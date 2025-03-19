import { writable, derived, get, readable } from 'svelte/store'
import { inputNodes } from '$lib/data/inputNodes.js'
import { fuelNodes } from '$lib/data/fuelNodes.js'
import { outputNodes } from "$lib/data/outputNodes.js";
import { fuelMoisture } from "$lib/data/fuelMoisture";
import { modelConfigOptions } from '$lib/data/configuration';
import { dateTime, getMonth, getHour, month, currentDateTime } from "$lib/shared/stores/timeStore";
import { currentWeather, elevationDiff, forecastTimeIndex, forecastOpenMeteo, forecastDaysPast } from "$lib/shared/stores/forecastStore";
import { currentLocation } from "$lib/shared/stores/locationStore";
import UKFuelModels from '$lib/data/UKFuelModels.json'
import FireSim from '$lib/model/surfaceFireOptimized.js'
import { browser } from "$app/environment";
import { deadFFMC } from '$lib/model/fireInSiteFFMC';

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
export const selectedFuels = writable(['cll', 'clm', 'clh', 'cld', 'mhl', 'mhh', 'gl', 'gm', 'gh', 'gt', 'grl', 'grm', 'grh', 'fn', 'sn', 'bl', 'ln'])
export const selectedFuel = writable('cl1')
export const secondaryFuel = writable(['gr6'])
export const advancedMode = writable(false)
export const chartType = writable("bars")


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

