// SSR stub for onnxruntime-web — the real package is browser-only.
// The server never runs inference (ssr = false), it only needs env to be
// assignable so module-level config in fireInSiteFFMC.js doesn't throw.
export const env = { wasm: {} };
