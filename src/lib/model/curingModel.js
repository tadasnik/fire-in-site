/**
 * @file curingModel.js
 * Grass curing (cured herb fraction) prediction via ONNX, mirroring the LFMC
 * wrapper (lfmcModel.js).
 *
 * Model: HistGradientBoostingRegressor exported from the fuel-moisture repo
 * (export_curing_greenness.py), trained on 12 years of satellite greenness
 * (EVI2 converted per grid cell to a cured fraction) across UK grass cells under
 * leave-one-cell-out cross-validation. Feature order MUST match that export:
 *   [ ddur(s), ddur_change(s), vpdmax-7mean(kPa) ]
 * A single universal grass curve (no fuel one-hot): applied to the grass fuels
 * (grl/grm/grh) and to mixed-heath high-herb (mhh, small grass fraction). Output
 * = cured herb fraction (%), 0..100.
 *
 * Like LFMC, curing is per-day (astronomical day length + its change, plus the
 * shared 7-day-mean daily-max VPD), so it is predicted once per forecast and
 * stored as a per-day map (forecast.curingByDay) that modelStore reads by day
 * index. This replaces the analytic base + VPD-anomaly heuristic in grassCuring.js.
 */
import * as ort from 'onnxruntime-web/wasm';
import { daylightSeconds } from '$lib/model/grassCuring';
import { buildVpdMax7MeanByDay } from '$lib/model/lfmcModel';

ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = '/wasm/';

const MODEL_URL = '/wasm/model_curing.onnx';
const N_FEATURES = 3;
const DAY_MS = 86400000;

let _sessionPromise = null;
function getSession() {
  if (!_sessionPromise) _sessionPromise = ort.InferenceSession.create(MODEL_URL);
  return _sessionPromise;
}

/** Warm the ONNX session at app start so the first forecast doesn't pay the load. */
export function preloadCuring() {
  getSession().catch(() => { });
}

/** Batch inference. `inputs` is a flat Float array of N * N_FEATURES. Returns N predictions. */
export async function curingPredict(inputs) {
  try {
    const session = await getSession();
    const tensor = new ort.Tensor('float32', Float32Array.from(inputs), [inputs.length / N_FEATURES, N_FEATURES]);
    const results = await session.run({ X: tensor });
    return results.variable.cpuData;
  } catch (e) {
    console.log('curing ONNX inference failed:', e);
    return [];
  }
}

/**
 * Augment a forecast with per-day grass curing:
 *   forecast.curingByDay = { <dayIndex>: cured% }   (dayIndex = floor(time / DAY_MS))
 * Uses the same shared 7-day-mean daily-max VPD series as the LFMC model
 * (buildVpdMax7MeanByDay, seeded with past days). Constant within a day; varies
 * day to day. Consumed by modelStore for grl/grm/grh and mhh.
 */
export async function curingCalcs(forecast, latitude) {
  const vpd7ByDay = buildVpdMax7MeanByDay(forecast);
  const days = Object.keys(vpd7ByDay).map(Number).sort((a, b) => a - b);
  if (!days.length) return forecast;

  // Feature order must match export_curing_greenness.py: [ddur, ddur_change, vpd7mean].
  const inputs = [];
  for (const day of days) {
    const today = daylightSeconds(latitude, new Date(day * DAY_MS));
    const yesterday = daylightSeconds(latitude, new Date((day - 1) * DAY_MS));
    inputs.push(today, yesterday - today, vpd7ByDay[day] ?? 0);
  }

  const preds = await curingPredict(inputs);
  if (!preds.length) return forecast;

  const byDay = {};
  days.forEach((day, di) => {
    byDay[day] = Math.min(100, Math.max(0, preds[di]));
  });
  forecast.curingByDay = byDay;
  return forecast;
}
