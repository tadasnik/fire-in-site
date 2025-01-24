/**
 * @file surfaceFireOoptimized.js example and performance
 * @copyright 2021 Systems for Environmental Management
 * @author Collin D. Bevins, <cbevins@montana.com>
 * @license MIT
 */

/**
 * surfaceFireOptimized.js
 *
 * An example of how fire-behavior-simulator internally optimizes computation order
 * to make 240,000 estimates of surface fire spread rate, flame length, and scorch height
 * under various fuel model, moisture, wind, slope, and temperature input values.
 *
 * On my old laptop, 240,000 runs requires from 735 to 1300 millseconds,
 * or 180,000 to 326,000 runs per second.
 */
import { Sim, UpdateOrthogonalStack } from '@cbevins/fire-behavior-simulator'
import StorageNeat from '$lib/model/ResultsStore.js'
import { UpdateRandomOrthogonalStack } from '$lib/model/UpdateRandomOrthogonalStack.js'
import { randomInt, randomUniform, randomNormal } from "d3-random"

function header(content) {
  const dash = '\n-----------------------------------------------------------------------\n'
  return dash + content + dash
}

function makeRangeRand(origArray, noElements) {
  const vMin = Math.min(origArray[0], origArray[1])
  const vMax = Math.max(origArray[0], origArray[1])
  const generator = randomUniform(vMin, vMax + 1);
  let valueArray = []
  for (let i = 0; i < noElements; i++) {
    valueArray.push(generator())
  }
  return valueArray
};

function makeRange(origArray, noElements) {
  const vMin = Math.min(origArray[0], origArray[1])
  const vMax = Math.max(origArray[0], origArray[1])
  const increments = ((vMax - vMin) / noElements)
  const values = [...Array(noElements + 1)].map((_, y) => vMin + increments * y)
  return values
};

// Step 1 - create a fire behavior simulator with 1 directed acyclical graph (DAG)
export default class FireSim {
  constructor(nodeProps) {
    this.sim = new Sim()
    this.dag = this.sim.createDag('Optimized')
    this.store = new StorageNeat(this.dag)
    this.dag.setStorageClass(this.store)
    this.dag.setUpdateClass(new UpdateRandomOrthogonalStack(this.dag))
    // Set display units
    for (const [key, values] of Object.entries(nodeProps)) {
      if (values.selected === true) {
        this.dag.get(key)._variant.setDisplayUnits(values.units)
      }
      // console.log(this.dag.get('surface.primary.fuel.model.behave.parms.dead.tl1h.surfaceAreaToVolumeRatio'))
      // console.log(this.dag.get('site.temperature.shading'))
    }
  }

  selectOutputs(outputs) {
    this.selected = outputs
    this.dag.select(this.selected)
    this.requiredConfig = this.dag.requiredConfigNodes().map((node) => `${node.key()}`)
    return this.requiredConfig
  }

  updateConfig(config) {
    // Step 2 - configure input choices and computational options
    this.dag.configure(config)
    return this.dag.requiredInputNodes().map((node) => node.key())
  }

  doRuns(inputs, runNo) {
    const resultsArray = []
    const randGenerator = randomNormal(0, 1)
    for (let i = 0; i < runNo; i++) {
      const inputsArray = []
      for (const [key, values] of Object.entries(inputs)) {
        let valuesMod = [];
        if (values.length === 2) {
          valuesMod = makeRangeRand(values, 1)
        } else if (Number(values[0])) {
          valuesMod = [values[0] + randGenerator()]
        } else {
          valuesMod = values
        }
        inputsArray.push([key, this.arrayToNative(key, valuesMod)])
      }
      resultsArray.push(this.dag.input(inputsArray).run()[0])
    }
    // console.log(resultsArray)
    return resultsArray
  }

