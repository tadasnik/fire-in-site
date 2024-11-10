<!--
  @component
  Generates an SVG scatter plot. This component can also work if the x- or y-scale is ordinal, i.e. it has a `.bandwidth` method. See the [timeplot chart](https://layercake.graphics/example/Timeplot) for an example.
 -->
<script>
  import { getContext, createEventDispatcher } from "svelte";
  import { raise } from "layercake";
  import UKFuelModels from "$lib/data/UKFuelModels.json";

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
  } = getContext("LayerCake");

  export let data;

  /** @type {Number} [r=5] – The circle's radius. */
  export let r = 10;

  /** @type {String} [fill='#0cf'] – The circle's fill color. */
  export let fill = "#0cf";

  /** @type {String} [stroke='#000'] – The circle's stroke color. */
  export let stroke = "#000";

  /** @type {Number} [strokeWidth=0] – The circle's stroke width. */
  export let strokeWidth = 1;

  const dispatch = createEventDispatcher();
  const images = import.meta.glob(["$lib/assets/bars_background/**.webp"], {
    eager: true,
    as: "url",
  });
  function handleMousemove(feature) {
    return function handleMousemoveFn(e) {
      raise(this);
      // When the element gets raised, it flashes 0,0 for a second so skip that
      if (e.layerX !== 0 && e.layerY !== 0) {
        dispatch("mousemove", {
          e,
          props: {
            flame: feature["surface.weighted.fire.flameLength"],
            name: feature["surface.primary.fuel.model.catalogKey"],
          },
        });
      }
    };
  }
  console.log("SCATTER data", data);
</script>

<g
  class="scatter-group"
  on:mouseout={() => dispatch("mouseout")}
  on:blur={() => dispatch("mouseout")}
  role="tooltip"
>
  {#each data as d, i}
    <defs>
      <pattern id={i} patternUnits="userSpaceOnUse" width="20" height="20">
        <image
          xlink:href={images[
            "/src/lib/assets/bars_background/" +
              UKFuelModels[d["surface.primary.fuel.model.catalogKey"]].photo
          ]}
          y="0"
          x="0"
        />
      </pattern>
    </defs>

    <circle
      cx={$xGet(d) + ($xScale.bandwidth ? $xScale.bandwidth() / 2 : 0)}
      cy={$yGet(d) + ($yScale.bandwidth ? $yScale.bandwidth() / 2 : 0)}
      {r}
      fill="url(#{i})"
      {stroke}
      stroke-width={strokeWidth}
      on:mouseover={(e) =>
        dispatch("mousemove", {
          e,
          props: {
            flame: d["surface.weighted.fire.flameLength"],
            name: d["surface.primary.fuel.model.catalogKey"],
          },
        })}
      on:focus={(e) =>
        dispatch("mousemove", {
          e,
          props: {
            flame: d["surface.weighted.fire.flameLength"],
            name: d["surface.primary.fuel.model.catalogKey"],
          },
        })}
      on:mousemove={handleMousemove(d)}
    />
  {/each}
</g>

<style>
</style>
