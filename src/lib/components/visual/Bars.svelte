<!--
  @component
  Generates an SVG bar chart.
 -->
<script>
  import { getContext } from "svelte";
  import fireCharBackg from "$lib/assets/fire_char_backg.svg";

  const { data, xGet, yGet, xScale, yScale, xDomain, xRange } =
    getContext("LayerCake");

  /** @type {String} [fill='#00bbff'] - The shape's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color. */
  export let fill = "#00bbff";
</script>

<pattern
  id="orange"
  height="100%"
  width="100%"
  patternContentUnits="objectBoundingBox"
>
  <image
    height="200"
    width="200"
    preserveAspectRatio="none"
    src={fireCharBackg}
  />
</pattern>
<g class="bar-group">
  {#each $data as d, i}
    <defs>
      <pattern id={i} patternUnits="userSpaceOnUse" width="500" height="500">
        <image
          xlink:href={fireCharBackg}
          x={$xScale.range()[0]}
          y={$yGet(d.values[0])}
          height={$yScale.bandwidth()}
          width={$xGet(d.values[0])}
        />
      </pattern>
    </defs>

    <rect
      class="group-rect"
      data-id={i}
      x={$xScale.range()[0]}
      y={$yGet(d.values[0])}
      height={$yScale.bandwidth()}
      width={$xGet(d.values[0])}
      fill="url(#{i})"
    />
  {/each}
</g>