  /**
   * Calculate the critical surface fire intensity (I'initiation)
   * sufficient to drive off canopy foliar moisture and initiate a
   * passive or active crown fire.
   *
   * This is Scott & Reinhardt (2001) equation 11 (p 13).
   *
   * @param folMois Canopy foliar moisture content (percent).
   * @param cpyBase Crown canopy base height (m).
   * @return The critical surface fireline intensity (btu+1 ft-1 s-1)
   *  required to initiate a passive or active crown fire.
   */
  fliInit(folMois, cpyBase) {
    const fmc = Math.max(30, 100 * folMois) // convert to percent with 30% min
    const cbh = Math.max(0.1, cpyBase) // with 10 cm min
    const kwm = Math.pow(0.01 * cbh * (460 + 25.9 * fmc), 1.5) // (kW/m)
    return kwm * 0.288672 // return as Btu/ft/s
  }

  /**
   * Calculate conopy base height at which transition to canopy ratio is 1.
   * Below this height transition to canopy is likely.
   *
   * @param intensit surface fireline intensity (kw/m)
   * @param folMois Canopy foliar moisture content (percent).
   *
  */
  cbhInit(intensity, folMois) {
    const denominator = 0.01 * (460 + 25.9 * folMois)
    const nominator = Math.pow(intensity * 1000, 2 / 3)
    const cbh = nominator / denominator
    return cbh
  }

  runBasic(inputs) {
    this.dag.setRunLimit(1000)
    this.dag.setUpdateClass(new UpdateOrthogonalStack(this.dag))
    const inputsArray = []
    for (const [key, values] of Object.entries(inputs)) {
      if (Array.isArray(values)) {
        // console.log('array: ', key, values)
        // console.log('pushing ', [key, this.arrayToNative(key, values)[0]])
        inputsArray.push([key, this.arrayToNative(key, values)])
      } else {
        // console.log('not array: ', key, values)
        // console.log('pushing ', [key, this.dag.get(key)._variant.displayValueToNativeValue(values)])
        inputsArray.push([key, this.dag.get(key)._variant.displayValueToNativeValue(values)])
      }
    }
    this.dag.input(inputsArray)
    this.dag.run()
    return this.store._resultsArray
  };


  runWithRandom(inputs) {
    this.dag.setRunLimit(1000)
    this.dag.setUpdateClass(new UpdateRandomOrthogonalStack(this.dag))
    // this.dag.run()
    // dag.run can be replaced by the below:
    // console.log('inputs during run: ', inputs)
    this.dag._sortedNodes.forEach(node => {
      if (node._is._required && node._is._input) {
        if ((!this.dag._input.has(node)) || this.dag._input.get(node) === []) {
          this.dag._input.set(node, [node.value()])
        }
      }
    })
    // let elapsed = Date.now() // start the elapsed timer
    this.dag._updateClass.update(inputs)
    // elapsed = Date.now() - elapsed
    //
    // const calls = results.calls
    // const runs = results.runs
    // const rps = (runs / (0.001 * elapsed)).toFixed(0)
    // console.log(
    //   header(`Optimized: ${runs} runs and ${calls} calls required ${elapsed} ms (${rps} runs/s): ${results.message}`)
    // )
    return this.store._resultsArray
  }

  // Set display units
  run(inputs) {
    this.dag.setRunLimit(100000)

    const inputsArray = []

    for (const [key, values] of Object.entries(inputs)) {
      let valuesMod = [];
      if (values.length === 2) {
        valuesMod = makeRange(values, 100)
      } else if (values.length === 1) {
        valuesMod = values
      }
      inputsArray.push([key, this.arrayToNative(key, valuesMod)])
    }
    this.dag.input(inputsArray)
    //this.dag.run(inputsArray)
    let elapsed = Date.now() // start the elapsed timer
    const results = this.dag.run()
    elapsed = Date.now() - elapsed

    const calls = results.calls
    const runs = results.runs
    const rps = (runs / (0.001 * elapsed)).toFixed(0)
    // console.log(
    //   header(`Optimized: ${runs} runs and ${calls} calls required ${elapsed} ms (${rps} runs/s): ${results.message}`)
    // )
    return this.store._resultsArray
  };

  arrayToNative(key, values) {
    const valuesNative = []
    const node = this.dag.get(key)
    // console.log('key: ', key, 'values: ', values)
    values.forEach((element) => {
      // if (key === 'site.canopy.crown.baseHeight') {
      //   console.log('valuesNative: ', values, element)
      // }

      valuesNative.push(node._variant.displayValueToNativeValue(element))
    })

    return valuesNative
  }
}
