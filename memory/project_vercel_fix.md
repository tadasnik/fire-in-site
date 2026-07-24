---
name: project-vercel-fix
description: Root cause and fix for Vercel serverless function crash and prerender failure in this project
metadata:
  type: project
---

## Vercel deployment fix (2026-05-20, commit 6baae10)

`vite-plugin-wasm` and `vite-plugin-top-level-await` must be applied to **all builds** (SSR and client), not client-only.

**Why:** `onnxruntime-web/wasm` is imported at module level in `src/lib/model/fireInSiteFFMC.js`. It uses WASM and top-level await that must be transformed by these plugins. Without them on the SSR build, the server bundle in the Vercel Node.js runtime fails to handle the import and the serverless function crashes (`FUNCTION_INVOCATION_FAILED`).

**How to apply:** Never restrict wasm/topLevelAwait to `!isSsrBuild` in this project. They are needed on both environments.

**Caveat — prerender incompatibility:** If `prerender = true` is ever added to `+layout.js`, these plugins applied to SSR will break SvelteKit's prerender step (`TypeError: Server is not a constructor`). The two options are mutually exclusive: prerender OR wasm+TLA on SSR. Currently the project uses serverless functions (no prerender), so the plugins run everywhere.

**Package versions pinned** in `package.json` to avoid future breakage from `"latest"`:
- `vite`: 7.3.2
- `@sveltejs/kit`: 2.59.0
- `@sveltejs/vite-plugin-svelte`: 6.1.3
- `firebase`: 12.6.0

**How to apply:** When upgrading these, test Vercel build locally with `npm run build` before pushing.
