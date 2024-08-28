<script context="module">
  export const ssr = false;
</script>

<script>
  import { Select, Button, Popover, Label } from "flowbite-svelte";
  import Map from "$lib/components/ui/Map.svelte";
  import Auth from "$lib/components/Auth.svelte";
  import UKFuelModels from "$lib/data/UKFuelModels.json";
  import { simpleNelsonFuelMoisture } from "$lib/model/nelsonFMC/simpleNelson.js";
  import { outputNodes } from "$lib/data/outputNodes.js";
  import {
    selectedOutput,
    selectedOutputs,
    modelConfigValues,
    advancedMode,
    _outputForecast,
    _outputForecastArray,
  } from "$lib/shared/stores/modelStore.js";
  import {
    forecastOpenMeteo,
    forecastLocation,
    getForecastOpenMeteo,
    forecastMode,
    fetchingForecast,
  } from "$lib/shared/stores/forecastStore.js";
  import { currentLocation } from "$lib/shared/stores/locationStore";
  import {
    dateTime,
    currentDateTime,
    historicalYear,
    historicalMonth,
    historicalDay,
  } from "$lib/shared/stores/timeStore.js";
  import BarFigure from "$lib/components/visual/BarFigure.svelte";
  import FireCharacteristics from "$lib/components/visual/FireCharacteristics.svelte";
  import Heatmap from "$lib/components/visual/Heatmap.svelte";
  import { getLocation } from "$lib/shared/stores/locationStore";
  import WeatherInfo from "$lib/components/visual/WeatherInfo.svelte";

  let w;
  const years = [
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
    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" },
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" },
  ];
  $: daysInHistoryMonth = new Date(
    $historicalYear,
    $historicalMonth,
    0,
  ).getDate();
  $: console.log("daysInHistoryMonth", daysInHistoryMonth);

  $: days = Array.from({ length: daysInHistoryMonth }, (_, i) => i + 1);
  $: daysOb = days.map((day) => {
    return { value: day, name: day };
  });

  const selectOptions = [];

  for (const [key, value] of Object.entries(UKFuelModels)) {
    selectOptions.push({ name: key + ": " + value.label, value: key });
  }

  function fetchHistoricalForecast() {
    console.log("fetching forecast");
    $currentDateTime = new Date(
      $historicalYear,
      $historicalMonth - 1,
      $historicalDay,
      12,
    );
    getForecastOpenMeteo();
  }

  function configOptions(configKey) {
    const options = [];
    $modelConfigValues[configKey].options.forEach((element) => {
      options.push({ name: element });
    });
    return options;
  }

  $: console.log("forecastOpenMeteo  ", $forecastOpenMeteo);

  function onChange(event) {
    console.log("date change", event.detail); // logs currently selected date or null
    $currentDateTime = new Date(event.detail);
  }
</script>

<div class="flex justify-center max-w-screen-2xl flex-col">
  <div class="justify-center p-4 items-center">
    <WeatherInfo
      data={$forecastOpenMeteo}
      forecastLocation={$forecastLocation.name}
      fireLocation={$currentLocation}
    />
  </div>

  <div class="flex flex-col p-6 md:flex-row items-center">
    <div class="grow w-full p-4 md:w-1/2 min-w-96 p-2">
      <div class="aspect-square" bind:clientWidth={w}>
        {#if $currentLocation.userLocation}
          <Map />
        {/if}
      </div>
    </div>

    <div class="grow w-full md:w-1/2 aspect-square min-w-96 p-2">
      {#if $advancedMode}
        <FireCharacteristics
          parentWidth={w}
          data={$_outputForecast.get($dateTime)}
          xKey="surface.weighted.fire.heatPerUnitArea"
          yKey="surface.weighted.fire.spreadRate"
          zKey="surface.primary.fuel.model.catalogKey"
        />
      {:else if $_outputForecast.get($dateTime)}
        <Label>
          Select Model output
          <Select id="select" class="mb-6" bind:value={$selectedOutput}>
            {#each $selectedOutputs as output}
              <option value={output}>{outputNodes[output].label}</option>
            {/each}
          </Select>
        </Label>

        {#if $selectedOutput !== "ignition.firebrand.probability" && $selectedOutput !== "site.moisture.dead.tl1h"}
          <BarFigure
            data={$_outputForecast.get($dateTime)}
            time={$dateTime}
            xKey={$selectedOutput}
            yKey="surface.primary.fuel.model.catalogKey"
          />
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
      <Popover
        class="absolute w-64 text-sm font-light z-50 "
        title="Popover title"
        triggeredBy="#rect-2"
        >And here's some amazing content. It's very engaging. Right?</Popover
      >
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
          disabled={$historicalYear && $historicalMonth && $historicalDay
            ? false
            : true}
          on:click={() => fetchHistoricalForecast()}>Retrieve</Button
        >
      </div>
    </div>
  {/if}

  {#if $forecastOpenMeteo.time.length > 1 && $fetchingForecast === false}
    <div class="flex w-full overflow-x-auto justify-center">
      <Heatmap
        fireBehaviourData={$_outputForecastArray}
        forecastData={$forecastOpenMeteo}
        xKey="time"
        zKey={$selectedOutput}
        yKey="surface.primary.fuel.model.catalogKey"
      />
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
