import { getEffisPoint } from '$lib/server/effisPoint.js';

export function GET(event) {
  return getEffisPoint(event);
}
