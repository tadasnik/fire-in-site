<script>
  import { browser } from "$app/environment";
  import { Select, Button, Spinner } from "flowbite-svelte";
  import Map from "$lib/components/ui/Map.svelte";
  import { outputNodes } from "$lib/data/outputNodes.js";
  import {
    selectedOutput,
    selectedOutputs,
  } from "$lib/shared/stores/modelStore.js";

  import {
    forecastOpenMeteo,
    forecastLocation,
    forecastMode,
    fetchingForecast,
  } from "$lib/shared/stores/forecastStore.js";
  import { changedHistoricalDate } from "$lib/shared/stores/timeStore.js";
  import { currentLocation } from "$lib/shared/stores/locationStore";
  import CurrentBehaviour from "$lib/components/visual/CurrentBehaviour.svelte";
  import CanopyControls from "$lib/components/ui/CanopyControls.svelte";
  import WeatherInfo from "$lib/components/visual/WeatherInfo.svelte";
  import HourlyForecast from "$lib/components/visual/HourlyForecast.svelte";
  import HistoricalSelectDate from "$lib/components/visual/HistoricalSelectDate.svelte";
  import DayPicker from "$lib/components/visual/DayPicker.svelte";
  import Heatmap from "$lib/components/visual/Heatmap.svelte";
  import SelectOutput from "$lib/components/ui/SelectOutput.svelte";
  import UserInputControls from "$lib/components/ui/UserInputControls.svelte";
  // import GeoLocation from "$lib/components/ui/GeoLocation.svelte";
  // import FindLocation from "$lib/components/ui/FindLocation.svelte";

  let width = $state();
  let showMap = false;

  async function geolocate() {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    function success(pos) {
      const crd = pos.coords;

      console.log("Your current position is:");
      console.log(`Latitude : ${crd.latitude}`);
      console.log(`Longitude: ${crd.longitude}`);
      console.log(`More or less ${crd.accuracy} meters.`);
      $currentLocation.longitude = crd.longitude;
      $currentLocation.latitude = crd.latitude;

      // setMapLocation(crd.longitude, crd.latitude)
    }

    function error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success, error, options);
  }

  // $: console.log("currentLocation  !??????", $currentLocation);
  // $: console.log("fetchingForecast  !??????", $fetchingForecast);
  // $: console.log("Forecast MOde  !??????", $forecastMode);
</script>

<svelte:head>
  <title>FireInSite fire behaviour prediction system</title>
  <meta
    name="description"
    content="Fire behaviour predictions for a wide range of
    temperate shrub and grass-dominated vegetation fuels in your browser."
  />
</svelte:head>

<div class="flex flex-col justify-center content-center w-full space-y-5">
  <div class="container mx-auto justify-center p-2 items-center">
    {#if $fetchingForecast === false}
      <WeatherInfo
        data={$forecastOpenMeteo}
        forecastLocation={$forecastLocation.name}
        fireLocation={$currentLocation}
      />
    {:else}
      <WeatherInfo
        data={null}
        forecastLocation={$forecastLocation.name}
        fireLocation={$currentLocation}
      />
    {/if}
  </div>
  <!-- <div class="flex flex-row mx-auto max-h-3 w-full max-w-screen-xl"> -->
  <!--   <div class="hidden md:block place-items-baseline align-text-bottom pb-0"> -->
  <!--     <div class="flex-row"> -->
  <!--       <div class="items-baseline align-text-bottom pr-4"> -->
  <!--         <span class="align-bottom">HHSelect location on the Map</span> -->
  <!--       </div> -->
  <!--       <div> -->
  <!--         <Button outline primary size="xs">Geolocate</Button> -->
  <!--       </div> -->
  <!--     </div> -->
  <!--     <!-- <div>Current</div> -->
  <!--     <div class="p-5"> -->
  <!--       <Label> -->
  <!--         HHSelect Model output -->
  <!--         <Select -->
  <!--           id="select-output" -->
  <!--           class="mb-6 pl-3" -->
  <!--           bind:value={$selectedOutput} -->
  <!--         > -->
  <!--           {#each $selectedOutputs as output} -->
  <!--             <option value={output}>{outputNodes[output].label}</option> -->
  <!--           {/each} -->
  <!--         </Select> -->
  <!--       </Label> -->
  <!--     </div> -->
  <!--   </div> -->
  <!-- </div> -->
  <div
    class="container mx-auto flex flex-col md:flex-row justify-center items-center max-w-screen-xl"
  >
    <div class="grow w-full md:w-1/2 min-w-96 max-w-120 pl-4 md:pl-8">
      <!-- <FindLocation></FindLocation> -->
      <!-- <GeoLocation></GeoLocation> -->
      <Map></Map>
    </div>
    <div class="grow w-full md:w-1/2 min-w-96 max-w-120 p-2 md:pl-8">
      <div class="flex flex-row place-items-baseline justify-center">
        <div class="items-baseline align-text-bottom pr-2">
          <span class="align-bottom">Select model output</span>
        </div>

        <SelectOutput></SelectOutput>
      </div>

      <div class="flex grow aspect-square pt-2" bind:clientWidth={width}>
        {#if browser && $fetchingForecast === false}
          <CurrentBehaviour></CurrentBehaviour>
        {:else}
          <div class="flex justify-center">
            <Spinner></Spinner>
          </div>
        {/if}
      </div>
    </div>
  </div>
  <div class="flex flex-col mx-auto min-w-120 md:justify-center">
    {#if $forecastMode === "user"}
      <UserInputControls></UserInputControls>
    {:else}
      {#if $forecastMode === "historical"}
        <HistoricalSelectDate></HistoricalSelectDate>
      {/if}
      {#if $forecastMode === "forecast"}
        <div class="flex min-w-120 max-w-120 md:max-w-4xl overflow-x-auto">
          <DayPicker />
        </div>
      {/if}

      {#if $changedHistoricalDate === true || $forecastMode === "forecast"}
        {#if $fetchingForecast === false}
          <div
            class="flex mx-auto min-w-120 max-w-120 md:max-w-4xl overflow-x-auto md:justify-center"
          >
            <Heatmap
              xKey="time"
              zKey={$selectedOutput}
              yKey="surface.primary.fuel.model.catalogKey"
            />
          </div>
          {#if $selectedOutput == "crown.fire.transition.minBaseHeight"}
            <div class="p-2 mx-auto max-w-120">
              <CanopyControls></CanopyControls>
            </div>
          {/if}
        {/if}
      {/if}
    {/if}
  </div>
</div>

<style>
</style>
