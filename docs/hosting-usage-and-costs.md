# Hosting usage, costs, and optimization notes

Recorded: 2026-10-18. Prices are USD before taxes and may change. Recheck provider documentation before making a hosting or billing decision.

## Summary

FireInSite is predominantly a client-side application. Fire-behaviour calculations, ONNX inference, and chart rendering happen in the browser. Hosting usage is mainly asset delivery and lightweight weather/map proxy requests, not server-side model computation.

At the observed quiet traffic level, Vercel Hobby has substantial remaining capacity. CDN request count appears likely to become the first limit if the same traffic mix grows uniformly. Cloudflare Workers with Static Assets is worth evaluating if delivery costs or request limits become significant.

## Observed Vercel usage

Source: `~/Downloads/Screenshot 2026-10-18 at 14-21-54 Vercel.png`, showing the last 30 days.

| Meter | Observed usage | Displayed free allowance | Approximate growth to allowance |
| --- | ---: | ---: | ---: |
| CDN requests | 49,000 | 1,000,000 | 20.4× |
| Web Analytics events | 1,500 | 50,000 | 33.3× |
| Fast Data Transfer | 2.92 GB | 100 GB | 34.2× |
| Function invocations | 7,400 | 1,000,000 | 135× |
| Function duration | 0.69 GB-hours | 100 GB-hours | 145× |
| CDN request CPU | 19 seconds | 1 hour | 189× |
| Fast Origin Transfer | 45.73 MB | 10 GB | Approximately 219× |
| Deployment storage | 58.46 MB | 10 GB | Not a visitor-capacity estimate |

Important qualifications:

