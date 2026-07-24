import * as ort from 'onnxruntime-web/wasm';

// numThreads=1 disables Emscripten pthread workers, which would otherwise be
// spawned as classic blob-URL workers containing import.meta (ES module syntax
// not valid in classic workers). wasmPaths points to the static directory that
// holds both the .wasm and .mjs files onnxruntime-web needs at runtime.
ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = '/wasm/';

const MODEL_URL = "/wasm/model_onehot_dead.onnx";

// Create the ONNX session once and reuse it across forecast fetches, rather
// than reloading/reparsing the model and re-initialising the WASM session on
// every call.
let _sessionPromise = null;
function getSession() {
  if (!_sessionPromise) _sessionPromise = ort.InferenceSession.create(MODEL_URL);
  return _sessionPromise;
}

/** Warm the ONNX session at app start so the first forecast doesn't pay the load. */
export function preloadDeadFFMC() {
  getSession().catch(() => { });
}

export async function deadFFMC(inputs) {
  try {
    const session = await getSession();
    const tensorA = new ort.Tensor('float32', Float32Array.from(inputs), [inputs.length / 18, 18]);
    const results = await session.run({ X: tensorA });
    return results.variable.cpuData;
  } catch (e) {
    console.log("failed to inference ONNX model:", e);
  }
}
