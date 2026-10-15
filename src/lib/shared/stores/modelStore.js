import { writable, derived, get, readable } from 'svelte/store'
import { inputNodes } from '$lib/data/inputNodes.js'
import { fuelNodes } from '$lib/data/fuelNodes.js'
import { outputNodes } from "$lib/data/outputNodes.js";
import { fuelMoisture } from "$lib/data/fuelMoisture";
import { modelConfigOptions } from '$lib/data/configuration';
import { getMonth, getHour, month } from "$lib/shared/stores/timeStore";
import { elevationDiff, forecastOpenMeteo, forecastDaysPast } from "$lib/shared/stores/forecastStore";
import { currentLocation } from "$lib/shared/stores/locationStore";
import UKFuelModels from '$lib/data/UKFuelModels.json'
import FireSim from '$lib/model/surfaceFireOptimized.js'
import { FUEL_TO_COMPONENT } from '$lib/model/lfmcModel';
import { computeOutputForecast } from '$lib/model/computeForecast.js';

export const inputNodesStore = writable(inputNodes)
export const fireSim = new FireSim({ ...inputNodes, ...fuelNodes, ...outputNodes })
export const selectedOutputs = writable(['surface.weighted.fire.spreadRate',
  'surface.weighted.fire.heatPerUnitArea',
  'surface.weighted.fire.firelineIntensity',
  'surface.weighted.fire.flameLength',
  'site.moisture.dead.category',
  'ignition.firebrand.probability',
])

export const commonOutputs = readable(["ignition.firebrand.probability", "site.moisture.dead.category"])
export const selectedInput = writable('site.moisture.dead.category')
export const selectedOutput = writable('surface.weighted.fire.spreadRate')
export const fuelMoistureModel = writable('fireInSite')
export const scenarios = writable([])
export const modelConfigValues = writable(modelConfigOptions)
export const selectedFuels = writable(['cll', 'clm', 'clh', 'clt', 'mhl', 'mhh', 'gl', 'gm', 'gh', 'gt', 'grl', 'grm', 'grh', 'bk', 'wb', 'bv', 'sn', 'bl', 'ln', 'bch'])
export const selectedFuel = writable('cl1')
export const secondaryFuel = writable(['gr6'])
export const advancedMode = writable(false)
export const chartType = writable("bars")

// Grass curing method: 'climatology' = static monthly table (cured.herb.fraction),
// 'phenology' = weather-driven ONNX curing model (per-day, forecast.curingByDay).
export const grassCuringMode = writable('climatology')
// Live fuel moisture method: 'climatology' = monthly table (site.moisture.live.category),
// 'lfmc' = weather-driven ONNX LFMC model (per mapped fuel component).
export const liveMoistureMode = writable('climatology')

export const canopyInputs = writable({
  "site.canopy.fuel.foliar.moistureContent": [120],
  // "site.canopy.crown.baseHeight": [5],
  // "site.canopy.crown.totalHeight": [20],
})

export const fuelMoistureInputs = writable({
  "site.moisture.dead.tl1h": [0.05],
})

export const fuelInputsList = readable({
  'static': [
    // "surface.primary.fuel.model.behave.parms.cured.herb.fraction",
    "surface.primary.fuel.model.behave.parms.total.herb.ovendryLoad",
    "surface.primary.fuel.model.behave.parms.dead.tl1h.ovendryLoad",
    "surface.primary.fuel.model.behave.parms.dead.tl10h.ovendryLoad",
    "surface.primary.fuel.model.behave.parms.dead.tl100h.ovendryLoad",
    "surface.primary.fuel.model.behave.parms.live.stem.ovendryLoad",
    "surface.primary.fuel.model.behave.parms.dead.tl1h.surfaceAreaToVolumeRatio",
    "surface.primary.fuel.model.behave.parms.live.herb.surfaceAreaToVolumeRatio",
    "surface.primary.fuel.model.behave.parms.live.stem.surfaceAreaToVolumeRatio",
    "surface.primary.fuel.model.behave.parms.depth",
    "surface.primary.fuel.model.behave.parms.dead.extinction.moistureContent",
  ],
  'heatOfCombustion': [
    "surface.primary.fuel.model.behave.parms.dead.heatOfCombustion",
    "surface.primary.fuel.model.behave.parms.live.heatOfCombustion",
  ]
})

