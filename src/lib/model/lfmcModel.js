/**
 * @file lfmcModel.js
 * Live fuel moisture content (LFMC) prediction via ONNX, mirroring the dead
 * fuel moisture wrapper (fireInSiteFFMC.js).
 *
 * Model: HistGradientBoostingRegressor exported from the fuel-moisture repo
 * (export_lfmc_min.py). Feature order MUST match that export:
 *   [ vpdmax-7mean(kPa), ddur(s), ddur_change(s), <7 fuel one-hots> ]
 * where vpdmax-7mean is the 7-day trailing mean of daily-max VPD (not same-day)
 * — chosen because live fuel moisture is highly autocorrelated and changes
 * slowly; a daily value produces implausibly jumpy time series. The trailing
 * window is seeded with past days' daily max VPD (forecast._pastVpdMaxByDay,
 * from the ERA5 archive) since the forecast fetch only carries 1 past day.
 * Fuel one-hot order = COMPONENTS below. Output = live FMC (%).
 *
 * Unlike deadFFMC, the ONNX session is created once and reused.
 */
import * as ort from 'onnxruntime-web/wasm';
import { daylightSeconds } from '$lib/model/grassCuring';

ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = '/wasm/';

const MODEL_URL = '/wasm/lfmc_min.onnx';
const N_FEATURES = 10;

/** Fuel one-hot order — must match export_lfmc.py FUELS. */
export const COMPONENTS = [
  'bracken_leaves', 'bracken_stem', 'gorse_canopy', 'gorse_stem',
  'heather_canopy', 'heather_stem', 'moor_grass',
];

/** App fuel code -> representative live LFMC component for site.moisture.live.category.
 *  Fuels not listed keep the climatology live moisture (no clear component). */
export const FUEL_TO_COMPONENT = {
  grl: 'moor_grass', grm: 'moor_grass', grh: 'moor_grass',
  gl: 'gorse_canopy', gm: 'gorse_canopy', gh: 'gorse_canopy', gt: 'gorse_canopy',
  cll: 'heather_canopy', clm: 'heather_canopy', clh: 'heather_canopy', clt: 'heather_canopy', cld: 'heather_canopy',
  mhl: 'heather_canopy', mhh: 'heather_canopy',
  bk: 'bracken_leaves', bch: 'bracken_leaves', bl: 'bracken_leaves', bv: 'bracken_leaves',
};

let _sessionPromise = null;
function getSession() {
  if (!_sessionPromise) _sessionPromise = ort.InferenceSession.create(MODEL_URL);
  return _sessionPromise;
}

/** Warm the ONNX session at app start so the first forecast doesn't pay the load. */
export function preloadLfmc() {
  getSession().catch(() => { });
}

/** Batch inference. `inputs` is a flat Float array of N * N_FEATURES. Returns N predictions. */
export async function lfmcPredict(inputs) {
  try {
    const session = await getSession();
    const tensor = new ort.Tensor('float32', Float32Array.from(inputs), [inputs.length / N_FEATURES, N_FEATURES]);
    const results = await session.run({ X: tensor });
    return results.variable.cpuData;
  } catch (e) {
    console.log('LFMC ONNX inference failed:', e);
    return [];
  }
}

/**
 * Augment a forecast with per-timestep live FMC per component:
 * forecast['lfmc_<component>'] = [fmc% per timestep]. Features are per-day
 * (daily-max VPD + astronomical day length), so a fuel's LFMC is constant
 * within a day and varies day to day.
 */
const DAY_MS = 86400000;

/**
 * Canonical per-day 7-day trailing mean of daily-max VPD for a forecast, seeded
 * with the preceding days (forecast._pastVpdMaxByDay, from the ERA5 archive) so
 * the window is complete at the forecast start. This is the single shared VPD
 * series consumed by BOTH the LFMC model (as an absolute feature) and the grass-
 * curing bump (standardised into an anomaly). Computed once and memoised on
 * forecast.vpdMax7MeanByDay. Returns a { dayIndex: vpd7mean } map.
 */
