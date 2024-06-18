import { writable, derived } from 'svelte/store'
import { inputNodes } from '$lib/data/inputNodes.js'
import { fuelNodes } from '$lib/data/fuelNodes.js'
import { outputNodes } from "$lib/data/outputNodes.js";
import { fuelMoisture } from "$lib/data/fuelMoisture";
import { modelConfigOptions } from '$lib/data/configuration';
import { dateTime, getMonth, getHour, month } from "$lib/shared/stores/timeStore";
import { currentWeather, elevationDiff, forecastTimeIndex } from "$lib/shared/stores/forecastStore";
import { currentLocation } from "$lib/shared/stores/locationStore";
import UKFuelModels from '$lib/data/UKFuelModels.json'
import FireSim from '$lib/model/surfaceFireOptimized.js'

export const inputNodesStore = writable(inputNodes)
export const fireSim = new FireSim({ ...inputNodes, ...fuelNodes, ...outputNodes })
export const selectedOutputs = writable(['surface.weighted.fire.spreadRate',
  'surface.weighted.fire.heatPerUnitArea',
  'surface.weighted.fire.firelineIntensity',
  'surface.weighted.fire.flameLength',
  'ignition.firebrand.probability',
  'site.moisture.dead.tl1h',
  'site.moisture.dead.tl10h'

])
export const selectedInput = writable('site.moisture.dead.category')
export const selectedOutput = writable('surface.weighted.fire.spreadRate')
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
export const selectedFuels = writable(['cl1', 'cl2', 'mxh1', 'mxh2', 'gr1', 'gr3'])
export const secondaryFuel = writable(['gr6'])
export const advancedMode = writable(false)

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
  return requiredC
})

export const config = derived(
  [requiredConfig, modelConfigValues],
  ([$requiredConfig, $modelConfigValues]) => {
    const configArray = []
    $requiredConfig.forEach((item) => {
      configArray.push([item, $modelConfigValues[item].value])
    })
    return configArray
  }
)

