import { dayKey, isDay } from '../weather/effis.js';
import { EFFIS_MAP_MAX_ZOOM, mercatorTileBounds } from '../weather/effisMap.js';

const DAY = 86400000;
const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

export async function getEffisTile({ params, fetch }, now = Date.now()) {
  const { date, z, x, y } = params;
  if (!isDay(date) || date < dayKey(now - 2 * DAY) || date > dayKey(now + 10 * DAY)
    || ![z, x, y].every(value => /^\d{1,6}$/.test(value))
    || Number(z) > EFFIS_MAP_MAX_ZOOM || Number(x) >= 2 ** Number(z) || Number(y) >= 2 ** Number(z)) {
    return new Response('Invalid EFFIS date or tile coordinates', {
      status: 400, headers: { 'cache-control': 'no-store' },
    });
  }
  // Fixed product, host, projection and dimensions; never proxy arbitrary WMS
  // URLs. XYZ is converted server-side to a bounded Web Mercator GetMap request.
  const upstreamUrl = new URL('https://maps.effis.emergency.copernicus.eu/gwis');
  upstreamUrl.search = new URLSearchParams({
    SERVICE: 'WMS', VERSION: '1.1.1', REQUEST: 'GetMap', LAYERS: 'ecmwf.fwi',
    STYLES: '', FORMAT: 'image/png', TRANSPARENT: 'true', SRS: 'EPSG:3857',
    BBOX: mercatorTileBounds(Number(z), Number(x), Number(y)).join(','),
    WIDTH: '256', HEIGHT: '256', TIME: date,
  }).toString();
  try {
    const upstream = await fetch(upstreamUrl, { signal: AbortSignal.timeout(15000) });
    if (!upstream.ok || !upstream.headers.get('content-type')?.includes('image/png')) throw new Error('EFFIS tile unavailable');
    const bytes = new Uint8Array(await upstream.arrayBuffer());
    // WMS exceptions may arrive with HTTP 200. Check PNG header and dimensions,
    // not just HTTP status or the advertised content type.
    if (bytes.length < 33 || !PNG_SIGNATURE.every((value, i) => bytes[i] === value)
      || String.fromCharCode(...bytes.slice(12, 16)) !== 'IHDR') throw new Error('Invalid EFFIS tile');
    const header = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (header.getUint32(16) !== 256 || header.getUint32(20) !== 256) throw new Error('Invalid EFFIS dimensions');
    return new Response(bytes, { headers: {
      'content-type': 'image/png', 'cache-control': 'public, max-age=300, s-maxage=900',
      'x-content-type-options': 'nosniff',
    } });
  } catch {
    return new Response('EFFIS map tiles temporarily unavailable', {
      status: 502, headers: { 'cache-control': 'no-store' },
    });
  }
}
