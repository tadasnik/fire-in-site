import { env } from '$env/dynamic/private';

const CUSTOMER = 'https://customer-api.open-meteo.com/v1/forecast';
const FREE = 'https://api.open-meteo.com/v1/forecast';

/**
 * Server-side proxy for Open-Meteo *forecast* requests.
 *
 * Open-Meteo's paid customer key is a plain query parameter with no domain /
 * referrer / IP restriction, so embedding it in the client bundle would leave
 * it unrestricted and stealable. This route keeps the key server-side: the
 * browser calls /api/forecast?<same params>, we attach the key and forward to
 * customer-api.open-meteo.com, and stream the (flatbuffers) bytes straight back
 * for the openmeteo client to decode.
 *
 * Historical / ERA5 archive calls need no key and are NOT routed here — they go
 * direct from the browser to archive-api.open-meteo.com.
 *
 * If OPENMETEO_API_KEY is unset (e.g. local dev without a key) we transparently
 * fall back to the free forecast endpoint so the app keeps working.
 */
export async function GET({ url, fetch }) {
  const key = env.OPENMETEO_API_KEY;
  const params = new URLSearchParams(url.searchParams);
  params.delete('apikey'); // ignore any client-supplied key
  const base = key ? CUSTOMER : FREE;
  if (key) params.set('apikey', key);

  let upstream;
  try {
    upstream = await fetch(`${base}?${params.toString()}`);
  } catch (e) {
    return new Response('upstream fetch failed', { status: 502 });
  }
  const body = await upstream.arrayBuffer();
  return new Response(body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'application/octet-stream',
      'cache-control': 'no-store',
    },
  });
}
