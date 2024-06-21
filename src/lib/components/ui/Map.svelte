<script>
  import { onMount, onDestroy } from "svelte";
  import { Map, Marker } from "mapbox-gl";
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
  zoom = 9;

  function setCurrentLocation(coordinates) {
    const prevLoc = new LatLon(
      $currentLocation.latitude,
      $currentLocation.longitude
    );
    $currentLocation.longitude = coordinates.lng;
    $currentLocation.latitude = coordinates.lat;
    const newLoc = new LatLon(
      $currentLocation.latitude,
      $currentLocation.longitude
    );
    $currentLocation.distanceFromPrevious = prevLoc.distanceTo(newLoc);
  }

  // Slope and aspect
  function slopeAspect(points, distance) {
    var dzdx = (points["W"].elevation - points["E"].elevation) / (distance * 2),
      dzdy = (points["S"].elevation - points["N"].elevation) / (distance * 2);

    const slope = Math.atan(Math.sqrt(dzdx ** 2 + dzdy ** 2)) * (180 / Math.PI);
    const aspectInit = 57.29578 * Math.atan2(dzdy, dzdx);

    return [slope, (450 - aspectInit) % 360];
  }

  function processPointSlopeAspect(map, distance) {
    const points = pointsCardinalDirections(
      $currentLocation.longitude,
      $currentLocation.latitude,
      distance
    );
    pointsElevation(points, map);
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
        points[key].bearing
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

    map = new Map({
      container: mapContainer,
      accessToken: import.meta.env.VITE_MAPBOX_GL_TOKEN,

      style: `mapbox://styles/mapbox/outdoors-v11`,
      center: [$currentLocation.longitude, $currentLocation.latitude],
      zoom: initialState.zoom,
    });
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
    map.on("sourcedata", (e) => {
      if (
        e.source.type === "raster-dem" &&
        $currentLocation.userLocation === false
      ) {
        locMarker.setLngLat([
          $currentLocation.longitude,
          $currentLocation.latitude,
        ]);
        map.setCenter([$currentLocation.longitude, $currentLocation.latitude]);
        const [slope, aspect] = processPointSlopeAspect(map, 50);
        $currentLocation.slope = slope;
        $currentLocation.aspect = aspect;
        $currentLocation.userLocation = true;
      }
    });

    map.on("click", function (e) {
      var coordinates = e.lngLat;
      setCurrentLocation(coordinates);
      locMarker.setLngLat([
        $currentLocation.longitude,
        $currentLocation.latitude,
      ]);
      $currentLocation.elevation = map.queryTerrainElevation([
        coordinates.lng,
        coordinates.lat,
      ]);
      const [slope, aspect] = processPointSlopeAspect(map, 50);
      $currentLocation.slope = slope;
      $currentLocation.aspect = aspect;
    });
    locMarker = new Marker()
      .setLngLat([$currentLocation.longitude, $currentLocation.latitude])
      .addTo(map);
  });

  onDestroy(async () => {
    if (map) {
      map.remove();
    }
  });

  // $: $currentLocation, setMarkerLocation(); // promise.then(fetchForecast());
</script>

<div class="sidebar">
  Longitude: {$currentLocation.longitude.toFixed(3)} | Latitude: {$currentLocation.latitude.toFixed(
    3
  )} | Zoom:
  {zoom.toFixed(2)}
</div>
<div class="">
  <div class="map" bind:this={mapContainer} />
</div>

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
