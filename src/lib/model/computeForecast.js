/**
 * @file computeForecast.js
 *
 * The hot path of the fire-behaviour pipeline, extracted from modelStore's
 * `_outputForecast` derived so it can be tested and (later) run in a Worker.
 *
 * This is deliberately a PURE function of (fireSim, inputsForecast): it reads no
 * stores and holds no module state, so the same inputs always produce the same
 * outputs. That property is what makes a golden-master test — and moving it off
 * the main thread — tractable. Keep it that way.
 *
 * Note it does depend on `fireSim`'s DAG already being configured (via
 * selectOutputs/updateConfig); a second FireSim instance must have the same
 * config applied before it will produce identical results.
 */
import { outputNodes } from '$lib/data/outputNodes.js'

// heatPerUnitArea and firelineIntensity come out of the model in base units and
// are scaled for display (MW etc.).
const CONVERT_UNITS = [
  "surface.weighted.fire.heatPerUnitArea",
  "surface.weighted.fire.firelineIntensity"
]

/**
 * Run the surface fire model for every fuel at every forecast timestep.
 *
 * @param {object} fireSim  A configured FireSim instance.
 * @param {Map<number, object>} inputsForecast  time -> { fuel -> inputs }
 * @returns {Map<number, Array<object>>} time -> [ { [fuel]: results } ]
 */
export function computeOutputForecast(fireSim, inputsForecast) {
  const resultForecast = new Map()
  inputsForecast.forEach((forecast, time) => {
    const output = []
    Object.keys(forecast).forEach((fuel) => {
      const result = fireSim.runBasic(forecast[fuel])[0]
      result["surface.primary.fuel.model.catalogKey"] = fuel
      CONVERT_UNITS.forEach((item) => {
        result[item] = result[item] * Number(outputNodes[item].multiplier)
      })
      output.push({ [fuel]: result })
    })
    resultForecast.set(time, output)
  })
  return resultForecast
}
