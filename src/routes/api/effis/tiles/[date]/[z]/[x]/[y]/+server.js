import { getEffisTile } from '$lib/server/effisTiles.js';

export function GET(event) {
  return getEffisTile(event);
}
