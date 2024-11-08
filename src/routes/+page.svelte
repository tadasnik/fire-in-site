<script>
  import { browser } from "$app/environment";
  import { Select, Button, Popover, Label, Spinner } from "flowbite-svelte";
  import { timeFormat } from "d3-time-format";
  import Map from "$lib/components/ui/Map.svelte";
  import UKFuelModels from "$lib/data/UKFuelModels.json";
  import { outputNodes } from "$lib/data/outputNodes.js";
  import {
    selectedOutput,
    selectedOutputs,
    modelConfigValues,
    advancedMode,
  } from "$lib/shared/stores/modelStore.js";

  import {
    forecastOpenMeteo,
    forecastLocation,
    getForecastOpenMeteo,
    forecastMode,
    fetchingForecast,
    forecastDays,
    daysInForecast,
    focusDayIndex,
  } from "$lib/shared/stores/forecastStore.js";
  import { currentLocation } from "$lib/shared/stores/locationStore";
  import {
    dateTime,
    currentDateTime,
    historicalYear,
    historicalMonth,
    historicalDay,
    historicalDate,
    focusDay,
    timeMode,
    yearsOptions,
    monthOptions,
    dayOptions,
  } from "$lib/shared/stores/timeStore.js";
  import CurrentBehaviour from "$lib/components/visual/CurrentBehaviour.svelte";
  import WeatherInfo from "$lib/components/visual/WeatherInfo.svelte";
  import HourlyForecast from "$lib/components/visual/HourlyForecast.svelte";
  import HistoricalSelectDate from "$lib/components/visual/HistoricalSelectDate.svelte";

  let width;

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

  function fetchHistoricalForecast() {
    $fetchingForecast = true;
    let dateTime = new Date(
      $historicalYear,
      $historicalMonth,
      $historicalDay,
      12,
    );
    console.log(
      "Calling fetch forecast from handle historical, currentdateTime ",
      $currentDateTime,
      dateTime,
    );
    getForecastOpenMeteo(dateTime);
  }

  function geolocateForecast() {
    // geolocate();
    // $currentLocation.longitude = lon;
    // $currentLocation.latitudex = lat;
    // getForecastOpenMeteo($currentDateTime);
  }

  function configOptions(configKey) {
    const options = [];
    $modelConfigValues[configKey].options.forEach((element) => {
      options.push({ name: element });
    });
    return options;
  }

  $: console.log("currentLocation  !??????", $currentLocation);
  // $: console.log("fetchingForecast  !??????", $fetchingForecast);
  // $: console.log("FOcUsIndex  !??????", $focusDayIndex);
  // $: console.log("Forecast MOde  !??????", $forecastMode);
</script>

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
    <Map></Map>
    <div class="md:pl-8">
      <div class="flex flex-row place-items-baseline justify-center">
        <div class="items-baseline align-text-bottom pr-4">
          <span class="align-bottom">Select model output</span>
        </div>

        <div>
          <Select id="select-output" class="" bind:value={$selectedOutput}>
            {#each $selectedOutputs as output}
              <option value={output}>{outputNodes[output].label}</option>
            {/each}
          </Select>
        </div>
      </div>

      <div class="grow w-full sm:w-1/2 min-w-96 p-2">
        <div class="aspect-square pt-2" bind:clientWidth={width}>
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
  </div>
  {#if $forecastMode === "historical"}
    <div class="container mx-auto w-auto p-4 mb-6">
      <HistoricalSelectDate></HistoricalSelectDate>
    </div>
  {/if}
  {#if $fetchingForecast === false}
    <HourlyForecast></HourlyForecast>
  {/if}
</div>

<style>
</style>
