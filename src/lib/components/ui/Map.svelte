<script>
  import { onMount, onDestroy } from "svelte";
  import { Map, Marker } from "mapbox-gl";
  import { locations } from "$lib/shared/stores/locationStore";
  import "$lib/styles/mapbox-gl.css";

  let locMarker;
  let map;
  let mapContainer;
  let lng, lat, zoom;

  lng = -3;
  lat = 52;
  zoom = 9;

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
