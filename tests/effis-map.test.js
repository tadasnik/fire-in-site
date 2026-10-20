import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getEffisTile } from '../src/lib/server/effisTiles.js';
import { effisTileTemplate, mercatorTileBounds, replaceEffisLayer } from '../src/lib/weather/effisMap.js';

const now = Date.UTC(2026, 9, 18, 8);
function png() {
  const bytes = new Uint8Array(33);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10]);
  bytes.set([73, 72, 68, 82], 12);
  new DataView(bytes.buffer).setUint32(16, 256);
  new DataView(bytes.buffer).setUint32(20, 256);
  return bytes;
}
const event = (fetch, params = { date: '2026-10-18', z: '5', x: '16', y: '11' }) => ({ params, fetch });

test('EFFIS tile proxy uses fixed product, date, Mercator XYZ bounds and short caching', async () => {
  const result = await getEffisTile(event(async (url, options) => {
    assert.equal(url.origin + url.pathname, 'https://maps.effis.emergency.copernicus.eu/gwis');
    for (const [key, value] of Object.entries({ REQUEST: 'GetMap', LAYERS: 'ecmwf.fwi', TIME: '2026-10-18', SRS: 'EPSG:3857', WIDTH: '256', HEIGHT: '256', TRANSPARENT: 'true' })) {
      assert.equal(url.searchParams.get(key), value);
    }
    assert.deepEqual(url.searchParams.get('BBOX').split(',').map(Number), mercatorTileBounds(5, 16, 11));
    assert.ok(options.signal);
    return new Response(png(), { headers: { 'content-type': 'image/png' } });
  }), now);
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('content-type'), 'image/png');
  assert.match(result.headers.get('cache-control'), /max-age=300/);
});

test('Mercator bounds have west/east x and south/north y, including world edges', () => {
  const half = 20037508.342789244;
  assert.deepEqual(mercatorTileBounds(0, 0, 0), [-half, -half, half, half]);
  assert.deepEqual(mercatorTileBounds(1, 1, 0), [0, 0, half, half]);
});

test('EFFIS tile dates and coordinates are validated before fetching', async () => {
  const valid = { date: '2026-10-18', z: '5', x: '16', y: '11' };
  for (const patch of [{ date: '2026-02-30' }, { date: '2026-10-15' }, { date: '2026-10-29' },
    { z: '9' }, { x: '32' }, { y: '-1' }, { z: '1.5' }, { x: '../foo' }]) {
    const result = await getEffisTile(event(() => assert.fail('invalid request must not fetch'), { ...valid, ...patch }), now);
    assert.equal(result.status, 400);
    assert.equal(result.headers.get('cache-control'), 'no-store');
  }
});

test('WMS exceptions, invalid images, wrong dimensions and upstream failures cannot be cached', async () => {
  const wrongSize = png();
  new DataView(wrongSize.buffer).setUint32(16, 512);
  for (const fetch of [
    async () => new Response('<ServiceException>LayerNotDefined</ServiceException>', { headers: { 'content-type': 'text/xml' } }),
    async () => new Response('<error/>', { headers: { 'content-type': 'image/png' } }),
    async () => new Response(png().slice(0, 20), { headers: { 'content-type': 'image/png' } }),
    async () => new Response(wrongSize, { headers: { 'content-type': 'image/png' } }),
    async () => new Response('unavailable', { status: 503 }),
    async () => { throw new Error('timeout'); },
  ]) {
    const result = await getEffisTile(event(fetch), now);
    assert.equal(result.status, 502);
    assert.equal(result.headers.get('cache-control'), 'no-store');
  }
});

test('changing map day removes old imagery first and adds a date-specific, bounded source', () => {
  const layers = new Map();
  const sources = new Map();
  const calls = [];
  const map = {
    getLayer: id => layers.get(id),
    removeLayer(id) { calls.push(`remove layer ${id}`); layers.delete(id); },
    removeSource(id) { calls.push(`remove source ${id}`); sources.delete(id); },
    addSource(id, source) { calls.push(`add source ${id}`); sources.set(id, source); },
    addLayer(layer) { calls.push(`add layer ${layer.id}`); layers.set(layer.id, layer); },
  };
  assert.equal(replaceEffisLayer(map, '2026-10-18'), 'effis-2026-10-18');
  calls.length = 0;
  assert.equal(replaceEffisLayer(map, '2026-10-19', 0.8), 'effis-2026-10-19');
  assert.deepEqual(calls, ['remove layer effis-fwi', 'remove source effis-2026-10-18', 'add source effis-2026-10-19', 'add layer effis-fwi']);
  const source = sources.get('effis-2026-10-19');
  assert.equal(source.maxzoom, 8);
  assert.deepEqual(source.tiles, ['/api/effis/tiles/2026-10-19/{z}/{x}/{y}']);
  assert.equal(layers.get('effis-fwi').paint['raster-resampling'], 'nearest');
  assert.equal(layers.get('effis-fwi').paint['raster-opacity'], 0.8);
  assert.throws(() => effisTileTemplate('../wrong'), /Invalid/);
});