export function buildVpdMax7MeanByDay(forecast) {
  const times = forecast.time || [];
  const vpd = forecast['vapour_pressure_deficit'] || [];
  // Forecast-window days come from the (locally computed, model-independent)
  // hourly VPD; earlier days are seeded from the past-days fetch.
  const dailyMaxVpd = { ...(forecast._pastVpdMaxByDay || {}) };
  for (let k = 0; k < times.length; k++) {
    const day = Math.floor(times[k] / DAY_MS);
    const v = vpd[k];
    if (v != null && !Number.isNaN(v) && (dailyMaxVpd[day] == null || v > dailyMaxVpd[day])) {
      dailyMaxVpd[day] = v;
    }
  }
  // 7-day trailing mean (target day inclusive) over whatever days have data.
  const byDay = {};
  for (const key of Object.keys(dailyMaxVpd)) {
    const day = Number(key);
    let sum = 0, cnt = 0;
    for (let d = day - 6; d <= day; d++) {
      const v = dailyMaxVpd[d];
      if (v != null && !Number.isNaN(v)) { sum += v; cnt++; }
    }
    byDay[day] = cnt ? sum / cnt : (dailyMaxVpd[day] ?? 0);
  }
  forecast.vpdMax7MeanByDay = byDay;
  return byDay;
}

// Response-time relaxation of a daily series: L_t = L_{t-1} + a*(Leq_t - L_{t-1}),
// a = 1 - exp(-1/tau). Live fuel moisture is highly autocorrelated and changes
// slowly, so the raw day-to-day model output is smoothed toward a fuel time
// constant. tau=7d removes ~80% of day-to-day jitter with no loss of skill
// (leave-location-out July RMSE unchanged/slightly better). Applied over the
// full past+forecast day range so the filter is warmed up by the start of the
// forecast rather than cold-starting mid-window.
export const LFMC_TAU_DAYS = 7;
function ewmaRelax(values, tau) {
  const alpha = 1 - Math.exp(-1 / tau);
  const out = new Array(values.length);
  let s = values[0];
  for (let i = 0; i < values.length; i++) {
    if (values[i] != null && !Number.isNaN(values[i])) s = s + alpha * (values[i] - s);
    out[i] = s;
  }
  return out;
}

export async function lfmcCalcs(forecast, latitude) {
  const times = forecast.time || [];
  const n = times.length;
  if (!n) return forecast;

  const dayOf = times.map((t) => Math.floor(t / DAY_MS));
  const vpd7ByDay = buildVpdMax7MeanByDay(forecast);

  // Predict over every day that has VPD data — this includes the seeded past
  // days, which serve to warm up the relaxation filter below before the forecast
  // window begins. Days are sorted so the filter runs chronologically.
  const days = Object.keys(vpd7ByDay).map(Number).sort((a, b) => a - b);
  const dayDdur = {};
  const dayDdurChange = {};
  for (const day of days) {
    const today = daylightSeconds(latitude, new Date(day * DAY_MS));
    const yesterday = daylightSeconds(latitude, new Date((day - 1) * DAY_MS));
    dayDdur[day] = today;
    dayDdurChange[day] = yesterday - today;
  }

  const inputs = [];
  for (const day of days) {
    const vpdFeat = vpd7ByDay[day] ?? 0;
    for (let ci = 0; ci < COMPONENTS.length; ci++) {
      inputs.push(vpdFeat, dayDdur[day], dayDdurChange[day]);
      for (let j = 0; j < COMPONENTS.length; j++) inputs.push(j === ci ? 1 : 0);
    }
  }

  const preds = await lfmcPredict(inputs);
  if (!preds.length) return forecast;

  // Reshape to per-component daily series, relax each, then index by day.
  const byDayComp = {};
  for (const day of days) byDayComp[day] = {};
  for (let ci = 0; ci < COMPONENTS.length; ci++) {
    const comp = COMPONENTS[ci];
    const series = days.map((_, di) => preds[di * COMPONENTS.length + ci]);
    const smoothed = ewmaRelax(series, LFMC_TAU_DAYS);
    days.forEach((day, di) => { byDayComp[day][comp] = smoothed[di]; });
  }
  for (const comp of COMPONENTS) {
    forecast['lfmc_' + comp] = times.map((_, k) => byDayComp[dayOf[k]]?.[comp]);
  }
  return forecast;
}
