import assert from 'node:assert/strict';
import { test } from 'node:test';
import { get } from 'svelte/store';
import { canadianIndices, fwiDanger, normalizeEffis, dayKey } from '../src/lib/weather/effis.js';
import { getEffisPoint } from '../src/lib/server/effisPoint.js';
import { createEffisStore } from '../src/lib/shared/stores/effisStore.js';

const now = Date.UTC(2026, 9, 16, 9);
function payload() {
  return {
    x_data: ['2026-10-16T00:00:00', '2026-10-17T00:00:00'],
    y_data: Object.fromEntries(canadianIndices.map(({ key }) => [key, [0, 12]])),
  };
}
function event(query, fetch = async () => Response.json(payload())) {
  return { url: new URL(`https://fireinsite.org/api/effis/point?${query}`), fetch };
}

test('normalization preserves zero, removes missing values and keeps date-only keys', () => {
  const source = payload();
  source.y_data.ffmc = [-9999, null];
  source.y_data.dc = [Infinity, '10'];
  const days = normalizeEffis(source, '2026-10-16', '2026-10-17');
  assert.equal(days[0].date, '2026-10-16');
  assert.equal(days[0].fwi, 0);
  assert.equal(days[0].danger.label, 'Low');
  assert.equal(days[0].ffmc, null);
  assert.equal(days[1].ffmc, null);
  assert.equal(days[0].dc, null);
  assert.equal(days[1].dc, null);
  assert.equal(normalizeEffis(source, '2026-10-17', '2026-10-17').length, 1);
});

test('malformed arrays and duplicate or invalid forecast days are rejected', () => {
  for (const source of [null, {}, { x_data: [], y_data: {} }]) {
    assert.throws(() => normalizeEffis(source, '2026-10-16', '2026-10-17'));
  }
  for (const date of ['2026-10-16T00:00:00', '2026-02-30T00:00:00']) {
    const source = payload();
    source.x_data[1] = date;
    assert.throws(() => normalizeEffis(source, '2026-10-16', '2026-10-17'));
  }
  const source = payload();
  source.y_data.fwi = [1];
  assert.throws(() => normalizeEffis(source, '2026-10-16', '2026-10-17'));
});

test('FWI danger thresholds include zero and preserve the >70 Very Extreme definition', () => {
  for (const [value, label] of [[0, 'Low'], [11.2, 'Moderate'], [21.3, 'High'],
    [38, 'Very High'], [50, 'Extreme'], [70, 'Extreme'], [70.01, 'Very Extreme']]) {
    assert.equal(fwiDanger(value).label, label);
  }
  for (const value of [null, undefined, -9999, NaN]) assert.equal(fwiDanger(value), null);
});

test('point API uses lon/lat order, a fixed ECMWF upstream and cacheable normalized records', async () => {
  let requested;
  const res = await getEffisPoint(event('lat=51.5&lon=-3.5&model=other&url=https://example.com', async (url, options) => {
    requested = url;
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json(payload());
  }), now);
  assert.equal(res.status, 200);
  assert.equal(requested.origin, 'https://api.effis.emergency.copernicus.eu');
  assert.equal(requested.searchParams.get('model'), 'ecmwf');
  assert.equal(requested.searchParams.get('point'), '(-3.5 51.5)');
  assert.equal(requested.searchParams.get('day_gte'), '2026-10-15');
  assert.equal(requested.searchParams.get('day_lte'), '2026-10-25');
  assert.match(res.headers.get('cache-control'), /s-maxage=900/);
  const body = await res.json();
  assert.equal(body.latitude, 51.5);
  assert.equal(body.longitude, -3.5);
  assert.equal(body.model, 'ECMWF');
  assert.equal(body.retrievedAt, new Date(now).toISOString());
  assert.equal(body.days.length, 2);
});

