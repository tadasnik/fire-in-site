import { getMapTile } from '$lib/server/mapTiles.js';

export function GET(event) {
  return getMapTile(event);
}
