/**
 * @file grassCuring.js
 * Astronomy helpers for the fuel-moisture models, plus a legacy analytic grass
 * curing curve.
 *
 * `daylightSeconds` / `dayOfYear` are the shared day-length primitives used by
 * the LFMC (lfmcModel.js) and curing (curingModel.js) ONNX feature builders.
 *
 * NOTE: the deployed grass curing prediction is now the ONNX model in
 * curingModel.js (a gradient-boosted regressor trained on satellite greenness,
 * features [ddur, ddur_change, vpdmax-7mean]). The analytic `grassCuring` /
 * `grassCuringBase` below — a smooth day-length base plus a one-sided VPD-anomaly
 * heatwave bump — are the earlier heuristic, retained for reference/fallback and
 * no longer wired into the forecast path.
 *
 * Scale: returns cured herb fraction in PERCENT (0..100), matching the existing
 * `cured.herb.fraction` table.
 */

/** Fitted linear base: cured% = A + B*ddur + C*ddur_change  (ddur in seconds). */
const BASE_INTERCEPT = 128.19;
const BASE_DDUR = -1.7475e-3;
const BASE_DDUR_CHANGE = -5.2399e-2;

/** Default bump: curing-% added per +1 kPa of positive VPD anomaly (vpd7 above
 *  the local daily normal). ~26 pts/kPa matches the previous 13 pts/SD at the
 *  summer VPD SD (~0.5 kPa) while removing the low-variance-month amplification. */
export const DEFAULT_BETA = 26;

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

/** Day of year (1..366) in UTC. */
export function dayOfYear(date) {
  const d = new Date(date);
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  return Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - start) / 86400000);
}

/**
 * Astronomical daylight duration (sunrise to sunset), in SECONDS, at a given
 * latitude and date. Cooper (1969) declination + sunrise hour angle; matches
 * Open-Meteo `daylight_duration`, which the base coefficients were fitted on.
 *
 * @param {number} latitude degrees north
 * @param {Date|number|string} date
 * @returns {number} daylight seconds (0 at polar night, 86400 at polar day)
 */
export function daylightSeconds(latitude, date) {
  const n = dayOfYear(date);
  const phi = (latitude * Math.PI) / 180;
  const decl = 0.4092797 * Math.sin((2 * Math.PI * (284 + n)) / 365); // ~23.45 deg
  const cosH = -Math.tan(phi) * Math.tan(decl);
  if (cosH <= -1) return 86400; // sun never sets
  if (cosH >= 1) return 0; // sun never rises
  const H = Math.acos(cosH); // sunrise hour angle, radians
  const hours = (24 * H) / Math.PI;
  return hours * 3600;
}

/**
 * Continuous seasonal base curing (%), 0..100, from latitude + date.
 * ddur_change = ddur(yesterday) - ddur(today), so it is negative while days
 * lengthen (spring) and positive while they shorten (autumn) — this encodes
 * the spring/autumn asymmetry a bare day-length cannot.
 */
export function grassCuringBase(latitude, date) {
  const today = daylightSeconds(latitude, date);
  const yesterday = daylightSeconds(latitude, new Date(new Date(date).getTime() - 86400000));
  const ddurChange = yesterday - today;
  const cured = BASE_INTERCEPT + BASE_DDUR * today + BASE_DDUR_CHANGE * ddurChange;
  return clamp(cured, 0, 100);
}

/**
 * Combined continuous grass curing = smooth base + one-sided heatwave bump.
 * The anomaly (vpdAnomaly) is the absolute kPa departure of 7-day-mean VPD from
 * the local daily-normal (see vpdClimatology.vpdAnomalyAbs); only positive
 * (hotter-than-normal) departures raise curing.
 *
 * @param {Object} p
 * @param {number}  p.latitude        degrees north
 * @param {Date|number|string} p.date date of the forecast step
 * @param {number} [p.vpdAnomaly=0]   VPD anomaly in kPa vs the local daily normal
 * @param {number} [p.beta=DEFAULT_BETA] curing-% per +1 kPa of VPD anomaly
 * @returns {number} cured herb fraction, 0..100
 */
export function grassCuring({ latitude, date, vpdAnomaly = 0, beta = DEFAULT_BETA }) {
  const base = grassCuringBase(latitude, date);
  const bump = beta * Math.max(0, vpdAnomaly); // one-sided: heat only cures more
  return clamp(base + bump, 0, 100);
}

/**
 * Optional: linearly stretch the satellite-greenness base scale (~14..88) onto
 * the app's historical monthly-table endpoints (~20..100), preserving shape.
 */
export function rescaleToAppRange(cured, srcLo = 14, srcHi = 88, dstLo = 20, dstHi = 100) {
  const t = (cured - srcLo) / (srcHi - srcLo);
  return clamp(dstLo + t * (dstHi - dstLo), 0, 100);
}
