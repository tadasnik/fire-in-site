<script>
  import { getContext } from "svelte";
  import { Popover, Modal, Gallery, Button } from "flowbite-svelte";
  import {
    getFuelsImages,
    getFuelModelsFileNames,
  } from "$lib/firebase/firebase.client";

  import { selectedFuel } from "$lib/shared/stores/modelStore.js";
  import UKFuelModels from "$lib/data/UKFuelModels.json";
  import FuelModelModal from "$lib/components/visual/FuelModal.svelte";
  const { data, xGet, y, yGet, percentRange } = getContext("LayerCake");

  /** @type {Array} annotations - A list of annotation objects. */
  export let weatherProps;

  /** @type {number} cellSize - heatmap cell size in px */
  export let cellSize;

  /** @type {number} gapSize - gap between weather and fire behaviour heatmaps
   * in units of cellSize. */
  export let gapSize;

  /** @type {Function} [getText=d => d.text] - An accessor function to get the field to display. */
  export let getText = (d) => d.text;

  export let forecastData;

  /** @type {string} Selectede fire behaviour, y axis label. */
  export let axisLabel;

  let clickOutsideModal = false;
  function handleFuelClick(fuelObject) {
    $selectedFuel = $y(fuelObject);
    console.log("selected fuel", $selectedFuel);
    console.log("clickOutsideModal parrent was", clickOutsideModal);
    clickOutsideModal = !clickOutsideModal;
    console.log("clickOutsideModal parrent", clickOutsideModal);
  }

  $: console.log("forecastData", forecastData);
</script>

{#each Object.values(weatherProps) as prop, i}
  <div
    class="flex justify-end overflow text-right items-center"
    style:left={cellSize / 2 + "px"}
    style:top={cellSize * i + "px"}
    style:height={cellSize + "px"}
  >
    <!-- <i class="text-xl {prop[1]} hover:text-primary-900" /> -->
    <div class="text-xs hover:text-primary-900 pr-1" id={"is" + i}>
      {prop[4]}
    </div>
  </div>
  <Popover
    class="w-64 text-sm font-light relative"
    arrow={false}
    title=""
    placement="right"
    offset={20}
    triggeredBy={"#" + "is" + i}>{prop[0]}</Popover
  >
{/each}

<div class="flex" style:height={cellSize + "px"}>
  {#each forecastData as weatherObject, x}
    <div
      class="shrink-0 items-center justify-center align-middle"
      style:height={cellSize + "px"}
      style:width={cellSize + "px"}
    >
      <i
        class="text-xl wi wi-wind wi-from-{Math.round(
          weatherObject['windDirectionFrom10m']
        )}"
        style="fill:grey"
      />
    </div>
  {/each}
  <!---->
  <!-- <div class="" /> -->
  <!--         <i -->
  <!--           class="text-xl wi wi-wind -->
  <!--       wi-from-{getWindCardinalDirection(data.windDirectionFrom10m)}" -->
  <!--         /> -->
</div>

<div class="flex justify-end">
  <div class="label text-base" style:width="35px">{axisLabel}</div>
  <div class="text-right justify-end pr-2 pl-2">
    {#each $data as fuelObject, i}
      <div
        class="flex justify-end overflow align-middle"
        role="button"
        on:click={() => handleFuelClick(fuelObject)}
        data-id={i}
        style:left={cellSize / 2 + "px"}
        style:top={cellSize * i + "px"}
        style:height={cellSize + "px"}
      >
        <div class="hover:text-primary-900">
          {$y(fuelObject)}
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

<!-- <Modal -->
<!--   title="{UKFuelModels[$selectedFuel] -->
<!--     .displayLabel} ({$selectedFuel}) Fuel Model" -->
<!--   bind:open={clickOutsideModal} -->
<!--   autoclose -->
<!--   outsideclose -->
<!-- > -->
<!--   <Gallery class="gap-4 grid-cols-2 md:grid-cols-4"> -->
<!--     <Gallery items={images1} /> -->
<!--   </Gallery> -->
<!--   <p>{UKFuelModels[$selectedFuel].description}</p> -->
<!--   <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400"> -->
<!--     With less than a month to go before the European Union enacts new consumer -->
<!--     privacy laws for its citizens, companies around the world are updating their -->
<!--     terms of service agreements to comply. -->
<!--   </p> -->
<!--   <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400"> -->
<!--     {Object.keys(UKFuelModels[$selectedFuel])} -->
<!--   </p> -->
<!--   <svelte:fragment slot="footer"> -->
<!--     <Button on:click={() => alert('Handle "success"')}>I accept</Button> -->
<!--     <Button color="alternative">Decline</Button> -->
<!--   </svelte:fragment> -->
<!-- </Modal> -->

<style>
  .label {
    display: inline-block;
    writing-mode: vertical-lr;
    transform: scale(-1);
    text-align: center;
  }
</style>
