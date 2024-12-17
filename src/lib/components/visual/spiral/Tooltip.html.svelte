<!--
  @component
 -->
<script>
  import { getContext } from "svelte";
  import { format, fromUnixTime } from "date-fns";

  import QuadTree from "$lib/components/visual/QuadTree.html.svelte";

  const { data, width, yScale, xScale, z } = getContext("LayerCake");

  /** @type {Number} [offset=-20] - A y-offset from the hover point, in pixels. */
  export let offset = -20;

  const w = 150;
  const w2 = w / 2;

  /* --------------------------------------------
   * Sort the keys by the highest value
   */
  function sortResult(result) {
    if (Object.keys(result).length === 0) return [];
    return result;
  }
  function getTranslation(found) {
    if (found.x1 > 0) {
      return "translate(-150%, -70%)";
    }
    return "translate(-50%, -70%)";
  }
</script>

<QuadTree dataset={$data} y="y" let:x let:y let:visible let:found let:e>
  {@const foundSorted = sortResult(found)}
  {#if visible === true}
    <div
      class="absolute text-sm border border-gray-300 bg-white rounded-lg shadow-md p-2"
      style="
        width:{w}px;
        display: {visible ? 'block' : 'none'};
        top:{$yScale(foundSorted.y1) + offset}px;
        left:{$xScale(foundSorted.x1) + -4 * offset}px;
        transform: {getTranslation(foundSorted)};

      "
    >
      <span class="key"
        >{format(fromUnixTime(foundSorted.date * 0.001), "yyyy-MM-dd")}
        <br />
        VPD: {$z(foundSorted).toFixed(1)} (kPa)</span
      >
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
