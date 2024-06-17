<script>
  import { Select, Label, Badge, Spinner } from "flowbite-svelte";
  import MultiSelect from "$lib/components/ui/MultiSelect.svelte";
  import Map from "$lib/components/ui/Map.svelte";
  import Auth from "$lib/components/Auth.svelte";
  import UKFuelModels from "$lib/data/UKFuelModels.json";
  import SveltyPicker from "svelty-picker";
  import { outputNodes } from "$lib/data/outputNodes.js";
  import {
    selectedOutput,
    selectedOutputs,
    modelConfigValues,
    requiredConfig,
    config,
    siteInputs,
    selectedFuels,
    selectedInput,
    requiredFuelInputs,
    requiredInputs,
    fuelInputs,
    scenarios,
    selectedScenario,
    // _inputs,
    // _output,
    advancedMode,
    requiredSiteInputsForecast,
    _inputsForecast,
    _outputForecast,
    _outputForecastArray,
  } from "$lib/shared/stores/modelStore.js";
  import {
    forecastTimeSeries,
    forecastTimeIndex,
    forecastLocation,
  } from "$lib/shared/stores/forecastStore.js";
  import { currentLocation } from "$lib/shared/stores/locationStore";
  import { dateTime } from "$lib/shared/stores/timeStore.js";
  import MultiLinePage from "$lib/components/visual/MultiLinePage.svelte";
  import BarFigure from "$lib/components/visual/BarFigure.svelte";
  import FireCharacteristics from "$lib/components/visual/FireCharacteristics.svelte";
  import { getLocation } from "$lib/shared/stores/locationStore";

  export let data;
  let w;
  const selectOptions = [];
  for (const [key, value] of Object.entries(UKFuelModels)) {
    selectOptions.push({ name: key + ": " + value.label, value: key });
  }

  function configOptions(configKey) {
    const options = [];
    $modelConfigValues[configKey].options.forEach((element) => {
      options.push({ name: element });
    });
    return options;
  }

  let currentDateTime = new Date($dateTime).toString();

  // $: console.log("CurrentDateTime :", currentDateTime);

  // $: console.log("requiredSiteInputsForecast  ", $requiredSiteInputsForecast);
  // $: console.log("inputsForecast  ", $_inputsForecast);
  // $: console.log("outputsForecastArray  ", $_outputForecastArray);
  $: console.log("forecastTimeIndex  ", $forecastTimeIndex);
  // $: console.log("dateTime :", $dateTime);
  // $: console.log("forecastNow  ", $forecastTimeIndex.get($dateTime));
  // $: console.log("required inputs  ", $requiredSiteInputs);
  // $scenarios = data.scenarios;
  // $: console.log("selected Output", $selectedOutput);
  // $: console.log("selectedScenario", $selectedScenario);

  // $: console.log("output", $_output);
  // );
  // $: console.log("fuel inputs", $fuelInputs);
  //
  const cardinalDirections = {
    0: "N",
    1: "NNE",
    2: "NNE",
    3: "NE",
    4: "NE",
    5: "ENE",
    6: "ENE",
    7: "E",
    8: "E",
    9: "ESE",
    10: "ESE",
    11: "SE",
    12: "SE",
    13: "SSE",
    14: "SSE",
    15: "S",
    16: "S",
    17: "SSW",
    18: "SSW",
    19: "SW",
    20: "SW",
    21: "WSW",
    22: "WSW",
    23: "W",
    24: "W",
    25: "WNW",
    26: "WNW",
    27: "NW",
    28: "NW",
    29: "NNW",
    30: "NNW",
    31: "N",
  };
</script>

<section class="p-4">
  <h1>
    Current fire behaviour prediction for: <strong
      >{$forecastLocation.name}</strong
    >
    <br />
    <p>
      lon: {$forecastLocation.coordinates[0].toFixed(3)}, lat: {$forecastLocation.coordinates[1].toFixed(
        3
      )}, el.: {$forecastLocation.coordinates[2]}m, slope: {$currentLocation.slope.toFixed(
        0
      )}%, aspect: {$currentLocation.aspect.toFixed(0)},
      {cardinalDirections[Math.floor($currentLocation.aspect / 11.25)]}

      <br />
      {new Date($dateTime)}
    </p>
  </h1>
</section>
<section class="pb-2">
  <Label for="select-sm" class="mb-2">Select fire behaviour output</Label>
  <Select id="select-sm" size="sm" class="mb-6" bind:value={$selectedOutput}>
    {#each $selectedOutputs as output}
      <option value={output}>{outputNodes[output].label}</option>
    {/each}
  </Select>
</section>
<div />
<section class="pt-2">
  <div class="w-full aspect-square container" bind:clientWidth={w}>
    {#if $advancedMode}
      <FireCharacteristics
        parentWidth={w}
        data={$_outputForecast.get($dateTime)}
        xKey="surface.weighted.fire.heatPerUnitArea"
        yKey="surface.weighted.fire.spreadRate"
        zKey="surface.primary.fuel.model.catalogKey"
      />
    {:else}
      <BarFigure
        data={$_outputForecast.get($dateTime)}
        xKey={$selectedOutput}
        yKey="surface.primary.fuel.model.catalogKey"
      />
    {/if}
  </div>
</section>

<section class="pt-5">
  <div class="w-full" bind:clientWidth={w}>
    <MultiLinePage
      data={$_outputForecastArray}
      xKey="time"
      yKey="value"
      zKey="surface.primary.fuel.model.catalogKey"
    />
  </div>
</section>

<section class="pt-5">
  <div class="w-full aspect-square container" bind:clientWidth={w}>
    <section>
      {#await getLocation()}
        <div class="text-center"><Spinner /></div>
      {:then}
        <Map />
      {/await}
    </section>
  </div>
</section>

<section class="pt-2 space-y-2">
  <heading class="p-2" tag="h1" customSize="text-3xl"
    >Select fuel models</heading
  >
  <div>
    <MultiSelect
      items={selectOptions}
      bind:value={$selectedFuels}
      let:item
      let:clear
    >
      <Badge
        dismissable={$selectedFuels.length > 1}
        params={{ duration: 100 }}
        on:close={clear}
      >
        {item.name}
      </Badge>
    </MultiSelect>
  </div>
</section>
<section>
  <SveltyPicker
    bind:value={currentDateTime}
    mode="datetime"
    format="mm-dd hh"
    displayFormat="mm-dd HH P"
    placeholder="Set date and time"
  />
</section>
<section class="pt-20 space-y-2">
  <h3 class="h3 font-bold">Required config options:</h3>
  {#each $requiredConfig as configKey}
    <Label for="select-sm" class="mb-2">{configKey}</Label>
    <Select
      id="select-sm"
      size="sm"
      class="mb-6"
      bind:value={$modelConfigValues[configKey].value}
    >
      {#each $modelConfigValues[configKey].options as option}
        <option value={option}>{option}</option>
      {/each}
    </Select>
  {/each}
</section>

<style>
</style>
