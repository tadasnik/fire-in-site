<script>
  import { Select, Label, Badge, Spinner } from "flowbite-svelte";
  import { timeFormat } from "d3-time-format";
  import MultiSelect from "$lib/components/ui/MultiSelect.svelte";
  import Map from "$lib/components/ui/Map.svelte";
  import Auth from "$lib/components/Auth.svelte";
  import UKFuelModels from "$lib/data/UKFuelModels.json";
  import SveltyPicker from "svelty-picker";
  import { simpleNelsonFuelMoisture } from "$lib/model/nelsonFMC/simpleNelson.js";
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
    getForecast,
  } from "$lib/shared/stores/forecastStore.js";
  import { currentLocation } from "$lib/shared/stores/locationStore";
  import { dateTime } from "$lib/shared/stores/timeStore.js";
  import MultiLinePage from "$lib/components/visual/MultiLinePage.svelte";
  import MultilineTestPage from "$lib/components/visual/MultilineTestPage.svelte";
  import BarFigure from "$lib/components/visual/BarFigure.svelte";
  import FireCharacteristics from "$lib/components/visual/FireCharacteristics.svelte";
  import InfoTable from "$lib/components/visual/InfoTable.svelte";
  import Heatmap from "$lib/components/visual/Heatmap.svelte";
  import { getLocation } from "$lib/shared/stores/locationStore";
  import WeatherInfo from "$lib/components/visual/WeatherInfo.svelte";

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
  // $: console.log("forecastTimeIndex  ", $forecastTimeIndex);
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
  const dateFormat = timeFormat("%a %b %e, %H %p");
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
  function getWindCardinalDirection(windDir) {
    return cardinalDirections[Math.floor(windDir / 11.25)].toLowerCase();
  }

  console.log("$$$$$%$%$%$% index of ");
</script>

<div class="w-full bg-primary-200">
  <WeatherInfo
    data={$forecastTimeIndex.get($dateTime)}
    forecastLocation={$forecastLocation.name}
    fireLocation={$currentLocation}
  />
</div>

<div class="container px-2 mx-auto flex flex-wrap">
  <div class="sm:w-full md:w-1/2 flex-col px-4 min-w-80">
    <!-- <div class="sm:w-full md:w-1/2 p-4 min-w-80"> -->
    <!--   <div class="text-2xl">Fire Location:</div> -->
    <!--   {$currentLocation.latitude.toFixed(3)}<i -->
    <!--     class="text-xl wi wi-degrees" -->
    <!--   />{$currentLocation.latitude >= 0 ? "N" : "S"}, {$currentLocation.longitude.toFixed( -->
    <!--     3 -->
    <!--   )}<i class="text-xl wi wi-degrees" />{$currentLocation.longitude >= 0 -->
    <!--     ? "E" -->
    <!--     : "W"}, {$currentLocation.elevation.toFixed(0)}m asl, slope: {$currentLocation.slope.toFixed( -->
    <!--     0 -->
    <!--   )}%, aspect: -->
    <!--   <i -->
    <!--     class="text-2xl wi wi-wind -->
    <!--   wi-towards-{getWindCardinalDirection($currentLocation.aspect)}" -->
    <!--   /> -->
    <!--   <strong -->
    <!--     >({cardinalDirections[ -->
    <!--       Math.floor($currentLocation.aspect / 11.25) -->
    <!--     ]})</strong -->
    <!--   > -->
    <!-- </div> -->

    <div class="aspect-square container" bind:clientWidth={w}>
      {#await getLocation()}
        <div class="text-center"><Spinner /></div>
      {:then}
        <Map />
      {/await}
    </div>
  </div>

  <div class="sm:w-full md:w-1/2 p-4 min-w-80">
    <Label for="select-sm" class="mb-2">Select fire behaviour output</Label>
    <Select id="select-sm" size="sm" class="mb-6" bind:value={$selectedOutput}>
      {#each $selectedOutputs as output}
        <option value={output}>{outputNodes[output].label}</option>
      {/each}
    </Select>
    <div />
    <div class="container" bind:clientWidth={w}>
      {#if $advancedMode}
        <FireCharacteristics
          parentWidth={w}
          data={$_outputForecast.get($dateTime)}
          xKey="surface.weighted.fire.heatPerUnitArea"
          yKey="surface.weighted.fire.spreadRate"
          zKey="surface.primary.fuel.model.catalogKey"
        />
      {:else if $_outputForecast.get($dateTime)}
        <BarFigure
          data={$_outputForecast}
          time={$dateTime}
          xKey={$selectedOutput}
          yKey="surface.primary.fuel.model.catalogKey"
        />
      {/if}
    </div>
  </div>
</div>
<section class="pt-5">
  <div class="w-full" bind:clientWidth={w}>
    <MultiLinePage
      data={$_outputForecastArray}
      xKey="time"
      yKey={$selectedOutput}
      zKey="surface.primary.fuel.model.catalogKey"
    />
  </div>
</section>
<section class="pt-5">
  <div class="w-full overflow-x-auto" bind:clientWidth={w}>
    <Heatmap
      data={$_outputForecastArray}
      forecastData={$forecastTimeSeries}
      xKey="time"
      zKey={$selectedOutput}
      yKey="surface.primary.fuel.model.catalogKey"
    />
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
  .xcontainer {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
  }
  .xcontainer::-webkit-scrollbar {
    /* WebKit */
    width: 0px;
  }
</style>
