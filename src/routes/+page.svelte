<script context="module">
  export const ssr = false;
</script>

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
  } from "$lib/shared/stores/timeStore.js";
  import BarFigure from "$lib/components/visual/BarFigure.svelte";
  import FireCharacteristics from "$lib/components/visual/FireCharacteristics.svelte";
  import Heatmap from "$lib/components/visual/Heatmap.svelte";
  import WeatherInfo from "$lib/components/visual/WeatherInfo.svelte";
  import DayPicker from "$lib/components/visual/DayPicker.svelte";

  let placement = "";
  let w;
  const years = [
    { value: 2010, name: "2010" },
    { value: 2011, name: "2011" },
    { value: 2012, name: "2012" },
    { value: 2013, name: "2013" },
    { value: 2014, name: "2014" },
    { value: 2015, name: "2015" },
    { value: 2016, name: "2016" },
    { value: 2017, name: "2017" },
    { value: 2018, name: "2018" },
    { value: 2019, name: "2019" },
    { value: 2020, name: "2020" },
    { value: 2021, name: "2021" },
    { value: 2022, name: "2022" },
    { value: 2023, name: "2023" },
    { value: 2024, name: "2024" },
  ];
  const months = [
    { value: 0, name: "January" },
    { value: 1, name: "February" },
    { value: 2, name: "March" },
    { value: 3, name: "April" },
    { value: 4, name: "May" },
    { value: 5, name: "June" },
    { value: 6, name: "July" },
    { value: 7, name: "August" },
    { value: 8, name: "September" },
    { value: 9, name: "October" },
    { value: 10, name: "November" },
    { value: 11, name: "December" },
  ];

  $: daysInHistoryMonth = new Date(
    $historicalYear,
    $historicalMonth + 1,
    0,
  ).getDate();

  $: days = Array.from({ length: daysInHistoryMonth }, (_, i) => i + 1);
  $: daysOb = days.map((day) => {
    return { value: day, name: day };
  });

  const selectOptions = [];

  for (const [key, value] of Object.entries(UKFuelModels)) {
    selectOptions.push({ name: key + ": " + value.label, value: key });
  }

  function fetchHistoricalForecast() {
    $fetchingForecast = true;
    let dateTime = new Date(
      $historicalYear,
      $historicalMonth,
      $historicalDay,
      12,
    );
    getForecastOpenMeteo(dateTime);
    console.log("currentDateTime", $currentDateTime, dateTime);
  }

  function configOptions(configKey) {
    const options = [];
    $modelConfigValues[configKey].options.forEach((element) => {
      options.push({ name: element });
    });
    return options;
  }

  $: console.log("FOcUsIndex  !??????", $focusDayIndex);
  $: console.log("_outputForecastArray  ", $_outputForecastArray);

  function onChange(event) {
    // console.log("date change", event.detail); // logs currently selected date or null
    $currentDateTime = new Date(event.detail);
  }
  $: $currentLocation, getForecastOpenMeteo(new Date()); // promise.then(fetchForecast());
</script>

<div class="flex flex-col justify-center content-center w-full">
  <div class="container mx-auto justify-center p-4 items-center">
    {#if $forecastOpenMeteo.time.length > 1 && $fetchingForecast !== true}
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
      <div class="aspect-square" bind:clientWidth={w}>
        {#if $currentLocation.userLocation}
          <Map />
        {/if}
      </div>
    </div>

    <div class="grow w-full sm:w-1/2 aspect-square min-w-80 p-2">
      {#if $_outputForecast.get($dateTime)}
        {#if $chartType === "fireChar"}
          <FireCharacteristics
            parentWidth={w}
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
          items={years}
          bind:value={$historicalYear}
          placeholder="Select year"
        />
      </div>
      <div>
        <Select
          id="select-month"
          size="sm"
          items={months}
          bind:value={$historicalMonth}
          placeholder="Select month"
        />
      </div>
      <div>
        <Select
          id="select-day"
          size="sm"
          items={daysOb}
          bind:value={$historicalDay}
          placeholder="Select day"
        />
      </div>
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

  {#if $forecastOpenMeteo.time.length > 1 && $fetchingForecast === false}
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
