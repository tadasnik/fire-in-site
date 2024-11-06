<script>
  import { onMount, onDestroy } from "svelte";
  import { Modal, Gallery, Carousel, Button } from "flowbite-svelte";
  import UKFuelModels from "$lib/data/UKFuelModels.json";
  import { selectedFuel } from "$lib/shared/stores/modelStore.js";
  import {
    getFuelModelImages,
    getFuelModelsFileNames,
    getFuelsImages,
    getFuelModelsImages,
    getFuelImage,
    getFuelModelsUrls,
  } from "$lib/firebase/firebase.client";

  const fuelsImages = import.meta.glob("$lib/assets/fuelModelPhotos/*.webp", {
    eager: true,
    as: "url",
  });

  console.log("fuelsImages", fuelsImages);
  export let clickOutsideModal;

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

  console.log("images", images);
</script>

<Modal
  title="{UKFuelModels[$selectedFuel]
    .displayLabel} ({$selectedFuel}) Fuel Model"
  bind:open={clickOutsideModal}
  autoclose
  outsideclose
>
  <div class="max-w-2xl">
    <Carousel {images}></Carousel>
  </div>
  <div class="container text-left">
    <p>{UKFuelModels[$selectedFuel].description}</p>
    <div class="content pt-2">
      <div class="text-lg text-primary-800">Fuel model parameters</div>
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
