import { dayKey, isDay, normalizeEffis } from '../weather/effis.js';

const DAY = 86400000;
const UPSTREAM = 'https://api.effis.emergency.copernicus.eu/rest/2/burntareas/charts/wms';

function response(body, status = 200) {
  return Response.json(body, {
    status,
    headers: { 'cache-control': status === 200 ? 'public, max-age=300, s-maxage=900' : 'no-store' },
  });
}

export async function getEffisPoint({ url, fetch }, now = Date.now()) {
  const params = url.searchParams;
  const lat = params.get('lat');
  const lon = params.get('lon');
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!lat?.trim() || !lon?.trim() || !Number.isFinite(latitude) || !Number.isFinite(longitude)
    || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return response({ message: 'Valid latitude and longitude are required.' }, 400);
  }
  // Include yesterday for locations west of UTC and the full forecast horizon.
  const from = params.get('from') ?? dayKey(now - DAY);
  const to = params.get('to') ?? dayKey(now + 9 * DAY);
  if (!isDay(from) || !isDay(to) || from > to
    || from < dayKey(now - 2 * DAY) || to > dayKey(now + 10 * DAY)) {
    return response({ message: 'EFFIS dates must be within the current forecast window.' }, 400);
  }
  const upstreamUrl = new URL(UPSTREAM);
  upstreamUrl.search = new URLSearchParams({
    model: 'ecmwf', day_gte: from, day_lte: to, point: `(${longitude} ${latitude})`,
  }).toString();
  try {
    const upstream = await fetch(upstreamUrl, { signal: AbortSignal.timeout(15000) });
    if (!upstream.ok || !upstream.headers.get('content-type')?.includes('application/json')) {
      throw new Error('EFFIS unavailable');
    }
    const days = normalizeEffis(await upstream.json(), from, to);
    return response({
      source: 'Copernicus Emergency Management Service / EFFIS', model: 'ECMWF',
      resolutionKm: 8, latitude, longitude, retrievedAt: new Date(now).toISOString(), days,
    });
  } catch {
    return response({ message: 'EFFIS fire danger forecasts are temporarily unavailable. Please try again.' }, 502);
  }
}
