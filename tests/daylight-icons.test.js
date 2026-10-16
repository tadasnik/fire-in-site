import assert from 'node:assert/strict';
import { test } from 'node:test';
import { iconForWmoCode } from '../src/lib/data/wmoWeatherIcons.js';

test('hourly sky icons use night variants only when the API explicitly indicates night', () => {
  assert.equal(iconForWmoCode(0, null, 0), 'wi-night-clear');
  assert.equal(iconForWmoCode(1, null, 0), 'wi-night-partly-cloudy');
  assert.equal(iconForWmoCode(2, null, 0), 'wi-night-alt-cloudy');
  assert.equal(iconForWmoCode(0, null, 1), 'wi-day-sunny');
  assert.equal(iconForWmoCode(0), 'wi-day-sunny');
  assert.equal(iconForWmoCode(61, null, 0), 'wi-rain');
  assert.equal(iconForWmoCode(null, null, 0), '');
});
