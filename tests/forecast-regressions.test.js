import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { after, before, test } from 'node:test';
import { get } from 'svelte/store';
import { createServer } from 'vite';

let server;
let forecast;
let location;

before(async () => {
  // Load the real application modules with SvelteKit aliases, without opening a port.
  server = await createServer({
    server: { middlewareMode: true, hmr: { server: createHttpServer() } },
    appType: 'custom',
  });
  forecast = await server.ssrLoadModule('/src/lib/shared/stores/forecastStore.js');
  location = await server.ssrLoadModule('/src/lib/shared/stores/locationStore.js');
});

after(async () => {
  await server?.close();
});

test('FWI map date controls remain usable without hourly weather and hide hour selection', async () => {
  const { render } = await server.ssrLoadModule('svelte/server');
  const { default: Controls } = await server.ssrLoadModule('/src/lib/components/visual/ForecastTimeControls.svelte');
  const previous = { mode: get(forecast.forecastMode), fetching: get(forecast.fetchingForecast), dataMode: get(forecast.forecastDataMode) };
  try {
    forecast.forecastMode.set('forecast');
    forecast.fetchingForecast.set(true);
    forecast.forecastDataMode.set(null);
    const { body } = render(Controls, { props: { dailyOnly: true } });
    assert.ok(body.includes('Forecast day'));
    assert.ok(body.includes('daily EFFIS forecast'));
    assert.equal((body.match(/class="forecast-day /g) ?? []).length, 5);
    assert.ok(!body.includes('id="forecast-hour"'));
    assert.ok(!body.includes('Loading forecast times'));
  } finally {
    forecast.forecastMode.set(previous.mode);
    forecast.fetchingForecast.set(previous.fetching);
    forecast.forecastDataMode.set(previous.dataMode);
  }
});

test('EFFIS severity badges distinguish zero, extreme danger, loading and missing data', async () => {
  const { render } = await server.ssrLoadModule('svelte/server');
  const { default: FwiBadge } = await server.ssrLoadModule('/src/lib/components/visual/FwiBadge.svelte');
  for (const [fwi, severity] of [[0, 'Low'], [21.3, 'High'], [71, 'Very Extreme']]) {
    const { body } = render(FwiBadge, { props: { day: { fwi }, status: 'ready' } });
    assert.ok(body.includes(`EFFIS FWI ${fwi.toFixed(1)} · ${severity} fire danger`));
  }
  for (const status of ['idle', 'loading', 'error', 'ready']) {
    const { body } = render(FwiBadge, { props: { day: null, status } });
    assert.ok(body.includes(status === 'loading' ? 'EFFIS FWI loading' : 'EFFIS FWI unavailable'));
    assert.ok(!body.includes('Low'));
  }
  const { body } = render(FwiBadge, { props: { day: { fwi: 99 }, status: 'loading' } });
  assert.ok(!body.includes('99.0'), 'Loading cannot display a stale danger value');
});

test('day tabs match EFFIS severity by local date rather than response order', async () => {
  const { render } = await server.ssrLoadModule('svelte/server');
  const { default: DayPicker } = await server.ssrLoadModule('/src/lib/components/visual/DayPicker.svelte');
  const day = Date.UTC(2026, 9, 17);
  const oldData = get(forecast.forecastOpenMeteo);
  const oldDays = get(forecast.forecastDays);
  const oldPast = get(forecast.forecastDaysPast);
  try {
    forecast.forecastDaysPast.set(0);
    forecast.forecastDays.set(3);
    forecast.forecastOpenMeteo.set({ time: [day], weather_code: [0] });
    const effis = { status: 'ready', data: { days: [{ date: '2026-10-18', fwi: 55 }, { date: '2026-10-17', fwi: 0 }] } };
    const { body } = render(DayPicker, { props: { effis } });
    assert.ok(body.includes('Sat 17 Oct · EFFIS Fire danger Low'));
    assert.ok(body.includes('Sun 18 Oct · EFFIS Fire danger Extreme'));
    assert.ok(body.includes('Mon 19 Oct · EFFIS Fire danger unavailable'));
  } finally {
    forecast.forecastDays.set(oldDays);
    forecast.forecastDaysPast.set(oldPast);
    forecast.forecastOpenMeteo.set(oldData);
  }
});

test('day tabs render independent daily maxima and class-only fire danger', async () => {
  const { render } = await server.ssrLoadModule('svelte/server');
  const { default: DayPicker } = await server.ssrLoadModule('/src/lib/components/visual/DayPicker.svelte');
  const day = Date.UTC(2026, 9, 17);
  const dailySummaries = new Map([['2026-10-17', {
    ignition: { value: 75, time: day + 12 * 3600000, fuel: 'gm' },
    ros: { value: 23.45, time: day + 14 * 3600000, fuel: 'gh' },
    flame: { value: 4.56, time: day + 15 * 3600000, fuel: 'gh' },
  }]]);
  const { body } = render(DayPicker, { props: {
    days: [day, day + 86400000], dailySummaries,
    effis: { status: 'ready', data: { days: [{ date: '2026-10-17', fwi: 22 }] } },
  } });
  assert.ok(body.includes('Ignition prob. 75%, Extreme (app-defined rank)'));
  assert.ok(body.includes('ROS up to 23.4 m/min'));
  assert.ok(body.includes('Flames up to 4.6 m'));
  assert.ok(body.includes('14:00 location time'));
  assert.ok(body.includes('Gorse'));
  assert.ok(body.includes('Not an EFFIS classification'));
  assert.ok(body.includes('Ignition prob. —%'));
  assert.equal((body.match(/<img /g) ?? []).length, 1, 'One representative background per day');
  assert.ok(body.indexOf('class="day-danger') > body.indexOf('Flames up to <span>'), 'Severity follows behaviour at the bottom');
  assert.ok(!body.includes('Suppression'));
  // Numeric FWI remains in accessible detail, but not the visible badge.
  assert.ok(!body.includes('aria-hidden="true">FWI'));
  assert.ok(body.includes('Fire danger'));
});

test('day tabs omit suppression equipment for every flame level', async () => {
  const { render } = await server.ssrLoadModule('svelte/server');
  const { default: DayPicker } = await server.ssrLoadModule('/src/lib/components/visual/DayPicker.svelte');
  const day = Date.UTC(2026, 9, 17);
  for (const value of [0.1, 0.5, 1.5, 3.5, 5, 12, 0, null, undefined, NaN]) {
    const { body } = render(DayPicker, { props: { days: [day], dailySummaries: new Map([['2026-10-17', { flame: { value, time: day, fuel: 'gh' } }]]) } });
    assert.ok(!body.includes('class="suppression-icon'));
    assert.ok(!body.includes('Suppression illustration'));
  }
});

test('daily background is generic, omitted for low behaviour, and independent of fuel category', async () => {
  const { render } = await server.ssrLoadModule('svelte/server');
  const { default: DailyFuelPeak } = await server.ssrLoadModule('/src/lib/components/visual/DailyFuelPeak.svelte');
  const { fuelPhoto, fuelCategory } = await server.ssrLoadModule('/src/lib/data/fuelPhotos.js');
  assert.equal(fuelPhoto('gh').src, fuelPhoto('gm').src, 'Gorse variants use the same bar-chart background');
  assert.equal(fuelPhoto('cll').src, fuelPhoto('clh').src, 'Calluna variants share the bar-chart background');
  assert.match(fuelPhoto('gh').src, /bars_background\/g\.webp/);
  for (const code of ['cll', 'clm', 'clh', 'clt', 'mhl', 'mhh', 'gl', 'gm', 'gh', 'gt', 'grl', 'grm', 'grh', 'bk', 'wb', 'bv', 'sn', 'bl', 'ln', 'bch']) {
    const fuel = fuelPhoto(code);
    assert.ok(fuel.src, `Representative local photo for ${code}`);
    assert.ok(!fuel.src.startsWith('http'));
    assert.ok(fuel.label && fuel.code);
  }
  const peak = { fuel: 'gh', value: 8.1, time: Date.UTC(2026, 9, 17, 14) };
  assert.equal(fuelCategory('grh').label, 'Grass');
  assert.equal(fuelCategory('gm').label, 'Gorse');
  assert.equal(fuelCategory('gm').src, fuelCategory('gt').src);
  assert.ok(fuelCategory('gm').flaming);
  assert.ok(!fuelCategory('grh').flaming, 'Do not mislabel another vegetation fire as grass');
  assert.equal(fuelCategory('unknown'), null);
  const { body } = render(DailyFuelPeak, { props: { ros: peak, flame: { ...peak, value: 2 } } });
  assert.ok(body.includes('day-fuel-background'));
  assert.ok(!body.includes('data-category'));
  assert.ok(body.includes('aria-hidden="true"'));
  assert.ok(!body.includes('Gh'));
  assert.equal((body.match(/<img /g) ?? []).length, 1, 'Deduplicate by fuel, not peak hour');
  const { body: different } = render(DailyFuelPeak, { props: { ros: peak, flame: { ...peak, fuel: 'grh' } } });
  assert.equal((different.match(/<img /g) ?? []).length, 1);
  assert.equal(different, body, 'Same generic flame illustration for any fuel category');
  for (const flameValue of [0, 0.5, 1.49]) {
    const { body: low } = render(DailyFuelPeak, { props: { ros: peak, flame: { ...peak, value: flameValue } } });
    assert.ok(!low.includes('<img'), `No photo for low flame length ${flameValue}`);
  }
  for (const missing of [null, { ...peak, value: 0 }]) {
    const { body } = render(DailyFuelPeak, { props: { ros: missing } });
    assert.ok(!body.includes('<img'));
  }
  const { body: fallback } = render(DailyFuelPeak, { props: { ros: { ...peak, fuel: 'unknown' } } });
  assert.ok(!fallback.includes('<img'));
});

test('hourly weather icons follow the selected Open-Meteo WMO code', async () => {
  const { render } = await server.ssrLoadModule('svelte/server');
  const time = await server.ssrLoadModule('/src/lib/shared/stores/timeStore.js');
  const { default: WeatherLine } = await server.ssrLoadModule('/src/lib/components/visual/WeatherLine.svelte');
  const start = Date.UTC(2026, 9, 15, 8);
  const codes = new Float32Array([45, 1, 2, 3, 61, 95, NaN]);
  const data = {
    time: Array.from(codes, (_, i) => start + i * 3600000),
    weather_code: codes,
    // An obsolete field must never override the selected hourly WMO code.
    significantWeatherCode: 0,
    temperature_2m: new Float32Array(codes.length).fill(15),
    relative_humidity_2m: new Float32Array(codes.length).fill(60),
    wind_speed_10m: new Float32Array(codes.length).fill(5),
    wind_direction_10m: new Float32Array(codes.length).fill(180),
  };
  const originalForecast = get(forecast.forecastOpenMeteo);
  const originalTime = get(time.currentDateTime);
  const originalOffset = get(time.forecastUtcOffset);
  try {
    forecast.forecastOpenMeteo.set(data);
    time.forecastUtcOffset.set(0);
    const expected = ['wi-fog', 'wi-day-sunny-overcast', 'wi-day-cloudy', 'wi-cloudy', 'wi-rain', 'wi-thunderstorm', 'wi-na'];
    for (let i = 0; i < codes.length; i++) {
      time.currentDateTime.set(new Date(data.time[i]));
      assert.equal(get(forecast.currentTimeIndex), i);
      const { body } = render(WeatherLine, { props: { data } });
      assert.match(body, new RegExp(`class="text-2xl wi ${expected[i]}"`));
      assert.doesNotMatch(body, /wi-undefined|wi-day-claudy|wi-claudy/);
    }
    const { body } = render(WeatherLine, { props: { data: { ...data, weather_code: undefined } } });
    assert.match(body, /class="text-2xl wi wi-na"/);
  } finally {
    forecast.forecastOpenMeteo.set(originalForecast);
    time.currentDateTime.set(originalTime);
    time.forecastUtcOffset.set(originalOffset);
  }
});

test('historical Retrieve enables every January day and stays disabled for incomplete dates', async () => {
  const { render } = await server.ssrLoadModule('svelte/server');
  const time = await server.ssrLoadModule('/src/lib/shared/stores/timeStore.js');
  const { default: DatePicker } = await server.ssrLoadModule('/src/lib/components/visual/HistoricalSelectDate.svelte');
  const retrieveDisabled = () => {
    const { body } = render(DatePicker);
    const buttons = body.match(/<button\b[^>]*>/g);
    assert.ok(buttons?.length, 'Retrieve button is rendered');
    return /\sdisabled(?:\s|=|>)/.test(buttons.at(-1));
  };
  time.historicalYear.set(2025);
  time.historicalMonth.set(0);
  assert.equal(get(time.dayOptions).length, 31);
  for (let day = 1; day <= 31; day++) {
    time.historicalDay.set(day);
    assert.equal(get(time.historicalDate).getMonth(), 0);
    assert.equal(retrieveDisabled(), false, `January ${day}`);
  }
  time.historicalMonth.set(1);
  time.historicalDay.set(15);
  assert.equal(retrieveDisabled(), false, 'February still works');
  for (const missing of [time.historicalYear, time.historicalMonth, time.historicalDay]) {
    time.historicalYear.set(2025);
    time.historicalMonth.set(0);
    time.historicalDay.set(15);
    missing.set(undefined);
    assert.equal(retrieveDisabled(), true, 'Incomplete dates cannot be retrieved');
  }
});

test('irradiance requests include terrain for full and GTI-only forecasts and history', () => {
  location.currentLocation.update((loc) => ({ ...loc, slope: 35, aspect: 270 }));
  for (const forecast_mode of ['forecast', 'historical']) {
    for (const hourlyVars of [forecast.hourlyVarsFull, ['global_tilted_irradiance']]) {
      const params = forecast.fillParams({ forecast_mode, hourlyVars });
      assert.equal(params.tilt, 35);
      assert.equal(params.azimuth, 90);
    }
  }
  const params = forecast.fillParams({ hourlyVars: ['temperature_2m'] });
  assert.equal('tilt' in params, false);
  assert.equal('azimuth' in params, false);
});

test('LFMC stays active when switching dead-moisture models, with monthly fallback and clamp', async () => {
  const model = await server.ssrLoadModule('/src/lib/shared/stores/modelStore.js');
  const time = Date.UTC(2026, 6, 15, 12);
  const values = new Array(25).fill(10);
  const data = {
    time: Array.from({ length: 25 }, (_, i) => time + i * 3600000),
    temperature_2m: values, relative_humidity_2m: values,
    wind_speed_10m: values, wind_direction_10m: values, cloud_cover: values,
    ffmc_grass: values, ffmc_nelson: values,
    lfmc_moor_grass: new Array(25).fill(150),
  };
  model.selectedFuels.set(['grl']);
  forecast.forecastOpenMeteo.set(data);
  model.liveMoistureMode.set('lfmc');
  const liveKey = 'site.moisture.live.category';
  for (const mode of ['fireInSite', 'Nelson', 'Fosberg']) {
    model.modelConfigValues.update((config) => ({
      ...config,
      'configure.fuel.moisture': {
        ...config['configure.fuel.moisture'],
        value: mode === 'Fosberg' ? 'fosberg' : 'category',
      },
    }));
    model.fuelMoistureModel.set(mode);
    const inputs = get(model._inputsForecast).get(time + 24 * 3600000).grl;
    assert.equal(inputs[liveKey][0], 150, mode);
  }
  model.modelConfigValues.update((config) => ({
    ...config,
    'configure.fuel.moisture': { ...config['configure.fuel.moisture'], value: 'category' },
  }));
  model.fuelMoistureModel.set('Nelson');
  model.liveMoistureMode.set('climatology');
  const monthly = get(model.requiredFuelInputs).grl[liveKey][0];
  assert.equal(get(model._inputsForecast).get(time + 24 * 3600000).grl[liveKey][0], monthly);
  model.liveMoistureMode.set('lfmc');
  forecast.forecastOpenMeteo.set({ ...data, lfmc_moor_grass: undefined });
  assert.equal(get(model._inputsForecast).get(time + 24 * 3600000).grl[liveKey][0], monthly);
  forecast.forecastOpenMeteo.set({ ...data, lfmc_moor_grass: new Array(25).fill(1) });
  assert.equal(get(model._inputsForecast).get(time + 24 * 3600000).grl[liveKey][0], 10);
});
