<script>
  import { Select, Button, Popover, Label, Spinner } from "flowbite-svelte";
  import BarFigure from "$lib/components/visual/BarFigure.svelte";
  import FireCharacteristics from "$lib/components/visual/FireCharacteristics.svelte";
  import { outputNodes } from "$lib/data/outputNodes.js";
  import UKFuelModels from "$lib/data/UKFuelModels.json";

  import {
    selectedOutput,
    selectedOutputs,
    modelConfigValues,
    advancedMode,
    _outputForecastCanopy,
    _outputUserInputs,
    chartType,
    commonOutputs,
    fuelMoistureModel,
  } from "$lib/shared/stores/modelStore.js";
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

  import { forecastMode } from "$lib/shared/stores/forecastStore.js";
  let width;
  $: console.log(
    "_outputForecastCanopy in CurrentBehaviour",
    $_outputForecastCanopy.get($dateTime),
  );
  $: data =
    $forecastMode === "user"
      ? $_outputUserInputs
      : $_outputForecastCanopy.get($dateTime);
</script>

{#if $chartType === "fireChar"}
  <FireCharacteristics
    parentWidth={width}
    {data}
    xKey="surface.weighted.fire.heatPerUnitArea"
    yKey="surface.weighted.fire.spreadRate"
    zKey="surface.primary.fuel.model.catalogKey"
  />
{:else}
  <!-- <div class="m-2"> -->
  <!--   <Label> -->
  <!--     Select Model output -->
  <!--     <Select id="select-output" class="mb-6 pl-3" bind:value={$selectedOutput}> -->
  <!--       {#each $selectedOutputs as output} -->
  <!--         <option value={output}>{outputNodes[output].label}</option> -->
  <!--       {/each} -->
  <!--     </Select> -->
  <!--   </Label> -->
  <!-- </div> -->

  {#if $commonOutputs.includes($selectedOutput) && $fuelMoistureModel != "fireInSite"}
    <div class="flex flex-col p-2 text-primary-500">
      <div class="text-center text-2xl">All fuels</div>
      <div class="text-center text-9xl">
        {Math.round(data[0].values[0][$selectedOutput])}%
      </div>
    </div>
  {:else}
    <BarFigure
      {data}
      time={$dateTime}
      xKey={$selectedOutput}
      yKey="surface.primary.fuel.model.catalogKey"
    />
    {#each data as d, i}
      {@const fuel = d["surface.primary.fuel.model.catalogKey"]}
      <Popover
        class="absolute w-64 text-sm font-light z-50 "
        title={UKFuelModels[fuel].displayLabel}
        triggeredBy="#rect-{i}"
        triger="hover"
        >{data[i].values[$selectedOutput].toFixed(3)}
        ({outputNodes[$selectedOutput].displayUnits})</Popover
      >
    {/each}
  {/if}
{/if}
