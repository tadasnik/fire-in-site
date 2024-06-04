import { writable, derived, get } from 'svelte/store'
import { inputNodes } from '$lib/data/inputNodes.js'
import { fuelNodes } from '$lib/data/fuelNodes.js'
import { outputNodes } from "$lib/data/outputNodes.js";
import { modelConfigOptions } from '$lib/data/configuration';
import { dateTime, getMonth, getHour } from "$lib/shared/stores/timeStore";
import { currentWeather } from "$lib/shared/stores/forecastStore";
import UKFuels from '$lib/data/UKFuels.json'
import FireSim from '$lib/model/surfaceFireOptimized.js'
import { db, auth } from "$lib/firebase/firebase.client";
import { doc, getDoc, getDocs, collection, setDoc } from "firebase/firestore";

export const inputNodesStore = writable(inputNodes)
export const fireSim = new FireSim({ ...inputNodes, ...fuelNodes, ...outputNodes })
export const selectedOutputs = writable(['surface.weighted.fire.spreadRate',
  'surface.weighted.fire.heatPerUnitArea',
  'surface.weighted.fire.firelineIntensity',
  'surface.weighted.fire.flameLength',
  'ignition.firebrand.probability'])
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
export const selectedFuels = writable(['sh6', 'sh4', 'gr6'])
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
for (const [f_key, f_values] of Object.entries(UKFuels)) {
  fuelProps[f_key] = {}
  for (const [key, values] of Object.entries(fuelNodes)) {
    if (Number(f_values[values.catalogParam])) {
      fuelProps[f_key][key] = [f_values[values.catalogParam].toFixed(values.decimals)]
    } else {
      fuelProps[f_key][key] = [f_values[values.catalogParam]]
    }
  }
}

export const fuelInputs = writable(fuelProps)
export const modelConfigValues = writable(modelConfigOptions)

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
export const requiredSiteInputsForecast = derived(
  [requiredInputs, siteInputs, currentWeather, dateTime],
  ([$requiredInputs, $siteInputs, $currentWeather, $dateTime]) => {
    const requiredSiteI = {}
    const forecastInputs = {
      "site.temperature.air": "screenTemperature",
      "site.temperature.relativeHumidity": "screenRelativeHumidity",
      "site.wind.speed.at10m": "windSpeed10m"
    }
    const timeInputs = { "site.date.month": getMonth(new Date($dateTime)), "site.time.hour": getHour(new Date($dateTime)) }
    $requiredInputs.forEach((input) => {
      const splitKey = input.split('.')
      if (Object.keys(forecastInputs).includes(input)) {
        console.log('required inputs forecast :', input, $currentWeather[forecastInputs[input]])
        requiredSiteI[input] = [$currentWeather[forecastInputs[input]]]
      } else if (Object.keys(timeInputs).includes(input)) {
        requiredSiteI[input] = [timeInputs[input]]
      }
      else {
        console.log('required inputs non - forecast :', input)
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

// export const requiredSiteInputs = derived(
//   [requiredInputs, siteInputs],
//   ([$requiredInputs, $siteInputs]) => {
//     const requiredSiteI = {}
//     $requiredInputs.forEach((input) => {
//       console.log('required inputs :', input)
//       const splitKey = input.split('.')
//       if (splitKey[0] === 'site') {
//         requiredSiteI[input] = $siteInputs[input].value
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

export const requiredFuelInputs = derived(
  [requiredInputs, selectedFuels, secondaryFuel, fuelInputs],
  ([$requiredInputs, $selectedFuels, $secondaryFuel, $fuelInputs]) => {
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
          splitKey[0] === 'surface' &&
          splitKey[1] === 'secondary' &&
          splitKey.at(-1) === 'catalogKey'
        ) {
          requiredFuelI[fuel][input] = $secondaryFuel
        } else if (
          splitKey[1] === 'primary' &&
          splitKey[4] === 'behave'
        ) {
          requiredFuelI[fuel][input] = $fuelInputs[fuel][input]
        }
      })
    })
    return requiredFuelI
  }
)
export const _inputs = derived(
  [selectedFuels, requiredFuelInputs, requiredSiteInputsForecast],
  ([$selectedFuels, $requiredFuelInputs, $requiredSiteInputsForecast]) => {
    const inputs = {}
    $selectedFuels.forEach((fuel) => {
      inputs[fuel] = { ...$requiredFuelInputs[fuel], ...$requiredSiteInputsForecast }
    })
    return inputs
  }
)
export const _output = derived([_inputs, advancedMode], ([$_inputs, $advancedMode]) => {
  const output = []
  Object.keys($_inputs).forEach((fuel) => {
    let result = {};
    if ($advancedMode) {
      result = fireSim.runWithRandom($_inputs[fuel])
    } else {
      console.log($_inputs[fuel])
      result = fireSim.runBasic($_inputs[fuel])
      // console.log(" $$$$$$$ node :", fireSim.dag.get('site.temperature.shading'))
    }
    output.push({
      "surface.primary.fuel.model.catalogKey": fuel,
      values: result
    });
  })
  return output
})
