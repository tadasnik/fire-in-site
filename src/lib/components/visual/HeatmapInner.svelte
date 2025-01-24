<!--
  @component
  Generates an SVG calendar chart.
 -->
<script>
  import { getContext } from "svelte";
  import { timeFormat } from "d3-time-format";
  import { format, precisionFixed } from "d3-format";
  import { timeDay } from "d3-time";
  import { scaleLinear, scaleSequential } from "d3-scale";
  import {
    interpolatePuOr,
    interpolateYlOrRd,
    interpolateReds,
    interpolateBlues,
    interpolateInferno,
    interpolateRdYlGn,
  } from "d3-scale-chromatic";
  import { selectedOutput } from "$lib/shared/stores/modelStore";
  import { dateTime } from "$lib/shared/stores/timeStore";
  import { focusDayIndex } from "$lib/shared/stores/forecastStore";
  import MultiSelect from "../ui/MultiSelect.svelte";

  const { data, z, zGet } = getContext("LayerCake");

  const scaleTemp = scaleSequential(interpolatePuOr).domain([5, 30]);
  const scaleHum = scaleSequential(interpolatePuOr).domain([99, 30]);
  const scalePrec = scaleSequential(interpolateBlues).domain([0, 2]);
  const scaleWind = scaleSequential(interpolateRdYlGn).domain([10, 0]);
  /** @type {Function} [calcCellSize=(w, h) => Math.min(w / 7, h / 5)] - A function givn the canvas width and height as arguments and expects a return number that will be used as the width and height for each cell. The default will choose a size that fits seven cells across and five rows top to bottom. */
  export let cellSize;
  export let gapSize;
  export let forecastData;
  export let weatherProps;
  export let modelOutputProps;

  $: isSelectedClass = (x) => {
    // console.log("isSelectedClass", x);
    return $dateTime == x
      ? "text-sm font-bold text-neutral-500"
      : "text-xs text-neutral-400";
  };

  const formatValues = (d) =>
    d < 10
      ? d.toFixed(modelOutputProps[$selectedOutput].roundTo)
      : Math.round(d);
  const datasetsProps = [Object.keys(weatherProps).length, $data.length];
  // console.log("haetmap forecast DATA", forecastData);
  // console.log("focusDayIndex", $focusDayIndex);
</script>

{#each Object.entries(weatherProps) as [prop, values], i}
  {#if prop != "wind_direction_10m"}
    {#each forecastData[prop].slice($focusDayIndex[0] < 0 ? 0 : $focusDayIndex[0], $focusDayIndex[1] < 0 ? forecastData.length : $focusDayIndex[1]) as weatherObject, x}
      <rect
        width={cellSize}
        height={cellSize}
        x={x * cellSize}
        y={i * cellSize}
        style="fill:{values[2](weatherObject)}
        ;stroke-width:.2;stroke:grey"
      />
      {#if !(prop == "precipitation" && weatherObject <= 0)}
        <text
          x={x * cellSize + cellSize / 2}
          y={i * cellSize + cellSize / 2}
          class={isSelectedClass(x)}
          text-anchor="middle"
          dominant-baseline="middle"
          style="fill:{Math.round(weatherObject) >= values[4][0] &&
          Math.round(weatherObject) < values[4][1]
            ? 'grey'
            : 'white'}">{weatherObject.toFixed(values[3])}</text
        >
      {/if}
    {/each}
  {/if}
{/each}

{#each $data as fuelObject, i}
  {#each fuelObject.values as object, j}
    {@const value = formatValues($z(object))}
    <rect
      width={cellSize}
      height={cellSize}
      x={j * cellSize}
      y={(datasetsProps[0] + gapSize + i) * cellSize}
      style="fill:{modelOutputProps[$selectedOutput].scale($z(object))}
        ;stroke-width:.2;stroke:grey"
    />
    <!-- {#if (!modelOutputProps[$selectedOutput].showSmallVals && $z(object) > 0.05) || modelOutputProps[$selectedOutput].showSmallVals} -->
    {#if modelOutputProps[$selectedOutput].showSmallVals && value != 0}
      <text
        x={j * cellSize + cellSize / 2}
        y={(datasetsProps[0] + gapSize + i) * cellSize + cellSize / 2}
        class={isSelectedClass(object.time)}
        text-anchor="middle"
        dominant-baseline="middle"
        style="fill:{value >=
          modelOutputProps[$selectedOutput].scaleLimits[0] &&
        value < modelOutputProps[$selectedOutput].scaleLimits[1]
          ? 'grey'
          : 'white'}">{formatValues($z(object))}</text
      >
    {/if}
  {/each}
{/each}

<style>
</style>
