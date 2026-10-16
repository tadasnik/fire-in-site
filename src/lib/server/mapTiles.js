const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

export async function getMapTile({ params, url, fetch, request }) {
  const { z, x, y } = params;
  if (![z, x, y].every(value => /^\d{1,6}$/.test(value))
    || Number(z) > 18 || Number(x) >= 2 ** Number(z) || Number(y) >= 2 ** Number(z)) {
    return new Response('Invalid tile coordinates', { status: 400 });
  }
  try {
    // Fixed host: this route only serves the visible street-map tiles.
    const upstream = await fetch(`https://tile.openstreetmap.de/${Number(z)}/${Number(x)}/${Number(y)}.png`, {
      signal: AbortSignal.timeout(10000),
      headers: {
        'user-agent': 'FireInSite/1.0 (+https://fireinsite.org)',
        referer: request?.headers.get('referer') || `${url.origin}/`,
      },
    });
    if (!upstream.ok || upstream.headers.has('x-blocked')
      || !upstream.headers.get('content-type')?.includes('image/png')) {
      throw new Error('Tile unavailable');
    }
    const bytes = new Uint8Array(await upstream.arrayBuffer());
    if (!PNG_SIGNATURE.every((value, i) => bytes[i] === value)) throw new Error('Invalid tile');
    return new Response(bytes, {
      headers: {
        'content-type': 'image/png',
        'cache-control': upstream.headers.get('cache-control') || 'public, max-age=604800',
        ...(upstream.headers.get('etag') ? { etag: upstream.headers.get('etag') } : {}),
      },
    });
  } catch {
    return new Response('Street map tile temporarily unavailable', {
      status: 502, headers: { 'cache-control': 'no-store' },
    });
  }
}
