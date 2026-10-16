# EFFIS forecast integration investigation

Investigated against the application and live services on 16 October 2026.
This document records the service investigation and proposed integration. The
point forecast panel is now implemented on the `effis-fwi` branch; spatial layers
and numeric raster ingestion remain proposals.

## Recommendation

Add an independent **EFFIS / ECMWF daily fire danger** panel for the selected
location, plus an optional raster overlay on the existing Mapbox map. Start with
FWI and its danger class, then offer FFMC, ISI, BUI, DMC, DC, anomaly and ranking.
Use the same valid date for the panel and overlay.

EFFIS documents ECMWF forecasts at approximately 8 km resolution with a 1–9 day
horizon. The UK is covered: point queries in south Wales and maps covering the
UK, including Northern Ireland and Shetland, worked in this investigation.

Treat these as regional, daily fire weather indicators alongside FireInSite's
hourly, fuel-specific fire behavior predictions. They do not incorporate this
application's chosen fuel, slope or canopy settings. Changing FireInSite's
weather model should not change the EFFIS product: it remains ECMWF driven.
Canadian FWI FFMC is an index and must not be substituted directly for the
application's dead fuel moisture percentage.

## Working service routes

The older EFFIS download instructions show `/effis` with `ecmwf007.fwi`.
That exact request returned HTTP 200 containing a WMS `LayerNotDefined`
exception during this investigation. `/effis` capabilities listed MeteoFrance
layers but omitted ECMWF layers.

The current EFFIS viewer's deployed configuration instead points ECMWF layers
to the companion **GWIS** map service:

```text
https://maps.effis.emergency.copernicus.eu/gwis
```

Its capabilities advertise `ecmwf.fwi`, `ecmwf.ffmc`, `ecmwf.isi`, `ecmwf.bui`,
`ecmwf.dmc`, `ecmwf.dc`, `ecmwf.anomaly` and `ecmwf.ranking`. Point information
comes from the separate, queryable `ecmwf.query` layer.

Capabilities can be inspected at:

```text
https://maps.effis.emergency.copernicus.eu/gwis?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetCapabilities
```

The advertised time extent is broadly `2018-01-01/2099-12-31`, which does not
describe actual forecast availability. Do not generate date controls from that
extent or assume that every accepted TIME value has data.

## Point forecast: JSON first

The current EFFIS viewer uses this endpoint for its fire danger charts:

```text
https://api.effis.emergency.copernicus.eu/rest/2/burntareas/charts/wms
```

Despite the `burntareas` path, it accepts arbitrary point coordinates and returns
daily fire danger indices. A tested request for 51.5 N, 3.5 W is:

```text
?model=ecmwf&day_gte=2026-10-16&day_lte=2026-10-24&point=%28-3.5%2051.5%29
```

Coordinates are **longitude latitude**, in geographic degrees. The response has
`x_data` date strings and a `y_data` object containing parallel arrays named
`fwi`, `ffmc`, `isi`, `bui`, `dmc`, `dc`, `anomaly index` and `ranking index`.
All eight fields were returned in one request. On 16 October the test point's
FWI was `0.27604302763938904`, FFMC `56.3180046081543` and DC
`147.67864990234375`; these matched WMS point information to its displayed
precision. These are dated verification samples, not fixed application values.

Implement a SvelteKit endpoint such as:

```text
/api/effis/point?lat=51.5&lon=-3.5&from=2026-10-16&to=2026-10-24
```

The upstream response had no `Access-Control-Allow-Origin`, including when sent
an Origin header. Fetch through the server and normalize the response to daily
records with explicit source, model, requested coordinates, valid date and
retrieval time. Validate coordinates and bound date ranges. Keep the upstream
host and model allowlisted. This viewer endpoint works now but is not a
documented, versioned public API contract; isolate its adapter.

Convert `-9999`, nulls and nonfinite values to missing data. The offshore control
point at 20 W, 52 N returned `-9999.0`, not an HTTP error. Do not reject all
negative numbers: valid anomaly values can be negative. Do not reject zero FWI.
Treat the timestamp-shaped `x_data` entries as daily date keys; their midnight
strings do not establish an hourly forecast valid time or timezone.

