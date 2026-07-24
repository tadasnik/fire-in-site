/**
 * @file grassCuring.js
 * Continuous grass curing (cured herb fraction) for FireInSite.
 *
 * Replaces the discrete monthly `cured.herb.fraction` lookup table with:
 *   1. a smooth seasonal BASE, a linear function of daylight duration and its
 *      day-to-day change (ddur, ddur_change) — no month steps; and
 *   2. a one-sided heatwave BUMP that raises curing under hotter-than-normal
 *      conditions, driven by the same VPD/drought signal as the LFMC model.
 *
 * Provenance: coefficients fitted to UK moor-grass satellite greenness
 * (cured% = 1 - greenness) under spatial cross-validation. The base matches
 * the monthly climatology's skill (R^2 ~0.66) while being continuous; the bump
 * removes the static table's ~20-point under-curing bias during heatwaves.
 * See fuel-moisture repo: figures/continuous_curing.png, hybrid_grass_curing.png.
 *
 * Scale: returns cured herb fraction in PERCENT (0..100), matching the existing
 * `cured.herb.fraction` table. The base is on the satellite-greenness scale
 * (~14% mid-summer to ~88% mid-winter); see rescaleToAppRange() to stretch it
 * to the app's historical 20..100 endpoints if preferred.
 */

/** Fitted linear base: cured% = A + B*ddur + C*ddur_change  (ddur in seconds). */
const BASE_INTERCEPT = 128.19;
const BASE_DDUR = -1.7475e-3;
const BASE_DDUR_CHANGE = -5.2399e-2;

/** Default bump: curing-% added per +1 SD of positive VPD anomaly. */
export const DEFAULT_BETA = 13;

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
 * Standardised VPD anomaly for the heatwave bump: (vpd - normal) / sd.
 * `vpdNormal` and `vpdSd` are the local month-of-year VPD climatology (mean and
 * standard deviation) and belong in the data/forecast layer. Returns 0 when no
 * climatology is supplied, which reduces the model to the smooth base.
 */
export function vpdAnomalySd(vpd, vpdNormal, vpdSd) {
  if (vpdNormal == null || !vpdSd) return 0;
  return (vpd - vpdNormal) / vpdSd;
}

/**
 * Combined continuous grass curing = smooth base + one-sided heatwave bump.
 *
 * @param {Object} p
 * @param {number}  p.latitude          degrees north
 * @param {Date|number|string} p.date   date of the forecast step
 * @param {number} [p.vpdAnomalySd=0]   standardised VPD anomaly vs the local
 *        monthly normal; only positive (hotter-than-normal) values raise curing
 * @param {number} [p.beta=DEFAULT_BETA] curing-% per +1 SD of VPD anomaly
 * @returns {number} cured herb fraction, 0..100
 */
export function grassCuring({ latitude, date, vpdAnomalySd = 0, beta = DEFAULT_BETA }) {
  const base = grassCuringBase(latitude, date);
  const bump = beta * Math.max(0, vpdAnomalySd); // one-sided: heat only cures more
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
