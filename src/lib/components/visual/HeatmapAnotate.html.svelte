<script>
  import { getContext } from "svelte";
  import { Popover, Modal, Gallery, Button, Select } from "flowbite-svelte";
  import { Html } from "layercake";
  import {
    selectedFuel,
    selectedOutput,
    selectedOutputs,
  } from "$lib/shared/stores/modelStore.js";
  import { outputNodes } from "$lib/data/outputNodes.js";
  import UKFuelModels from "$lib/data/UKFuelModels.json";
  import FuelModelModal from "$lib/components/visual/FuelModal.svelte";
  import SelectOutput from "$lib/components/ui/SelectOutput.svelte";
  import { fuelCodeFormat } from "$lib/shared/utils.js";
  const { data, xGet, y, yGet, percentRange } = getContext("LayerCake");

  

  

  


  

  

  

  

  
  /**
   * @typedef {Object} Props
   * @property {Array} weatherProps - A list of annotation objects.
   * @property {number} cellSize - heatmap cell size in px
   * @property {number} gapSize - gap between weather and fire behaviour heatmaps
   * @property {any} forecastData
   * @property {string} axisLabel
   * @property {string} forecastLabel
   * @property {boolean} commonOutput
   * @property {number} leftMargin - annotation (y axis) element width in px.
   * @property {number} topMargin - annotation (y axis) element width in px.
   */

  /** @type {Props} */
  let {
    weatherProps,
    cellSize,
    gapSize,
    forecastData,
    axisLabel,
    forecastLabel,
    commonOutput,
    leftMargin,
    topMargin
  } = $props();

  let clickOutsideModal = $state(false);

  function handleFuelClick(fuelObject) {
    $selectedFuel = $y(fuelObject);
    // console.log("selected fuel", $selectedFuel);
    // console.log("clickOutsideModal parrent was", clickOutsideModal);
    clickOutsideModal = !clickOutsideModal;
    // console.log("clickOutsideModal parrent", clickOutsideModal);
  }
</script>

<div
  class="flex absolute columns-2 items-end min-w-96"
  style:top="-{topMargin}px"
  style:height={cellSize + "px"}
>
  <div class="w-[{leftMargin}px]"></div>
  <div class="pl-2 text-xl">
    {forecastLabel}
  </div>
</div>
<div
  class="flex absolute justify-end text-right items-center"
  style:left={"49" + "px"}
  style:top={"-25" + "px"}
  style:height={cellSize + "px"}
>
  <div class="text-xs hover:text-primary-900 pr-1" id="is_time">time (H)</div>
</div>
<Popover
  class="w-64 text-sm font-light relative"
  arrow={false}
  title=""
  placement="right"
  offset={20}
  triggeredBy="#is_time">Click to select time</Popover
>
{#each Object.values(weatherProps) as prop, i}
  <div
    class="flex justify-end overflow text-right items-center"
    style:left={cellSize / 2 + "px"}
    style:top={cellSize * i + "px"}
    style:height={cellSize + "px"}
  >
    <!-- <i class="text-xl {prop[1]} hover:text-primary-900" /> -->
    <div class="text-xs hover:text-primary-900 pr-1" id={"is" + i}>
      {prop[5]}
    </div>
  </div>
  <Popover
    class="w-64 text-sm font-light relative"
    arrow={false}
    title=""
    placement="right"
    offset={20}
    triggeredBy={"#" + "is" + i}>{prop[6]}</Popover
  >
{/each}
<div class="absolute items-end min-w-96 p-1" style:left="95px">
  <div class=""></div>
  <SelectOutput />
</div>
<div
  class="flex columns-2 items-end min-w-64 p-1"
  style:height={cellSize * gapSize + "px"}
>
  <div class="w-[{leftMargin}px]"></div>
</div>
<div class="flex justify-end">
  <div class="text-right justify-end pr-2 pl-2">
    {#each $data as fuelObject, i}
      <div
        class="flex justify-end overflow align-middle"
        role="button"
        onclick={() => handleFuelClick(fuelObject)}
        data-id={i}
        style:left={cellSize / 2 + "px"}
        style:top={cellSize * i + "px"}
        style:height={cellSize + "px"}
      >
        <div class="hover:text-primary-900">
          {#if $y(fuelObject) !== "All fuels"}
            {@html fuelCodeFormat($y(fuelObject))}
          {:else}
            {$y(fuelObject)}
          {/if}
        </div>
      </div>
      <!-- <Popover -->
      <!--   class="w-64 text-sm font-light relative" -->
      <!--   arrow={false} -->
      <!--   title="" -->
      <!--   placement="right" -->
      <!--   offset={20} -->
      <!--   triggeredBy={"#" + "is" + i}>{prop[0]}</Popover -->
      <!-- > -->
    {/each}
    {#if clickOutsideModal}
      <FuelModelModal bind:clickOutsideModal />
    {/if}
  </div>
</div>

<style>
  .label-vertical {
    display: inline-block;
    writing-mode: vertical-lr;
    transform: scale(-1);
    text-align: center;
  }
</style>
