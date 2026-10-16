import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parse } from 'svelte/compiler';
import { get, writable } from 'svelte/store';
import { beginLocationSelection, currentLocationSelection } from '../src/lib/shared/locationSelection.js';

// Exercise the actual handlers without needing Mapbox, a DOM, or network calls.
// Svelte's parser selects their source; only external dependencies are replaced.
function loadHandler(file, name, bindings) {
  let source = readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8');
  if (file.endsWith('.js')) source = `<script>${source}</script>`;
  const statements = parse(source).instance.content.body;
  let handler;
  if (name === 'onMount') {
    handler = statements.find((node) => node.expression?.callee?.name === name).expression.arguments[0];
  } else {
    handler = statements.map((node) => node.declaration ?? node).find((node) => node.id?.name === name);
  }
  assert.ok(handler, `${file}: ${name}`);
  return new Function(...Object.keys(bindings), `
    let query, results, open, showingHistory, editing, inputEl;
    let latestForecastRequest = 0;
    return (${source.slice(handler.start, handler.end)});
  `)(...Object.values(bindings));
}

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test('map compass labels wrap a rounded 360-degree terrain aspect to north', () => {
  const direction = loadHandler('lib/components/ui/Map.svelte', 'getWindCardinalDirection', {
    cardinalDirections: { 0: 'N', 8: 'E', 16: 'S', 24: 'W' },
  });
  assert.equal(direction(360), 'n');
  assert.equal(direction(-360), 'n');
  assert.equal(direction(90), 'e');
  assert.equal(direction(NaN), 'n');
});

function selectionHandlers() {
  const pending = new Map();
  const committed = [];
  const forecasts = [];
  const currentLocation = writable({ latitude: 53, longitude: -3 });
  const dependencies = {
    beginLocationSelection,
    elevationSlopeAspect: (lat) => {
      const request = deferred();
      pending.set(lat, request);
      return request.promise;
    },
    terrainPopup: { setText() {} },
    locMarker: { setLngLat() {} }, map: { setCenter() {} },
    setCurrentLocation: (longitude, latitude) => { committed.push(latitude); },
    getForecastOpenMeteo: () => forecasts.push('fetch'),
    recordSearch() {}, forecastCache: writable(null), forecastModel: writable('ecmwf_ifs'),
    currentLocation: {
      update(fn) {
        currentLocation.update(fn);
        committed.push(get(currentLocation).latitude);
      },
    },
  };
  const map = loadHandler('lib/components/ui/Map.svelte', 'setMapLocation', dependencies);
  const search = loadHandler('lib/components/ui/LocationSearch.svelte', 'select', dependencies);
  return {
    map: (lat) => map(-3, lat),
    search: (lat) => search({ latitude: lat, longitude: -3 }),
    pending, committed, forecasts,
  };
}

for (const [first, second] of [['map', 'map'], ['search', 'search'], ['map', 'search'], ['search', 'map']]) {
  for (const fails of [false, true]) {
    test(`${first} then ${second}: stale terrain ${fails ? 'failure' : 'success'} cannot overwrite latest selection`, async () => {
      const h = selectionHandlers();
      const older = h[first](51);
      const newer = h[second](52);
      h.pending.get(52).resolve({ elevation: 100, slope: 20, aspect: 270 });
      await newer;
      if (fails) h.pending.get(51).reject(new Error('old DEM request failed'));
      else h.pending.get(51).resolve({ elevation: 200, slope: 30, aspect: 180 });
      await older;
      assert.deepEqual(h.committed, [52]);
      assert.equal(h.forecasts.length, 1);
    });
  }
}

test('latest terrain failure still commits the fallback', async () => {
  const h = selectionHandlers();
  const selection = h.search(52);
  h.pending.get(52).reject(new Error('DEM unavailable'));
  await selection;
  assert.deepEqual(h.committed, [52]);
  assert.equal(h.forecasts.length, 1);
});

test('delayed IP location cannot supersede a manual selection', async () => {
  const ip = deferred();
  const selected = [];
  const init = loadHandler('lib/components/ui/LocationSearch.svelte', 'onMount', {
    get, currentLocation: writable({ userLocation: false }),
    beginLocationSelection, getHistory: () => [], getLocation: () => ip.promise,
    select: (value) => selected.push(value),
  });
  const pending = init();
  beginLocationSelection();
  ip.resolve([51, -3]);
  await pending;
  assert.deepEqual(selected, []);
});

function deviceGeolocation() {
  const selected = [];
  let restored = 0;
  const addControl = loadHandler('lib/components/ui/Map.svelte', 'addGeolocationControl', {
    beginLocationSelection,
    $currentLocation: { latitude: 53, longitude: -3 },
    setMapLocation: (...coords) => selected.push(coords),
    setMarkerLocation: () => restored++,
    map: { addControl() {}, stop() {} },
  });
  class GeolocateControl {
    handlers = {};
    on(type, handler) { this.handlers[type] = handler; }
    trigger() { return true; }
  }
  const control = addControl({ GeolocateControl });
  return { control, selected, restored: () => restored };
}

