<script>
  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    ImagePlaceholder,
    Card,
    Modal,
    Gallery,
  } from "flowbite-svelte";
  import UKFuelModels from "$lib/data/UKFuelModels.json";
  import { fuelNodes } from "$lib/data/fuelNodes.js";
  import FuelModelModal from "$lib/components/visual/FuelModal.svelte";
  import { fuelCodeFormat } from "$lib/shared/utils.js";

  import { slide } from "svelte/transition";

  import { selectedFuels } from "$lib/shared/stores/modelStore";

  const fuelsImages = import.meta.glob("$lib/assets/fuelModelPhotos/*.webp", {
    eager: true,
    as: "url",
  });
  console.log("fuelsImages = ", fuelsImages);

  function getFuelImages(fuel) {
    let images = [];
    Object.entries(fuelsImages).forEach(([key, value]) => {
      if (key.split("/")[5].split("_")[0] === fuel.toLowerCase()) {
        images.push({ src: value, alt: fuel });
      }
    });
    return images;
  }

  function getFuelImage(fuel) {
    return fuelsImages[`$lib/assets/fuelModelPhotos/${fuel}*.webp`];
  }

  const showItems = {
    depth: "surface.primary.fuel.model.behave.parms.depth",
    dead1Load: "surface.primary.fuel.model.behave.parms.dead.tl1h.ovendryLoad",
    dead10Load:
      "surface.primary.fuel.model.behave.parms.dead.tl10h.ovendryLoad",
    dead100Load:
      "surface.primary.fuel.model.behave.parms.dead.tl100h.ovendryLoad",
    totalHerbLoad:
      "surface.primary.fuel.model.behave.parms.total.herb.ovendryLoad",
    liveStemLoad:
      "surface.primary.fuel.model.behave.parms.live.stem.ovendryLoad",
    dead1Savr:
      "surface.primary.fuel.model.behave.parms.dead.tl1h.surfaceAreaToVolumeRatio",
    liveHerbSavr:
      "surface.primary.fuel.model.behave.parms.live.herb.surfaceAreaToVolumeRatio",
    liveStemSavr:
      "surface.primary.fuel.model.behave.parms.live.stem.surfaceAreaToVolumeRatio",
    deadMext:
      "surface.primary.fuel.model.behave.parms.dead.extinction.moistureContent",
  };

  let openRow;
  let details;
  let doubleClickModal = false;

  const toggleRow = (i) => {
    openRow = openRow === i ? null : i;
  };
</script>

<svelte:head>
  <title>FireInSite fuel models</title>
  <meta
    name="description"
    content="Fuel models (numerical representations) of temperate shrub and grass-dominated vegetation types used in the FireInSite fire behaviour prediction system."
  />
</svelte:head>

<Table>
  <TableHead>
    <TableHeadCell class="text-sm">Fuel code</TableHeadCell>
    {#each Object.entries(showItems) as [key, item]}
      <TableHeadCell class="text-sm normal-case"
        >{fuelNodes[item].label}
        <span class="text-xs font-normal">({fuelNodes[item].units})</span
        ></TableHeadCell
      >
    {/each}
  </TableHead>
  <TableBody tableBodyClass="divide-y">
    {#each $selectedFuels as fuel, i}
      <TableBodyRow on:click={() => toggleRow(i)}>
        <TableBodyCell class="text-sm"
          >{@html fuelCodeFormat(UKFuelModels[fuel].code)}</TableBodyCell
        >
        {#each Object.entries(showItems) as [key, item]}
          <TableBodyCell>{UKFuelModels[fuel][key]}</TableBodyCell>
        {/each}
      </TableBodyRow>
      {#if openRow === i}
        {@const images = getFuelImages(fuel)}
        <TableBodyRow
          on:dblclick={() => {
            doubleClickModal = true;
            details = i;
          }}
        >
          <TableBodyCell colspan="11" class="p-0">
            <div
              class="px-2 py-3"
              transition:slide|global={{ duration: 300, axis: "y" }}
            >
              <div class="flex flex-col md:flex-row">
                {#if images.length !== 0}
                  {#each images as image}
                    <div class="p-2 min-w-96 min-h-60">
                      <img
                        class="object-cover h-60 w-96"
                        src={image.src}
                        alt={image.alt}
                      />
                    </div>
                  {/each}
                {/if}
                <div class="p-8">
                  <div
                    class="uppercase tracking-wide text-sm text-primary-800 font-semibold"
                  >
                    {UKFuelModels[fuel].label}
                  </div>
                  <p class="mt-2 text-wrap max-w-96 text-slate-500">
                    {UKFuelModels[fuel].description}
                  </p>
                </div>
              </div>
            </div></TableBodyCell
          >
        </TableBodyRow>
      {/if}
    {/each}
  </TableBody>
</Table>
