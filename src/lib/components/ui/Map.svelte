<script>
  import { onMount, onDestroy } from "svelte";
  import mapboxgl from "mapbox-gl";
  import LatLon from "geodesy/latlon-spherical.js";
  import { currentLocation } from "$lib/shared/stores/locationStore";
  import "$lib/styles/mapbox-gl.css";
  import Layout from "../../../routes/+layout.svelte";

  let locMarker;
  let map;
  let mapContainer;
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
  function getWindCardinalDirection(windDir) {
    return cardinalDirections[Math.floor(windDir / 11.25)].toLowerCase();
  }

  function setCurrentLocation(longitude, latitude, elevation, slope, aspect) {
    console.log("setCurrent");
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
    currentLoc.distanceFromPrevious = distanceFromPrevious;
    currentLoc.userLocation = true;
    $currentLocation = currentLoc;
    console.log("setCurrent currentLoc", $currentLocation);
  }

  // Slope and aspect
  function slopeAspect(points, distance) {
    var dzdx = (points["W"].elevation - points["E"].elevation) / (distance * 2),
      dzdy = (points["S"].elevation - points["N"].elevation) / (distance * 2);

    const slope = Math.atan(Math.sqrt(dzdx ** 2 + dzdy ** 2)) * (180 / Math.PI);
    const aspectInit = 57.29578 * Math.atan2(dzdy, dzdx);

    return [slope, (450 - aspectInit) % 360];
  }

  function processPointSlopeAspect(map, longitude, latitude, distance) {
    const points = pointsCardinalDirections(longitude, latitude, distance);
    console.log("points", points);
    pointsElevation(points, map);
    console.log("points", points);
    return slopeAspect(points, distance);
  }

  function pointsCardinalDirections(longitude, latitude, distance) {
    const points = {
      N: { bearing: 0, coordinates: [], elevation: null },
      E: { bearing: 90, coordinates: [], elevation: null },
      S: { bearing: 180, coordinates: [], elevation: null },
      W: { bearing: 270, coordinates: [], elevation: null },
    };
    const p1 = new LatLon(latitude, longitude);
    Object.keys(points).forEach((key) => {
      points[key].coordinates = p1.destinationPoint(
        distance,
        points[key].bearing,
      );
    });
    return points;
  }

  function pointsElevation(points, map) {
    Object.keys(points).forEach((key) => {
      points[key].elevation = map.queryTerrainElevation([
        points[key].coordinates._lon,
        points[key].coordinates._lat,
      ]);
    });
  }

  function setMarkerLocation() {
    console.log("setMarkerLocation");
    if (map) {
      console.log("setMarkerLocation map available");
      map.setCenter([$currentLocation.longitude, $currentLocation.latitude]);
      locMarker.setLngLat([
        $currentLocation.longitude,
        $currentLocation.latitude,
      ]);
    }
  }

  onMount(() => {
    const initialState = { lng: lng, lat: lat, zoom: zoom };
    console.log(
      "Map onMount",
      $currentLocation.longitude,
      $currentLocation.latitude,
      $currentLocation.userLocation,
    );

    map = new mapboxgl.Map({
      container: mapContainer,
      accessToken: import.meta.env.VITE_MAPBOX_GL_TOKEN,

      style: `mapbox://styles/mapbox/outdoors-v11`,
      center: [$currentLocation.longitude, $currentLocation.latitude],
      zoom: initialState.zoom,
    });
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
    // map.on("sourcedata", (e) => {
    map.on("load", () => {
      // if (e.source.type === "raster-dem") {
      console.log("Map on load", map.ready());
      console.log("sourcedata true");
      locMarker.setLngLat([
        $currentLocation.longitude,
        $currentLocation.latitude,
      ]);
      map.setCenter([$currentLocation.longitude, $currentLocation.latitude]);
      let elevation = map.queryTerrainElevation([
        $currentLocation.longitude,
        $currentLocation.latitude,
      ]);
      console.log("elevation", elevation);

      let [slope, aspect] = processPointSlopeAspect(
        map,
        $currentLocation.longitude,
        $currentLocation.latitude,
        50,
      );
      setCurrentLocation(
        $currentLocation.longitude,
        $currentLocation.latitude,
        elevation,
        slope,
        aspect,
      );
      // map.off("sourcedata");
    });

    map.on("click", function (e) {
      console.log("click", e);
      let coordinates = e.lngLat;
      locMarker.setLngLat([coordinates.lng, coordinates.lat]);
      let elevation = map.queryTerrainElevation([
        coordinates.lng,
        coordinates.lat,
      ]);
      let [slope, aspect] = processPointSlopeAspect(
        map,
        coordinates.lng,
        coordinates.lat,
        50,
      );
      setCurrentLocation(
        coordinates.lng,
        coordinates.lat,
        elevation,
        slope,
        aspect,
      );
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

<div class="absolute bg-slate-600 bg-opacity-90 text-gray-50 z-10 m-4 p-2">
  <div class="text-xl">Fire Location:</div>
  {$currentLocation.latitude.toFixed(3)}<i
    class="text-xl wi wi-degrees"
  />{$currentLocation.latitude >= 0 ? "N" : "S"}, {$currentLocation.longitude.toFixed(
    3,
  )}<i class="text-xl wi wi-degrees" />{$currentLocation.longitude >= 0
    ? "E"
    : "W"}, {$currentLocation.elevation.toFixed(0)}m asl, slope: {$currentLocation.slope.toFixed(
    0,
  )}%, aspect:
  <i
    class="text-2xl wi wi-wind
      wi-towards-{getWindCardinalDirection($currentLocation.aspect)}"
  />
  <strong
    >({cardinalDirections[Math.floor($currentLocation.aspect / 11.25)]})</strong
  >
</div>
<div class="map z-0" bind:this={mapContainer} />

<style>
  .map {
    position: absolute;
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
    position: absolute;
    top: 0;
    left: 0;
    margin: 12px;
    border-radius: 4px;
  }
</style>
