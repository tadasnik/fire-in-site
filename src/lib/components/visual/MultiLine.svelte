<!--
  @component
  Generates an SVG multi-series line chart. It expects your data to be an array of objects, each with a `values` key that is an array of data objects.
 -->
<script>
  import { getContext } from "svelte";
  import { timeParse, timeFormat } from "d3-time-format";

  const { data, xDomain, yDomain, xGet, yGet, zGet, flatData } =
    getContext("LayerCake");

  const formatTickX = timeFormat("%b. %e");
  // $: console.log("Multiline data", $data);
  let path = $derived((values) => {
    return (
      "M" +
      values
        .map((d) => {
          return $xGet(d) + "," + $yGet(d);
        })
        .join("L")
    );
  });
</script>

<g class="line-group">
  {#each $data as group}
    <path class="path-line" d={path(group.values)} stroke={$zGet(group)} />
  {/each}
</g>

<style>
  .path-line {
    fill: none;
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-width: 3px;
  }
</style>
