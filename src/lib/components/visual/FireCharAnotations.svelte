<!--
  @component
  Generates HTML text labels for a nested data structure. It places the label near the y-value of the highest x-valued data point. This is useful for labeling the final point in a multi-series line chart, for example. It expects your data to be an array of objects where each has `alues` field that is an array of data objects. It uses the `z` field accessor to pull the text label.
 -->
<script>
  import { getContext, tick } from "svelte";
  import { max } from "d3-array";
  import { writable } from "svelte/store";

  const { data, x, y, xScale, yScale, xRange, yRange, xDomain } =
    getContext("LayerCake");

  $: yCoord = max($xDomain) - 400000;

  $: console.log($xDomain, yCoord);
  $: tickParms = [
    { label: "1.2m", ros: 1.5, hpa: yCoord },
    { label: "2.4m", ros: 4.2, hpa: yCoord },
    { label: "3.5m", ros: 9, hpa: yCoord },
    { label: "Flame\nlength\n5m", ros: 18.3, hpa: yCoord },
    { label: "8m", ros: 51, hpa: yCoord },
  ];
  $: console.log(tickParms);
  /* --------------------------------------------
   * Title case the first letter
   */
  const cap = (val) => val.replace(/^\w/, (d) => d.toUpperCase());

  /* --------------------------------------------
   * Put the label on the highest value
   */
  $: left = (value) => $xScale(value) / Math.max(...$xRange);
  $: top = (value) => $yScale(value) / Math.max(...$yRange);
</script>

{#each tickParms as tick}
  <div
    class="label text-xs text-right"
    style="
      top:{top(tick.ros) * 100}%;
      left:{left(tick.hpa) * 100}%;
      text-align: right;
    "
  >
    {cap(tick.label)}
  </div>
{/each}

<style>
  .label {
    position: absolute;
    transform: translate(-100%, -100%) translateY(1px);
  }
</style>
