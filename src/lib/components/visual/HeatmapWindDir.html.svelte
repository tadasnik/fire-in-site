<script>
  import { dateTime } from "$lib/shared/stores/timeStore";
  import {
    currentTimeIndex,
    focusDayIndex,
  } from "$lib/shared/stores/forecastStore";

  /**
   * @typedef {Object} Props
   * @property {number} cellSize - heatmap cell size in px
   * @property {Array} forecastData
   */

  /** @type {Props} */
  let { cellSize, forecastData } = $props();

  let isSelectedClass = $derived((x) => {
    return $currentTimeIndex == x
      ? "text-2xl font-bold text-neutral-500"
      : "text-xl text-neutral-400";
  });
</script>

<div
  class="flex absolute"
  style:height={cellSize + "px"}
  style:top={6 * cellSize + "px"}
>
  <div class="flex justify-end overflow text-right items-center"></div>

  {#each forecastData["wind_direction_10m"].slice($focusDayIndex[0] < 0 ? 0 : $focusDayIndex[0], $focusDayIndex[1] < 0 ? forecastData.length : $focusDayIndex[1]) as dataObject, x}
    <div
      class="flex shrink-0 items-center justify-center align-middle"
      style:height={cellSize + "px"}
      style:width={cellSize + "px"}
    >
      <div class={isSelectedClass(x)}>
        <i class="wi wi-wind from-{Math.round(dataObject)}-deg"></i>
      </div>
    </div>
  {/each}
</div>
