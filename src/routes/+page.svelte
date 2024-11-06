<script>
  import { Select, Button, Popover, Label } from "flowbite-svelte";
  import { timeFormat } from "d3-time-format";
  import Map from "$lib/components/ui/Map.svelte";
  import UKFuelModels from "$lib/data/UKFuelModels.json";
  import { outputNodes } from "$lib/data/outputNodes.js";
  import {
    selectedOutput,
    selectedOutputs,
    modelConfigValues,
    advancedMode,
    _outputForecast,
    _outputForecastArray,
    chartType,
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
  import Heatmap from "$lib/components/visual/Heatmap.svelte";
  import WeatherInfo from "$lib/components/visual/WeatherInfo.svelte";
  import DayPicker from "$lib/components/visual/DayPicker.svelte";

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

  $: console.log("FOcUsIndex  !??????", $focusDayIndex);
  $: console.log("Forecast MOde  !??????", $forecastMode);
</script>

<div class="flex flex-col justify-center content-center w-full">
  <div class="container mx-auto justify-center p-4 items-center">
    {#if $fetchingForecast !== true}
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
    class="container mx-auto flex flex-col md:flex-row items-center max-w-screen-xl"
  >
    <div class="grow w-full sm:p-4 sm:w-1/2 min-w-80">
      <div class="aspect-square" bind:clientWidth={width}>
        {#if $currentLocation.userLocation}
          <Map />
        {/if}
      </div>
    </div>

    <div class="grow w-full sm:w-1/2 aspect-square min-w-80 p-2">
      {#if $_outputForecast.get($dateTime)}
        {#if $chartType === "fireChar"}
          <FireCharacteristics
            parentWidth={width}
            data={$_outputForecast.get($dateTime)}
            xKey="surface.weighted.fire.heatPerUnitArea"
            yKey="surface.weighted.fire.spreadRate"
            zKey="surface.primary.fuel.model.catalogKey"
          />
        {:else}
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

          {#if $selectedOutput !== "ignition.firebrand.probabiity"}
            <BarFigure
              data={$_outputForecast.get($dateTime)}
              time={$dateTime}
              xKey={$selectedOutput}
              yKey="surface.primary.fuel.model.catalogKey"
            />
            {#each $_outputForecast.get($dateTime) as d, i}
              {@const fuel = d["surface.primary.fuel.model.catalogKey"]}
              <Popover
                class="absolute w-64 text-sm font-light z-50 "
                title={UKFuelModels[fuel].displayLabel}
                triggeredBy="#rect-{i}"
                triger="hover"
                >{$_outputForecast
                  .get($dateTime)
                  [i].values[0][$selectedOutput].toFixed(3)} ({outputNodes[
                  $selectedOutput
                ].units})</Popover
              >
            {/each}
          {:else}
            <div class="flex flex-col p-2 text-primary-500">
              <div class="text-center text-2xl">All fuels</div>
              <div class="text-center text-9xl">
                {Math.round(
                  $_outputForecast.get($dateTime)[0].values[0][$selectedOutput],
                )}%
              </div>
            </div>
          {/if}
        {/if}
      {/if}
    </div>
  </div>
  {#if $forecastMode === "historical"}
    <div class="w-full text-center pt-4 mt-6">Historical Weather</div>
    <div class="flex flex-row pt-2 justify-center space-x-2">
      <div>
        <Select
          id="select-year"
          size="sm"
          items={$yearsOptions}
          bind:value={$historicalYear}
          placeholder="Select year"
        />
      </div>
      {#if $historicalYear}
        <div>
          <Select
            id="select-month"
            size="sm"
            items={$monthOptions}
            bind:value={$historicalMonth}
            placeholder="Select month"
          />
        </div>
      {/if}
      {#if $historicalYear && $historicalMonth}
        <div>
          <Select
            id="select-day"
            size="sm"
            items={$dayOptions}
            bind:value={$historicalDay}
            placeholder="Select day"
          />
        </div>
      {/if}
      <div>
        <Button
          size="sm"
          disabled={$historicalYear &&
          $historicalMonth &&
          $historicalDay &&
          $historicalDate
            ? false
            : true}
          on:click={() => fetchHistoricalForecast()}>Retrieve</Button
        >
      </div>
    </div>
  {/if}

  {#if $fetchingForecast === false}
    <div class="flex flex-col relative items-center">
      {#if $forecastMode === "forecast"}
        <div class="container flex max-w-4xl overflow-x-auto">
          <DayPicker />
        </div>
      {/if}
      <div class="flex mx-auto w-full overflow-x-auto md:justify-center">
        <Heatmap
          fireBehaviourData={$_outputForecastArray.slice(
            $focusDayIndex[0] < 0 ? 0 : $focusDayIndex[0],
            $focusDayIndex[1] < 0
              ? $_outputForecastArray.length
              : $focusDayIndex[1],
          )}
          forecastData={$forecastOpenMeteo}
          xKey="time"
          zKey={$selectedOutput}
          yKey="surface.primary.fuel.model.catalogKey"
        />
      </div>
    </div>
  {/if}
  <!-- <div class="container mx-auto p-8"> -->
  <!--   {#if $forecastOpenMeteo.time.length > 1} -->
  <!--     <Label for="multiline" class="mb-2 text-xl font-normal" -->
  <!--       >{outputNodes[$selectedOutput].label} forecast</Label -->
  <!--     > -->
  <!--     <div class="w-full" id="multiline"> -->
  <!--       <MultiLinePage -->
  <!--         data={$_outputForecastArray} -->
  <!--         xKey="time" -->
  <!--         yKey={$selectedOutput} -->
  <!--         zKey="surface.primary.fuel.model.catalogKey" -->
  <!--       /> -->
  <!--     </div> -->
  <!--   {/if} -->
  <!-- </div> -->
</div>

<!-- <section class="pt-20 space-y-2"> -->
<!--   <h3 class="h3 font-bold">Required config options:</h3> -->
<!--   {#each $requiredConfig as configKey} -->
<!--     <Label for="select-sm" class="mb-2">{configKey}</Label> -->
<!--     <Select -->
<!--       id="select-sm" -->
<!--       size="sm" -->
<!--       class="mb-6" -->
<!--       bind:value={$modelConfigValues[configKey].value} -->
<!--     > -->
<!--       {#each $modelConfigValues[configKey].options as option} -->
<!--         <option value={option}>{option}</option> -->
<!--       {/each} -->
<!--     </Select> -->
<!--   {/each} -->
<!-- </section> -->

<style>
</style>