- An earlier screenshot explicitly showed **All Projects**. The later crop does not show the scope, so these figures must not be treated as verified FireInSite-only usage.
- These are screenshot/account-specific allowances, including the displayed function-duration meter. Do not mix them with different Fluid Compute allowances or billing units.
- Analytics events are not unique users. Repeat visits, blockers, bots, and different browsing patterns affect any conversion to users.
- CLI billing data was unavailable, and detailed metrics queries required Observability Plus. No route-by-route production bandwidth attribution was obtained.
- Hobby limits are not automatically paid overages; affected resources can be paused. See [Hobby plan documentation](https://vercel.com/docs/plans/hobby).

### Rough capacity scenarios—not guarantees

If 1,500 analytics events roughly represent 1,500 visits, and the request mix stays unchanged, the 1M CDN-request allowance corresponds to approximately **30,600 visits per 30 days**, or **1,020 visits/day**.

That could mean roughly 30,000 monthly users visiting once, 7,500 visiting weekly, or 1,000 visiting daily. Checking several locations or using the map heavily changes the ratio. A provisional planning range for visits checking 3–5 locations was 20,000–25,000 visits/month, but this was not load-tested.

With uniform growth from an empty monthly request allowance:

- 20× the quiet baseline: approximately one month to the CDN-request limit.
- 100×: approximately 6.1 days.
- 1,000×: approximately 14.7 hours.

Review capacity well before the limit; 500–700 visits/day was suggested as a conservative review point, not a measured technical threshold.

## What generates usage

### Static browser assets

The ONNX runtime is a likely major asset-delivery contributor, but its share of actual production bandwidth was not measured. Small origin transfer compared with visitor transfer is consistent with substantial cached/static delivery, not proof of which file dominates.

Local file measurements:

| Asset | Uncompressed bytes | Locally gzip-compressed bytes |
| --- | ---: | ---: |
| WASM runtime | 13,022,405 | 3,329,880 |
| Dead-fuel moisture model | 184,141 | 29,672 |
| Live-fuel moisture model | 223,488 | 33,601 |
| Grass-curing model | 223,488 | 35,617 |
| Total | 13,653,522 | 3,428,770 |

Actual production compression and transferred bytes need verification. These assets are shared across location checks within a session, rather than downloaded once per location.

### Weather requests

A full location fetch in the reviewed branch typically involves around 5–6 API requests: elevation, main forecast, supporting past weather, separate precipitation probability, EFFIS point data, and potentially a model fallback.

- The authenticated weather proxy forwards data; it does not run the fire model.
- Main forecast data was estimated at 10–30 KB/location, not measured in production. Five location checks would therefore be roughly 50–150 KB for those main forecast responses, plus other responses.
- Forecast/elevation proxy responses currently use `Cache-Control: no-store`.
- Historical weather currently has direct-to-provider paths; confirm the applicable endpoint and subscription configuration before generalizing that behavior.

Open-Meteo customer authentication uses an `apikey` query parameter. A browser request would expose that key. Keep it in a server-side secret and add it only on the upstream request. Current public documentation did not establish an explicit technical browser-authentication ban; key confidentiality is sufficient reason to retain the proxy. See [Open-Meteo pricing and customer API documentation](https://open-meteo.com/en/pricing).

### Map requests

- EFFIS PNG tiles currently travel through `/api/effis/tiles/...`, not directly from EFFIS to the browser.
- The EFFIS proxy sets browser caching to 300 seconds and shared-cache freshness to 900 seconds.
- Background map tiles also use a server proxy.
- A CDN cache hit can avoid proxy execution and upstream fetching, but still counts toward applicable visitor delivery/request usage.
- Direct browser requests could remove these proxy hops only after checking upstream CORS, licensing, attribution, and usage policies.

## Vercel pricing considerations

As checked on 2026-10-18:

- Pro starts at **$20/month**, including one deploying seat and $20 of metered infrastructure credit.
- Under Flat Rate CDN, the included tier provides **1M CDN requests and 1 TB transfer**. Moving from Hobby to base Pro does not itself increase the 1M CDN-request allowance.
- An additional **$20/month CDN tier** provides 10M requests and 50 TB transfer: approximately **$40/month total** including base Pro, before other charges.
- An additional **$100/month CDN tier** provides 50M requests and 50 TB transfer: approximately **$120/month total** including base Pro, before other charges.
- Function compute and Fast Origin Transfer are separate from Flat Rate CDN. Do not assume the infrastructure credit offsets the CDN tier subscription.
- Flat Rate CDN availability, account enrollment, fair-use conditions, and tier-adjustment rules must be checked for the actual team. Existing accounts may differ from new teams.

Sources: [Pro plan](https://vercel.com/docs/plans/pro-plan), [Flat Rate CDN](https://vercel.com/docs/pricing/flat-rate-cdn).

### Illustrative 1,000× scenario

Using the earlier screenshot's totals—2.95 GB visitor transfer, 46.14 MB origin transfer, and approximately 50K requests—1,000× would mean approximately:

- 2.95 TB visitor transfer/month.
- 46.14 GB origin transfer/month.
- 50M CDN requests/month.

This sits around the boundary of the $100 additional CDN tier, suggesting approximately **$120/month plus compute/origin and other charges**, subject to plan eligibility and actual metering. This scales the screenshot, potentially across all projects; it is not a FireInSite traffic forecast.

An earlier on-demand calculation was approximately $575/month before credits/subscription, using Frankfurt rates of $0.15/GB visitor transfer, $2.60/M CDN requests, and $0.06/GB origin transfer. Flat Rate CDN materially changes that comparison; do not reuse the on-demand estimate as the default Pro bill. See [regional pricing](https://vercel.com/docs/pricing/regional-pricing/fra1).

## Alternatives

| Host | Relevant pricing checked | Assessment |
| --- | --- | --- |
| Cloudflare Workers + Static Assets | Paid starts at $5/month, including 10M dynamic requests and 30M CPU milliseconds. Additional dynamic requests $0.30/M; additional CPU $0.02/M CPU milliseconds. Direct static-asset requests are free and unlimited; no Workers bandwidth charges. | Strong candidate for this app's static assets and lightweight proxies. Runtime compatibility and routing must be tested. |
| Netlify | Free: 300 credits. Pro: $20/month with 3,000 credits. Bandwidth, requests, compute, and production deployments consume credits. | Similar managed workflow, but not an obvious bandwidth-cost improvement. |
| Render | Compute charges plus bandwidth. Hobby workspace includes 5 GB/month, then $0.15/GB. | Suitable for a conventional Node server, less compelling for minimizing static delivery costs. |
| Self-hosted VPS | Provider-dependent server subscription and transfer allowance. | More control, but security updates, operations, monitoring, and deployment become your responsibility. |

Sources: [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [static asset billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [Netlify pricing](https://www.netlify.com/pricing/), [Render pricing](https://render.com/pricing).

Cloudflare's free dynamic tier allows 100,000 requests/day with a 10 ms CPU limit per invocation. Cached proxy responses are not automatically free static assets; Worker routing/cache configuration affects billing. A $5/month paid bill looks plausible at modest traffic, but is not guaranteed. Open-Meteo costs remain separate on every hosting platform.

## Optimization priorities

### 1. Reliable browser caching of WASM and models

Normal HTTP browser caching is sufficient; a service worker is not required.

- Use versioned or content-hashed URLs for the runtime, matching JavaScript loader, and models.
- Serve those immutable files with `Cache-Control: public, max-age=31536000, immutable`.
- Keep the URL stable across unrelated app deployments; change it when the actual asset changes.
- Never replace a file's contents at a URL already marked immutable.
- Verify deployed response headers, compression, and repeat-visit network behavior before claiming savings.

The current wrappers use `/wasm/`. No explicit long-lived runtime caching configuration was found during inspection. Existing browser caching or conditional requests may already avoid full downloads; absence of explicit immutable caching does not prove every visit re-downloads the runtime.

A fresh browser-cache hit can avoid both a network request and Vercel transfer. Eviction, clearing site data, private browsing, a different device/domain, or a runtime upgrade can require another download. Browser cache lifetime is not guaranteed storage retention.

References: [HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching), [Vercel cache-control headers](https://vercel.com/docs/caching/cache-control-headers).

### 2. Reuse weather data in the browser

Reuse recent location forecasts across view switches and return visits, and deduplicate in-flight requests. Store fetch time, forecast validity, model, variables, units, location/elevation settings, and schema version. Clearly handle stale data; fire-weather freshness matters.

### 3. Cache weather at the edge

An edge cache is a shared cache on the hosting provider's distributed servers. It is distinct from the user's browser cache.

```text
Browser -> edge cache -> cached public forecast response
                     -> on miss/expiry: secret-key proxy -> Open-Meteo
```

A short freshness window, initially perhaps 10–15 minutes, could reduce proxy execution and Open-Meteo calls. It needs a freshness review, not automatic adoption. Keys must include all response-affecting parameters, and secrets must never appear in client-visible URLs or cached response bodies.

Exact-coordinate queries may share little cached data. Coordinate rounding could improve reuse but can change terrain/elevation-sensitive forecasts, so it requires explicit accuracy decisions and testing. Never cache one user's private data as a shared response.

On Vercel, edge hits still contribute CDN requests and visitor bandwidth. Caching addresses backend/upstream engagement; it does not remove delivery accounting.

### 4. Load only what the selected view needs

FWI-map-only use should ideally avoid loading the full weather/fuel-model workflow. This requires separating data/inference dependencies, not merely deleting model preloads. Fetch optional information lazily and reuse data across location checks.

### 5. Evaluate hosting separately from optimization

Keep Vercel live while testing Cloudflare on a separate deployment. Validate authenticated forecasts, historical mode, WASM/model loading, EFFIS/background tiles, cache behavior, environment secrets, and deployment previews before moving the domain. No migration or billing change has been made as part of these notes.

## Continuous FWI versus severity PNG tiles

EFFIS provides continuous numeric FWI, not only severity classes. The implemented map uses class-colored PNG tiles.

Small live sample on 2026-10-18, using 256×256 tiles:

- Severity PNG: approximately 0.9–3.9 KB/tile.
- Float32 GeoTIFF: approximately 263 KB/tile uncompressed; locally gzip-compressed samples ranged approximately 3–58 KB.
- An illustrative locally colorized continuous-gradient PNG estimate ranged approximately 2–22 KB/tile, with about 2–5 ms local decode/color/compression time. This was not a production encoder or server benchmark.

For 20 tiles, rough payloads are 18–78 KB for classes versus 40–440 KB for a continuous gradient, compared with about 5.3 MB for uncompressed GeoTIFF. Real sizes depend strongly on zoom, geography, encoding, and caching; these examples are not universal ratios.

If implementing continuous visualization, a cached numeric-to-gradient-PNG service is worth considering to retain a normal raster-map client. Direct numeric rendering is another option, but adds client decoding/rendering complexity. Continuous visualization has not been implemented.

## Measurements to collect next

- Confirm project-only versus team-wide usage.
- Measure bytes and request counts for a cold visit, warm repeat visit, 1/3/5 location checks, and an FWI-map session.
- Inspect runtime/model browser-cache hits and deployed content encoding.
- Attribute transfer by route/asset rather than assuming WASM dominates.
- Measure proxy CPU, edge hit rate, and upstream Open-Meteo call consumption.
- Remember that Open-Meteo counts can exceed one billable call per HTTP request depending on variables, dates, models, and locations.
- Recalculate provider bills using actual traffic mix and current account-specific pricing before migrating or upgrading.
