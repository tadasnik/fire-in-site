import { StorageAbstract } from '@cbevins/fire-behavior-simulator'

export default class StorageNeat extends StorageAbstract {
  constructor(dag) {
    super(dag)
    this._nodeArray = []; // Array of references to all DagNodes to be saved
    this._valueTable = [];
    this._valueMap = new Map(); // Map of DagNode reference => run results array
  }

  end() {
    this._resultsArray = [];
    // Creates a Map of <dagNode> => <resultsArray>
    // for (let idx = 0; idx < this._nodeArray.length; idx++) {
    //   // this._valueMap.set(this._nodeArray[idx], this._valueTable[idx]);
    //   this._valueMap.set(this._nodeArray[idx].key(), this._valueTable[idx]);
    // }
    for (let it = 0; it < this._valueTable[0].length; it++) {
      let resOb = {}
      for (let idx = 0; idx < this._nodeArray.length; idx++) {
        resOb[this._nodeArray[idx].key()] = this._valueTable[idx][it];
      }
      this._resultsArray.push(resOb)
    }
  }

  get(something, idx = -1) {
    const node = this._dag.get(something);

    return idx >= 0 ? this._valueMap.get(node)[idx] : this._valueMap.get(node);
  }

  init() {
    this._valueMap = new Map();
    this._valueTable = []; // first subscript is DagNode idx, second subscript is runIdx
    this._valueArray = []; // first subscript is DagNode idx, second subscript is runIdx

    this._nodeArray = [...this._dag.requiredInputNodes(), ...this._dag.selectedNodes()];

    for (let idx = 0; idx < this._nodeArray.length; idx++) {
      this._valueTable.push([]);
    }
  } // Called by Dag UpdaterClass at the end of each DAG value update traversal

  store() {
    for (let idx = 0; idx < this._nodeArray.length; idx++) {
      const nativeValue = this._nodeArray[idx].value()
      this._valueTable[idx].push(this._nodeArray[idx]._variant.nativeValueToDisplayValue(nativeValue));
      // The bellow is fastest!
      // this._valueTable[idx].push(this._nodeArray[idx].value());
    }
  }

  //   displayDataset = derived([selectedInput, selectedOutput, _output],
  //     ([$selectedInput, $selectedOutput, $_output]) => {
  //       const resArray = [];
  //       Object.keys($_output).forEach((fuel) => {
  //         const inputs = $_output[fuel].get($selectedInput);
  //         const outputs = $_output[fuel].get($selectedOutput);
  //         const combined = inputs.map((input, index) => ({ [$selectedInput]: input, [$selectedOutput]: outputs[index], fuel }));
  //
  //         resArray.push({
  //           fuel,
  //           values: combined
  //         });
  //       })
  //       return resArray;
  //     })
}
