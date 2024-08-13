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
  import { formatDate } from "svelty-picker";
  import { selectedOutput } from "$lib/shared/stores/modelStore";
  import { currentTimeIndex } from "$lib/shared/stores/forecastStore";

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
  export let halfPoint;

  $: isSelectedClass = (x) => {
    return $currentTimeIndex == x
      ? "text-sm font-bold text-neutral-500"
      : "text-xs text-neutral-400";
  };

  const formatValues = (d) => (d < 10 ? d.toFixed(1) : Math.round(d));
  const datasetsProps = [Object.keys(weatherProps).length, $data.length];
  console.log("haetmap innner", weatherProps, forecastData);
</script>

{#each Object.entries(weatherProps) as [prop, values], i}
  {#if prop != "windDirection10m"}
    {#each forecastData[prop] as weatherObject, x}
      <rect
        width={cellSize}
        height={cellSize}
        x={x * cellSize}
        y={i * cellSize}
        style="fill:{values[2](weatherObject)}
        ;stroke-width:.2;stroke:grey"
      />
      {#if weatherObject > 0}
        <text
          x={x * cellSize + cellSize / 2}
          y={i * cellSize + cellSize / 2}
          class={isSelectedClass(x)}
          text-anchor="middle"
          dominant-baseline="middle"
          style:fill="rgb(115 115 115)">{weatherObject.toFixed(values[3])}</text
        >
      {/if}
    {/each}
  {/if}
{/each}

<!-- {#each Object.values(commonOutputProps) as prop, i} -->
<!--   {#each commonOutputs as object, x} -->
<!--     <rect -->
<!--       width={cellSize} -->
<!--       height={cellSize} -->
<!--       x={x * cellSize} -->
<!--       y={(datasetsProps[0] + gapSize * 2 + i) * cellSize} -->
<!--       style="fill:{prop[2](object[prop[0]])};stroke-width:.2;stroke:grey" -->
<!--     /> -->
<!--   {/each} -->
<!-- {/each} -->
{#each $data as fuelObject, i}
  {#each fuelObject.values as object, x}
    <rect
      width={cellSize}
      height={cellSize}
      x={x * cellSize}
      y={(datasetsProps[0] + gapSize + i) * cellSize}
      style="fill:{$zGet(object)};stroke-width:.2;stroke:grey"
    />
    {#if $z(object) > 0.05}
      <text
        x={x * cellSize + cellSize / 2}
        y={(datasetsProps[0] + gapSize + i) * cellSize + cellSize / 2}
        class={isSelectedClass(x)}
        text-anchor="middle"
        dominant-baseline="middle"
        style="fill:{Math.round($z(object)) < halfPoint ? 'grey' : 'white'}"
        >{formatValues($z(object))}</text
      >
    {/if}
  {/each}
{/each}

<style>
</style>