export const siteInputsStore = writable({
  "site.moisture.dead.category": 8,
  "site.moisture.live.category": 116,
  "surface.primary.fuel.model.behave.parms.cured.herb.fraction": 50,
  // "site.canopy.crown.baseHeight":
  // "site.canopy.crown.totalHeight",
  // "site.canopy.cover",
  "site.slope.steepness.degrees": 10,
  "site.wind.speed.at10m": 5,
  "site.slope.direction.aspect": 180,
  "site.wind.direction.source.fromNorth": 0,
})

export const monthIndex = derived([month], ([$month]) => {
  return $month + 1
})
export function getFuelInputs(fuel, month) {
  const inputs = {}
  const fuelIns = get(fuelInputs)
  // console.log('fuelIns :', fuelIns)
  const fuelInputsKeys = get(fuelInputsList)
  fuelInputsKeys['static'].forEach((input) => {
    // console.log('input :', fuelIns[fuel])
    inputs[input] = Number(fuelIns[fuel][input])
  })
  fuelInputsKeys['heatOfCombustion'].forEach((input) => {
    inputs[input] = Number(fuelIns[fuel][input][month] * 1000)
  })
  return inputs
}

export const fuelsInputs = derived([selectedFuels, monthIndex], ([$selectedFuels, $monthIndex]) => {
  const fuelsInputs = {}
  $selectedFuels.forEach((fuel) => {
    const inputs = getFuelInputs(fuel, $monthIndex)
    fuelsInputs[fuel] = inputs
  })
  return fuelsInputs
})


export const userInputs = derived([fuelsInputs, siteInputsStore], ([$fuelsInputs, $siteInputsStore]) => {
  const inputs = {}
  for (const [fuel, values] of Object.entries($fuelsInputs)) {
    inputs[fuel] = { ...values, ...$siteInputsStore }
  }
  // console.log('userInputs :', inputs)
  return inputs
})

export const siteInputs = writable(inputNodes)

const fuelProps = {}
for (const [f_key, f_values] of Object.entries(UKFuelModels)) {
  fuelProps[f_key] = {}
  for (const [key, values] of Object.entries(fuelNodes)) {
    if (Number(f_values[values.catalogParam])) {
      fuelProps[f_key][key] = f_values[values.catalogParam].toFixed(values.decimals)
    } else {
      fuelProps[f_key][key] = f_values[values.catalogParam]
    }
  }
}

export const fuelInputs = writable(fuelProps)

export const requiredConfig = derived(selectedOutputs, ($selectedOutputs) => {
  const requiredC = fireSim.selectOutputs($selectedOutputs)
  // console.log('requiredConfig :', requiredC)
  return requiredC
})

export const config = derived(
  [requiredConfig, modelConfigValues],
  ([$requiredConfig, $modelConfigValues]) => {
    const configArray = []
    $requiredConfig.forEach((item) => {
      // console.log('item :', item)
      configArray.push([item, $modelConfigValues[item].value])
    })
    return configArray
  }
)

export const requiredInputs = derived(config, ($config) => {
  // console.log('required config :', $config)
  const requiredI = fireSim.updateConfig($config)
  // console.log('requiredInputs :', requiredI)
  return requiredI
})

