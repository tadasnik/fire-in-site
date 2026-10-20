import { isDay } from './effis.js';

const HALF_WORLD = 20037508.342789244;
export const EFFIS_MAP_MAX_ZOOM = 8;

export function mercatorTileBounds(z, x, y) {
  const span = 2 * HALF_WORLD / 2 ** z;
  return [x * span - HALF_WORLD, HALF_WORLD - (y + 1) * span,
    (x + 1) * span - HALF_WORLD, HALF_WORLD - y * span];
}

export function effisTileTemplate(date) {
  if (!isDay(date)) throw new Error('Invalid EFFIS map date');
  return `/api/effis/tiles/${date}/{z}/{x}/{y}`;
}

// Replace the source, rather than retaining yesterday's tiles while a new date
// loads. Date-specific source IDs also let us ignore late errors from old tiles.
export function replaceEffisLayer(map, date, opacity = 0.65) {
  const previous = map.getLayer('effis-fwi');
  if (previous) {
    map.removeLayer('effis-fwi');
    map.removeSource(previous.source);
  }
  const id = `effis-${date}`;
  map.addSource(id, {
    type: 'raster', tiles: [effisTileTemplate(date)], tileSize: 256,
    maxzoom: EFFIS_MAP_MAX_ZOOM,
    attribution: '<a href="https://forest-fire.emergency.copernicus.eu/">CEMS / EFFIS</a> · ECMWF',
  });
  map.addLayer({ id: 'effis-fwi', type: 'raster', source: id, paint: {
    'raster-opacity': opacity, 'raster-resampling': 'nearest', 'raster-fade-duration': 0,
  } });
  return id;
}
