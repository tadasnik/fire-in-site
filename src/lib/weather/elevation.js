import LatLon from "geodesy/latlon-spherical.js";

/**
 * Point elevation, slope and aspect for a location, from the Open-Meteo
 * elevation API (Copernicus GLO-90 DEM) — no Mapbox required.
 *
 * The slope/aspect finite-difference math is the same as the former map-based
 * implementation; only the elevation source differs. Center + the four cardinal
 * neighbours are fetched in a single batched request.
 *
 * Sampling distance: the DEM is ~90 m, so sampling finer than that returns
 * repeated (quantized) elevations and a meaningless gradient. Empirically, 120–
 * 180 m is the stable band across varied UK terrain (below it is sub-DEM noise,
 * above it starts integrating the broader landform); 150 m is the default.
 * Because the DEM is coarse, absolute slope magnitude is smoothed relative to a
 * high-resolution DEM — aspect and moderate slopes are the reliable outputs.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} [distance=150] cardinal sampling distance in metres
 * @returns {Promise<{elevation:number, slope:number, aspect:number}>}
 *   slope in degrees, aspect in degrees from north (0=N, 90=E). Falls back to
 *   flat (slope 0, aspect 0) if the DEM is missing a neighbour.
 */
export async function elevationSlopeAspect(latitude, longitude, distance = 150) {
  const center = new LatLon(latitude, longitude);
  // Order: center, N, E, S, W — must match how we read the response below.
  const bearings = [null, 0, 90, 180, 270];
  const lats = [];
  const lons = [];
  for (const brg of bearings) {
    if (brg === null) {
      lats.push(latitude);
      lons.push(longitude);
    } else {
      const p = center.destinationPoint(distance, brg);
      lats.push(p.lat);
      lons.push(p.lon);
    }
  }

  // Proxied through our server route so the paid apikey stays server-side and
  // the free quota is preserved for archive/historical calls.
  const url =
    "/api/elevation?latitude=" +
    lats.map((v) => v.toFixed(6)).join(",") +
    "&longitude=" +
    lons.map((v) => v.toFixed(6)).join(",");

  const res = await fetch(url);
  if (!res.ok) throw new Error(`elevation API ${res.status}`);
  const data = await res.json();
  const e = data.elevation;
  if (!Array.isArray(e) || e.length < 5) throw new Error("elevation: bad response");

  const [c, n, east, s, w] = e;
  const elevation = c ?? 0;

  // Any missing neighbour (coast / no-data cell) → treat as flat rather than
  // producing a bogus gradient.
  if (n == null || east == null || s == null || w == null) {
    return { elevation, slope: 0, aspect: 0 };
  }

  const dzdx = (w - east) / (distance * 2);
  const dzdy = (s - n) / (distance * 2);
  const slope = Math.atan(Math.hypot(dzdx, dzdy)) * (180 / Math.PI);
  const aspectInit = 57.29578 * Math.atan2(dzdy, dzdx);
  const aspect = (450 - aspectInit) % 360;

  return { elevation, slope, aspect };
}
