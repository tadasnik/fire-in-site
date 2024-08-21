<script>
  import { dateTime } from "$lib/shared/stores/timeStore";
  import { currentTimeIndex } from "$lib/shared/stores/forecastStore";
  /** @type {number} cellSize - heatmap cell size in px */
  export let cellSize;

  /** @type {Array} Weather forecast - array with objects containing hourly weather forecasts. */
  export let forecastData;

  $: isSelectedClass = (x) => {
    return $currentTimeIndex == x
      ? "text-2xl font-bold text-neutral-500"
      : "text-xl text-neutral-400";
  };
</script>

<div
  class="flex absolute"
  style:height={cellSize + "px"}
  style:top={5 * cellSize + "px"}
>
  <div class="flex justify-end overflow text-right items-center" />

  {#each forecastData["windDirection10m"] as dataObject, x}
    <div
      class="flex shrink-0 items-center justify-center align-middle"
      style:height={cellSize + "px"}
      style:width={cellSize + "px"}
    >
      <div class={isSelectedClass(x)}>
        <i class="wi wi-wind from-{Math.round(dataObject)}-deg" />
      </div>
    </div>
  {/each}
</div>
