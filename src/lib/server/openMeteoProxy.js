import { env } from '$env/dynamic/private';

/**
 * Shared server-side proxy for Open-Meteo *paid* endpoints (forecast, elevation).
 *
 * Open-Meteo's customer key is a plain query parameter with no domain / referrer
 * / IP restriction, so embedding it in the client bundle would leave it
 * unrestricted and stealable. These routes keep the key server-side: the browser
 * calls /api/<endpoint>?<same params>, we attach the key and forward to
 * customer-api.open-meteo.com, streaming the bytes straight back (works for both
 * flatbuffers forecast and JSON elevation responses).
 *
 * If OPENMETEO_API_KEY is unset (local dev without a key) we transparently fall
 * back to the free endpoint so the app keeps working.
 *
 * Note the free ERA5 *archive* endpoint is NOT proxied — it needs no key, is not
 * covered by the subscription, and goes direct from the browser. Keeping the
 * paid, high-frequency calls (forecast, elevation) on the subscription preserves
 * the free quota for archive/historical use.
 *
 * @param {{ url: URL, fetch: typeof globalThis.fetch }} event  the SvelteKit GET event
 * @param {string} customerUrl  full customer-api endpoint, e.g. .../v1/elevation
 * @param {string} freeUrl      full free endpoint used when no key is configured
 */
export async function proxyOpenMeteo({ url, fetch }, customerUrl, freeUrl) {
  const key = env.OPENMETEO_API_KEY;
  const params = new URLSearchParams(url.searchParams);
  params.delete('apikey'); // ignore any client-supplied key
  const base = key ? customerUrl : freeUrl;
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
