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
  import BarFigure from "$lib/components/visual/BarFigure.svelte";
  import FireCharacteristics from "$lib/components/visual/FireCharacteristics.svelte";
  import CurrentBehaviour from "$lib/components/visual/CurrentBehaviour.svelte";
  import Heatmap from "$lib/components/visual/Heatmap.svelte";
  import WeatherInfo from "$lib/components/visual/WeatherInfo.svelte";
  import DayPicker from "$lib/components/visual/DayPicker.svelte";
  import HourlyForecast from "$lib/components/visual/HourlyForecast.svelte";
  import HistoricalSelectDate from "$lib/components/visual/HistoricalSelectDate.svelte";

  let width;

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

  function configOptions(configKey) {
    const options = [];
    $modelConfigValues[configKey].options.forEach((element) => {
      options.push({ name: element });
    });
    return options;
  }

  $: console.log("currentLocation  !??????", $currentLocation);
  $: console.log("fetchingForecast  !??????", $fetchingForecast);
  // $: console.log("FOcUsIndex  !??????", $focusDayIndex);
  // $: console.log("Forecast MOde  !??????", $forecastMode);
</script>

<div class="flex flex-col justify-center content-center w-full">
  <div class="container mx-auto justify-center p-4 items-center">
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
  <div
    class="flex flex-row mx-auto max-h-3 w-full max-w-screen-xl justify-end items-center"
  >
    <!-- <div>Current</div> -->
    <div class="m-2">
      <Label>
        Select Model output
        <Select
          id="select-output"
          class="mb-6 pl-3"
          bind:value={$selectedOutput}
        >
          {#each $selectedOutputs as output}
            <option value={output}>{outputNodes[output].label}</option>
          {/each}
        </Select>
      </Label>
    </div>
  </div>
  <div
    class="container mx-auto flex flex-col md:flex-row items-center max-w-screen-xl"
  >
    <div class="grow w-full sm:p-4 sm:w-1/2 min-w-96">
      <div class="aspect-square" bind:clientWidth={width}>
        <Map />
      </div>
    </div>
    <div class="grow w-full sm:w-1/2 min-w-80 p-4">
      <!-- <div>{outputNodes[$selectedOutput].label}</div> -->
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