A WMS fallback can retrieve all eight indices for one date:

```text
https://maps.effis.emergency.copernicus.eu/gwis?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&LAYERS=ecmwf.query&QUERY_LAYERS=ecmwf.query&STYLES=&SRS=EPSG:4326&BBOX=-4,51,-3,52&WIDTH=101&HEIGHT=101&X=50&Y=50&TIME=2026-10-16&INFO_FORMAT=text/html&FORMAT=image/png
```

For other locations, construct a small bbox centered on the requested point and
query its center pixel. Parse and validate the returned HTML table server-side;
do not inject upstream HTML into the UI. In the MeteoFrance control queries,
text/plain and GML returned no numerical attributes and HTML contained unresolved
placeholders. A successful HTTP response alone is insufficient.

## Spatial layer: WMS in Mapbox

Mapbox GL supports WMS GetMap requests through a raster source. An example tile
template for the working ECMWF layer is:

```text
https://maps.effis.emergency.copernicus.eu/gwis?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=ecmwf.fwi&STYLES=&FORMAT=image/png&TRANSPARENT=true&SRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256&TIME=2026-10-16
```

Use `type: 'raster'`, `tileSize: 256`, source attribution and a raster layer with
adjustable opacity. Use nearest resampling to preserve danger-class colors.
Update source tiles when the selected date or index changes. Re-add the source
and layer after style reloads. Request a suitable maximum source zoom and
overzoom it locally to avoid generating ever more requests for the same coarse
forecast. Test terrain draping and label placement with the current map style.

An EPSG:3857 GetMap covering the UK returned a valid transparent PNG; both the
UK geography and classified land cells were visually inspected. The WMS
capabilities response allowed cross-origin requests. Verify image-response CORS
in a browser before deciding between direct requests and a cached tile proxy.
The Mapbox tile template itself has not been exercised in the application.

Add a “UK overview” fit-bounds action, approximately `[-9,49,3,61]`, and a
larger map option. A UK viewport naturally includes Ireland and nearby countries;
strict UK-only rendering would additionally require a boundary mask.

Obtain the official legend with:

```text
https://maps.effis.emergency.copernicus.eu/gwis?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&LAYER=ecmwf.fwi&FORMAT=image/png
```

The inspected legend shows Low, Moderate, High, Very High, Extreme and Very
Extreme, with breakpoints 11.2, 21.3, 38, 50 and 70. Match the current service's
classification and explicitly settle boundary inclusivity when deriving classes
from numerical values; published interval labels do not fully specify it.

## Numeric rasters for UK analysis

The same service can deliver numerical data rather than rendered colors:

```text
https://maps.effis.emergency.copernicus.eu/gwis?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=ecmwf.fwi&STYLES=&FORMAT=image/tiff&SRS=EPSG:4326&BBOX=-9,49,3,61&WIDTH=120&HEIGHT=120&TIME=2026-10-16
```

This returned a single-band, 32-bit floating-point GeoTIFF, EPSG:4326, at the
requested 0.1-degree output spacing. Its values ranged from 0 to approximately
13.08. This verifies a useful route for downloads, regional summaries and a
future raster cache. It does not establish native grid alignment or resolution:
WMS resamples to the requested bbox and dimensions. For analysis, verify nodata
and resampling, apply a land/UK boundary mask, and use area weighting for
geographic-grid summaries. The tested TIFF lacked an explicit GDAL nodata tag;
zero cannot safely be treated as missing because it is also a valid FWI value.

For a first map release, remote PNG tiles are sufficient. If many users or
regional analytics justify it, periodically ingest UK numeric rasters into
object storage and serve cached tiles and point samples from a common dataset.
Do not run thousands of point requests to build a national raster.

## Application integration points