export const requiredSiteInputsForecastOpen = derived(
  [requiredInputs, forecastOpenMeteo, fuelMoistureModel, forecastDaysPast],
  ([$requiredInputs, $forecastOpenMeteo, $fuelMoistureModel, $forecastDaysPast]) => {
    const requiredSiteInputs = new Map()
    const forecastInputs = {
      "site.temperature.air": "temperature_2m",
      "site.temperature.relativeHumidity": "relative_humidity_2m",
      "site.wind.speed.at10m": "wind_speed_10m",
      "site.wind.direction.source.fromNorth": "wind_direction_10m",
    }
    // Read-latest, deliberately NOT a tracked dependency. Terrain is only ever
    // written together with a forecast refetch (Map.svelte, LocationSearch.svelte),
    // so the forecast update below already carries the new slope/aspect through.
    // Making these reactive would run the whole ~5k-fireSim cascade twice per
    // location change: once on the location write, again when the forecast lands.
    // If a terrain-only edit path is ever added, revisit this.
    const location = get(currentLocation)
    const locationInputs = {
      "site.slope.direction.aspect": location.aspect,
      "site.slope.steepness.degrees": location.slope,
      "site.location.elevation.diff": get(elevationDiff)
    }
    const deadMoistureCategories = { "site.moisture.dead.category": 0, "site.moisture.dead.tl1h": 0, "site.moisture.dead.tl10h": 2, "site.moisture.dead.tl100h": 4 }

    // Hoisted out of the per-timestep loop: these are invariant for the whole run.
    const pastHours = $forecastDaysPast * 24
    const useNelson = $fuelMoistureModel == "Nelson"
    const TIME_INPUT_KEYS = new Set(["site.date.month", "site.time.hour"])

    $forecastOpenMeteo.time.forEach((time, nr) => {
      const requiredSiteI = {}
      // Do not run for past days
      if (nr < pastHours) {
        requiredSiteInputs.set(time, requiredSiteI)
        return
      }
      const date = new Date(time)
      const timeInputs = { "site.date.month": getMonth(date), "site.time.hour": getHour(date) }
      $requiredInputs.forEach((input) => {
        if (input in forecastInputs) {
          requiredSiteI[input] = [$forecastOpenMeteo[forecastInputs[input]][nr]]
        } else if (input == "site.temperature.shading") {
          requiredSiteI[input] = [$forecastOpenMeteo["cloud_cover"]]
        } else if (TIME_INPUT_KEYS.has(input)) {
          requiredSiteI[input] = [timeInputs[input]]
        } else if (input in locationInputs) {
          requiredSiteI[input] = [locationInputs[input]]
        } else if (useNelson && input in deadMoistureCategories) {
          requiredSiteI[input] = [$forecastOpenMeteo["ffmc_nelson"][nr] + deadMoistureCategories[input]]
        }
      })
      requiredSiteInputs.set(time, requiredSiteI)
    })
    return requiredSiteInputs
  }
);

export const requiredFuelInputs = derived(
  [requiredInputs, selectedFuels, secondaryFuel, fuelInputs, monthIndex],
  ([$requiredInputs, $selectedFuels, $secondaryFuel, $fuelInputs, $monthIndex]) => {
    // Classify each required input once (splitting the dotted key is invariant
    // across fuels), then the per-fuel loop is a cheap switch on the result.
    const classified = []
    $requiredInputs.forEach((input) => {
      const splitKey = input.split('.')
      let kind = null
      if (
        splitKey[0] === 'surface' &&
        splitKey[1] === 'primary' &&
        splitKey.at(-1) === 'catalogKey'
      ) {
        kind = 'primaryKey'
      } else if (
        splitKey[0] === 'site' &&
        splitKey[1] === 'moisture' &&
        splitKey[2] === 'live'
        ||
        splitKey[7] === 'herb' &&
        splitKey[8] === 'fraction'
      ) {
        kind = 'monthly'
      } else if (
        splitKey[0] === 'surface' &&
        splitKey[1] === 'secondary' &&
        splitKey.at(-1) === 'catalogKey'
      ) {
        kind = 'secondaryKey'
      } else if (
        splitKey[1] === 'primary' &&
        splitKey[4] === 'behave'
      ) {
        // heatOfCombustion varies by month and needs converting to J/kg from kJ/kg
        kind = splitKey.at(-1) === 'heatOfCombustion' ? 'heatOfCombustion' : 'behave'
      }
      if (kind) classified.push([input, kind])
    })

    const requiredFuelI = {}
    $selectedFuels.forEach((fuel) => {
      const fuelI = {}
      const fuelIn = $fuelInputs[fuel]
      const fuelMoist = fuelMoisture[fuel]
      for (const [input, kind] of classified) {
        if (kind === 'primaryKey') {
          fuelI[input] = [fuel]
        } else if (kind === 'monthly') {
          fuelI[input] = [fuelMoist[input][$monthIndex]]
        } else if (kind === 'secondaryKey') {
          fuelI[input] = $secondaryFuel
        } else if (kind === 'heatOfCombustion') {
          fuelI[input] = [fuelIn[input][$monthIndex] * 1000]
        } else {
          fuelI[input] = [fuelIn[input]]
        }
      }
      requiredFuelI[fuel] = fuelI
    })
    return requiredFuelI
  }
)

