<script>
  import { onMount, onDestroy } from "svelte";
  import { Button } from "flowbite-svelte";
  import mapboxgl from "mapbox-gl";
  import LatLon from "geodesy/latlon-spherical.js";
  import { currentLocation } from "$lib/shared/stores/locationStore";
  import { getForecastOpenMeteo } from "$lib/shared/stores/forecastStore";
  import { elevationSlopeAspect } from "$lib/weather/elevation";
  import { beginLocationSelection } from "$lib/shared/locationSelection";
  import "$lib/styles/mapbox-gl.css";

  let locMarker;
  let map;
  let mapContainer = $state();
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

  function geolocateForecast() {
    geolocate();
  }

  async function geolocate() {
    const isCurrent = beginLocationSelection();
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    function success(pos) {
      if (!isCurrent()) return;
      const crd = pos.coords;

      // console.log("Your current position is:");
      // console.log(`Latitude : ${crd.latitude}`);
      // console.log(`Longitude: ${crd.longitude}`);
      // console.log(`More or less ${crd.accuracy} meters.`);
      setMapLocation(
        crd.longitude,
        crd.latitude,
        true,
      );
    }

    function error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
      // Resume the last confirmed location if this attempt superseded an
      // in-flight startup/forecast request and permission was denied.
      if (isCurrent()) {
        setMapLocation($currentLocation.longitude, $currentLocation.latitude, true);
      }
    }

    await navigator.geolocation.getCurrentPosition(success, error, options);
  }

  async function setMapLocation(longitude, latitude, center = false) {
    const isCurrent = beginLocationSelection();
    locMarker.setLngLat([longitude, latitude]);
    if (center) {
      map.setCenter([longitude, latitude]);
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
    return cardinalDirections[Math.floor(windDir / 11.25)].toLowerCase();
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

  function setMarkerLocation() {
    // console.log("setMarkerLocation");
    if (map) {
      // console.log("setMarkerLocation map available");
      map.setCenter([$currentLocation.longitude, $currentLocation.latitude]);
      locMarker.setLngLat([
        $currentLocation.longitude,
        $currentLocation.latitude,
      ]);
    }
  }
  let width = $state();

  $effect(() => {
    const _lat = $currentLocation.latitude;
    const _lon = $currentLocation.longitude;
    setMarkerLocation();
  });

  onMount(() => {
    const initialState = { lng: lng, lat: lat, zoom: zoom };

    // console.log(
    //   "Map onMount",
    //   $currentLocation.longitude,
    //   $currentLocation.latitude,
    //   $currentLocation.userLocation,
    // );
    // $currentLocation, setMarkerLocation();

    map = new mapboxgl.Map({
      container: mapContainer,
      accessToken: import.meta.env.VITE_MAPBOX_GL_TOKEN,

      style: `mapbox://styles/mapbox/satellite-streets-v12`,
      center: [$currentLocation.longitude, $currentLocation.latitude],
      zoom: initialState.zoom,
    });
    map.addControl(new mapboxgl.NavigationControl());
    map._isReady = false;
    map.ready = () => map._isReady;
    map.once("load", () => (map._isReady = true));
    map.on("style.load", () => {
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

    locMarker = new mapboxgl.Marker()
      .setLngLat([$currentLocation.longitude, $currentLocation.latitude])
      .addTo(map);
  });

  onDestroy(async () => {
    if (map) {
      map.remove();
    }
  });
</script>

<div class="flex flex-col justify-center">
  <div class="flex flex-row place-items-baseline justify-center pb-2">
    <div class="items-baseline align-text-bottom pr-4">
      <span class="align-bottom text-slate-500">Select location on the Map</span
      >
    </div>
    <div>
      <Button outline primary-200 size="xs" onclick={geolocate}
        >Geolocate</Button
      >
    </div>
  </div>

  <div class="aspect-square overflow-hidden" bind:clientWidth={width}>
    <div
      class="w-full bg-slate-600 bg-opacity-90 text-center text-gray-50 z-10 p-1"
    >
      {#if $currentLocation.elevation}
        {$currentLocation.latitude.toFixed(3)}<i class="text-xl wi wi-degrees"
        ></i>{$currentLocation.latitude >= 0 ? "N" : "S"}, {$currentLocation.longitude.toFixed(
          3,
        )}<i class="text-xl wi wi-degrees"></i>{$currentLocation.longitude >= 0
          ? "E"
          : "W"}, {$currentLocation.elevation.toFixed(0)}m asl, slope: {$currentLocation.slope.toFixed(
          0,
        )}%,
        <i
          class="text-2xl wi wi-wind
      wi-towards-{getWindCardinalDirection($currentLocation.aspect)}"
        ></i>
      {/if}
    </div>
    <div class="w-full h-full z-0" bind:this={mapContainer}></div>
  </div>
</div>

<!-- </div> -->

<!-- <div -->
<!--   class="absolute w-full bg-slate-600 bg-opacity-90 text-center text-gray-50 z-10 p-1" -->
<!-- > -->
<!--   {$currentLocation.latitude.toFixed(3)}<i -->
<!--     class="text-xl wi wi-degrees" -->
<!--   />{$currentLocation.latitude >= 0 ? "N" : "S"}, {$currentLocation.longitude.toFixed( -->
<!--     3, -->
<!--   )}<i class="text-xl wi wi-degrees" />{$currentLocation.longitude >= 0 -->
<!--     ? "E" -->
<!--     : "W"}, {$currentLocation.elevation.toFixed(0)}m asl, slope: {$currentLocation.slope.toFixed( -->
<!--     0, -->
<!--   )}%, -->
<!--   <i -->
<!--     class="text-2xl wi wi-wind -->
<!--       wi-towards-{getWindCardinalDirection($currentLocation.aspect)}" -->
<!--   /> -->
<!-- </div> -->
<!-- <div class="map z-0" bind:this={mapContainer} /> -->

<style>
  .map {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .sidebar {
    background-color: rgb(35 55 75 / 90%);
    color: #fff;
    padding: 6px 12px;
    font-family: monospace;
    z-index: 1;
    position: relative;
    top: 0;
    left: 0;
    margin: 12px;
    border-radius: 4px;
  }
</style>
