<script>
  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Card,
    Heading,
    Span,
    P,
  } from "flowbite-svelte";
  import UKFuelModels from "$lib/data/UKFuelModels.json";
  import { fuelNodes } from "$lib/data/fuelNodes.js";
  import { fuelCodeFormat } from "$lib/shared/utils.js";
  import { slide } from "svelte/transition";
  import { selectedFuels } from "$lib/shared/stores/modelStore";

  import heatherPhoto from "$lib/assets/fuelModelPhotos/clm_2.webp";
  import mixedPhoto from "$lib/assets/fuelModelPhotos/mhl_3.webp";
  import grassPhoto from "$lib/assets/fuelModelPhotos/grh_1.webp";
  import gorsePhoto from "$lib/assets/fuelModelPhotos/gh_2.webp";
  import fernPhoto from "$lib/assets/fuelModelPhotos/bk_forest.webp";
  import forestPhoto from "$lib/assets/fuelModelPhotos/sn_2.webp";

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
    console.log("fuel", fuel);
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

  const fuelsClasses = [
    {
      title: "Calluna fuels",
      description:
        "Calluna vulgaris dominated fuel models (<strong>CL</strong>). Four calluna fuel models are available based on fuel load and life cycle phase: low load or pioneer stage (<strong>CL</strong>l), medium load or building stage (<strong>CL</strong>m), high load or mature phase (<strong>CL</strong>h)  and degenarate phase (<strong>CL</strong>d).",
      image: heatherPhoto,
    },

    {
      title: "Mixed heath models",
      description:
        "Mixed heath fuel models (<strong>MH</strong>) characterising dwarf shrub vegetation. Two mixed heath fuel models are available based on herbaceous fuel content: low herbaceous load (<strong>MH</strong>l) and high herbaceous load (<strong>MH</strong>h) models.",
      image: mixedPhoto,
    },
    {
      title: "Grass fuels",
      description:
        "Grass fuel models (<strong>GR</strong>) representing grass-dominated vegetation. Divided into low load (<strong>GR</strong>l), medium load (<strong>GR</strong>m) and high load (<strong>GR</strong>h) models based on fuel load and fuel bed height.",
      image: grassPhoto,
    },
    {
      title: "Gorse fuels",
      description:
        "Gorse fuel models (<strong>G</strong>) characterising European gorse shrubs. The category is split into four categories primarily corresponding to different fuel bed heights and fuel loads: low (<strong>G</strong>l), medium (<strong>G</strong>m), high (<strong>G</strong>h) load and tall gorse (<strong>G</strong>t) models.",
      image: gorsePhoto,
    },
    {
      title: "Bracken model",
      description:
        "Fuel model (<strong>BK</strong>) representing vegetation dominated by bracken ferns.  Very high load of herbaceous vegetation, fuel depth approximatelly one metre.",
      image: fernPhoto,
    },
    {
      title: "Forest litter models",
      description:
        "Fuel models representing litter in different forest types. These were split into broadleaf forest litter (<strong>BL</strong>), long needle litter (<strong>LN</strong>) and short needle litter (<strong>SN</strong>) models.",
      image: forestPhoto,
    },
  ];

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

<div class="max-w-80 mx-auto items-center overflow-hidden md:max-w-2xl pt-10">
  <div class="flex flex-col text-slate-600">
    <Heading
      tag="h4"
      class="mb-4"
      customSize="text-2xl font-extrabold  md:text-3xl lg:text-4xl"
    >
      Fuel models
    </Heading>
    <!-- <Heading tag="h3">Getting Started</Heading> -->
    Fuel models are numerical representations of vegetation types used in fire behaviour
    prediction systems. The FireInSite system uses custom surface fuel models to
    estimate fire behaviour in humid temperate UK and other similar regions.

    <P class="pt-5 pb-8"></P>
  </div>
</div>
<div
  class="grid justify-items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4 px-10"
>
  {#each fuelsClasses as fuel}
    <div>
      <Card img={fuel.image} imgClass="aspect-video">
        <h5
          class="mb-2 text-2xl font-bold tracking-tight text-gray-700 dark:text-white"
        >
          {fuel.title}
        </h5>
        <p
          class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight"
        >
          {@html fuel.description}
        </p>
      </Card>
    </div>
  {/each}
</div>
<div class="max-w-80 mx-auto items-center overflow-hidden md:max-w-2xl pt-10">
  <Heading
    tag="h4"
    class="mb-4"
    customSize="pt-10 text-2xl font-extrabold  md:text-3xl lg:text-4xl"
  >
    <Span class="text-primary-600 font-bold">FireInSite</Span> fuel model table
  </Heading>
</div>
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
