<script>
  import { onMount, untrack } from 'svelte';
  import { get } from 'svelte/store';
  import { currentLocation } from '$lib/shared/stores/locationStore';
  import { focusDay } from '$lib/shared/stores/timeStore';
  import { dateText } from '$lib/shared/dayForecast.js';
  import { dayKey, fwiDanger } from '$lib/weather/effis.js';
  import { replaceEffisLayer } from '$lib/weather/effisMap.js';
  import FwiBadge from './FwiBadge.svelte';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';

  let { effis = null } = $props();
  let container;
  let map = $state.raw(null);
  let marker;
  let loaded = $state(false);
  let status = $state('loading');
  let basemapError = $state(false);
  let opacity = $state(0.65);
  let activeSource;
  const date = $derived(dayKey($focusDay));
  const selected = $derived(effis?.data?.days.find(day => day.date === date));
  const legend = [0, 11.2, 21.3, 38, 50, 70.1].map(fwiDanger);

  function showDay(day) {
    if (!map || !loaded) return;
    status = 'loading';
    activeSource = `effis-${day}`;
    replaceEffisLayer(map, day, opacity);
  }

  $effect(() => {
    const day = date;
    if (loaded) untrack(() => showDay(day));
  });
  $effect(() => {
    const value = opacity;
    if (loaded && map?.getLayer('effis-fwi')) map.setPaintProperty('effis-fwi', 'raster-opacity', value);
  });
  $effect(() => {
    const { latitude, longitude } = $currentLocation;
    if (map && marker) {
      marker.setLngLat([longitude, latitude]);
      map.easeTo({ center: [longitude, latitude] });
    }
  });

  function recenter() {
    const { longitude, latitude } = get(currentLocation);
    map?.easeTo({ center: [longitude, latitude], zoom: 6.5 });
  }

  onMount(() => {
    let disposed = false;
    void (async () => {
      const renderer = await import('maplibre-gl');
      if (disposed) return;
      renderer.setWorkerUrl(workerUrl);
      const { longitude, latitude } = get(currentLocation);
      map = new renderer.Map({
        container, center: [longitude, latitude], zoom: 6.5, minZoom: 2, maxZoom: 12,
        style: {
          version: 8,
          sources: { osm: { type: 'raster', tiles: ['/api/map/tiles/{z}/{x}/{y}'], tileSize: 256, maxzoom: 18,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · <a href="https://www.fossgis.de/">FOSSGIS</a>' } },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        },
      });
      map.addControl(new renderer.NavigationControl({ showCompass: false }), 'top-right');
      marker = new renderer.Marker({ color: '#334155' }).setLngLat([longitude, latitude]).addTo(map);
      marker.getElement().setAttribute('aria-label', 'Selected forecast location');
      map.on('load', () => { loaded = true; });
      map.on('sourcedata', event => {
        if (event.sourceId === activeSource && event.isSourceLoaded && status !== 'error') status = 'ready';
        if (event.sourceId === 'osm' && event.tile?.state === 'loaded') basemapError = false;
      });
      // Cached tiles may finish before the new source ID is assigned. The idle
      // event covers that path as well as completion after a pan or resize.
      map.on('idle', () => {
        if (activeSource && map.getSource(activeSource) && map.isSourceLoaded(activeSource) && status !== 'error') status = 'ready';
      });
      map.on('error', event => {
        if (event.error?.name === 'AbortError') return;
        if (event.sourceId === activeSource) status = 'error';
        else if (event.sourceId === 'osm') basemapError = true;
      });
    })().catch(() => { if (!disposed) status = 'init-error'; });
    return () => { disposed = true; loaded = false; map?.remove(); map = null; };
  });
</script>

<section class="effis-map" aria-labelledby="effis-map-heading">
  <div class="map-toolbar">
    <div>
      <h2 id="effis-map-heading" class="section-title">EFFIS Fire Weather Index · {dateText($focusDay)}</h2>
      <p class="control-help">ECMWF · daily · approximately 8 km. Independent of local fuel and terrain settings.</p>
    </div>
    <button type="button" class="button-secondary" disabled={!loaded} onclick={recenter}>Recenter</button>
  </div>
  <div class="map-point">
    <span>Selected location</span><FwiBadge day={selected} status={effis?.status ?? 'idle'} compact />
    <label for="effis-opacity">Overlay <input id="effis-opacity" type="range" min="0.2" max="1" step="0.05" bind:value={opacity} /></label>
  </div>
  <div class="effis-map-canvas" bind:this={container} role="region" aria-label="EFFIS daily FWI severity map for {date}" aria-busy={status === 'loading'}></div>
  <div class="map-status control-help" role="status">
    {#if status === 'loading'}Loading EFFIS map for {date}…
    {:else if status === 'error'}EFFIS map tiles could not load for {date}.
      <button type="button" class="underline" onclick={() => showDay(date)}>Retry layer</button>
    {:else if status === 'init-error'}The interactive map could not start. WebGL may be unavailable.
      <a class="underline" href="https://forest-fire.emergency.copernicus.eu/apps/effis_current_situation/" target="_blank" rel="noreferrer">Open EFFIS viewer</a>
    {:else}Daily FWI layer loaded. Uncoloured areas may have no data; they do not mean Low danger.{/if}
    {#if basemapError} Some background map tiles could not load.{/if}
  </div>
  <ul class="fwi-legend" aria-label="EFFIS FWI danger classes">
    {#each legend as danger}<li><span style:background={danger.color}></span>{danger.label}</li>{/each}
  </ul>
  <p class="control-help">Pan and zoom to explore. The marker is your selected location; use location search to change it. Day tabs select the daily map—not an hourly forecast.</p>
  <p class="control-help">Source: <a class="underline" href="https://forest-fire.emergency.copernicus.eu/about-effis/technical-background/fire-danger-forecast" target="_blank" rel="noreferrer">Copernicus CEMS / EFFIS · ECMWF</a>. Tiles and point forecasts can update at different times.</p>
</section>

<style>
  .effis-map { min-width: 0; }
  .map-toolbar, .map-point { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
  .map-point { justify-content: flex-start; font-size: 12px; }
  .map-point label { display: flex; align-items: center; gap: 8px; margin-left: auto; }
  .map-point input { width: 100px; accent-color: #c2410c; }
  .effis-map-canvas { height: clamp(340px, 55vh, 520px); width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #e2e8f0; }
  .map-status { margin-top: 8px; min-height: 18px; }
  .fwi-legend { display: flex; flex-wrap: wrap; gap: 6px 14px; margin: 8px 0; padding: 0; list-style: none; font-size: 11px; }
  .fwi-legend li { display: flex; align-items: center; gap: 5px; }
  .fwi-legend li span { width: 14px; height: 10px; border: 1px solid rgb(71 85 105 / 40%); }
</style>