export const requiredInputs = derived(config, ($config) => {
  const requiredI = fireSim.updateConfig($config)
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
    const requiredSiteI = {}
    const forecastInputs = {
      "site.temperature.air": "screenTemperature",
      "site.temperature.relativeHumidity": "screenRelativeHumidity",
      "site.wind.speed.at10m": "windSpeed10m",
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

export const requiredSiteInputsForecast = derived(
  [requiredInputs, siteInputs, forecastTimeIndex, currentLocation, elevationDiff],
  ([$requiredInputs, $siteInputs, $forecastTimeIndex, $currentLocation, $elevationDiff]) => {
    const requiredSiteInputs = new Map()
    const forecastInputs = {
      "site.temperature.air": "screenTemperature",
      "site.temperature.relativeHumidity": "screenRelativeHumidity",
      "site.wind.speed.at10m": "windSpeed10m",
      "site.wind.direction.source.fromNorth": "windDirectionFrom10m",
    }
    const locationInputs = {
      "site.slope.direction.aspect": $currentLocation.aspect,
      "site.slope.steepness.degrees": $currentLocation.slope,
      "site.location.elevation.diff": $elevationDiff,
    }
    const liveMoistureInputs = [
      "site.moisture.live.stem", "site.moisture.live.herb"
    ]
    $forecastTimeIndex.forEach((forecast, time) => {
      let requiredSiteI = {}
      let timeInputs = { "site.date.month": getMonth(new Date(time)), "site.time.hour": getHour(new Date(time)) }
      $requiredInputs.forEach((input) => {
        // console.log("Required input :", input)
        const splitKey = input.split('.')
        if (Object.keys(forecastInputs).includes(input)) {
          requiredSiteI[input] = [forecast[forecastInputs[input]]]
        } else if (input == "site.temperature.shading") {
          requiredSiteI[input] = [fuelShadingMetoffice(forecast)]
          // console.log(time, requiredSiteI[input], forecast["uvIndex"], forecast["significantWeatherCode"], inputNodes[input])
        } else if (Object.keys(timeInputs).includes(input)) {
          requiredSiteI[input] = [timeInputs[input]]
        } else if (Object.keys(locationInputs).includes(input)) {
          requiredSiteI[input] = [locationInputs[input]]
          // } else if (liveMoistureInputs.includes(input)) {
          //   requiredSiteI[input] = fuelMoisture[fuel][input][getMonth(new Date(time))]
          // } else if (
          //   splitKey[0] === 'site' &&
          //   splitKey[1] === 'moisture'
          // ) {
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
    })
    return requiredSiteInputs
  }
)


export const requiredFuelInputs = derived(
  [requiredInputs, selectedFuels, secondaryFuel, fuelInputs, month],
  ([$requiredInputs, $selectedFuels, $secondaryFuel, $fuelInputs, $month]) => {
    console.log("requiredInputs from fuel inputs :", $requiredInputs)
    console.log("updating requiredFuelInputs no 1")

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
          splitKey[1] === 'moisture'
        ) {
          console.log("fuel input moisture : ", fuelMoisture[fuel][input][$month])
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
    console.log("requiredFuelI", requiredFuelI)
    return requiredFuelI
  }
)

export const _inputsForecast = derived(
  [requiredFuelInputs, requiredSiteInputsForecast],
  ([$requiredFuelInputs, $requiredSiteInputsForecast]) => {
    console.log("updating requiredSiteInputs no 2")
    const inputsForecast = new Map()
    $requiredSiteInputsForecast.forEach((forecast, time) => {
      let inputsTime = {}
      Object.keys($requiredFuelInputs).forEach((fuel) => {
        inputsTime[fuel] = { ...$requiredFuelInputs[fuel], ...forecast }
      })
      inputsForecast.set(time, inputsTime)
    })
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
// export const _output = derived([_inputs, advancedMode], ([$_inputs, $advancedMode]) => {
//   const output = []
//   // console.log('inputs :', $_inputs)
//   Object.keys($_inputs).forEach((fuel) => {
//     let result = {};
//     if ($advancedMode) {
//       result = fireSim.runWithRandom($_inputs[fuel])
//     } else {
//       result = fireSim.runBasic($_inputs[fuel])
//       // console.log(" $$$$$$$ node :", fireSim.dag.get('site.temperature.shading'))
//     }
//     result[0]["surface.primary.fuel.model.catalogKey"] = fuel
//     output.push({
//       "surface.primary.fuel.model.catalogKey": fuel,
//       values: result
//     });
//   })
//   return output
// })

export const _outputForecast = derived([_inputsForecast], ([$_inputsForecast]) => {
  console.log("updating _outputForecast no 3, : ", $_inputsForecast)
  const resultForecast = new Map()
  $_inputsForecast.forEach((forecast, time) => {
    const output = []
    Object.keys(forecast).forEach((fuel) => {
      const result = fireSim.runBasic(forecast[fuel])
      result[0]["surface.primary.fuel.model.catalogKey"] = fuel
      output.push({
        "surface.primary.fuel.model.catalogKey": fuel,
        values: result
      });
    })
    resultForecast.set(time, output)
  })
  return resultForecast
})

export const _outputForecastArray = derived([_outputForecast, selectedOutput],
  ([$_outputForecast, $selectedOutput]) => {
    const outputArray = []
    const fuels = []
    $_outputForecast.values().next().value.forEach((item) => {
      fuels.push(item["surface.primary.fuel.model.catalogKey"])
    })
    fuels.forEach((fuel) => {
      const fuelOutput = {}
      fuelOutput["surface.primary.fuel.model.catalogKey"] = fuel
      fuelOutput["values"] = []
      $_outputForecast.forEach((forecast, time) => {
        let fuelForecast = forecast.filter(obj => {
          return obj["surface.primary.fuel.model.catalogKey"] === fuel
        })
        // console.log("fuel forecast ", fuelForecast[0].values)
        fuelOutput.values.push({ "value": fuelForecast[0].values[0][$selectedOutput], "time": new Date(time) })
      })
      outputArray.push(fuelOutput)

    })
    return outputArray
  })
