<script>
  import { onMount, onDestroy } from "svelte";
  import { Modal, Gallery, Carousel, Button } from "flowbite-svelte";
  import UKFuelModels from "$lib/data/UKFuelModels.json";
  import { selectedFuel } from "$lib/shared/stores/modelStore.js";
  import { fuelCodeFormat } from "$lib/shared/utils.js";

  const fuelsImages = import.meta.glob("$lib/assets/fuelModelPhotos/*.webp", {
    eager: true,
    as: "url",
  });

  
  /**
   * @typedef {Object} Props
   * @property {any} clickOutsideModal - console.log("fuelsImages", fuelsImages);
   */

  /** @type {Props} */
  let { clickOutsideModal = $bindable() } = $props();

  function getFuelImages(fuel) {
    let images = [];
    Object.entries(fuelsImages).forEach(([key, value], index) => {
      if (key.split("/")[5].split("_")[0] === fuel.toLowerCase()) {
        images.push({ id: index, src: value, alt: fuel, title: fuel });
      }
    });
    return images;
  }

  const images = getFuelImages($selectedFuel);

  let slideControls = true;
</script>

<Modal
  title={UKFuelModels[$selectedFuel].displayLabel}
  bind:open={clickOutsideModal}
  autoclose
  outsideclose
  class="overflow"
>
  <div id="default-carousel" class="relative w-full" data-carousel="slide">
    <Carousel {images} imgClass="min-h-72" >
      {#snippet children({ Controls })}
            <Controls />          {/snippet}
        </Carousel
    >
  </div>
  <div class="text-left">
    <p>{UKFuelModels[$selectedFuel].description}</p>
    <div class="content pt-2">
      <div class="text-lg text-primary-800">
        ({@html fuelCodeFormat($selectedFuel)}) Fuel model parameters
      </div>
      <ul>
        <li>
          Fuel height <strong>{UKFuelModels[$selectedFuel].depth}</strong>(m)
        </li>
        <li>
          Dead 1h load <strong>{UKFuelModels[$selectedFuel].dead1Load}</strong
          >(kg/m2)
        </li>
        <li>
          Dead 10h load <strong>{UKFuelModels[$selectedFuel].dead10Load}</strong
          >(kg/m2)
        </li>
        <li>
          Dead 100h load <strong
            >{UKFuelModels[$selectedFuel].dead100Load}</strong
          >(kg/m2)
        </li>
        <li>
          Total herb load <strong
            >{UKFuelModels[$selectedFuel].totalHerbLoad}</strong
          >(kg/m2)
        </li>
        <li>
          Live stem load <strong
            >{UKFuelModels[$selectedFuel].liveStemLoad}</strong
          >(kg/m2)
        </li>

        <li>
          Dead 1h SAVR <strong>{UKFuelModels[$selectedFuel].dead1Savr}</strong
          >(m2/m3)
        </li>
        <li>
          Live herb SAVR <strong
            >{UKFuelModels[$selectedFuel].liveHerbSavr}</strong
          >(m2/m3)
        </li>
        <li>
          Live stem SAVR <strong
            >{UKFuelModels[$selectedFuel].liveStemSavr}</strong
          >(m2/m3)
        </li>

        <li>
          Dead fuel moisture of extinction <strong
            >{UKFuelModels[$selectedFuel].deadMext}</strong
          >(%)
        </li>
      </ul>
    </div>
  </div>
</Modal>
