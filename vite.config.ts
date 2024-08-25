import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import dsv from '@rollup/plugin-dsv'
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit(), purgeCss(), dsv(), enhancedImages()]
});
