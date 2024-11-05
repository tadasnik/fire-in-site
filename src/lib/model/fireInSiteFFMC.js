import * as ort from 'onnxruntime-web';
// use an async context to call onnxruntime functions.
export async function deadFFMC(inputs) {
  try {
    // create a new session and load the specific model.
    //
    // the model in this example contains a single MatMul node
    // it has 2 inputs: 'a'(float32, 3x4) and 'b'(float32, 4x3)
    // it has 1 output: 'c'(float32, 3x3)
    const modelUrl = "/wasm/model_onehot_dead.onnx";
    const session = await ort.InferenceSession.create(modelUrl, {
      wasm: {
        wasmPaths: '/wasm/ort-wasm-simd-threaded.wasm',
      }
    }
    )
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