test('point API rejects invalid coordinates and unbounded or invalid date ranges before fetching', async () => {
  for (const query of ['lon=0', 'lat=&lon=0', 'lat=NaN&lon=0', 'lat=91&lon=0',
    'lat=0&lon=-181', 'lat=0&lon=0&from=2026-02-30',
    'lat=0&lon=0&from=2020-01-01', 'lat=0&lon=0&to=2099-01-01',
    'lat=0&lon=0&from=2026-10-20&to=2026-10-16']) {
    const res = await getEffisPoint(event(query, () => assert.fail('must not fetch')), now);
    assert.equal(res.status, 400, query);
  }
  assert.equal((await getEffisPoint(event('lat=0&lon=0'), now)).status, 200);
});

test('upstream timeouts, HTTP errors, HTTP-200 HTML exceptions and malformed JSON fail without caching', async () => {
  for (const fetcher of [
    async () => { throw new Error('timeout'); },
    async () => new Response('unavailable', { status: 503 }),
    async () => new Response('<ServiceException>error</ServiceException>', { headers: { 'content-type': 'text/html' } }),
    async () => new Response('{', { headers: { 'content-type': 'application/json' } }),
    async () => Response.json({ x_data: [], y_data: {} }),
  ]) {
    const res = await getEffisPoint(event('lat=51.5&lon=-3.5', fetcher), now);
    assert.equal(res.status, 502);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.match((await res.json()).message, /temporarily unavailable/);
  }
});

test('offshore nodata remains unavailable rather than being labelled Low', async () => {
  const source = payload();
  for (const key of Object.keys(source.y_data)) source.y_data[key] = [-9999, -9999];
  const res = await getEffisPoint(event('lat=52&lon=-20', async () => Response.json(source)), now);
  for (const day of (await res.json()).days) {
    assert.equal(day.danger, null);
    for (const { key } of canadianIndices) assert.equal(day[key], null);
  }
});

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

for (const failure of [false, true]) {
  test(`location changes clear data, abort requests and ignore stale ${failure ? 'errors' : 'responses'}`, async () => {
    const first = deferred();
    let calls = 0;
    let firstSignal;
    const latest = { days: [{ date: '2026-10-17', fwi: 2 }] };
    const store = createEffisStore(async (_, { signal }) => {
      if (++calls === 1) { firstSignal = signal; return first.promise; }
      return Response.json(latest);
    });
    const older = store.load(51, -3);
    assert.equal(get(store).status, 'loading');
    await store.load(52, -4);
    assert.equal(firstSignal.aborted, true);
    if (failure) first.reject(new Error('old request'));
    else first.resolve(Response.json({ days: [{ fwi: 999 }] }));
    await older;
    assert.deepEqual(get(store), { status: 'ready', data: latest });
    store.reset();
    assert.deepEqual(get(store), { status: 'idle', data: null });
  });
}

test('switching out of forecast mode prevents in-flight results from appearing', async () => {
  const pending = deferred();
  const store = createEffisStore(() => pending.promise);
  const request = store.load(51, -3);
  store.reset();
  pending.resolve(Response.json({ days: [{ fwi: 10 }] }));
  await request;
  assert.equal(get(store).status, 'idle');
  assert.equal(get(store).data, null);
});

test('an independent EFFIS error can be retried successfully', async () => {
  let calls = 0;
  const store = createEffisStore(async () => ++calls === 1
    ? new Response('', { status: 502 }) : Response.json({ days: [] }));
  await store.load(51, -3);
  assert.equal(get(store).status, 'error');
  await store.load(51, -3);
  assert.equal(get(store).status, 'ready');
});

test('location-local date keys survive BST offsets and UTC day rollover', () => {
  // focusDay uses location-local-as-UTC milliseconds, not browser-local time.
  assert.equal(dayKey(Date.UTC(2026, 9, 17)), '2026-10-17');
  const instant = Date.UTC(2026, 9, 16, 23, 30);
  assert.equal(dayKey(instant + 3600000), '2026-10-17');
  assert.equal(dayKey(instant), '2026-10-16');
});
