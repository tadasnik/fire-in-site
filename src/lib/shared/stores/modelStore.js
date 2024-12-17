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
  'site.moisture.dead.tl1h',
  'ignition.firebrand.probability',
  'crown.fire.initiation.transitionRatio'
])
export const commonOutputs = readable(["ignition.firebrand.probability", "site.moisture.dead.tl1h"])
export const selectedInput = writable('site.moisture.dead.category')
export const selectedOutput = writable('surface.weighted.fire.spreadRate')
export const fuelMoistureModel = writable('fireInSite')
export const scenarios = writable([])
export const selectedScenario = writable({
  "site.moisture.dead.category": [
    8
  ],
  "site.slope.steepness.degrees": [
    22
  ],
  "description": "Wet live fuels, steep terrain",
  "site.wind.speed.atMidflame": [
    5
  ],
  "label": "Wet live",
  "site.moisture.live.category": [
    116
  ],
  "site.temperature.air": [45],
  "site.canopy.fuel.shading": [0],
})

export const modelConfigValues = writable(modelConfigOptions)
export const selectedFuels = writable(['cll', 'clm', 'clh', 'cld', 'mhl', 'mhh', 'gl', 'gm', 'gh', 'gt', 'grl', 'grm', 'grh', 'fn', 'sn', 'bl', 'ln'])
export const selectedFuel = writable('cl1')
export const secondaryFuel = writable(['gr6'])
export const advancedMode = writable(false)
export const chartType = writable("bars")

// export const _outputForecast = writable(new Map())

export const siteInputs = writable(inputNodes)//, forecast], ([$inputNodesStore, $forecast]) => {

// export const testInputs = derived([siteInputs], ([$siteInputs, $forecast]) => {
//   inputNodesStore['site.temperature.air'] = $forecast.currentWeather.screenTemperature
//   console.log('model store forecast :', $forecast.currentWeather)
//   console.log(Object.hasOwn($forecast, 'currentWeather'))
//   console.log('model store forecast :', $forecast.location)
//   return $inputNodesStore
// })
const fuelProps = {}
for (const [f_key, f_values] of Object.entries(UKFuelModels)) {
  fuelProps[f_key] = {}
  for (const [key, values] of Object.entries(fuelNodes)) {
    if (Number(f_values[values.catalogParam])) {
      fuelProps[f_key][key] = [f_values[values.catalogParam].toFixed(values.decimals)]
    } else {
      fuelProps[f_key][key] = [f_values[values.catalogParam]]
    }
  }
}

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
  const requiredI = fireSim.updateConfig($config)
  // console.log('requiredInputs :', requiredI)
  return requiredI
})

// export const siteInputs = derived(
//   [inputNodeStore, month, hour],
//   ([$inputNodeStore, $month, $hour]) => {
//     $inputNodeStore['site.date.month'].value = $month
//     $inputNodeStore['site.time.hour'].value = $hour
//   })

export const requiredSiteInputsScenario = derived(
  [requiredInputs, siteInputs, selectedScenario],
  ([$requiredInputs, $siteInputs, $selectedScenario]) => {
    const requiredSiteI = {}
    $requiredInputs.forEach((input) => {
      const splitKey = input.split('.')
      if (splitKey[0] === 'site') {
        requiredSiteI[input] = $selectedScenario[input]
      } else if (
        splitKey[0] === 'surface' &&
        splitKey[1] === 'weighted' &&
        splitKey.at(-1) === 'primaryCover'
      ) {
        requiredSiteI[input] = $siteInputs[input].value
      }
    })
    return requiredSiteI
  }
)
export const requiredSiteInputsCurrenWeather = derived(
  [requiredInputs, siteInputs, currentWeather, currentLocation, elevationDiff],
  ([$requiredInputs, $siteInputs, $currentWeather, $currentLocation, $elevationDiff]) => {
    // console.log("requiredSiteInputsCurrentWeather")
    const requiredSiteI = {}
    const forecastInputs = {
      "site.temperature.air": "screenTemperature",
      "site.temperature.relativeHumidity": "screenRelativeHumidity",
      "site.wind.speed.at10m": "wind_speed_10m",
      "site.wind.direction.source.fromNorth": "windDirectionFrom10m"
    }
    const locationInputs = {
      "site.slope.direction.aspect": $currentLocation.aspect,
      "site.slope.steepness.degrees": $currentLocation.slope,
      "site.location.elevation.diff": $elevationDiff,
    }
    const timeInputs = { "site.date.month": getMonth(new Date($currentWeather.time)), "site.time.hour": getHour(new Date($currentWeather.time)) }
    // console.log($currentLocation.aspect)
    $requiredInputs.forEach((input) => {
      // console.log("Required input :", input)
      const splitKey = input.split('.')
      if (Object.keys(forecastInputs).includes(input)) {
        // console.log('required inputs forecast :', input, $currentWeather[forecastInputs[input]])
        requiredSiteI[input] = [$currentWeather[forecastInputs[input]]]
      } else if (Object.keys(timeInputs).includes(input)) {
        requiredSiteI[input] = [timeInputs[input]]
      } else if (Object.keys(locationInputs).includes(input)) {
        requiredSiteI[input] = [locationInputs[input]]
      }
      else {
        // console.log('required inputs non - forecast :', input)
        if (splitKey[0] === 'site') {
          requiredSiteI[input] = $siteInputs[input].value
        } else if (
          splitKey[0] === 'surface' &&
          splitKey[1] === 'weighted' &&
          splitKey.at(-1) === 'primaryCover'
        ) {
          requiredSiteI[input] = $siteInputs[input].value
        }
      }
    })
    return requiredSiteI
  }
)


