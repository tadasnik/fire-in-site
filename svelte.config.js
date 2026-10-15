import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [vitePreprocess({})],

  kit: {
    // fra1 (Frankfurt): closest region to Open-Meteo's German origin and to
    // UK/EU users, so the forecast proxy (src/routes/api/forecast) and SSR avoid
    // the transatlantic detour of the default US region.
    adapter: adapter({ runtime: 'nodejs24.x', regions: ['fra1'] }),
  },
};

export default config;
