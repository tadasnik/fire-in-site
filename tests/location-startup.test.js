import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getLocation } from '../src/lib/shared/stores/locationStore.js';

test('startup without a Geoapify key returns a usable coordinate pair without fetching', async () => {
  assert.deepEqual(await getLocation({ token: '', fetcher: () => assert.fail('must not fetch') }), [52, -1.5]);
});

test('failed, timed-out or malformed IP lookup always returns fallback coordinates', async () => {
  for (const fetcher of [
    async () => new Response('Unauthorized', { status: 401 }),
    async () => { throw new Error('network unavailable'); },
    async () => new Response('not JSON'),
    async () => Response.json({}),
    async () => Response.json({ location: { latitude: 'invalid', longitude: 0 } }),
    async () => Response.json({ location: { latitude: 91, longitude: 0 } }),
  ]) {
    assert.deepEqual(await getLocation({ token: 'test', fetcher }), [52, -1.5]);
  }
});

test('successful IP lookup preserves valid coordinates including zero', async () => {
  assert.deepEqual(await getLocation({ token: 'test', fetcher: async () =>
    Response.json({ location: { latitude: '0', longitude: '-3.5' } }) }), [0, -3.5]);
});
