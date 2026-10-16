import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getMapTile } from '../src/lib/server/mapTiles.js';

const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const event = (fetch, params = { z: '12', x: '2030', y: '1356' }) => ({
  fetch, params, url: new URL('http://localhost:5173/api/map/tiles/12/2030/1356'),
  request: new Request('http://localhost:5173/', { headers: { referer: 'http://localhost:5173/' } }),
});

test('street tiles use a fixed upstream, identify the app and preserve cache headers', async () => {
  const response = await getMapTile(event(async (url, options) => {
    assert.equal(url, 'https://tile.openstreetmap.de/12/2030/1356.png');
    assert.match(options.headers['user-agent'], /FireInSite/);
    assert.equal(options.headers.referer, 'http://localhost:5173/');
    return new Response(signature, { headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=86400' } });
  }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'public, max-age=86400');
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), signature);
});

test('street tile coordinates are bounded before any upstream request', async () => {
  for (const params of [{ z: '19', x: '1', y: '1' }, { z: '1', x: '2', y: '0' },
    { z: '1', x: '../x', y: '0' }, { z: '0', x: '0', y: '-1' }]) {
    assert.equal((await getMapTile(event(() => assert.fail('must not fetch'), params))).status, 400);
  }
});

test('HTTP-200 denial tiles, malformed images and upstream errors are never cached', async () => {
  for (const fetch of [
    async () => new Response(signature, { headers: { 'content-type': 'image/png', 'x-blocked': 'Access denied' } }),
    async () => new Response('error', { headers: { 'content-type': 'image/png' } }),
    async () => new Response('error', { status: 503 }),
    async () => { throw new Error('timeout'); },
  ]) {
    const res = await getMapTile(event(fetch));
    assert.equal(res.status, 502);
    assert.equal(res.headers.get('cache-control'), 'no-store');
  }
});