test('delayed device geolocation cannot supersede a manual selection', () => {
  const { control, selected, restored } = deviceGeolocation();
  control.trigger();
  beginLocationSelection();
  control.handlers.geolocate({ coords: { latitude: 51, longitude: -3 } });
  assert.deepEqual(selected, []);
  assert.equal(restored(), 1, 'restore the map after its native camera update');
});

test('device geolocation selects the returned point and ignores repeat clicks while pending', () => {
  const { control, selected } = deviceGeolocation();
  assert.equal(control.trigger(), true);
  assert.equal(control.trigger(), false);
  control.handlers.geolocate({ coords: { latitude: 51, longitude: -3 } });
  assert.deepEqual(selected, [[-3, 51]]);
  assert.equal(control.trigger(), true);
});

test('denied geolocation resumes the confirmed location only if still current', () => {
  const { control, selected } = deviceGeolocation();
  control.trigger();
  control.handlers.error({ code: 1, message: 'Denied' });
  assert.deepEqual(selected, [[-3, 53]]);
  control.trigger();
  beginLocationSelection();
  control.handlers.error({ code: 1, message: 'Denied' });
  assert.equal(selected.length, 1);
});

for (const stage of ['fetch', 'dead', 'live', 'curing']) {
  test(`a selection during ${stage} processing discards stale forecast data and loading updates`, async () => {
    const pending = deferred();
    const entered = deferred();
    const before = { time: [0], utcOffsetSeconds: 0 };
    const after = { time: [1], utcOffsetSeconds: 3600 };
    const data = writable(before);
    const loading = writable(false);
    const mode = writable('forecast');
    const offset = writable(0);
    const waitAt = async (step, value) => {
      if (step === stage) { entered.resolve(); await pending.promise; }
      return value;
    };
    const fetchForecast = loadHandler('lib/shared/stores/forecastStore.js', 'getForecastOpenMeteo', {
      get, forecastMode: mode,
      currentLocation: writable({ latitude: 53, userLocation: true, distanceFromPrevious: 99999 }),
      currentLocationSelection, fetchingForecast: loading, forecastDataMode: mode,
      forecastCache: writable(null), forecastOpenMeteo: data, forecastUtcOffset: offset,
      hourlyVarsFull: [], fillParams: () => ({}), fetchPastDailyVpdMax: async () => ({}),
      fetchForecastMeteo: () => waitAt('fetch', after),
      fuelMoistureCalcs: (value) => waitAt('dead', value),
      lfmcCalcs: () => waitAt('live'), curingCalcs: () => waitAt('curing'),
    });
    beginLocationSelection();
    const request = fetchForecast();
    await entered.promise;
    beginLocationSelection();
    pending.resolve();
    await request;
    assert.equal(get(data), before);
    assert.equal(get(offset), 0);
    assert.equal(get(loading), true);
  });
}

for (const fails of [false, true]) {
  test(`overlapping refreshes: an older ${fails ? 'failure' : 'success'} cannot change the latest forecast`, async () => {
    const oldRequest = deferred();
    const newRequest = deferred();
    const initial = { time: [0] };
    const newest = { time: [2], utcOffsetSeconds: 7200 };
    const data = writable(initial);
    const loading = writable(false);
    const offset = writable(0);
    const mode = writable('forecast');
    let requests = 0;
    const refresh = loadHandler('lib/shared/stores/forecastStore.js', 'getForecastOpenMeteo', {
      get, forecastMode: mode,
      currentLocation: writable({ latitude: 53, userLocation: true, distanceFromPrevious: 99999 }),
      currentLocationSelection, fetchingForecast: loading, forecastDataMode: mode,
      forecastCache: writable(null), forecastOpenMeteo: data, forecastUtcOffset: offset,
      hourlyVarsFull: [], fillParams: () => ({}), fetchPastDailyVpdMax: async () => ({}),
      fetchForecastMeteo: () => (++requests === 1 ? oldRequest : newRequest).promise,
      fuelMoistureCalcs: async (value) => value,
      lfmcCalcs: async () => {}, curingCalcs: async () => {},
    });
    beginLocationSelection();
    const older = refresh();
    const newer = refresh();
    if (fails) {
      oldRequest.reject(new Error('old request failed'));
      await older;
      assert.equal(get(data), initial);
      assert.equal(get(loading), true);
    }
    newRequest.resolve(newest);
    await newer;
    if (!fails) {
      oldRequest.resolve({ time: [1], utcOffsetSeconds: 3600 });
      await older;
    }
    assert.equal(get(data), newest);
    assert.equal(get(offset), 7200);
    assert.equal(get(loading), false);
  });
}
