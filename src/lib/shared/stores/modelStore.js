import { writable, derived, get } from 'svelte/store'
import { inputNodes } from '$lib/data/inputNodes.js'
import { fuelNodes } from '$lib/data/fuelNodes.js'
import { outputNodes } from "$lib/data/outputNodes.js";
import { modelConfigOptions } from '$lib/data/configuration';
import UKFuels from '$lib/data/UKFuels.json'
import FireSim from '$lib/model/surfaceFireOptimized.js'
import { db, auth } from "$lib/firebase/firebase.client";
import { doc, getDoc, getDocs, collection, setDoc } from "firebase/firestore";

import { browser } from '$app/environment';

export const fireSim = new FireSim({ ...inputNodes, ...fuelNodes, ...outputNodes })
export const siteInputs = writable(inputNodes)
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
export const selectedFuels = writable(['sh6', 'sh4'])
export const secondaryFuel = writable(['gr6'])
export const advancedMode = writable(false)
export const coordinates = writable({ 'latitude': 51.6, 'longitude': -4 })
export const forecast = writable({})

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


export const requiredSiteInputs = derived(
  [requiredInputs, siteInputs, selectedScenario],
  ([$requiredInputs, $siteInputs, $selectedScenario]) => {
    console.log("from model store selected scenario", $selectedScenario)
    const requiredSiteI = {}
    $requiredInputs.forEach((input) => {
      console.log("input ", input)
      const splitKey = input.split('.')
      if (splitKey[0] === 'site') {
        console.log("READING ", input)
        requiredSiteI[input] = $selectedScenario[input]
        console.log("SET value ", requiredSiteI[input])
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
  [selectedFuels, requiredFuelInputs, requiredSiteInputs],
  ([$selectedFuels, $requiredFuelInputs, $requiredSiteInputs]) => {
    const inputs = {}
    $selectedFuels.forEach((fuel) => {
      inputs[fuel] = { ...$requiredFuelInputs[fuel], ...$requiredSiteInputs }
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
      result = fireSim.runBasic($_inputs[fuel])
      console.log('if NOT advanced : ', $advancedMode)
    }
    console.log("result store ", result)
    console.log("result store ", result)
    output.push({
      "surface.primary.fuel.model.catalogKey": fuel,
      values: result
    });
  })
  return output
})
