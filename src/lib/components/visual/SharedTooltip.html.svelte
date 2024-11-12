<!--
  @component
  Generates a tooltip that works on multiseries datasets, like multiline charts. It creates a tooltip showing the name of the series and the current value. It finds the nearest data point using the [QuadTree.html.svelte](https://layercake.graphics/components/QuadTree.html.svelte) component.
 -->
<script>
  import { getContext } from "svelte";
  import { format } from "d3-format";

  import { fuelCodeFormat } from "$lib/shared/utils.js";
  import QuadTree from "./QuadTree.html.svelte";
  import FireCharacteristics from "./FireCharacteristics.svelte";
  import UKFuelModels from "$lib/data/UKFuelModels";

  const { data, width, yScale, xScale, config } = getContext("LayerCake");

  const commas = format(",");
  const titleCase = (d) => d.replace(/^\w/, (w) => w.toUpperCase());

  /** @type {Function} [formatTitle=d => d] - A function to format the tooltip title, which is `$config.x`. */
  export let formatTitle = (d) => d;

  /** @type {Function} [formatValue=d => isNaN(+d) ? d : commas(d)] - A function to format the value. */
  export let formatValue = (d) => format(".2f")(d);

  /** @type {Function} [formatKey=d => titleCase(d)] - A function to format the series name. */
  export let formatKey = (d) => titleCase(d);

  /** @type {Number} [offset=-20] - A y-offset from the hover point, in pixels. */
  export let offset = -20;

  /** @type {Array} [dataset] - The dataset to work off ofdefaults to $data if left unset. You can pass something custom in here in case you don't want to use the main data or it's in a strange format. */
  export let dataset = undefined;

  const w = 150;
  const w2 = w / 2;

  /* --------------------------------------------
   * Sort the keys by the highest value
   */
  function sortResult(result) {
    if (Object.keys(result).length === 0) return [];
    const rows = {
      key: result["surface.primary.fuel.model.catalogKey"],
      value: result["surface.weighted.fire.flameLength"],
      yval: result["surface.weighted.fire.spreadRate"],
      xval: result["surface.weighted.fire.heatPerUnitArea"],
    };
    return rows;
  }
</script>

<QuadTree
  dataset={dataset || $data}
  y="y"
  let:x
  let:y
  let:visible
  let:found
  let:e
>
  {@const foundSorted = sortResult(found)}
  {#if visible === true}
    <div
      class="tooltip"
      style="
        width:{w}px;
        display: {visible ? 'block' : 'none'};
        top:{$yScale(foundSorted.yval) + offset}px;
        left:{$xScale(foundSorted.xval) + -4 * offset}px;"
    >
      <div class="title">{@html fuelCodeFormat(foundSorted.key)}</div>
      <span class="key">Flame lenght: {foundSorted.value.toFixed(1)}(m)</span>
    </div>
  {/if}
</QuadTree>

<style>
  .tooltip {
    position: absolute;
    font-size: 13px;
    pointer-events: none;
    border: 1px solid #ccc;
    background: rgba(255, 255, 255, 0.85);
    transform: translate(-50%, -100%);
    padding: 5px;
    z-index: 15;
    pointer-events: none;
  }
  .tooltip {
    transition:
      left 250ms ease-out,
      top 250ms ease-out;
  }
  .key {
    color: #999;
  }
</style>