export const fuelsInputs = derived([selectedFuels, month], ([$selectedFuels, $month]) => {
  const fuelsInputs = {}
  $selectedFuels.forEach((fuel) => {
    const inputs = getFuelInputs(fuel, $month)
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

// export const _outputForecast = writable(new Map())

export const siteInputs = writable(inputNodes)//, forecast], ([$inputNodesStore, $forecast]) => {

// export const testInputs = derived([siteInputs], ([$siteInputs, $forecast]) => {
//   inputNodesStore['site.temperature.air'] = $forecast.currentWeather.screenTemperature
//   console.log('model store forecast :', $forecast.currentWeather)
//   console.log(Object.hasOwn($forecast, 'currentWeather'))
//   console.log('model store forecast :', $forecast.location)
//   return $inputNodesStore
// })

// redesign of the below 
// const fuelProps = {}
// for (const [f_key, f_values] of Object.entries(UKFuelModels)) {
//   fuelProps[f_key] = {}
//   for (const [key, values] of Object.entries(fuelNodes)) {
//     if (Number(f_values[values.catalogParam])) {
//       fuelProps[f_key][key] = [f_values[values.catalogParam].toFixed(values.decimals)]
//     } else {
//       fuelProps[f_key][key] = [f_values[values.catalogParam]]
//     }
//   }
// }
// const fuelProps = {}
// for (const [f_key, f_values] of Object.entries(UKFuelModels)) {
//   // console.log('f_key :', f_key)
//   fuelProps[f_key] = {}
//   get(fuelInputsList).forEach((input) => {
//     // for (const [key, values] of Object.entries(fuelNodes)) {
//     // console.log('key :', key)
//     if (Number(f_values[values.catalogParam])) {
//       fuelProps[f_key][key] = f_values[values.catalogParam].toFixed(values.decimals)
//       // console.log('fuelProps Number:', fuelProps[f_key][key])
//     } else {
//       fuelProps[f_key][key] = f_values[values.catalogParam]
//       // console.log('fuelProps NOT:', fuelProps[f_key][key])
//     }
//   })
// }

//Test of the above
const fuelProps = {}
for (const [f_key, f_values] of Object.entries(UKFuelModels)) {
  // console.log('f_key :', f_key)
  fuelProps[f_key] = {}
  for (const [key, values] of Object.entries(fuelNodes)) {
    // console.log('key :', key)
    if (Number(f_values[values.catalogParam])) {
      fuelProps[f_key][key] = f_values[values.catalogParam].toFixed(values.decimals)
      // console.log('fuelProps Number:', fuelProps[f_key][key])
    } else {
      fuelProps[f_key][key] = f_values[values.catalogParam]
      // console.log('fuelProps NOT:', fuelProps[f_key][key])
    }
  }
}
console.log('fuelProps :', fuelProps)

export function getOutputsForecast(inputsForecast) {
  // console.log("_outputForecast start")
  const resultForecast = new Map()
  inputsForecast.forEach((forecast, time) => {
    const output = []
    Object.keys(forecast).forEach((fuel) => {
      const result = fireSim.runBasic(forecast[fuel])
      result[0]["surface.primary.fuel.model.catalogKey"] = fuel
      output.push({
        "surface.primary.fuel.model.catalogKey": fuel,
        values: result
      });
    })
    _outputForecast.set(time, output)
  })
  return resultForecast
}

// Not implemented
function solarRadiationFromUVIndex(forecast) {
  let solRad = 0
  if (forecast.significantWeatherCode == 1) {
    shading = 1
  } else if (forecast.significantWeatherCode == 3 && forecast.uvIndex > 3) {
    shading = 1
  }
  return shading
}

function fuelShadingMetoffice(forecast) {
  let shading = 0
  if (forecast.significantWeatherCode == 1) {
    shading = 1
  } else if (forecast.significantWeatherCode == 3 && forecast.uvIndex > 3) {
    shading = 1
  }
  return shading
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
  console.log('requiredInputs :', requiredI)
  return requiredI
})

// export const siteInputs = derived(
//   [inputNodeStore, month, hour],
//   ([$inputNodeStore, $month, $hour]) => {
//     $inputNodeStore['site.date.month'].value = $month
//     $inputNodeStore['site.time.hour'].value = $hour
//   })

// export const requiredSiteInputsScenario = derived(
//   [requiredInputs, siteInputs, selectedScenario],
//   ([$requiredInputs, $siteInputs, $selectedScenario]) => {
//     const requiredSiteI = {}
//     $requiredInputs.forEach((input) => {
//       const splitKey = input.split('.')
//       if (splitKey[0] === 'site') {
//         requiredSiteI[input] = $selectedScenario[input]
//       } else if (
//         splitKey[0] === 'surface' &&
//         splitKey[1] === 'weighted' &&
//         splitKey.at(-1) === 'primaryCover'
//       ) {
//         requiredSiteI[input] = $siteInputs[input].value
//       }
//     })
//     return requiredSiteI
//   }
// )
// export const requiredSiteInputsCurrenWeather = derived(
//   [requiredInputs, siteInputs, currentWeather, currentLocation, elevationDiff],
//   ([$requiredInputs, $siteInputs, $currentWeather, $currentLocation, $elevationDiff]) => {
//     // console.log("requiredSiteInputsCurrentWeather")
//     const requiredSiteI = {}
//     const forecastInputs = {
//       "site.temperature.air": "screenTemperature",
//       "site.temperature.relativeHumidity": "screenRelativeHumidity",
//       "site.wind.speed.at10m": "wind_speed_10m",
//       "site.wind.direction.source.fromNorth": "windDirectionFrom10m"
//     }
//     const locationInputs = {
//       "site.slope.direction.aspect": $currentLocation.aspect,
//       "site.slope.steepness.degrees": $currentLocation.slope,
//       "site.location.elevation.diff": $elevationDiff,
//     }
//     const timeInputs = { "site.date.month": getMonth(new Date($currentWeather.time)), "site.time.hour": getHour(new Date($currentWeather.time)) }
//     // console.log($currentLocation.aspect)
//     $requiredInputs.forEach((input) => {
//       // console.log("Required input :", input)
//       const splitKey = input.split('.')
//       if (Object.keys(forecastInputs).includes(input)) {
//         // console.log('required inputs forecast :', input, $currentWeather[forecastInputs[input]])
//         requiredSiteI[input] = [$currentWeather[forecastInputs[input]]]
//       } else if (Object.keys(timeInputs).includes(input)) {
//         requiredSiteI[input] = [timeInputs[input]]
//       } else if (Object.keys(locationInputs).includes(input)) {
//         requiredSiteI[input] = [locationInputs[input]]
//       }
//       else {
//         // console.log('required inputs non - forecast :', input)
//         if (splitKey[0] === 'site') {
//           requiredSiteI[input] = $siteInputs[input].value
//         } else if (
//           splitKey[0] === 'surface' &&
//           splitKey[1] === 'weighted' &&
//           splitKey.at(-1) === 'primaryCover'
//         ) {
//           requiredSiteI[input] = $siteInputs[input].value
//         }
//       }
//     })
//     return requiredSiteI
//   }
// )

export const requiredSiteInputsForecastOpen = derived(
  [requiredInputs, forecastOpenMeteo, fuelMoistureModel],
  ([$requiredInputs, $forecastOpenMeteo, $fuelMoistureModel]) => {
    // console.log("requiredSiteInputsForecastOpen forecastOpenMeteo", $forecastOpenMeteo)
    // console.log("requiredSiteInputsForecastOpen run start", $requiredInputs)
    let deadFMC = null
    const requiredSiteInputs = new Map()
    const forecastInputs = {
      "site.temperature.air": "temperature_2m",
      "site.temperature.relativeHumidity": "relative_humidity_2m",
      "site.wind.speed.at10m": "wind_speed_10m",
      "site.wind.direction.source.fromNorth": "wind_direction_10m",
    }
    const locationInputs = {
      "site.slope.direction.aspect": get(currentLocation).aspect,
      "site.slope.steepness.degrees": get(currentLocation).slope,
      "site.location.elevation.diff": get(elevationDiff)
    }
    const deadMoistureCategories = { "site.moisture.dead.category": 0, "site.moisture.dead.tl1h": 0, "site.moisture.dead.tl10h": 2, "site.moisture.dead.tl100h": 4 }
    // Do not run for past days
    const ffmcInputs = []
    const ffmcInputTimes = []
    $forecastOpenMeteo.time.forEach((time, nr) => {
      let requiredSiteI = {}
      if (nr < get(forecastDaysPast) * 24) {
        requiredSiteInputs.set(time, requiredSiteI)
      } else {
        let timeInputs = { "site.date.month": getMonth(new Date(time)), "site.time.hour": getHour(new Date(time)) }
        $requiredInputs.forEach((input) => {
          const splitKey = input.split('.')
          if (Object.keys(forecastInputs).includes(input)) {
            requiredSiteI[input] = [$forecastOpenMeteo[forecastInputs[input]][nr]]
          } else if (input == "site.temperature.shading") {
            requiredSiteI[input] = [$forecastOpenMeteo["cloud_cover"]]
          } else if (Object.keys(timeInputs).includes(input)) {
            requiredSiteI[input] = [timeInputs[input]]
          } else if (Object.keys(locationInputs).includes(input)) {
            requiredSiteI[input] = [locationInputs[input]]
          } else if (Object.keys(deadMoistureCategories).includes(input) && ($fuelMoistureModel == "Nelson")) {
            console.log("deadMoistureCategories", nr, input, deadMoistureCategories[input], $forecastOpenMeteo["ffmc_nelson"][nr])
            requiredSiteI[input] = [$forecastOpenMeteo["ffmc_nelson"][nr] + deadMoistureCategories[input]]
          } else if (input == "site.moisture.live.category") {
            // console.log("live moisture input in inputs:", input)
            // requiredSiteI[fuel][input] = [fuelMoisture[fuel][input][$month]]
            // console.log('r quired inputs non - forecast :', input)
          }
        })
        requiredSiteInputs.set(time, requiredSiteI)
      }
    })
    console.log("requiredSiteInputsForecastOpen run end", $requiredInputs, requiredSiteInputs)
    return requiredSiteInputs
  }
);

export const requiredFuelInputs = derived(
  [requiredInputs, selectedFuels, secondaryFuel, fuelInputs, month],
  ([$requiredInputs, $selectedFuels, $secondaryFuel, $fuelInputs, $month]) => {
    const requiredFuelI = {}
    $selectedFuels.forEach((fuel) => {
      requiredFuelI[fuel] = {}
      $requiredInputs.forEach((input) => {
        const splitKey = input.split('.')
        if (
          splitKey[0] === 'surface' &&
          splitKey[1] === 'primary' &&
          splitKey.at(-1) === 'catalogKey'
        ) {
          requiredFuelI[fuel][input] = [fuel]
        } else if (
          splitKey[0] === 'site' &&
          splitKey[1] === 'moisture' &&
          splitKey[2] === 'live'
          ||
          splitKey[7] === 'herb' &&
          splitKey[8] === 'fraction'
        ) {
          // console.log("live moisture input :", input, fuelMoisture[fuel][input][$month])
          requiredFuelI[fuel][input] = [fuelMoisture[fuel][input][$month]]
        } else if (
          splitKey[0] === 'surface' &&
          splitKey[1] === 'secondary' &&
          splitKey.at(-1) === 'catalogKey'
        ) {
          requiredFuelI[fuel][input] = $secondaryFuel
        } else if (
          splitKey[1] === 'primary' &&
          splitKey[4] === 'behave'
        ) {
          if (splitKey[splitKey.length - 1] === 'heatOfCombustion') {
            // heatOfCompustion varies by month and needs to be converted to J/kg from kJ/kg
            requiredFuelI[fuel][input] = [$fuelInputs[fuel][input][$month] * 1000]
            // console.log('heatOfCombustion :', requiredFuelI[fuel][input])
          } else {
            requiredFuelI[fuel][input] = [$fuelInputs[fuel][input]]

          }
        }
      })
    })
    console.log('requiredFuelInputs end::', requiredFuelI)
    return requiredFuelI
  }
)

export const _inputsForecast = derived(
  [requiredFuelInputs, requiredSiteInputsForecastOpen],
  ([$requiredFuelInputs, $requiredSiteInputsForecastOpen]) => {
    // const grassFuels = {'grl': 'ffmc_grass', 'grm': 'ffmc_grass', 'grl': 'ffmc_grass', 'cll': 'ffmc_heather', 'clm': 'ffmc_heather', 'clh': 'ffmc_heather', 'cld': 'ffmc_heather', 'mhl': '}
    // console.log('requiredFuelInputs in _inputsForecast :', $requiredFuelInputs)
    console.log('requiredSiteInputsForecastOpen in _inputsForecast :', $requiredSiteInputsForecastOpen)
    const inputsForecast = new Map()
    const forecastOpenMeteoFFMC = get(forecastOpenMeteo)
    // console.log('forecastOpenMeteoFFMC in _inputs :', forecastOpenMeteoFFMC)
    let i = 0;
    $requiredSiteInputsForecastOpen.forEach((forecast, time) => {
      // console.log('time :', time)
      let inputsTime = {}
      Object.keys($requiredFuelInputs).forEach((fuel) => {
        inputsTime[fuel] = { ...$requiredFuelInputs[fuel], ...forecast }
        if (get(fuelMoistureModel) === "fireInSite") {
          if (fuel.substring(0, 2) == 'gr') {
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
          // live herb moisture cannot be lower than dead 1h moisture!!!
          // inputsTime[fuel]['site.moisture.live.herb'] = inputsTime[fuel]['site.moisture.live.herb'][0] < inputsTime[fuel]['site.moisture.dead.tl1h'][0] ? inputsTime[fuel]['site.moisture.dead.tl1h'] : inputsTime[fuel]['site.moisture.live.herb']
          inputsTime[fuel]['site.moisture.live.category'] = inputsTime[fuel]['site.moisture.live.category'][0] < inputsTime[fuel]['site.moisture.dead.category'][0] ? inputsTime[fuel]['site.moisture.dead.category'] : inputsTime[fuel]['site.moisture.live.category']
        }
      })
      inputsForecast.set(time, inputsTime)
      i++
    })
    // console.log('_inputsForecast end :')
    console.log('inputsForecast end:', inputsForecast)
    return inputsForecast
  }
)

export const _outputUserInputs = derived([userInputs], ([$userInputs]) => {
  console.log("RUN _outputUserInputs start", $userInputs)
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
  console.log("RUN _outputUserInputs end", output)
  return output
})

export const _outputForecast = derived([_inputsForecast], ([$_inputsForecast]) => {
  console.log("RUN _outputForecast start")
  console.log('_inputsForecast in _outputForecast:', $_inputsForecast)
  const convertUnits = [
    "surface.weighted.fire.heatPerUnitArea",
    "surface.weighted.fire.firelineIntensity"
  ]
  const resultForecast = new Map()
  // console.log(" $$$$$$$ node :", fireSim.dag.get('surface.weighted.fire.heatPerUnitArea'))
  $_inputsForecast.forEach((forecast, time) => {
    const output = []
    Object.keys(forecast).forEach((fuel) => {
      const result = fireSim.runBasic(forecast[fuel])[0]
      // const folMoisture = get(canopyInputs)["site.canopy.fuel.foliar.moistureContent"][0]
      // if (result[0]["surface.weighted.fire.firelineIntensity"] > 0) {
      //   const ccbh = fireSim.cbhInit(
      //     result[0]["surface.weighted.fire.firelineIntensity"],
      //     folMoisture
      //   )
      //   result[0]["crown.fire.transition.minBaseHeight"] = ccbh
      // } else {
      //   result[0]["crown.fire.transition.minBaseHeight"] = 0
      // }
      result["surface.primary.fuel.model.catalogKey"] = fuel
      // The below is required to convert heatPerUnitArea and firelineIntensity
      // MegaWatts etc.
      convertUnits.forEach((item) => {
        result[item] = result[item] * Number(outputNodes[item].multiplier)
      })
      // force transitionRatio to number
      // result["crown.fire.initiation.transitionRatio"] = Number(result["crown.fire.initiation.transitionRatio"])
      output.push({ [fuel]: result }
        // "surface.primary.fuel.model.catalogKey": fuel,
        // values: result
      );
    })
    // console.log('outputs in _outputForecast:', output)
    resultForecast.set(time, output)
  })

  // console.log("_outputForecast end")
  console.log('outputs in end _outputForecast:', resultForecast)

  return resultForecast
})


export const _outputForecastCanopy = derived([_outputForecast, canopyInputs], ([$_outputForecast, $canopyInputs]) => {
  console.log("_outputForecastCanopy start", $_outputForecast)
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
  console.log("_outputForecastCanopy end", resultForecastCanopy)
  return resultForecastCanopy
})


export const _outputForecastArray = derived([_outputForecastCanopy, selectedOutput],
  ([$_outputForecastCanopy, $selectedOutput]) => {
    const outputArray = []
    $_outputForecastCanopy.forEach((forecast, time) => {
      const timeObject = {}
      // console.log('forecast :', forecast)
      if (get(commonOutputs).includes($selectedOutput) && (get(fuelMoistureModel) != "fireInSite")) {
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


function maxValue(obj) {
  let { time: _, ...rest } = obj;
  let arr = Object.values(rest);
  let max = Math.max(...arr);
  return max
}
export const _maxVal = derived([_outputForecastArray], ([$_outputForecastArray]) => {
  var maxA = $_outputForecastArray.reduce((prev, current) => prev > maxValue(current) ? prev : maxValue(current));
  return maxA
})
