import { sveltekit } from '@sveltejs/kit/vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Redirect onnxruntime-web/wasm to a no-op stub during SSR so the server
// bundle never touches the browser-only WASM package.
const ssrOnnxStub = {
	name: 'ssr-onnx-stub',
	enforce: 'pre' as const,
	resolveId(id: string, _: string | undefined, options: { ssr?: boolean }) {
		if (options?.ssr && id === 'onnxruntime-web/wasm') {
			return resolve(__dirname, 'src/lib/model/onnx-stub.js');
		}
	}
};

export default defineConfig({
	plugins: [
		sveltekit(),
		// wasm and top-level-await are only needed for the client bundle;
		// the server bundle uses the onnx-stub instead.
		{ ...wasm(), apply: (_: unknown, { isSsrBuild }: { isSsrBuild?: boolean }) => !isSsrBuild },
		{ ...topLevelAwait(), apply: (_: unknown, { isSsrBuild }: { isSsrBuild?: boolean }) => !isSsrBuild },
		ssrOnnxStub,
	],
	optimizeDeps: {
		exclude: ['onnxruntime-web'],
	},
	build: {
		target: 'esnext',
		rollupOptions: {
			output: {
				manualChunks: undefined,
			},
		},
	},
	assetsInclude: ['**/*.wasm'],
});
