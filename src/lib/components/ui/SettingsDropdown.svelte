<script>
  import { get } from "svelte/store";
  import {
    Dropdown,
    DropdownDivider,
    DropdownItem,
    Radio,
    Helper,
    Span,
  } from "flowbite-svelte";
  import {
    fuelMoistureModel,
    modelConfigValues,
    selectedOutputs,
    selectedOutput,
    chartType,
  } from "$lib/shared/stores/modelStore";
  import {
    fetchingForecast,
    forecastMode,
    forecastModes,
    getForecastOpenMeteo,
    forecastModel,
    forecastModels,
  } from "$lib/shared/stores/forecastStore";
  import { timeMode, currentDateTime } from "$lib/shared/stores/timeStore";
  import { outputNodes } from "$lib/data/outputNodes.js";
  import CurrentBehaviour from "../visual/CurrentBehaviour.svelte";

  console.log("forecastModels", $forecastModels);

  function handleFuelMoistureChange(value) {
    if (value === "Fosberg") {
      $fuelMoistureModel = "Fosberg";
      $modelConfigValues["configure.fuel.moisture"].value = "fosberg";
    } else {
      if ($modelConfigValues["configure.fuel.moisture"].value === "fosberg") {
        $modelConfigValues["configure.fuel.moisture"].value = "individual";
      }
    }
    // console.log("Fuel moisture model changed to ", value);
  }
  function handleModelChange(value) {
    $fetchingForecast = true;
    $forecastModel = value;
    getForecastOpenMeteo();
  }

  function handleTimeModeChange(value) {
    $fetchingForecast = true;
    $forecastMode = value;
    if (value === "historical") {
      console.log("setting forecastMode to historical");
    } else {
      console.log("setting currentDateTime to now, fetching forecast");
      $currentDateTime = new Date();
      getForecastOpenMeteo();
    }
  }
</script>

<div class="max-w-80 bg-gray-100aa">
  <div class="px-4 py-2">
    <span class="block text-lg text-gray-900 dark:text-white"
      >Dead fuel moisture model:</span
    >
  </div>
  <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
    <Radio
      name="fuelMoistureModel"
      bind:group={$fuelMoistureModel}
      value={"fireInSite"}
      on:change={() => handleFuelMoistureChange("fireInSite")}>fireInSite</Radio
    >
    <Helper class="ps-6">fireInSite dead fuel moisture model.</Helper>
  </li>

  <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
    <Radio
      name="fuelMoistureModel"
      bind:group={$fuelMoistureModel}
      value={"Nelson"}
      on:change={() => handleFuelMoistureChange("Nelson")}>SimpleFFMC</Radio
    >
    <Helper class="ps-6">Use simple Nelson dead fuel moisture model.</Helper>
  </li>
  <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
    <Radio
      name="fuelMoistureModel"
      bind:group={$fuelMoistureModel}
      value={"Fosberg"}
      on:change={() => handleFuelMoistureChange("Fosberg")}>Fosberg</Radio
    >
    <Helper class="ps-6"
      >Calculate dead fuel mosture using Fosberg model.</Helper
    >
  </li>

  <DropdownDivider></DropdownDivider>
  <div class="px-4 py-2">
    <span class="block text-lg text-gray-900 dark:text-white"
      >Weather mode:</span
    >
  </div>

  {#each forecastModes as mode}
    <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
      <Radio
        bind:group={$forecastMode}
        value={mode}
        on:change={() => handleTimeModeChange(mode)}
      >
        {mode}
      </Radio>
      <Helper class="ps-6"
        >Fetch {mode} weather{mode === "historical"
          ? " for a specific date."
          : "."}</Helper
      >
    </li>
  {/each}

  <DropdownDivider></DropdownDivider>
  <div class="px-4 py-2">
    <span class="block text-lg text-gray-900 dark:text-white">Chart type :</span
    >
  </div>
  <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
    <Radio bind:group={$chartType} value={"bars"}>Bar chart</Radio>

    <Helper class="ps-6">Show fire behaviour for selected time.</Helper>
  </li>
  <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
    <Radio bind:group={$chartType} value={"fireChar"}
      >Fire Characteristics</Radio
    >

    <Helper class="ps-6">Show Fire Characteristics chart.</Helper>
  </li>

  <DropdownDivider></DropdownDivider>
  <div class="px-4 py-2">
    <span class="block text-lg text-gray-900 dark:text-white"
      >Weather model:</span
    >
  </div>

  {#if $forecastMode === "forecast"}
    {#each $forecastModels as { value, displayName, description }}
      <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
        <Radio
          bind:group={$forecastModel}
          {value}
          on:change={() => handleModelChange(value)}
        >
          {displayName}
        </Radio>
        <Helper class="ps-6">{description}</Helper>
      </li>
    {/each}
  {:else}
    <Helper class="ps-6"
      ><Span class="text-base">ERA5 reanalysis.</Span> Switch Weather mode to forecast
      to choose between differend forecasting models</Helper
    >
  {/if}
</div>
