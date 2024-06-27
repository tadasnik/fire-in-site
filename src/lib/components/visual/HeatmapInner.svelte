<!--
  @component
  Generates an SVG calendar chart.
 -->
<script>
  import { getContext } from "svelte";
  import { timeFormat } from "d3-time-format";
  import { timeDay } from "d3-time";

  const {
    width,
    height,
    data,
    flatData,
    x,
    z,
    zGet,
    yScale,
    xDomain,
    yRange,
    extents,
  } = getContext("LayerCake");

  /** @type {Function} [calcCellSize=(w, h) => Math.min(w / 7, h / 5)] - A function givn the canvas width and height as arguments and expects a return number that will be used as the width and height for each cell. The default will choose a size that fits seven cells across and five rows top to bottom. */
  export let cellSize;
  export let calcCellSize = (w, h) =>
    Math.min(w / $data.length, h / Object.keys($data[0]).length);
  // export let calcCellSize = (w, h) => Math.min(w / 7, h / 5);

  // const getDayOfWeek = timeFormat("%w");
  // const getWeekOfYear = timeFormat("%U");
  //
  // $: count = (date) => {
  //   const stringDate = date.toISOString().split("T")[0];
  //   const days = $data.filter((d) => $x(d) === stringDate)[0];
  //   if (days) {
  //     return $z(days);
  //   }
  //   return 0;
  // };
  //
  // $: fillColor = (day) => {
  //   const n = count(day);
  //   return n ? $zScale(n) : "#fff";
  // };
  // $: cellSize = calcCellSize($width, $height);

  $: console.log(
    "data Heatmap inner",
    $zGet($data[0].values[0]),
    $data[0].values[0]
  );
  /* --------------------------------------------
   * Calculate what month we're in and generate the full days of that month
   */
  // $: {
  //   const minDate = $extents.x[0];
  //   const parts = minDate.split("-").map((d) => +d);
  //
  //   days = timeDay.range(
  //     new Date(Date.UTC(parts[0], parts[1] - 1, 1)),
  //     new Date(Date.UTC(parts[0], parts[1], 1))
  //   );
  // }
  //
  // $: rectX = (day) => getDayOfWeek(day) * cellSize;
  // $: rectY = (day) => {
  //   const startWeek = getWeekOfYear(
  //     new Date(day.getUTCFullYear(), day.getUTCMonth(), 1)
  //   );
  //   const thisWeek = getWeekOfYear(day);
  //   const weekDiff = thisWeek - startWeek;
  //   return weekDiff * cellSize;
  // };
  //
  // function showCount(day) {
  //   console.log(day, count(day));
  // }
</script>

{#each $data as fuelObject, y}
  {#each fuelObject.values as object, x}
    <rect
      class="day"
      width={cellSize}
      height={cellSize}
      x={x * cellSize}
      y={y * cellSize}
      style="fill:{$zGet(object)};stroke-width:.5;stroke:grey"
    />
  {/each}
{/each}

<style>
  .day {
    stroke: #000;
    stroke-width: 1;
    fill: #fff;
  }
</style>
