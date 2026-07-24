import { dev } from '$app/environment';
import { injectAnalytics } from '@vercel/analytics/sveltekit';

injectAnalytics({ mode: dev ? 'development' : 'production' });

// SSR is opted out per-route (see each +page.js) for pages that use
// browser-only libraries (Mapbox, canvas charts, the fire-model store).
// Static pages like /about keep SSR for SEO.