| Existing file | Proposed change |
| --- | --- |
| `src/lib/components/HomeApp.svelte` | Add a daily danger panel with its own loading/error state. |
| `src/lib/components/ui/Map.svelte` | Add overlay controls, legend, UK extent and date-driven raster source. |
| `src/lib/shared/stores/locationStore.js` | Reuse selected coordinates. |
| `src/lib/shared/stores/timeStore.js` | Reuse the selected location-local day, with explicit daily date keys. |
| `src/lib/components/visual/DayPicker.svelte` | Synchronize EFFIS to overlapping forecast dates; use a separate selector for extra EFFIS dates. |
| `src/lib/shared/locationSelection.js` | Reuse the latest-selection guard and abort superseded EFFIS requests. |
| `src/routes/api/forecast/+server.js` | Follow the existing server-route pattern for a separate EFFIS adapter. |

Keep an independent EFFIS store so an upstream failure does not delay weather
fetching or the fire behavior model. Clear old point results on location changes.
Cache by model, coordinates and date range; do not claim a grid-cell cache until
the grid and sampling semantics have been established. Use a short configurable
cache lifetime initially, with explicit retrieval timestamps and stale labels.
No forecast issue time was exposed in the tested JSON response, so retrieval
time must not be presented as model initialization time.

The point JSON and map queries agreed on the sampled overlapping dates. At the
far end of the forecast, JSON returned a value for 25 October while the tested
WMS point request for that date was empty. Validate availability separately and
show only verified overlapping dates for synchronized views. The exact horizon
and update consistency remain integration checks, not assumptions.

In historical mode, only show a matching, available historical product or an
unavailable state. ERA5 reanalysis is a separate product, not an archive of the
forecast as issued. User-defined weather mode should label any EFFIS display as
external forecast context.

Recommended first release: FWI/class point panel for the existing five forecast
days; FWI map overlay synchronized to the selected day; UK overview; official
legend; source attribution and retrieval date. Next add ranking/anomaly and the
other indices. Ranking/anomaly provide useful context for unusually dry UK
conditions that may still fall into a low Europe-wide absolute danger class.

### Implemented point integration

`EffisForecast.svelte` now displays all six Canadian indices for the day selected
in FireInSite, with the available daily series in an expandable table and an
index guide. Its independent store clears data on location changes, cancels
superseded requests and supports retry. The panel is hidden in historical and
user-defined weather modes. An EFFIS failure does not block fire behavior results.

`/api/effis/point` validates coordinates and a bounded current date window,
fetches the fixed ECMWF chart endpoint with a 15-second timeout, and normalizes
missing values and daily date keys. Responses include retrieval time and source
metadata and use short browser/CDN caching. The server window includes the
previous UTC day to accommodate locations west of UTC. Classification uses
half-open intervals at 11.2, 21.3, 38 and 50, and strictly greater than 70 for
Very Extreme. All-null records remain missing and have no danger class.

Before shipping, verify coordinate order, daily date alignment across BST/GMT,
missing values, superseded requests, map/point agreement and upstream failures.
Check content types and payloads: WMS service errors can arrive with HTTP 200.

## Primary references

- [EFFIS forecast background and classification](https://forest-fire.emergency.copernicus.eu/about-effis/technical-background/fire-danger-forecast)
- [EFFIS access instructions; older layer example](https://forest-fire.emergency.copernicus.eu/downloads-instructions)
- [Current EFFIS viewer; endpoint configuration inspected in its deployed JavaScript](https://forest-fire.emergency.copernicus.eu/apps/effis.csv/)
- [GWIS WMS capabilities](https://maps.effis.emergency.copernicus.eu/gwis?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetCapabilities)
- [Mapbox WMS integration example](https://docs.mapbox.com/mapbox-gl-js/example/wms/)
- [CEMS real-time versus historical data access](https://confluence.ecmwf.int/spaces/CEMS/pages/382667784/CEMS-Fire%2BData%2Baccess)
- [EFFIS data license and attribution terms](https://forest-fire.emergency.copernicus.eu/about-effis/data-license)

The EFFIS license page allows reuse of EU-owned content under CC BY 4.0 unless
otherwise indicated. Retain attribution, identify transformations and check any
product-specific notices when implementing.