export const _inputsForecast = derived(
  [requiredFuelInputs, requiredSiteInputsForecastOpen, grassCuringMode,
    liveMoistureMode, forecastOpenMeteo, fuelMoistureModel],
  ([$requiredFuelInputs, $requiredSiteInputsForecastOpen, $grassCuringMode,
    $liveMoistureMode, $forecastOpenMeteo, $fuelMoistureModel]) => {
    const inputsForecast = new Map()
    const forecastOpenMeteoFFMC = $forecastOpenMeteo

    // Grass phenology curing: per-day cured fraction from the ONNX curing model
    // (curingModel.js), precomputed on forecast.curingByDay by curingCalcs and
    // read here by day index. A single universal grass curve.
    const CURED_KEY = 'surface.primary.fuel.model.behave.parms.cured.herb.fraction'
    // Fuels whose herbaceous curing is driven by the curing model: the three grass
    // fuels plus high-herb mixed heath (mhh), whose herbaceous component
    // (Molinia/Pteridium) cures like grass. Other herb-bearing fuels (bk, wb, bv)
    // keep the static monthly table.
    const CURING_MODEL_FUELS = new Set(['grl', 'grm', 'grh', 'mhh'])
    const usePhenology = $grassCuringMode === 'phenology'
    const curingByDay = usePhenology ? forecastOpenMeteoFFMC.curingByDay : null

    // Hoisted: invariant across the timestep x fuel loop below.
    const useFireInSite = $fuelMoistureModel === "fireInSite"
    const fuelKeys = Object.keys($requiredFuelInputs)
    // Litter / brash surface fuels take the dedicated litter dead-moisture series
    // (they previously borrowed bracken, which was biased ~10% too dry).
    const LITTER_FUELS = new Set(['sn', 'bl', 'ln', 'bch'])

    // DEBUG: capture climatology vs LFMC live.category per fuel at the first
    // forecast timestep, to compare when switching to the LFMC model.
    const lfmcDebug = $liveMoistureMode === 'lfmc' ? [] : null

    let i = 0;
    $requiredSiteInputsForecastOpen.forEach((forecast, time) => {
      let inputsTime = {}
      fuelKeys.forEach((fuel) => {
        inputsTime[fuel] = { ...$requiredFuelInputs[fuel], ...forecast }
        if (useFireInSite) {
          if (LITTER_FUELS.has(fuel)) {
            inputsTime[fuel]['site.moisture.dead.category'] = [forecastOpenMeteoFFMC.ffmc_litter[i]]
          } else if (fuel.substring(0, 2) == 'gr') {
            inputsTime[fuel]['site.moisture.dead.category'] = [forecastOpenMeteoFFMC.ffmc_grass[i]]
          } else if (fuel.substring(0, 1) == 'g') {
            inputsTime[fuel]['site.moisture.dead.category'] = [forecastOpenMeteoFFMC.ffmc_gorse[i]]
          } else if (fuel.substring(0, 1) == 'm') {
            inputsTime[fuel]['site.moisture.dead.category'] = [(forecastOpenMeteoFFMC.ffmc_heather[i] + forecastOpenMeteoFFMC.ffmc_grass[i]) / 2]
          } else if (fuel.substring(0, 1) == 'c') {
            inputsTime[fuel]['site.moisture.dead.category'] = [forecastOpenMeteoFFMC.ffmc_heather[i]]
          } else if (fuel.substring(0, 1) == 'f') {
            inputsTime[fuel]['site.moisture.dead.category'] = [forecastOpenMeteoFFMC.ffmc_bracken[i]]
          } else {
            inputsTime[fuel]['site.moisture.dead.category'] = [forecastOpenMeteoFFMC.ffmc_bracken[i]]
          }
        }
        // Live moisture is independent of the selected dead-moisture model.
        // Override the monthly value with this fuel's weather-driven prediction.
        let climLive = null, lfmcRaw = null
        if ($liveMoistureMode === 'lfmc') {
          climLive = inputsTime[fuel]['site.moisture.live.category']?.[0] // climatology, pre-override
          const comp = FUEL_TO_COMPONENT[fuel]
          const lfmcArr = comp ? forecastOpenMeteoFFMC['lfmc_' + comp] : null
          if (lfmcArr && lfmcArr[i] != null) {
            lfmcRaw = lfmcArr[i]
            inputsTime[fuel]['site.moisture.live.category'] = [lfmcArr[i]]
          }
        }
        // Fosberg can calculate moisture internally, without a dead-category input.
        if (inputsTime[fuel]['site.moisture.live.category']?.[0] < inputsTime[fuel]['site.moisture.dead.category']?.[0]) {
          inputsTime[fuel]['site.moisture.live.category'] = inputsTime[fuel]['site.moisture.dead.category']
        }
        if (lfmcDebug && i === 0) {
          lfmcDebug.push({
            fuel,
            component: FUEL_TO_COMPONENT[fuel] ?? '-',
            climatology: climLive,
            lfmc_raw: lfmcRaw,
            dead: inputsTime[fuel]['site.moisture.dead.category']?.[0],
            live_final: inputsTime[fuel]['site.moisture.live.category']?.[0],
          })
        }
        // Grass phenology curing: replace the monthly cured.herb.fraction with the
        // ONNX curing model's per-day prediction (forecast.curingByDay).
        if (usePhenology && CURING_MODEL_FUELS.has(fuel) && CURED_KEY in inputsTime[fuel]) {
          const cured = curingByDay?.[Math.floor(time / 86400000)]
          if (cured != null) inputsTime[fuel][CURED_KEY] = [cured]
        }
      })
      inputsForecast.set(time, inputsTime)
      i++
    })
    if (lfmcDebug && lfmcDebug.length) {
      console.log('[LFMC vs climatology] site.moisture.live.category (%), first forecast timestep — ' +
        'climatology = monthly table, lfmc_raw = model, live_final = after max(live,dead) clamp:')
      console.table(lfmcDebug)
    }
    // console.log('_inputsForecast end :')
    // console.log('inputsForecast end:', inputsForecast)
    return inputsForecast
  }
)

