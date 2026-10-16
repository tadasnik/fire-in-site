import assert from 'node:assert/strict';
import { test } from 'node:test';
import { availableHours, instantForLocalHour, localHour, HOUR_MS } from '../src/lib/shared/forecastTime.js';
import { get } from 'svelte/store';
import { currentDateTime, focusDay, forecastUtcOffset } from '../src/lib/shared/stores/timeStore.js';

test('day changes preserve the location-local hour independently of browser timezone', () => {
  const current = new Date('2026-10-16T14:00:00Z');
  const hour = localHour(current, 3600);
  assert.equal(hour, 15);
  const next = instantForLocalHour(Date.UTC(2026, 9, 17), hour, 3600);
  assert.equal(next.toISOString(), '2026-10-17T14:00:00.000Z');
});

test('local midnight and fractional offsets convert back to the correct UTC instant', () => {
  const day = Date.UTC(2026, 9, 17);
  assert.equal(instantForLocalHour(day, 0, 3600).toISOString(), '2026-10-16T23:00:00.000Z');
  assert.equal(localHour(instantForLocalHour(day, 9, 19800), 19800), 9);
  assert.equal(localHour(instantForLocalHour(day, 23, -18000), -18000), 23);
});

test('hour selection is limited to timestamps available on the selected local day', () => {
  const day = Date.UTC(2026, 9, 17);
  assert.deepEqual(availableHours([day - HOUR_MS, day, day + HOUR_MS, day + 24 * HOUR_MS], day), [0, 1]);
  assert.deepEqual(availableHours([], day), []);
});

test('day selection follows the same rounded forecast hour used by the charts at midnight', () => {
  const originalTime = get(currentDateTime);
  const originalOffset = get(forecastUtcOffset);
  try {
    forecastUtcOffset.set(3600);
    currentDateTime.set(new Date('2026-10-16T22:45:00Z'));
    assert.equal(get(focusDay), Date.UTC(2026, 9, 17));
    forecastUtcOffset.set(0);
    currentDateTime.set(new Date('2026-10-16T23:45:00Z'));
    assert.equal(get(focusDay), Date.UTC(2026, 9, 17));
  } finally {
    currentDateTime.set(originalTime);
    forecastUtcOffset.set(originalOffset);
  }
});
