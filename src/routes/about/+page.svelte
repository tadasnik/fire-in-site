<script>
  import { Carousel } from "flowbite-svelte";
  import { Heading, P, A, Secondary } from "flowbite-svelte";

  const fieldWork = import.meta.glob("$lib/assets/fieldWorkPhotos/*.webp", {
    eager: true,
    as: "url",
  });

  const fire = import.meta.glob("$lib/assets/firePhotos/*.webp", {
    eager: true,
    as: "url",
  });

  let fieldImages = [];
  Object.entries(fieldWork).forEach(([key, value]) => {
    fieldImages.push({ src: value, alt: value });
  });

  let fireImages = [];
  Object.entries(fire).forEach(([key, value]) => {
    fireImages.push({ src: value, alt: value });
  });
</script>

<div class="max-w-md mx-auto overflow-hidden md:max-w-2xl pt-10">
  <div class="flex flex-col text-slate-500">
    <div class="p-8">
      <P class="mt-2">
        <span class="text-lg leading-tight text-primary-900 font-bold"
          >FireInSite is a fire behaviour prediction system</span
        >
        in the form of a web-based application that forecasts the probability of
        ignition, surface fire rate of spread, flame length and fireline intensity
        for a user selected location for a set of core UK fire prone vegetation types
        (fuels).
      </P>
    </div>
    <div id="test" class="max-w-2xl pt-8 pb-8">
      <Carousel
        images={fireImages}
        imgClass="min-h-72"
        
        
        >{#snippet children({ Controls, Indicators })}
                <Indicators />
          <Controls />              {/snippet}
            </Carousel
      >
    </div>

    <div class="p-8">
      <P class="mt-2">
        <span
          class="text-lg leading-tight text-primary-900 font-bold hover:underline"
        >
          FireInSite is a point-based system</span
        > that calculates fire behaviour at a user-selected location on a map (or
        point) for a range of possible fuel types treating each as a homogeneous
        unit. It uses weather forecasts, linked to numeric fuel descriptors (fuel
        models) and calculates the potential probability of ignition, rate of surface
        fire spread, flame length, fireline intensity as well as allowing the user
        to explore variability in dead fuel moisture over a range of forecast days.
        It also allows the user to explore past fire behaviour by using historical
        weather records back to 1970.
      </P>
    </div>
    <div class="md:flex">
      <div class="p-8 md:pl-20">
        <P class="mt-2">
          <Secondary class="mb-4 text-xl text-primary-900 hover:underline">
            Key features</Secondary
          >
          <ul class="list-disc items-end">
            <li>Predicts fire behaviour for a selected location in the UK.</li>
            <li>Predictions for most common UK vegetation fuels.</li>
            <li>
              Seamless integration of weather forecasts up-to 5 days ahead.
            </li>
            <li>
              Fire spread rate, flame length, ignition probability, and fuel
              moisture.
            </li>
            <li>
              Choose between the integrated FireInSite, Fosberg or SimpleFFMC
              (Nelson) fine dead fuel moisture models.
            </li>
            <li>Easy-to-use web application</li>
          </ul>
        </P>
      </div>
    </div>

    <div class="p-8">
      <P class="mt-2">
        <span class="text-lg leading-tight text-primary-900 font-bold">
          FireInSite is built on over four years of intensive data collection</span
        > of fuel moistures, vegetation flammability and energy contents taken from
        across the UK in characteristic fuels and these have been used to develop
        fuel models that describe the fire prone fuel types of the UK landscape for
        the first time. No other fire behaviour prediction system contains fuel models
        that have been specifically designed and tailored to UK vegetation and are
        ready inbuilt for use in the system.
      </P>
    </div>
    <div id="test" class="max-w-2xl pt-8 pb-8">
      <Carousel
        images={fieldImages}
        imgClass="min-h-72"
        
        
        >{#snippet children({ Controls, Indicators })}
                <Indicators />
          <Controls />              {/snippet}
            </Carousel
      >
    </div>
    <div class="p-8">
      <P class="mt-2">
        <span class="text-lg leading-tight text-primary-900 font-bold">
          FireInSite integrates
        </span>
        terrain information from
        <A href="https://www.mapbox.com/about/maps/">Mapbox</A>
        digital elevation
        <A
          href="https://docs.mapbox.com/data/tilesets/reference/mapbox-terrain-dem-v1/"
          >dataset</A
        >
        and weather data by <A href="https://open-meteo.com/">Open-Meteo.com</A>
        with BehavePlus fire behaviour model to provide a seamless user experience.
        The system has built-in fuel models representative of dominant UK surface
        fuels and calculates dead fuel moisture content using machine learning model
        trained on the largest field-based UK fuel moisture dataset.
      </P>
    </div>

    <div class="md:flex">
      <div class="p-8 md:pl-20">
        <P class="mt-2">
          <Secondary class="mb-4 text-xl text-primary-900 hover:underline">
            The system can be used to:</Secondary
          >
          <ul class="list-disc">
            <li>Assess the risk of fire in a particular area</li>
            <li>Plan for fire prevention and suppression</li>
            <li>Assess the potential effects of fuel load reduction.</li>
            <li>Educate the public about fire behaviour</li>
          </ul>
        </P>
      </div>
    </div>
    <div class="p-8">
      <P class="mt-2">
        <span class="text-lg leading-tight text-primary-900 font-bold">
          To find out how to use FireInsite
        </span>
        please visit <A href="/tutorial">tutorial</A> page.
      </P>
    </div>
  </div>
</div>
