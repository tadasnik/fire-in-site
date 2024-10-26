import * as ort from 'onnxruntime-web';

// use an async context to call onnxruntime functions.
export async function deadFFMC(inputs) {
  try {
    // create a new session and load the specific model.
    //
    // the model in this example contains a single MatMul node
    // it has 2 inputs: 'a'(float32, 3x4) and 'b'(float32, 4x3)
    // it has 1 output: 'c'(float32, 3x3)
    const modelUrl = "/wasm/mono_model.onnx";
    const session = await ort.InferenceSession.create(modelUrl, {
      wasm: {
        wasmPaths: '/wasm/ort-wasm-simd-threaded.wasm',
      }
    }
    )
    console.log('ONNX model loaded successfully', inputs);
    // console.log('Model metadata:', session);
    // console.log('Model input metadata:', session.inputNames);
    // console.log('Model output metadata:', session.outputNames);
    // prepare inputs. a tensor need its corresponding TypedArray as data
    const dataA = Float32Array.from(inputs)
    // const dataA = Float32Array.from([1.08401656e-01, 1.98291779e-01, 3.01038504e-01, 4.76410031e-01,
    //   6.02268219e-01, 9.80200806e+01, 2.12419464e+02, 3.59098389e+02,
    //   4.30481415e+02, 4.00864166e+02, 1.88428473e+00, 2.31000042e+01,
    //   3.75000000e+02, 8.00000000e+00, 3.00000000e+00]);
    const tensorA = new ort.Tensor('float32', dataA, [dataA.length / 15, 15]);

    // const dataA = Float32Array.from([1.08401656e-01, 1.98291779e-01, 3.01038504e-01, 4.76410031e-01,
    //   6.02268219e-01, 9.80200806e+01, 2.12419464e+02, 3.59098389e+02,
    //   4.30481415e+02, 4.00864166e+02, 1.88428473e+00, 2.31000042e+01,
    //   3.75000000e+02, 8.00000000e+00, 3.00000000e+00]);
    // const tensorA = new ort.Tensor('float32', dataA, [15]);

    // prepare feeds. use model input names as keys.
    const feeds = { X: tensorA };

    // feed inputs and run
    const results = await session.run(feeds);

    // read from results
    const dataC = results.variable.cpuData;
    console.log("data of result tensor 'c':", dataC);

    return results.variable.cpuData
  } catch (e) {
    console.log("failed to inference ONNX model:", e);
  }
}
