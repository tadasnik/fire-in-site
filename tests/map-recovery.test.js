import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parse } from 'svelte/compiler';

function handlers(initialSatellite = false) {
  const source = readFileSync(new URL('../src/lib/components/ui/Map.svelte', import.meta.url), 'utf8');
  const statements = parse(source).instance.content.body;
  const names = ['handleMapError', 'handleSourceData', 'reloadStreetMap'];
  const functions = names.map(name => {
    const node = statements.find(node => node.type === 'FunctionDeclaration' && node.id.name === name);
    return source.slice(node.start, node.end);
  }).join('\n');
  const calls = [];
  const map = {
    setTerrain: value => calls.push(['terrain', value]),
    setStyle: value => calls.push(['style', value]),
    getSource: id => ({ setTiles: tiles => calls.push([id, tiles]) }),
  };
  return new Function('map', 'satellite', 'calls', `
    let mapNotice = '';
    const streetTiles = 'https://example.com/{z}/{x}/{y}.png';
    const streetStyle = () => ({ version: 8 });
    const initializeMap = async () => calls.push(['initialize']);
    ${functions}
    return { handleMapError, handleSourceData, reloadStreetMap, calls,
      state: () => ({ mapNotice, satellite }) };
  `)(map, initialSatellite, calls);
}

test('unrelated map errors and cancelled tiles do not label the basemap unavailable', () => {
  const h = handlers();
  h.handleMapError({ error: new Error('unrelated request') });
  h.handleMapError({ sourceId: 'osm', error: { name: 'AbortError' } });
  assert.equal(h.state().mapNotice, '');
});

test('a successful street tile clears an earlier source failure notice', () => {
  const h = handlers();
  h.handleMapError({ sourceId: 'osm', error: new Error('tile unavailable') });
  assert.match(h.state().mapNotice, /could not load/);
  h.handleSourceData({ sourceId: 'other', tile: { state: 'loaded' } });
  assert.match(h.state().mapNotice, /could not load/);
  h.handleSourceData({ sourceId: 'osm', tile: { state: 'loaded' } });
  assert.equal(h.state().mapNotice, '');
});

test('Mapbox authorization failure switches to the street style only once', () => {
  const h = handlers(true);
  h.handleMapError({ error: { status: 401 } });
  h.handleMapError({ error: { status: 401 } });
  assert.equal(h.state().satellite, false);
  assert.deepEqual(h.calls, [['initialize']]);
});

test('reload retries street tiles and clears the error notice', () => {
  const h = handlers();
  h.handleMapError({ sourceId: 'osm', error: new Error('offline') });
  h.reloadStreetMap();
  assert.equal(h.state().mapNotice, '');
  assert.deepEqual(h.calls, [['osm', ['https://example.com/{z}/{x}/{y}.png']]]);
});