export const requiredSiteInputsForecastOpen = derived(
  [requiredInputs, siteInputs, forecastOpenMeteo, fuelMoistureModel],
  ([$requiredInputs, $siteInputs, $forecastOpenMeteo, $fuelMoistureModel]) => {
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
    const canopyInputs = {
      "site.canopy.fuel.foliar.moistureContent": 50,
      "site.canopy.crown.baseHeight": 5,
      "site.canopy.crown.totalHeight": 20,
    }
    const deadMoistureCategories = { "site.moisture.dead.tl1h": 0, "site.moisture.dead.tl10h": 2, "site.moisture.dead.tl100h": 4 }
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
            // console.log("deadMoistureCategories", nr, input, deadMoistureCategories[input], $forecastOpenMeteo["ffmc_nelson"][nr])
            requiredSiteI[input] = [$forecastOpenMeteo["ffmc_nelson"][nr] + deadMoistureCategories[input]]
          } else if (Object.keys(canopyInputs).includes(input)) {
            // console.log('canopy input :', input)
            requiredSiteI[input] = [canopyInputs[input]]
          } else {
            // console.log('required inputs non - forecast :', input)
            if (splitKey[0] === 'site' && splitKey[1] == ! 'moisture') {
              requiredSiteI[input] = $siteInputs[input].value
            } else if (
              splitKey[0] === 'surface' &&
              splitKey[1] === 'weighted' &&
              splitKey.at(-1) === 'primaryCover'
            ) {
              requiredSiteI[input] = $siteInputs[input].value
            }
          }
        })
        requiredSiteInputs.set(time, requiredSiteI)
      }
    })
    console.log("requiredSiteInputsForecastOpen run end", requiredSiteInputs)
    return requiredSiteInputs
  }
)


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
        ) {
          // console.log("live moisture input :", input, fuelMoisture[fuel][input][$month])
          requiredFuelI[fuel][input] = [fuelMoisture[fuel][input][$month]]
        } else if (
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
            requiredFuelI[fuel][input] = [$fuelInputs[fuel][input][0][$month] * 1000]
          } else {
            requiredFuelI[fuel][input] = $fuelInputs[fuel][input]

          }
        }
      })
    })
    console.log('requiredFuelInputs end::')
    return requiredFuelI
  }
)

export const _inputsForecast = derived(
  [requiredFuelInputs, requiredSiteInputsForecastOpen],
  ([$requiredFuelInputs, $requiredSiteInputsForecastOpen]) => {
    // const grassFuels = {'grl': 'ffmc_grass', 'grm': 'ffmc_grass', 'grl': 'ffmc_grass', 'cll': 'ffmc_heather', 'clm': 'ffmc_heather', 'clh': 'ffmc_heather', 'cld': 'ffmc_heather', 'mhl': '}
    // console.log('requiredFuelInputs in _inputsForecast :', $requiredFuelInputs)
    // console.log('requiredSiteInputsForecastOpen in _inputsForecast :', $requiredSiteInputsForecastOpen)
    const inputsForecast = new Map()
    const forecastOpenMeteoFFMC = get(forecastOpenMeteo)
    console.log('forecastOpenMeteoFFMC in _inputs :', forecastOpenMeteoFFMC)
    let i = 0;
    $requiredSiteInputsForecastOpen.forEach((forecast, time) => {
      // console.log('time :', time)
      let inputsTime = {}
      Object.keys($requiredFuelInputs).forEach((fuel) => {
        inputsTime[fuel] = { ...$requiredFuelInputs[fuel], ...forecast }
        if (get(fuelMoistureModel) === "fireInSite") {
          if (fuel.substring(0, 2) == 'gr') {
            inputsTime[fuel]['site.moisture.dead.tl1h'] = [forecastOpenMeteoFFMC.ffmc_grass[i]]
          } else if (fuel.substring(0, 1) == 'g') {
            inputsTime[fuel]['site.moisture.dead.tl1h'] = [forecastOpenMeteoFFMC.ffmc_gorse[i]]
          } else if (fuel.substring(0, 1) == 'm') {
            inputsTime[fuel]['site.moisture.dead.tl1h'] = [(forecastOpenMeteoFFMC.ffmc_heather[i] + forecastOpenMeteoFFMC.ffmc_grass[i]) / 2]
          } else if (fuel.substring(0, 1) == 'c') {
            inputsTime[fuel]['site.moisture.dead.tl1h'] = [forecastOpenMeteoFFMC.ffmc_heather[i]]
          } else if (fuel.substring(0, 1) == 'f') {
            inputsTime[fuel]['site.moisture.dead.tl1h'] = [forecastOpenMeteoFFMC.ffmc_bracken[i]]
          } else {
            inputsTime[fuel]['site.moisture.dead.tl1h'] = [forecastOpenMeteoFFMC.ffmc_bracken[i]]
          }
          // live herb moisture cannot be lower than dead 1h moisture!!!
          inputsTime[fuel]['site.moisture.live.herb'] = inputsTime[fuel]['site.moisture.live.herb'][0] < inputsTime[fuel]['site.moisture.dead.tl1h'][0] ? inputsTime[fuel]['site.moisture.dead.tl1h'] : inputsTime[fuel]['site.moisture.live.herb']
        }
      })
      inputsForecast.set(time, inputsTime)
      i++
    })
    console.log('_inputsForecast end :')
    console.log('inputsForecast :', inputsForecast)
    return inputsForecast
  }
)
// export const _inputs = derived(
//   [selectedFuels, requiredFuelInputs, requiredSiteInputsCurrenWeather],
//   ([$selectedFuels, $requiredFuelInputs, $requiredSiteInputsCurrenWeather]) => {
//     const inputs = {}
//     $selectedFuels.forEach((fuel) => {
//       inputs[fuel] = { ...$requiredFuelInputs[fuel], ...$requiredSiteInputsCurrenWeather }
//     })
//     return inputs
//   }
// )
//
export const _selectedTimeOutput = derived([requiredSiteInputsForecastOpen, currentDateTime, advancedMode], ([$_requiredSiteInputsForecastOpen, $currentDateTime, $advancedMode]) => {
  const output = []
  // console.log('inputs :', $_inputs)
  Object.keys($_inputs).forEach((fuel) => {
    let result = {};
    if ($advancedMode) {
      result = fireSim.runWithRandom($_inputs[fuel])
    } else {
      result = fireSim.runBasic($_inputs[fuel])
      // console.log(" $$$$$$$ node :", fireSim.dag.get('site.temperature.shading'))
    }
    result[0]["surface.primary.fuel.model.catalogKey"] = fuel
    output.push({
      "surface.primary.fuel.model.catalogKey": fuel,
      values: result
    });
  })
  return output
})

