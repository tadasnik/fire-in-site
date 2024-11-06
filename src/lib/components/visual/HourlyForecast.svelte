<script>
  import { Select, Button, Popover, Label, Spinner } from "flowbite-svelte";
  import BarFigure from "$lib/components/visual/BarFigure.svelte";
  import FireCharacteristics from "$lib/components/visual/FireCharacteristics.svelte";
  import DayPicker from "$lib/components/visual/DayPicker.svelte";
  import Heatmap from "$lib/components/visual/Heatmap.svelte";
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

  let width;
</script>

<div class="flex flex-col relative items-center pt-8">
  {#if $forecastMode === "forecast"}
    <div class="container flex max-w-4xl overflow-x-auto">
      <DayPicker />
    </div>
  {/if}
  <div class="flex mx-auto overflow-x-auto md:justify-center">
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
