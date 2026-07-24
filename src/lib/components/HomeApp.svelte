<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { Spinner } from "flowbite-svelte";
  import Map from "$lib/components/ui/Map.svelte";
  import { selectedOutput } from "$lib/shared/stores/modelStore.js";
  import { preloadDeadFFMC } from "$lib/model/fireInSiteFFMC";
  import { preloadLfmc } from "$lib/model/lfmcModel";

  import {
    forecastOpenMeteo,
    forecastLocation,
    forecastMode,
    fetchingForecast,
    forecastDataMode,
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
  import LocationSearch from "$lib/components/ui/LocationSearch.svelte";

  let width = $state();

  // Warm the ONNX fuel-moisture sessions in the background so the first forecast
  // run doesn't wait on the model/WASM load.
  onMount(() => {
    preloadDeadFFMC();
    preloadLfmc();
  });
</script>

<div class="flex flex-col justify-center content-center w-full space-y-5">
  <div class="container mx-auto px-4 pt-3 max-w-sm md:max-w-2xl">
    <LocationSearch />
  </div>
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
  <div
    class="container mx-auto flex flex-col md:flex-row justify-center items-center max-w-screen-xl"
  >
    <div class="grow w-full md:w-1/2 md:min-w-96 max-w-120 px-2 md:pl-8">
      <Map></Map>
    </div>
    <div class="grow w-full md:w-1/2 md:min-w-96 max-w-120 p-2 md:pl-8">
      <div class="flex flex-row place-items-baseline justify-center">
        <div class="items-baseline align-text-bottom pr-2">
          <span class="align-bottom text-xs lg:text-sm"
            >Select model output</span
          >
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
  <div class="container mx-auto flex flex-col w-full items-center max-w-screen-xl px-2">
    {#if $forecastMode === "user"}
      <UserInputControls></UserInputControls>
    {:else}
      {#if $forecastMode === "historical"}
        <HistoricalSelectDate></HistoricalSelectDate>
      {/if}
      {#if $forecastMode === "forecast"}
        <div class="w-full md:max-w-4xl overflow-x-auto mx-auto">
          <DayPicker />
        </div>
      {/if}

      {#if $changedHistoricalDate === true || $forecastMode === "forecast"}
        {#if $forecastDataMode === $forecastMode}
          <div class="w-full md:max-w-4xl overflow-x-auto mx-auto transition-opacity duration-300"
               class:opacity-30={$fetchingForecast}
               class:pointer-events-none={$fetchingForecast}>
            <Heatmap
              xKey="time"
              zKey={$selectedOutput}
              yKey="surface.primary.fuel.model.catalogKey"
            />
          </div>
          {#if $selectedOutput == "crown.fire.transition.minBaseHeight" && !$fetchingForecast}
            <div class="p-2 mx-auto max-w-120">
              <CanopyControls></CanopyControls>
            </div>
          {/if}
        {:else}
          <div class="flex justify-center p-8">
            <Spinner />
          </div>
        {/if}
      {/if}
    {/if}
  </div>
</div>
