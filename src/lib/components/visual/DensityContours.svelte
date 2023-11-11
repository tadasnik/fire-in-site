<script>
  import { getContext } from "svelte";
  import { contourDensity } from "d3-contour";
  import { geoPath } from "d3-geo";
  const {
    z,
    x,
    y,
    xGet,
    yGet,
    zGet,
    xScale,
    yScale,
    xDomain,
    yDomain,
    xRange,
    yRange,
    width,
    height,
  } = getContext("LayerCake");

  export let data;

  /** @type {Number} [r=5] – The circle's radius. */
  export let r = 5;

  /** @type {String} [fill='#0cf'] – The circle's fill color. */
  export let fill = "#0cf";

  /** @type {String} [stroke='#000'] – The circle's stroke color. */
  export let stroke = "#000";

  /** @type {Number} [strokeWidth=0] – The circle's stroke width. */
  export let strokeWidth = 0;

  $: geoPathFn = geoPath();

  $: contours = contourDensity()
    .x($xGet)
    .y($yGet)
    .size([$width, $height])
    .bandwidth(10)
    .thresholds(5)(data);
</script>

<g class="">
  {#each contours as contour}
    <path
      d={geoPathFn(contour)}
      stroke-width="1"
      stroke="steelblue"
      fill="none"
      stroke-linejoin="round"
    />
  {/each}
</g>
