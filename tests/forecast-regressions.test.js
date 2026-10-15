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
