import { sveltekit } from '@sveltejs/kit/vite';
import wasm from "vite-plugin-wasm";
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit(), wasm(),],
  optimizeDeps: {
    exclude: ['onnxruntime-web'], // Exclude onnxruntime-web from pre-bundling
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      // Ensure .wasm files are correctly handled and imported
      output: {
        manualChunks: undefined,
      },
    },
  },
  // Add custom handling for WASM files
  assetsInclude: ['**/*.wasm'],
});
