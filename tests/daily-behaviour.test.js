import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dailyBehaviour, DAILY_METRICS, ignitionRank, showDailyFirePhoto } from '../src/lib/shared/dailyBehaviour.js';

const day = Date.UTC(2026, 9, 17);

test('generic flame photo requires positive spread and at least 1.5 m peak flames', () => {
  for (const flame of [1.5, 2, 8]) assert.equal(showDailyFirePhoto({ value: 1 }, { value: flame }), true);
  for (const flame of [undefined, null, NaN, Infinity, -1, 0, 0.5, 1.49]) assert.equal(showDailyFirePhoto({ value: 10 }, { value: flame }), false);
  for (const ros of [undefined, null, NaN, Infinity, -1, 0]) assert.equal(showDailyFirePhoto({ value: ros }, { value: 5 }), false);
  assert.equal(showDailyFirePhoto(null, null), false);
});
const row = (fuel, ignition, ros, flame) => ({ [fuel]: {
  [DAILY_METRICS.ignition]: ignition,
  [DAILY_METRICS.ros]: ros,
  [DAILY_METRICS.flame]: flame,
} });

test('daily maxima use all available hours and selected fuels, with independent peak times', () => {
  const data = new Map([
    [day - 3600000, [row('gm', 99, 99, 99)]],
    [day, [row('gm', 0, 2, 1), row('excluded', 100, 100, 100)]],
    [day + 3600000, [row('gm', 20, 8, 2), row('gh', 70, 5, 3)]],
    [day + 2 * 3600000, [row('gm', 10, 6, 4)]],
    [day + 86400000, [row('gm', 90, 90, 90)]],
  ]);
  const result = dailyBehaviour(data, ['gm', 'gh']);
  assert.deepEqual(result.get('2026-10-17'), {
    ignition: { value: 70, time: day + 3600000, fuel: 'gh' },
    ros: { value: 8, time: day + 3600000, fuel: 'gm' },
    flame: { value: 4, time: day + 2 * 3600000, fuel: 'gm' },
  });
  assert.equal(result.get('2026-10-18').ros.value, 90, 'Closing midnight belongs to next day');
  assert.equal(dailyBehaviour(data, []).size, 0);
});

test('missing and invalid model values remain missing, while zero is valid', () => {
  const result = dailyBehaviour(new Map([
    [day, [row('gm', null, NaN, undefined), row('gh', 101, -1, Infinity)]],
    [day + 86400000, [row('gm', 0, 0, 0)]],
  ]), ['gm', 'gh']);
  assert.equal(result.has('2026-10-17'), false);
  assert.equal(result.get('2026-10-18').ignition.value, 0);
  assert.equal(dailyBehaviour(new Map(), ['gm']).size, 0);
});

test('app-defined ignition ranks have explicit percentage boundaries and reject missing values', () => {
  for (const [value, label] of [[0, 'Low'], [9.99, 'Low'], [10, 'Moderate'], [30, 'High'], [50, 'Very High'], [70, 'Extreme'], [90, 'Very Extreme'], [100, 'Very Extreme']]) {
    assert.equal(ignitionRank(value).label, label);
    assert.match(ignitionRank(value).color, /^#[a-f0-9]{6}$/);
  }
  for (const value of [null, undefined, NaN, Infinity, -1, 101]) assert.equal(ignitionRank(value), null);
});
