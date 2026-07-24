---
name: project-stack
description: Tech stack and key architectural facts for fire-in-site (fireinsite.org)
metadata:
  type: project
---

Fire behaviour simulator web app at fireinsite.org.

- **Framework:** SvelteKit 2.x (Svelte 5), all routes `ssr = false` (pure CSR/SPA)
- **Adapter:** `@sveltejs/adapter-vercel` with `runtime: 'nodejs20.x'`
- **Build:** Vite 7, `vite-plugin-wasm` + `vite-plugin-top-level-await` (both needed for SSR and client)
- **Firebase:** Auth + Firestore used in `+layout.svelte` and `authStore.js`; Storage functions in `firebase.client.js` are dead code (never imported)
- **ML/WASM:** `onnxruntime-web` for in-browser ONNX inference, imported in `src/lib/model/fireInSiteFFMC.js`; WASM files served from `/wasm/` static path
- **Weather:** Open-Meteo API via `openmeteo` package
- **Styling:** Tailwind CSS 4 + flowbite-svelte components
