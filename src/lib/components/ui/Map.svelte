<script>
  import { onMount, onDestroy } from "svelte";
  import mapboxgl from "mapbox-gl";
  import LatLon from "geodesy/latlon-spherical.js";
  import { currentLocation } from "$lib/shared/stores/locationStore";
  import { getForecastOpenMeteo } from "$lib/shared/stores/forecastStore";
  import { elevationSlopeAspect } from "$lib/weather/elevation";
  import { beginLocationSelection } from "$lib/shared/locationSelection";
  import "$lib/styles/mapbox-gl.css";
  import 'maplibre-gl/dist/maplibre-gl.css';
  import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';

  let locMarker;
  let terrainPopup;
  let map;
  let destroyed = false;
  let mapContainer = $state();
  let mapNotice = $state('');
  const mapboxToken = import.meta.env.VITE_MAPBOX_GL_TOKEN;
  const streetTiles = import.meta.env.VITE_OSM_TILE_URL
    || '/api/map/tiles/{z}/{x}/{y}';
  let satellite = Boolean(mapboxToken?.trim());

  function streetStyle() {
    return {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: [streetTiles],
          tileSize: 256,
          maxzoom: 18,
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · <a href="https://www.fossgis.de/">FOSSGIS</a>',
        },
      },
      layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
    };
  }

  function handleMapError(event) {
    if (event.error?.name === 'AbortError') return;
    if (satellite && [401, 403].includes(event.error?.status)) {
      satellite = false;
      mapNotice = 'Satellite imagery unavailable. Showing street map.';
      void initializeMap().catch(() => { mapNotice = 'Unable to initialize the street map.'; });
    } else if (!satellite && event.sourceId === 'osm') {
      mapNotice = 'Some map tiles could not load. Try reloading the map.';
    }
  }

  function handleSourceData(event) {
    if (!satellite && event.sourceId === 'osm' && event.tile?.state === 'loaded') {
      mapNotice = '';
    }
  }

  function reloadStreetMap() {
    mapNotice = '';
    map?.getSource('osm')?.setTiles([streetTiles]);
  }
  let lng, lat, zoom;

  lng = -3;
  lat = 52;
  zoom = 12;
  const cardinalDirections = {
    0: "N",
    1: "NNE",
    2: "NNE",
    3: "NE",
    4: "NE",
    5: "ENE",
    6: "ENE",
    7: "E",
    8: "E",
    9: "ESE",
    10: "ESE",
    11: "SE",
    12: "SE",
    13: "SSE",
    14: "SSE",
    15: "S",
    16: "S",
    17: "SSW",
    18: "SSW",
    19: "SW",
    20: "SW",
    21: "WSW",
    22: "WSW",
    23: "W",
    24: "W",
    25: "WNW",
    26: "WNW",
    27: "NW",
    28: "NW",
    29: "NNW",
    30: "NNW",
    31: "N",
  };

  function addGeolocationControl(renderer) {
    const control = new renderer.GeolocateControl({
      positionOptions: { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      trackUserLocation: false,
      showUserLocation: false,
      showAccuracyCircle: false,
    });
    const trigger = control.trigger.bind(control);
    let isCurrent = () => false;
    let pending = false;
    // Start the selection guard before the native control requests permission.
    control.trigger = () => {
      if (pending) return false;
      isCurrent = beginLocationSelection();
      pending = true;
      const started = trigger();
      if (!started) pending = false;
      return started;
    };
    control.on('geolocate', ({ coords }) => {
      pending = false;
      if (!isCurrent()) {
        map.stop();
        setMarkerLocation();
        return;
      }
      setMapLocation(coords.longitude, coords.latitude);
    });
    control.on('error', () => {
      pending = false;
      // Resume a confirmed selection if this lookup interrupted its forecast.
      if (isCurrent()) setMapLocation($currentLocation.longitude, $currentLocation.latitude);
    });
    map.addControl(control, 'top-right');
    return control;
  }

  async function setMapLocation(longitude, latitude, center = false) {
    const isCurrent = beginLocationSelection();
    terrainPopup?.setText("Loading terrain…");
    locMarker?.setLngLat([longitude, latitude]);
    if (center) {
      map?.setCenter([longitude, latitude]);
    }
    // Elevation + slope + aspect from the Open-Meteo DEM (same source as the
    // location search), not from Mapbox terrain — the map is a visual location
    // picker only.
    let elevation = 0;
    let slope = 0;
    let aspect = 0;
    try {
      const t = await elevationSlopeAspect(latitude, longitude);
      elevation = t.elevation;
      slope = t.slope;
      aspect = t.aspect;
    } catch { /* flat fallback */ }
    if (!isCurrent()) return;
    setCurrentLocation(longitude, latitude, elevation, slope, aspect);
    getForecastOpenMeteo();
  }

  function getWindCardinalDirection(windDir) {
    const direction = ((Number(windDir) % 360) + 360) % 360;
    return cardinalDirections[Math.floor(direction / 11.25)]?.toLowerCase() ?? 'n';
  }

  function setCurrentLocation(longitude, latitude, elevation, slope, aspect) {
    let currentLoc = {};
    let prevLoc = new LatLon(
      $currentLocation.latitude,
      $currentLocation.longitude,
    );
    let newLoc = new LatLon(latitude, longitude);
    let distanceFromPrevious = prevLoc.distanceTo(newLoc);
    currentLoc.longitude = longitude;
    currentLoc.latitude = latitude;
    currentLoc.elevation = elevation;
    currentLoc.slope = Math.round(slope);
    currentLoc.aspect = Math.round(aspect);
    currentLoc.distanceFromPrevious =
      distanceFromPrevious === 0 ? 10000 : distanceFromPrevious;
    currentLoc.userLocation = true;
    $currentLocation = currentLoc;
    // console.log("setCurrent currentLoc", $currentLocation);
  }

  function updateTerrainPopup() {
    if (!terrainPopup) return;
    const { elevation, slope, aspect } = $currentLocation;
    const format = value => Number.isFinite(value) ? Math.round(value) : '—';
    const direction = getWindCardinalDirection(aspect).toUpperCase();
    terrainPopup.setText(
      `Elevation ${format(elevation)} m asl\nSlope ${format(slope)}% · Aspect ${Number.isFinite(aspect) ? direction : '—'}`,
    );
  }

  function setMarkerLocation() {
    // console.log("setMarkerLocation");
    if (map && locMarker) {
      // console.log("setMarkerLocation map available");
      map.setCenter([$currentLocation.longitude, $currentLocation.latitude]);
      updateTerrainPopup();
      locMarker.setLngLat([
        $currentLocation.longitude,
        $currentLocation.latitude,
      ]);
    }
  }

  $effect(() => {
    const _lat = $currentLocation.latitude;
    const _lon = $currentLocation.longitude;
    setMarkerLocation();
  });

  async function initializeMap() {
    // Mapbox GL requires authorization even for third-party tiles. Use the
    // independent MapLibre renderer for the keyless street-map fallback.
    const renderer = satellite ? mapboxgl : await import('maplibre-gl');
    if (!satellite) renderer.setWorkerUrl(maplibreWorkerUrl);
    if (destroyed) return;
    map?.remove();
    locMarker = undefined;
    const initialState = { lng: lng, lat: lat, zoom: zoom };

    // console.log(
    //   "Map onMount",
    //   $currentLocation.longitude,
    //   $currentLocation.latitude,
    //   $currentLocation.userLocation,
    // );
    // $currentLocation, setMarkerLocation();

    map = new renderer.Map({
      container: mapContainer,
      accessToken: satellite ? mapboxToken : undefined,

      style: satellite ? 'mapbox://styles/mapbox/satellite-streets-v12' : streetStyle(),
      center: [$currentLocation.longitude, $currentLocation.latitude],
      zoom: initialState.zoom,
    });
    map.addControl(new renderer.NavigationControl());
    addGeolocationControl(renderer);
    map._isReady = false;
    map.ready = () => map._isReady;
    map.once("load", () => (map._isReady = true));
    map.on('error', handleMapError);
    map.on('sourcedata', handleSourceData);
    map.on("style.load", () => {
      if (!satellite) return;
      // add the digital elevation model tiles
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 20,
      });
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1 });
    });

    // LocationSearch initializes from history/IP. Map load must not start a
    // competing selection while that asynchronous lookup is still pending.

    map.on("click", function (e) {
      let coordinates = e.lngLat;
      setMapLocation(coordinates.lng, coordinates.lat, false);
    });

    terrainPopup = new renderer.Popup({
      closeButton: false,
      closeOnClick: false,
      focusAfterOpen: false,
      offset: 38,
      className: 'terrain-popup',
      maxWidth: '220px',
    });
    updateTerrainPopup();
    locMarker = new renderer.Marker()
      .setLngLat([$currentLocation.longitude, $currentLocation.latitude])
      .setPopup(terrainPopup)
      .addTo(map)
      .togglePopup();
  }

  onMount(() => {
    void initializeMap().catch(() => { mapNotice = 'Unable to initialize the map.'; });
  });

  onDestroy(async () => {
    destroyed = true;
    if (map) {
      map.remove();
    }
  });
</script>

<div class="flex flex-col justify-center">
  <div class="map-viewport">
    <div class="map-canvas" bind:this={mapContainer}></div>
  </div>
  {#if mapNotice}
    <p class="pt-2 text-center text-xs text-gray-500" role="status">
      {mapNotice}
      <button type="button" class="ml-2 underline" onclick={reloadStreetMap}>Reload map</button>
    </p>
  {/if}
</div>

<style>
  .map-viewport { position: relative; height: 330px; border-radius: 8px; overflow: hidden; }
  .map-canvas { position: absolute; inset: 0; }
  :global(.terrain-popup .maplibregl-popup-content),
  :global(.terrain-popup .mapboxgl-popup-content) {
    padding: 6px 9px;
    color: #334155;
    font: 12px/1.5 system-ui, sans-serif;
    white-space: pre-line;
    border-radius: 5px;
    box-shadow: 0 1px 6px rgb(0 0 0 / 15%);
  }
</style>