export const _outputUserInputs = derived([userInputs], ([$userInputs]) => {
  // console.log("RUN _outputUserInputs start", $userInputs)
  const convertUnits = [
    "surface.weighted.fire.heatPerUnitArea",
    "surface.weighted.fire.firelineIntensity"
  ]

  const output = []
  Object.entries($userInputs).forEach(([fuel, inputs]) => {
    const result = fireSim.runBasic(inputs)[0]
    result["surface.primary.fuel.model.catalogKey"] = fuel
    convertUnits.forEach((item) => {
      if (item in result) {
        result[item] = result[item] * Number(outputNodes[item].multiplier)
      }
    })
    result["surface.primary.fuel.model.catalogKey"] = fuel
    // console.log('result in _outputForecast:', result)
    output.push({
      "surface.primary.fuel.model.catalogKey": fuel,
      "values": result
    })

    // output.push({ [fuel]: result })
  })
  // console.log("RUN _outputUserInputs end", output)
  return output
})

// The heavy step: ~20 fuels x ~340 timesteps of fireSim runs. The body lives in
// $lib/model/computeForecast.js as a pure function so it can be golden-master
// tested and later moved into a Worker.
export const _outputForecast = derived([_inputsForecast], ([$_inputsForecast]) => {
  return computeOutputForecast(fireSim, $_inputsForecast)
})


