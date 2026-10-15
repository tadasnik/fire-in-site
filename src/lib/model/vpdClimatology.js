/**
 * @file vpdClimatology.js
 * Per-location monthly climatology of daily-max VPD, used to standardise the
 * VPD anomaly that drives (a) the grass-curing heatwave bump and (b) the LFMC
 * model's VPD-anomaly feature.
 *
 * Global: pulls ~10 years of daily `vapour_pressure_deficit_max` from the
 * Open-Meteo ERA5 archive (works anywhere the app is used), reduces it to a
 * 12-month mean + SD, and caches it in localStorage keyed by the ERA5-Land
 * ~0.1 deg grid cell so nearby / re-visited (stored) locations reuse one fetch.
 *
 * Anomaly (SD units):  a = (vpd_today - mean[month]) / sd[month]
 * Only the positive side is used downstream (hotter-than-normal => drier fuel).
 *
 * Two SDs are stored per month: `sd` for a single day's max VPD, and `sd7` for
 * the 7-day trailing mean of daily-max VPD. The grass-curing bump is driven by
 * the 7-day mean (see lfmcModel / modelStore), whose variance is ~0.6-0.75x the
 * daily variance, so it must be standardised against `sd7` — using `sd` would
 * understate the anomaly and the heatwave bump would fire ~30% too weak.
 */
import { fetchDailyMeteo } from '$lib/weather/openMeteo';

const CACHE_KEY = 'fire-in-site-vpd-climatology';
const CELL = 0.1; // ERA5-Land grid; ~11 km — nearby points share a climatology
// Bump when the cached object's shape changes so old entries refetch.
// v3: daily (DOY) mean climatology, absolute anomaly (replaces monthly mean/sd).
const CLIM_VERSION = 3;

/**
 * Climatology window: the 10 complete calendar years ending at the last full
 * year, excluding the partial current year — e.g. 2016-01-01 .. 2025-12-31 during 2026.
 */
function climatologyWindow() {
  const endYear = new Date().getUTCFullYear() - 1; // last complete year (2025 in 2026)
  return { startYear: endYear - 9, endYear }; // 2016..2025 (10 years)
}

/** Stable cache key: snap to the 0.1 deg grid. */
export function cellKey(latitude, longitude) {
  const lat = (Math.round(latitude / CELL) * CELL).toFixed(1);
  const lon = (Math.round(longitude / CELL) * CELL).toFixed(1);
  return `${lat},${lon}`;
}

function loadCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* quota / private mode — climatology just won't persist */
  }
}

/** Day of year (1..365, leap Dec-31 folded to 365) for an epoch-ms timestamp. */
export function dayOfYearUTC(ms) {
  const d = new Date(ms);
  const soy = Date.UTC(d.getUTCFullYear(), 0, 1);
  const day = Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - soy) / 86400000) + 1;
  return Math.min(365, day);
}

/**
 * Smooth day-of-year climatological mean via a circular centred window
 * (+/- `window` days) pooled across all years. Returns a 365-length array
 * (index 0 = DOY 1). A daily normal, unlike the old 12-month step means, so the
 * anomaly has no month-boundary discontinuities. The mean of daily-max VPD
 * equals the mean of its 7-day trailing mean up to edge effects, so this normal
 * is the correct reference for the 7-day-mean anomaly the curing bump uses.
 */
export function dailyMean(times, values, window = 15) {
  const byDoy = Array.from({ length: 366 }, () => []);
  for (let i = 0; i < times.length; i++) {
    const v = values[i];
    if (v == null || Number.isNaN(v)) continue;
    byDoy[dayOfYearUTC(times[i])].push(v);
  }
  const mean = new Array(365).fill(null);
  for (let d = 1; d <= 365; d++) {
    let s = 0, c = 0;
    for (let k = -window; k <= window; k++) {
      let dd = d + k;
      if (dd < 1) dd += 365; else if (dd > 365) dd -= 365;
      const arr = byDoy[dd];
      for (let j = 0; j < arr.length; j++) { s += arr[j]; c++; }
    }
    if (c) mean[d - 1] = s / c;
  }
  return mean;
}

/** Fetch and compute the climatology for a point (no caching). */
export async function fetchVpdClimatology(latitude, longitude) {
  const { startYear, endYear } = climatologyWindow();
  const res = await fetchDailyMeteo({
    latitude,
    longitude,
    daily: ['vapour_pressure_deficit_max'],
    timezone: 'UTC',
    timeformat: 'unixtime',
    forecast_mode: 'historical',
    models: 'era5_seamless',
    start_date: `${startYear}-01-01`,
    end_date: `${endYear}-12-31`,
  });
  const daily = res['vapour_pressure_deficit_max'];
  // Smooth daily (DOY) climatological mean — the local "normal" the grass-curing
  // anomaly is measured against (absolute kPa deviation, not SD-standardised).
  const round3 = (x) => (x == null ? null : Math.round(x * 1000) / 1000);
  return {
    meanDaily: dailyMean(res.time, daily, 15).map(round3),
    years: [startYear, endYear],
    ts: Date.now(),
    v: CLIM_VERSION,
  };
}

/**
 * Get the climatology for a location: cached (per 0.1 deg cell, refreshed
 * yearly) or freshly fetched. Returns null if the fetch fails.
 */
export async function getVpdClimatology(latitude, longitude) {
  const key = cellKey(latitude, longitude);
  const cache = loadCache();
  const hit = cache[key];
  // Reuse the cache while it matches the current object version and already
  // covers the window's last full year; refetch when a new year is available
  // or the stored shape is stale (e.g. pre-sd7 entries).
  const { endYear } = climatologyWindow();
  if (hit && hit.v === CLIM_VERSION && Array.isArray(hit.years) && hit.years[1] >= endYear) return hit;
  try {
    const clim = await fetchVpdClimatology(latitude, longitude);
    cache[key] = clim;
    saveCache(cache);
    return clim;
  } catch (err) {
    console.error('VPD climatology fetch failed:', err);
    return hit ?? null; // fall back to a stale entry if we have one
  }
}

/** Fire-and-forget warm-up, e.g. when a location is searched/saved. */
export function prefetchVpdClimatology(latitude, longitude) {
  getVpdClimatology(latitude, longitude).catch(() => {});
}

/**
 * Absolute VPD anomaly (kPa) of the 7-day-mean VPD vs the local daily-normal.
 * This is the reference the grass-curing bump uses. It is climate-relative (a
 * drier climate has a higher normal, so the same weather registers a smaller
 * anomaly), but NOT SD-standardised — dividing by a per-month SD amplified noise
 * in low-variance (winter) months and stepped at month boundaries. Returns 0
 * (no bump) when no climatology is available, so callers degrade gracefully.
 *
 * @param {number} vpd7 7-day trailing mean of daily-max VPD (kPa)
 * @param {Date|number|string} date
 * @param {object|null} clim climatology from getVpdClimatology()
 * @returns {number} vpd7 - normal(dayOfYear), in kPa
 */
export function vpdAnomalyAbs(vpd7, date, clim) {
  if (vpd7 == null || Number.isNaN(vpd7) || !clim?.meanDaily) return 0;
  const doy = dayOfYearUTC(new Date(date).getTime());
  const mean = clim.meanDaily[doy - 1];
  if (mean == null) return 0;
  return vpd7 - mean;
}
