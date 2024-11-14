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
    _outputForecast,
    _outputForecastArray,
    chartType,
    commonOutputs,
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

  let width;
</script>

{#if $chartType === "fireChar"}
  <FireCharacteristics
    parentWidth={width}
    data={$_outputForecast.get($dateTime)}
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

  {#if !$commonOutputs.includes($selectedOutput)}
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