export const _outputForecastCanopy = derived([_outputForecast, canopyInputs], ([$_outputForecast, $canopyInputs]) => {
  // console.log("_outputForecastCanopy start", $_outputForecast)
  const resultForecastCanopy = new Map()
  $_outputForecast.forEach((forecast, time) => {
    const output = []
    // console.log('fuel in _outputForecastCanopy:', forecast, time)
    forecast.forEach((fuelObject) => {
      Object.entries(fuelObject).forEach(([fuel, values]) => {
        // console.log('item', fuel, values)
        const folMoisture = $canopyInputs["site.canopy.fuel.foliar.moistureContent"][0]
        if (values["surface.weighted.fire.firelineIntensity"] > 0) {
          const ccbh = fireSim.cbhInit(
            values["surface.weighted.fire.firelineIntensity"],
            folMoisture
          )
          values["crown.fire.transition.minBaseHeight"] = ccbh
        } else {
          values["crown.fire.transition.minBaseHeight"] = 0
        }
        values["surface.primary.fuel.model.catalogKey"] = fuel
        // console.log('result in _outputForecast:', result)
        output.push({
          "surface.primary.fuel.model.catalogKey": fuel,
          values
        })
      })
    })
    resultForecastCanopy.set(time, output)
  })
  // console.log("_outputForecastCanopy end", resultForecastCanopy)
  return resultForecastCanopy
})


export const _outputForecastArray = derived(
  [_outputForecastCanopy, selectedOutput, commonOutputs, fuelMoistureModel],
  ([$_outputForecastCanopy, $selectedOutput, $commonOutputs, $fuelMoistureModel]) => {
    const outputArray = []
    // Hoisted out of the per-timestep loop.
    const useAllFuels = $commonOutputs.includes($selectedOutput)
      && $fuelMoistureModel != "fireInSite"
    $_outputForecastCanopy.forEach((forecast, time) => {
      const timeObject = {}
      if (useAllFuels) {
        timeObject['All fuels'] = forecast[0].values[$selectedOutput]
      } else {
        forecast.forEach((item) => {
          timeObject[item["surface.primary.fuel.model.catalogKey"]] = item.values[$selectedOutput]
        })
      }
      timeObject["time"] = time
      outputArray.push(timeObject)
    })
    // console.log('outputArray :', outputArray)
    return outputArray
  })


// Max across every fuel in a timestep row, ignoring the `time` key. Non-finite
// values are skipped so one missing fuel can't poison the whole scale with NaN.
function maxValue(obj) {
  let max = -Infinity
  for (const key in obj) {
    if (key === 'time') continue
    const v = obj[key]
    if (typeof v === 'number' && v > max) max = v
  }
  return max
}

export const _maxVal = derived([_outputForecastArray], ([$_outputForecastArray]) => {
  let max = -Infinity
  for (const row of $_outputForecastArray) {
    const v = maxValue(row)
    if (v > max) max = v
  }
  // Empty forecast (or all-missing values) — 0 keeps chart scaling sane.
  return Number.isFinite(max) ? max : 0
})
