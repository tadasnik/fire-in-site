import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fetchWeatherWithProbability } from '../src/lib/weather/precipitationProbability.js';

const params = { forecast_mode: 'forecast', models: 'ukmo_seamless', hourly: ['temperature_2m', 'precipitation'], daily: ['sunrise'], latitude: 45.8, longitude: 8.7, forecast_days: 5, past_days: 1, timezone: 'auto' };

test('probability uses a separate Best Match fetch with matching location, time range and no daily block', async () => {
  const calls = [];
  const weather = { time: [100, 200, 300, 400, 500, 600], temperature_2m: [1, 2, 3, 4, 5, 6] };
  const result = await fetchWeatherWithProbability(params, async request => {
    calls.push(request);
    return request.models === 'best_match'
      ? { time: [600, 300, 100, 400, 500], precipitation_probability: [100, 30, 0, -1, 101] }
      : weather;
  });
  assert.equal(calls[0], params);
  const { daily, ...probabilityParams } = params;
  assert.deepEqual(calls[1], { ...probabilityParams, models: 'best_match', hourly: ['precipitation_probability'] });
  assert.ok(!('daily' in calls[1]), 'Omit daily entirely: the SDK serializes undefined as a query value');
  assert.deepEqual(Array.from(result.precipitation_probability), [0, NaN, 30, NaN, NaN, 100]);
  assert.equal(result.temperature_2m, weather.temperature_2m);
});

test('optional probability failure preserves the main weather forecast without inventing zero chance', async () => {
  const result = await fetchWeatherWithProbability(params, async request => {
    if (request.models === 'best_match') throw Error('upstream unavailable');
    return { time: [100, 200], precipitation: [0, 2] };
  });
  assert.deepEqual(result.precipitation, [0, 2]);
  assert.deepEqual(Array.from(result.precipitation_probability), [NaN, NaN]);
});

test('historical and reduced-variable requests never request precipitation probability', async () => {
  for (const request of [{ ...params, forecast_mode: 'historical' }, { ...params, hourly: ['vapour_pressure_deficit'] }]) {
    let calls = 0;
    const weather = { time: [100] };
    const result = await fetchWeatherWithProbability(request, async () => { calls++; return weather; });
    assert.equal(calls, 1);
    assert.equal(result, weather);
  }
});

test('main weather errors are not swallowed by the optional probability fetch', async () => {
  await assert.rejects(fetchWeatherWithProbability(params, async request => {
    if (request.models !== 'best_match') throw Error('main weather failed');
    return { time: [] };
  }), /main weather failed/);
});
