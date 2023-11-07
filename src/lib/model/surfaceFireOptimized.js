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
import { Sim } from '@cbevins/fire-behavior-simulator'
import StorageNeat from '$lib/model/ResultsStore.js'

function header(content) {
  const dash = '\n-----------------------------------------------------------------------\n'
  return dash + content + dash
}

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
    // Set display units
    for (const [key, values] of Object.entries(nodeProps)) {
      this.dag.get(key)._variant.setDisplayUnits(values.units)
    }
    console.log(this.dag.get('surface.weighted.fire.primaryCover'))
  }

  selectOutputs(outputs) {
    this.selected = outputs
    console.log('Outputs', outputs)
    this.dag.select(this.selected)
    this.requiredConfig = this.dag.requiredConfigNodes().map((node) => `${node.key()}`)
    return this.requiredConfig
  }

  updateConfig(config) {
    // Step 2 - configure input choices and computational options
    this.dag.configure(config)
    console.log('Configuring', config)
    return this.dag.requiredInputNodes().map((node) => node.key())
  }
  // Set display units
  run(inputs) {
    this.dag.setRunLimit(1000000)
    const inputsArray = []
    console.log("inputs", inputs)
    for (const [key, values] of Object.entries(inputs)) {
      let valuesMod = [];
      if (values.length === 2) {
        valuesMod = makeRange(values, 10)
      } else if (values.length === 1) {
        valuesMod = values
      }
      inputsArray.push([key, this.arrayToNative(key, valuesMod)])
    }
    this.dag.input(inputsArray)
    this.dag.run()
    let elapsed = Date.now() // start the elapsed timer
    const results = this.dag.run()
    elapsed = Date.now() - elapsed

    const runs = results.runs
    const rps = (runs / (0.001 * elapsed)).toFixed(0)
    console.log(
      header(`Optimized: ${runs} runs required ${elapsed} ms (${rps} runs/s): ${results.message}`)
    )
    const node = this.dag.get('surface.primary.fuel.model.behave.parms.dead.heatOfCombustion')
    console.log('heatOfCombustion', node.displayValue() / 1000)
    return this.store._valueMap
  };

  arrayToNative(key, values) {
    const valuesNative = []
    const node = this.dag.get(key)
    values.forEach((element) => {
      valuesNative.push(node._variant.displayValueToNativeValue(element))
    })
    return valuesNative
  }
}
