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
// Bump when the cached object's shape changes (e.g. sd7 added) so old entries refetch.
const CLIM_VERSION = 2;

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

/** Reduce a value series to per-calendar-month mean, SD and count. */
export function monthlyStats(times, values) {
  const sum = new Array(12).fill(0);
  const sumSq = new Array(12).fill(0);
  const n = new Array(12).fill(0);
  for (let i = 0; i < times.length; i++) {
    const v = values[i];
    if (v == null || Number.isNaN(v)) continue;
    const m = new Date(times[i]).getUTCMonth();
    sum[m] += v;
    sumSq[m] += v * v;
    n[m] += 1;
  }
  const mean = sum.map((s, m) => (n[m] ? s / n[m] : null));
  const sd = sumSq.map((sq, m) =>
    n[m] > 1 ? Math.sqrt(Math.max(0, (sq - (sum[m] * sum[m]) / n[m]) / (n[m] - 1))) : null,
  );
  return { mean, sd, n };
}

/**
 * Trailing mean over `window` days (target day inclusive), averaging whatever
 * values in the window are present. Input series is assumed chronological.
 */
export function trailingMean(values, window = 7) {
  const out = new Array(values.length).fill(null);
  for (let i = 0; i < values.length; i++) {
    let s = 0, c = 0;
    for (let j = Math.max(0, i - window + 1); j <= i; j++) {
      const v = values[j];
      if (v != null && !Number.isNaN(v)) { s += v; c++; }
    }
    if (c) out[i] = s / c;
  }
  return out;
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
  const stats = monthlyStats(res.time, daily);
  // SD of the 7-day trailing mean — what the grass-curing bump is standardised against.
  const stats7 = monthlyStats(res.time, trailingMean(daily, 7));
  const round3 = (x) => (x == null ? null : Math.round(x * 1000) / 1000);
  return {
    mean: stats.mean.map(round3),
    sd: stats.sd.map(round3),
    sd7: stats7.sd.map(round3),
    n: stats.n,
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
 * Standardised VPD anomaly for a given day. Returns 0 (no bump / neutral
 * feature) when no climatology is available, so callers degrade gracefully.
 *
 * @param {number} vpdmax daily-max VPD for the day (same units as the archive: kPa)
 * @param {Date|number|string} date
 * @param {object|null} clim climatology from getVpdClimatology()
 */
export function vpdAnomalySd(vpdmax, date, clim) {
  if (!clim) return 0;
  const m = new Date(date).getUTCMonth();
  const mean = clim.mean?.[m];
  const sd = clim.sd?.[m];
  if (mean == null || !sd) return 0;
  return (vpdmax - mean) / sd;
}

/**
 * Standardised anomaly of the 7-day trailing mean of daily-max VPD, using the
 * month's 7-day-mean SD (`sd7`). This is the correct standardisation for the
 * grass-curing bump, whose input is the 7-day mean. The mean is shared with the
 * daily climatology: the monthly mean of the 7-day trailing mean equals the
 * monthly mean of the daily series to within edge effects, so `mean` is reused.
 * Falls back to the daily `sd` if `sd7` is absent (older cache), and 0 if no
 * climatology is available.
 *
 * @param {number} vpd7 7-day trailing mean of daily-max VPD (kPa)
 * @param {Date|number|string} date
 * @param {object|null} clim climatology from getVpdClimatology()
 */
export function vpdAnomalySd7(vpd7, date, clim) {
  if (vpd7 == null || Number.isNaN(vpd7) || !clim) return 0;
  const m = new Date(date).getUTCMonth();
  const mean = clim.mean?.[m];
  const sd = clim.sd7?.[m] ?? clim.sd?.[m];
  if (mean == null || !sd) return 0;
  return (vpd7 - mean) / sd;
}
