import { writable, derived, get } from 'svelte/store'
import { inputNodes } from '$lib/data/inputNodes.js'
import { fuelNodes } from '$lib/data/fuelNodes.js'
import { outputNodes } from '$lib/data/outputNodes.js'
import { modelConfigOptions } from '$lib/data/configuration.js'
import UKFuels from '$lib/data/UKFuels.json'
import FireSim from '$lib/model/surfaceFireOptimized.js'

export const fireSim = new FireSim({ ...inputNodes, ...fuelNodes, ...outputNodes })
export const siteInputs = writable(inputNodes)
export const selectedOutputs = writable(['surface.weighted.fire.spreadRate', 'surface.primary.fuel.bed.dead.mineralDamping', 'surface.primary.fuel.bed.dead.moistureDamping', 'surface.primary.fuel.bed.live.mineralDamping', 'surface.primary.fuel.bed.live.extinction.moistureContent'])
export const selectedInput = writable('site.moisture.dead.category')
export const selectedOutput = writable('surface.weighted.fire.spreadRate')
export const selectedFuels = writable(['sh6', 'sh4'])
export const secondaryFuel = writable(['gr6'])

const fuelProps = {}
for (const [f_key, f_values] of Object.entries(UKFuels)) {
  fuelProps[f_key] = {}
  for (const [key, values] of Object.entries(fuelNodes)) {
    fuelProps[f_key][key] = [f_values[values.catalogParam]]
  }
}

export const fuelInputs = writable(fuelProps)
console.log("fuelInputs", fuelInputs)
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
  [requiredInputs, siteInputs],
  ([$requiredInputs, $siteInputs]) => {
    const requiredSiteI = {}
    $requiredInputs.forEach((input) => {
      const splitKey = input.split('.')
      if (splitKey[0] === 'site') {
        requiredSiteI[input] = $siteInputs[input].value
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
        console.log(fuel, input)
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

export const _output = derived([_inputs], ([$_inputs]) => {
  const output = {}
  Object.keys($_inputs).forEach((fuel) => {
    console.log("run fuel: ", fuel)
    console.log("inputs", $_inputs)
    output[fuel] = fireSim.run($_inputs[fuel])
  })
  return output
})

export const displayDataset = derived([selectedInput, selectedOutput, _output],
  ([$selectedInput, $selectedOutput, $_output]) => {
    const resArray = [];
    Object.keys($_output).forEach((fuel) => {
      const inputs = $_output[fuel].get($selectedInput);
      const outputs = $_output[fuel].get($selectedOutput);
      const combined = inputs.map((input, index) => ({ [$selectedInput]: input, [$selectedOutput]: outputs[index], fuel }));

      resArray.push({
        fuel,
        values: combined
      });
    })
    return resArray;
  })
