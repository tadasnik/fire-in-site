import { randomUniform, randomNormal } from "d3-random"
import { UpdateAbstract } from "@cbevins/fire-behavior-simulator"
/**
 * Generates a set of result values for all combinations of the dag.input values.
 *
 * For example, if fuel model has 2 input values, 1-h dead moisture has 3 input values,
 * and wind speed has 4 input values, then 2 x 3 x 4 = 24 results are generated.
 */
const randGenerator = randomNormal(0, 0.68)

export class UpdateRandomOrthogonalStack extends UpdateAbstract {
  // eslint-disable-next-line no-useless-constructor
  constructor(dag) {
    super(dag)
  }
  makeRangeRand(origArray, noElements) {
    const vMin = Math.min(origArray[0], origArray[1])
    const vMax = Math.max(origArray[0], origArray[1])
    const generator = randomUniform(vMin, vMax + 1);
    let valueArray = []
    for (let i = 0; i < noElements; i++) {
      valueArray.push(generator())
    }
    return valueArray.sort((a, b) => a - b)
  };

  makeRange(origArray, noElements) {
    const vMin = Math.min(origArray[0], origArray[1])
    const vMax = Math.max(origArray[0], origArray[1])
    const increments = ((vMax - vMin) / noElements)
    const values = [...Array(noElements + 1)].map((_, y) => vMin + increments * y)
    return values
  };

  arrayToNative(key, values) {
    const valuesNative = []
    const node = this.dag.get(key)
    values.forEach((element) => {
      valuesNative.push(node._variant.displayValueToNativeValue(element))
    })
    return valuesNative
  }

  prepareInputs(inputs) {
    let noRangeInputs = 0
    for (const values of Object.values(inputs)) {
      if (values.length === 2) {
        noRangeInputs = ++noRangeInputs
      }
    }
    const noElements = Math.floor(this._dag._runLimit / noRangeInputs / 2)
    const inputsObject = {}
    for (const [key, values] of Object.entries(inputs)) {
      let valuesMod = [];
      if (values.length === 2) {
        valuesMod = this.makeRangeRand(values, noElements)
      } else if (values.length === 1) {
        valuesMod = values
      }
      inputsObject[key] = valuesMod
    }
    return inputsObject
  }

  /**
   * @returns {object} {runs: 0, calls: 0, ok: true, message: ''}
   */
  update(inputs) {
    const inputsObject = this.prepareInputs(inputs)
    const result = { runs: 0, calls: 0, ok: true, message: '' }
    const ptrMap = new Map() // map of input DagNode value indices
    this._dag.requiredInputNodes().forEach(node => ptrMap.set(node, 0))
    this._dag._storageClass.init()
    const stack = this._dag.requiredUpdateNodes() // All required updteable (non-Config) DagNodes in topo order
    if (stack.length > 0) {
      let delta = 1
      let node
      let stackIdx = 0
      while (stackIdx >= 0) {
        node = stack[stackIdx]
        let inputValues = inputsObject[node.key()]
        if (ptrMap.has(node)) { // this is a required, non-Config input dagNode
          if (delta > 0) { // moving down the stack, so start with the first input value
            ptrMap.set(node, 0)
            if (inputValues.length === 1 && Number(inputValues[0]) && node.key().startsWith('site')
            ) {
              node._value = node._variant.displayValueToNativeValue(inputValues[0] + randGenerator())
            } else {
              node._value = node._variant.displayValueToNativeValue(inputValues[0])
            }

          } else { // moving up the stack, so check for another input value
            const iptr = ptrMap.get(node) + 1 // point to its next input value
            ptrMap.set(node, iptr) // set the input value pointer
            if (iptr < inputValues.length) { // there is another input value to process...
              node._value = node._variant.displayValueToNativeValue(inputValues[iptr])// set its next input value
              delta = 1 // and go back down the stack
            }
          }
        } else { // this is NOT an input DagNode
          if (delta > 0) { // if moving down the stack...
            node.updateValue()
            result.calls++
          }
        }
        stackIdx += delta // set the next stack node to be processed (+1 === next, -1 === previous)
        if (stackIdx === stack.length) { // at the end of the stack (must be going down)
          this._dag._storageClass.store()
          result.runs += 1
          if (result.runs >= this._dag._runLimit) {
            result.ok = false
            result.message = `Run limit of ${this._dag._runLimit} exceeded.`
            stackIdx = 0
          }
          delta = -1 // must now go back up the stack
          stackIdx += delta // set the next stack node to process (+1 === next, -1 === previous)
        }
      } // while
    } // if (stack.length > 0)
    this._dag._storageClass.end()
    console.log("run result : ", result)
    return result
  }
}