export const _outputForecast = derived([_inputsForecast], ([$_inputsForecast]) => {
  // console.log("_outputForecast start")
  // console.log('requiredSiteInputsForecastOpen in _outputForecast:', $_inputsForecast)

  const convertUnits = [
    "surface.weighted.fire.heatPerUnitArea",
    "surface.weighted.fire.firelineIntensity"
  ]
  const resultForecast = new Map()
  $_inputsForecast.forEach((forecast, time) => {
    const output = []
    Object.keys(forecast).forEach((fuel) => {
      const result = fireSim.runBasic(forecast[fuel])
      result[0]["surface.primary.fuel.model.catalogKey"] = fuel
      convertUnits.forEach((item) => {
        result.forEach((res) => {
          res[item] = res[item] * 10 ** -6
        })
      })
      // force transitionRatio to number
      result[0]["crown.fire.initiation.transitionRatio"] = Number(result[0]["crown.fire.initiation.transitionRatio"])
      output.push({
        "surface.primary.fuel.model.catalogKey": fuel,
        values: result
      });
    })
    resultForecast.set(time, output)
  })

  // console.log("_outputForecast end")
  // console.log('requiredSiteInputsForecastOpen in end _outputForecast:', resultForecast)

  return resultForecast
})

export const _outputForecastArray = derived([_outputForecast, selectedOutput],
  ([$_outputForecast, $selectedOutput]) => {
    const outputArray = []
    $_outputForecast.forEach((forecast, time) => {
      const timeObject = {}
      if (get(commonOutputs).includes($selectedOutput) && (get(fuelMoistureModel) != "fireInSite")) {
        // console.log("common output modelStore")
        timeObject['All fuels'] = forecast[0].values[0][$selectedOutput]
      } else {
        forecast.forEach((item) => {
          timeObject[item["surface.primary.fuel.model.catalogKey"]] = item.values[0][$selectedOutput]
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
// export const _outputForecastArray = derived([_outputForecast, selectedOutput],
//   ([$_outputForecast, $selectedOutput]) => {
//     const outputArray = []
//     const fuels = []
//     $_outputForecast.values().next().value.forEach((item) => {
//       fuels.push(item["surface.primary.fuel.model.catalogKey"])
//     })
//     fuels.forEach((fuel) => {
//       const fuelOutput = {}
//       fuelOutput["surface.primary.fuel.model.catalogKey"] = fuel
//       fuelOutput["values"] = []
//       $_outputForecast.forEach((forecast, time) => {
//         let fuelForecast = forecast.filter(obj => {
//           return obj["surface.primary.fuel.model.catalogKey"] === fuel
//         })
//         // console.log("fuel forecast ", fuelForecast[0].values)
//         fuelOutput.values.push({ "value": fuelForecast[0].values[0][$selectedOutput], "time": new Date(time), fuel })
//       })
//       outputArray.push(fuelOutput)
//
//     })
//     return outputArray
//   })
