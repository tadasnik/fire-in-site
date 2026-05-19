import * as ort from 'onnxruntime-web/wasm';

// numThreads=1 disables Emscripten pthread workers, which would otherwise be
// spawned as classic blob-URL workers containing import.meta (ES module syntax
// not valid in classic workers). wasmPaths points to the static directory that
// holds both the .wasm and .mjs files onnxruntime-web needs at runtime.
ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = '/wasm/';

export async function deadFFMC(inputs) {
  try {
    const modelUrl = "/wasm/model_onehot_dead.onnx";
    const session = await ort.InferenceSession.create(modelUrl)
    // console.log('ONNX model loaded successfully', inputs);
    const dataA = Float32Array.from(inputs)
    const tensorA = new ort.Tensor('float32', dataA, [inputs.length / 18, 18]);
    // console.log('tensorA:', tensorA);
    const feeds = { X: tensorA };
    const results = await session.run(feeds);
    const dataC = results.variable.cpuData;
    // console.log("data of result tensor 'c':", dataC);

    return results.variable.cpuData
  } catch (e) {
    console.log("failed to inference ONNX model:", e);
  }
}
