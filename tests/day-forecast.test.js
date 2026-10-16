import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dayWeather, viewWeather, weatherPoints, daylightSegments, dayFuels, rowDomain, linePath, areaPath, WEATHER_ROWS, hourText } from '../src/lib/shared/dayForecast.js';
import { solarTimestamps } from '../src/lib/weather/solarTimes.js';
const day = Date.UTC(2026, 9, 16);
const hour = 3600000;

test('daily weather preserves zero and missing data with location-local date boundaries', () => {
  const data = dayWeather({ time: [day - hour, day, day + 23 * hour, day + 24 * hour], temperature_2m: [9, 0, NaN, 99] }, day);
  assert.equal(data.length, 24);
  assert.equal(data[0].temperature_2m, 0);
  assert.equal(data[1].available, false);
  assert.equal(data[23].temperature_2m, null);
  assert.equal(hourText(data[23].time), '23:00');
});

test('continuous weather samples include both edges, cells use explicit start/end times', () => {
  const times = Array.from({ length: 121 }, (_, i) => day + i * hour);
  const data = { time: times, temperature_2m: times.map((_, i) => i), precipitation: times.map((_, i) => i), wind_gusts_10m: times.map((_, i) => i === 2 ? 50 : i) };
  const cells = viewWeather(data, day, { days: 5, step: 3 });
  const points = weatherPoints(data, day, { days: 5, step: 3 });
  assert.equal(cells.length, 40);
  assert.equal(points.length, 41);
  assert.equal(cells[0].time, day);
  assert.equal(cells[0].periodStart, day);
  assert.equal(cells[0].periodEnd, day + 3 * hour);
  assert.equal(cells[0].precipitation, 1 + 2 + 3);
  assert.equal(cells[0].wind_gusts_10m, 50);
  assert.equal(points[0].temperature_2m, 0);
  assert.equal(points.at(-1).time, day + 120 * hour);
  assert.equal(points.at(-1).temperature_2m, 120);
  assert.equal(cells.at(-1).precipitation, 118 + 119 + 120);
  assert.equal(cells.at(-1).periodEnd, points.at(-1).time);
  assert.equal(weatherPoints(data, day).length, 25);
});

test('hourly rain intervals use the amount ending at the interval right edge', () => {
  const data = { time: [day, day + hour], precipitation: [99, 2] };
  assert.equal(viewWeather(data, day)[0].precipitation, 2);
  assert.equal(viewWeather(data, day)[1].precipitation, null);
});

test('fuel cells cover [start,end), retain brief peaks and never include the closing sample', () => {
  const rows = Array.from({ length: 121 }, (_, i) => ({ time: day + i * hour, grass: i === 1 ? 9 : i === 120 ? 999 : 0, heath: i === 2 ? 4 : 1 }));
  const fuels = dayFuels(rows, day, { days: 5, step: 3 });
  assert.equal(fuels[0].values.length, 40);
  assert.deepEqual(fuels[0].values[0], { time: day, periodStart: day, periodEnd: day + 3 * hour, value: 9, peakTime: day + hour });
  assert.equal(fuels[1].values[0].peakTime, day + 2 * hour);
  assert.equal(fuels[0].values.at(-1).value, 0);
  assert.equal(fuels[0].values.at(-1).periodEnd, day + 120 * hour);
  assert.deepEqual(dayFuels([], day), []);
});

test('missing data breaks curves and makes incomplete totals/maxima unavailable', () => {
  const data = { time: [day, day + hour, day + 2 * hour], precipitation: [1, NaN, 2] };
  assert.equal(viewWeather(data, day, { step: 3 })[0].precipitation, null);
  assert.equal(weatherPoints(data, day).at(-1).temperature_2m, null);
  const fuels = dayFuels([{ time: day, grass: 9 }, { time: day + 2 * hour, grass: 1 }], day, { step: 3 });
  assert.equal(fuels[0].values[0].value, null);
  assert.equal(linePath([{ time: 0, t: 0 }, { time: 1, t: 2 }, { time: 2, t: null }, { time: 3, t: 4 }], 't', x => x, y => y), 'M0,0 L1,2  M3,4');
});

test('weather scales include zero, subzero temperatures and gust maxima', () => {
  assert.deepEqual(rowDomain([{ wind_speed_10m: 2, wind_gusts_10m: 16 }], WEATHER_ROWS[3]), [0, 16]);
  assert.deepEqual(rowDomain([{ temperature_2m: -10 }], WEATHER_ROWS[0]), [-12, 0]);
  assert.deepEqual(rowDomain([{ temperature_2m: 18 }], WEATHER_ROWS[0]), [0, 20]);
  assert.deepEqual(rowDomain([], WEATHER_ROWS[2]), [0, 1]);
});

test('temperature fill closes against zero and keeps missing segments separate', () => {
  const data = [{ time: 0, t: -2 }, { time: 1, t: 3 }, { time: 2, t: null }, { time: 3, t: -1 }];
  assert.equal(areaPath(data, 't', x => x, y => 10 - y), 'M0,10 L0,12 L1,7 L1,10 Z M3,10 L3,11 L3,10 Z');
});

test('sunrise/sunset decoding preserves seconds and location offsets, including fractional offsets', () => {
  const seconds = BigInt(Date.UTC(2026, 9, 16, 6, 40, 7) / 1000);
  const variable = { valuesInt64Length: () => 2, valuesInt64: i => i === 0 ? seconds : 0n };
  assert.deepEqual(solarTimestamps(variable, 3600), [day + 7 * hour + 40 * 60000 + 7000, null]);
  assert.equal(solarTimestamps(variable, 19800)[0], Number(seconds) * 1000 + 19800000);
  assert.equal(solarTimestamps(variable, -18000)[0], Number(seconds) * 1000 - 18000000);
});

test('daylight segments use exact solar times, clip to the window and handle polar days/nights', () => {
  const sunrise = day + 7 * hour + 37 * 60000;
  const sunset = day + 18 * hour + 19 * 60000;
  const data = { daily_time: [day, day + 24 * hour, day + 48 * hour], daily_sunrise: [sunrise, null, null], daily_sunset: [sunset, null, null], daily_daylight_duration: [38520, 86400, 0] };
  assert.deepEqual(daylightSegments(data, day, day + 72 * hour), [
    { start: day, end: sunrise, isDay: false },
    { start: sunrise, end: sunset, isDay: true },
    { start: sunset, end: day + 24 * hour, isDay: false },
    { start: day + 24 * hour, end: day + 48 * hour, isDay: true },
    { start: day + 48 * hour, end: day + 72 * hour, isDay: false },
  ]);
  assert.deepEqual(daylightSegments(data, day + 8 * hour, day + 9 * hour), [{ start: day + 8 * hour, end: day + 9 * hour, isDay: true }]);
  assert.deepEqual(daylightSegments({}, day, day + 24 * hour), []);
});
