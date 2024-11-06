<script>
  import { Card, Modal, Gallery, Carousel } from "flowbite-svelte";
  import { Heading, P, A, Mark, Secondary } from "flowbite-svelte";
  import emblaCarouselSvelte from "embla-carousel-svelte";
  import gorseFire from "$lib/assets/fuelModelPhotos/gm_3.webp";

  const fuelsImages = import.meta.glob("$lib/assets/fuelModelPhotos/*.webp", {
    eager: true,
    as: "url",
  });

  console.log("fuelsImages", fuelsImages);

  function getFuelImages(fuel) {
    let images = [];
    Object.entries(fuelsImages).forEach(([key, value], index) => {
      if (key.split("/")[5].split("_")[0] === fuel.toLowerCase()) {
        images.push({ id: index, src: value, alt: fuel, title: fuel });
      }
    });
    return images;
  }

  const images = getFuelImages("gm");
  console.log("images", images);
</script>

<div class="max-w-md mx-auto overflow-hidden md:max-w-2xl pt-10">
  <div id="test" class="max-w-2xl">
    <Carousel {images} imgClass="min-h-72" let:Controls>
      <Controls /></Carousel
    >
  </div>

  <div class="flex flex-col text-slate-500">
    <div class="md:flex">
      <div class="pt-8 md:shrink-0">
        <img
          class="h-48 w-full object-cover md:h-full md:w-48"
          src={gorseFire}
          alt="Gorse fire"
        />
      </div>
      <div class="p-8">
        <P class="mt-2">
          <span
            class="text-lg leading-tight font-medium text-black hover:underline"
            >FireInSite is a fire behaviour prediction system</span
          >
          in the form of a web-based application that forecasts the probability of
          ignition, surface fire rate of spread, flame length and fireline intensity
          for a user selected location for a set of core UK fire prone vegetation
          types (fuels).
        </P>
      </div>
    </div>
    <div class="md:flex">
      <div class="p-8">
        <P class="mt-2">
          <span class="text-lg leading-tight font-bold hover:underline">
            FireInSite is built on over four years of intensive data collection</span
          > of fuel moistures, vegetation flammability and energy contents taken
          from across the UK in characteristic fuels and these have been used to
          develop fuel models that describe the fire prone fuel types of the UK landscape
          for the first time. No other fire behaviour prediction system contains
          fuel models that have been specifically designed and tailored to UK vegetation
          and are ready inbuilt for use in the system.
        </P>
      </div>
      <div class="pt-8 md:shrink-0">
        <img
          class="h-48 w-full object-cover md:h-full md:w-48"
          src={gorseFire}
          alt="Gorse fire"
        />
      </div>
    </div>
    <div class="md:flex">
      <div class="p-8">
        <P class="mt-2">
          <Secondary class="mb-4 text-xl text-black hover:underline">
            Key features</Secondary
          >
          <ul class="list-disc">
            <li>Predicts fire behaviour for a selected location in the UK.</li>
            <li>Predictions for most common UK vegetation fuels.</li>
            <li>
              Seamless integration of weather forecasts up-to 5 days ahead.
            </li>
            <li>
              Fire spread rate, flame length, ignition probability, and fuel
              moisture.
            </li>
            <li>Two models to calculate fine dead fuel moisture.</li>
            <li>Easy-to-use web application</li>
          </ul>
        </P>
      </div>
    </div>
  </div>
</div>
