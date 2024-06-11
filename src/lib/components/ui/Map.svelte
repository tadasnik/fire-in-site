<script>
  import { onMount, onDestroy } from "svelte";
  import { Map, Marker } from "mapbox-gl";
  import LatLon from "geodesy/latlon-spherical.js";
  import { locations } from "$lib/shared/stores/locationStore";
  import "$lib/styles/mapbox-gl.css";

  let locMarker;
  let map;
  let mapContainer;
  let lng, lat, zoom;

  lng = -3;
  lat = 52;
  zoom = 9;

  function slopeAspect(points) {
    const p1 = new LatLon(
      points["N"].coordinates._lat,
      points["N"].coordinates._lon
    );
    const p2 = new LatLon(
      points["S"].coordinates._lat,
      points["S"].coordinates._lon
    );
    const dy = p1.distanceTo(p2);

    const p3 = new LatLon(
      points["E"].coordinates._lat,
      points["E"].coordinates._lon
    );
    const p4 = new LatLon(
      points["W"].coordinates._lat,
      points["W"].coordinates._lon
    );
    const dx = p3.distanceTo(p4);

    var dzdx = (points["E"].elevation - points["W"].elevation) / dx,
      dzdy = (points["N"].elevation - points["S"].elevation) / dy;

    //With those values, slope and aspect are calculated like this:

    const slope = Math.atan(Math.sqrt(dzdx ** 2 + dzdy ** 2)) * (180 / Math.PI);
    const aspect =
      dx !== 0 // counterclockwise from east
        ? (Math.atan2(dzdy, dzdx) * (180 / Math.PI) + 180) % 360
        : (90 * (dy > 0 ? 1 : -1) + 180) % 360;
    console.log("another aspect :", 57.29578 * Math.atan2(dzdy, -dzdx));
    return [slope, aspect];
  }

  function processPoint(map) {
    const points = pointsCardinalDirections(
      $locations.currentLocation.longitude,
      $locations.currentLocation.latitude,
      100
    );
    pointsElevation(points, map);
    console.log("slopeAspect", slopeAspect(points));
  }

  function pointsCardinalDirections(longitude, latitude, dist) {
    const points = {
      N: { bearing: 0, coordinates: [], elevation: null },
      E: { bearing: 90, coordinates: [], elevation: null },
      S: { bearing: 180, coordinates: [], elevation: null },
      W: { bearing: 270, coordinates: [], elevation: null },
    };
    const p1 = new LatLon(latitude, longitude);
    Object.keys(points).forEach((key) => {
      points[key].coordinates = p1.destinationPoint(dist, points[key].bearing);
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
    console.log(points);
  }

  onMount(() => {
    const initialState = { lng: lng, lat: lat, zoom: zoom };

    map = new Map({
      container: mapContainer,
      accessToken: import.meta.env.VITE_MAPBOX_GL_TOKEN,

      style: `mapbox://styles/mapbox/outdoors-v11`,
      center: [
        $locations.currentLocation.longitude,
        $locations.currentLocation.latitude,
      ],
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
    map.on("click", function (e) {
      var coordinates = e.lngLat;
      console.log(coordinates);
      $locations.currentLocation.longitude = coordinates.lng;
      $locations.currentLocation.latitude = coordinates.lat;
      locMarker.setLngLat([
        $locations.currentLocation.longitude,
        $locations.currentLocation.latitude,
      ]);
      const elevation = map.queryTerrainElevation([
        coordinates.lng,
        coordinates.lat,
      ]);
      processPoint(map);

      console.log("elevation : ", elevation);
    });
    map.setCenter([
      $locations.currentLocation.longitude,
      $locations.currentLocation.latitude,
    ]);
    locMarker = new Marker()
      .setLngLat([
        $locations.currentLocation.longitude,
        $locations.currentLocation.latitude,
      ])
      .addTo(map);

    // console.log(
    //   "pointsCardinalDirections",
    //   pointsCardinalDirections(
    //     $locations.currentLocation.longitude,
    //     $locations.currentLocation.latitude,
    //     100
    //   )
    // );
  });

  onDestroy(async () => {
    if (map) {
      map.remove();
    }
  });

  $: console.log("MAP locations ", $locations);
</script>

<div class="sidebar">
  Longitude: {$locations.currentLocation.longitude.toFixed(3)} | Latitude: {$locations.currentLocation.latitude.toFixed(
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
    background: #e5e9ec;
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
