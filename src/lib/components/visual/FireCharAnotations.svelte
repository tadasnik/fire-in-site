<!--
  @component
  Generates HTML text labels for a nested data structure. It places the label near the y-value of the highest x-valued data point. This is useful for labeling the final point in a multi-series line chart, for example. It expects your data to be an array of objects where each has `alues` field that is an array of data objects. It uses the `z` field accessor to pull the text label.
 -->
<script>
  import { getContext, tick } from "svelte";
  import { max } from "d3-array";
  import { writable } from "svelte/store";
  import heli from "$lib/assets/icons/helicop.png";
  import beater from "$lib/assets/icons/beater.png";
  import leaf_blower from "$lib/assets/icons/leaf_blower.png";
  import multi from "$lib/assets/icons/multi.png";
  import unimog from "$lib/assets/icons/unimog.png";
  import UKFuelModels from "$lib/data/UKFuelModels.json";

  const { data, x, y, xScale, yScale, xRange, yRange, xDomain } =
    getContext("LayerCake");

  $: yCoord = max($xDomain) - 0.3;

  // $: console.log("xDomain, yCoord", $xDomain, yCoord);
  $: tickParms = [
    { label: "0.5m", ros: -0.3, hpa: yCoord, rotate: 0 },
    { label: "1.5m", ros: 1.1, hpa: yCoord, rotate: 0 },
    { label: "Flame length 3.5m", ros: 5.8, hpa: yCoord - 0.2, rotate: 10 },
    { label: "5m", ros: 15, hpa: yCoord - 0.3, rotate: 20 },
    { label: "8m", ros: 42.8, hpa: yCoord - 1.0, rotate: 40 },
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
    class="label text-xs"
    style="
      top:{top(tick.ros) * 100}%;
      left:{left(tick.hpa) * 100}%;
      text-align: right;
      rotate:{tick.rotate}deg;
    white-space: nowrap;
    "
  >
    {cap(tick.label)}
  </div>
{/each}
<img
  class="h-12"
  src={heli}
  style="position:absolute; top:60%; right:5%"
  alt="helicopter"
/>
<img
  class="h-7"
  src={leaf_blower}
  style="position:absolute; top:92%; right:98%"
  alt="leaf blower"
/>
<img
  class="h-9"
  src={beater}
  style="position:absolute; top:85%; right:93%"
  alt="fire beater"
/>
<img
  class="h-5"
  src={unimog}
  style="position:absolute; top:90%; right:5%"
  alt="unimog"
/>
<img
  class="h-7"
  src={multi}
  style="position:absolute; top:75%; right:5%"
  alt="multi truck"
/>

<style>
  .label {
    position: absolute;
    transform: translate(-100%, -100%) translateY(1px);
  }
</style>
