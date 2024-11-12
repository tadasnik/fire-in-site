<script>
  import {
    Heading,
    P,
    A,
    Span,
    List,
    Li,
    Secondary,
    Popover,
    Select,
    Spinner,
  } from "flowbite-svelte";
  import {
    selectedOutput,
    selectedOutputs,
    _outputForecast,
  } from "$lib/shared/stores/modelStore";
  import { dateTime } from "$lib/shared/stores/timeStore";
  import { outputNodes } from "$lib/data/outputNodes.js";
  import FireInSiteLogo from "$lib/assets/FireInSitlogo.png";
  import Map from "$lib/components/ui/Map.svelte";
  import CurrentBehaviour from "$lib/components/visual/CurrentBehaviour.svelte";
  import { browser } from "$app/environment";
  import { fetchingForecast } from "$lib/shared/stores/forecastStore";
  import FireCharacteristics from "$lib/components/visual/FireCharacteristics.svelte";
  import flameTable from "$lib/assets/flameTable.webp";

  let width;
</script>

<div class="max-w-80 mx-auto items-center overflow-hidden md:max-w-2xl pt-10">
  <div class="flex flex-col text-slate-600">
    <Heading
      tag="h2"
      class="mb-4"
      customSize="text-3xl font-extrabold  md:text-5xl lg:text-6xl"
    >
      <Span class="text-primary-600 font-bold">FireInSite</Span> User guide
    </Heading>
    <!-- <Heading tag="h3">Getting Started</Heading> -->

    <Heading tag="h4">1. Accessing the Fire Behaveur Modelling System</Heading>
    <P class="pt-5 pb-8">
      The main modelling section (home page of the FireInSite web application)
      is loaded when the application starts. The main application page consists
      of a map, a Fire Behaviour Chart for the selected time and a more detailed
      hourly Fire Behaviour forecasts beneath. The main page can be accessed
      from other pages within the application by clicking the
      <Span class="inline-flex items-baseline">
        <img class="h-5" src={FireInSiteLogo} alt="fireInSite Logo" /></Span
      > logo on the top left of the webpage. This brings up the modelling page that
      contains a map, a Fire Behaviour Chart for the selected time and a Fire Behaviour
      forecasts below.
    </P>
    <Heading tag="h4">2. Select location</Heading>
    <P class="pt-5 pb-8">
      When FireInSite is initialised, the application determines approximate
      user location based on IP address. The method is not precise but is
      helpful to place the marker within a more relevant region. Users can also
      use the “geolocate” button above the map to trigger a geolocation service
      which can determine the user’s device position more accurately if
      ‘location services’ are enabled on your device. <Span
        class="text-primary-600">Pan and click on the map</Span
      >
      to select the precise location for which you wish to predict fire behaviour
      for. FireInSite calculates terrain (slope and aspect) based on the marker location
      on the map. This information is displayd on the map. The application uses the
      location coordinates and terrain parameters to retrieve weather forecasts and
      directly for fuel moisture and fire behaviour modelling.
    </P>
    <div class="container justify-center max-w-96 mx-auto pb-8">
      <div id="map1">
        <Map></Map>
      </div>
      <Popover
        class="w-64 text-sm font-light "
        title="Popover title"
        triggeredBy="#map1"
        >And here's some amazing content. It's very engaging. Right?</Popover
      >
    </div>
    <Heading tag="h4">3. Select model output</Heading>
    <P class="pt-5 pb-8">
      Click on the “select model output” drop down menu (default setting is fire
      spread rate) to change the fire behaviour prediction variable shown above
      the fire behaviour bar chart, within fire behaviour forecast graph. This
      allows you to switch between the outputs for Surface Fire Rate of Spread,
      Heat per Unit Area, Fireline Intensity, Fire Flame Length, Dead 1 hour
      fuel moisture and Probability of Ignition. This then updates the Fire
      Behaviour Bar Chart and the Fire Behaviour Table to show the predictions
      for your metric of choice.
    </P>
    <div>
      <div
        class="flex flex-col place-items-baseline justify-center mx-auto max-w-96 pb-8"
      >
        <div class="items-baseline align-text-bottom pr-4">
          <span class="align-bottom">Select model output</span>
        </div>

        <Select id="select-output" class="" bind:value={$selectedOutput}>
          {#each $selectedOutputs as output}
            <option value={output}
              >{outputNodes[output].label}
              ({outputNodes[output].units})</option
            >
          {/each}
        </Select>
      </div>
    </div>

    <Heading tag="h4">4. Current fire behaviour chart</Heading>
    <P class="pt-5 pb-8">
      Predicted fire behaviour for the selected time (hour) is show in the chart
      next to the location Map. Users can choose between a bar chart showing
      selected fire behaviour or fire characteristics chart.
    </P>
    <P class="pt-5 pb-8">
      The default fire behaviour bar chart will show you the predicted fire
      behaviour for the selected time step (shown at the top of the main page)
      and for all available fuel models (listed on the vertical access of the
      graph). It is up to you to choose which ones are relevant for your
      location. If you hover over the bars, you can read the fuel model name and
      it will provide you with the prediction e.g. if you chose rate of spread
      it will tell you the length of the bar in m/min etc.
    </P>
    <div class="flex aspect-square pt-2" bind:clientWidth={width}>
      {#if browser && $fetchingForecast === false}
        <CurrentBehaviour></CurrentBehaviour>
      {:else}
        <div class="flex justify-center">
          <Spinner></Spinner>
        </div>
      {/if}
    </div>
    <P class="pt-5 pb-8">
      You can also choose to view the results as a Fire Characteristics Chart,
      that plots the fire behaviour in respect to flame lengths and can be used
      to guide operational staffing requirements. To show the Fire
      Characteristics Chart instead of the Fire Behaviour Bar Chart go to the
      <Span italic>'Settings'</Span> drop down menu and change the selected <Span
        italic>'Chart type'</Span
      > to <Span italic>'Fire Characteristics'</Span>. This chart will then
      appear in place of the Fire Behaviour Bar Chart.
    </P>

    <!-- {#if browser && $fetchingForecast === false} -->
    <!--   <div class="flex w-96 h-96 pt-2"> -->
    <!--     <FireCharacteristics -->
    <!--       parentWidth="400px" -->
    <!--       data={$_outputForecast.get($dateTime)} -->
    <!--       xKey="surface.weighted.fire.heatPerUnitArea" -->
    <!--       yKey="surface.weighted.fire.spreadRate" -->
    <!--       zKey="surface.primary.fuel.model.catalogKey" -->
    <!--     /> -->
    <!--   </div> -->
    <!-- {/if} -->
    <P class="pt-5 pb-8">
      The Fire Characteristics Chart will plot dots the anticipated fire
      behaviour showing Heat per unit area (x axis), rate of spread (y axis) and
      flame length (colour bands). The flame length colour bands link to the
      National Operational Guidance for UK firefighters. For ease of reference
      these are:
    </P>
    <div class="flex flex-col max-w-md items-center pb-8">
      <img src={flameTable} alt="Flame Length Table" />
    </div>
    <Heading tag="h4">5. Fuel models</Heading>
    <P class="pt-5 pb-8">
      To familiarise yourself with the fuel models - you can either click on the
      fuel model names that form the row of the fire behaviour table. This will
      show a short description and provide an example image of the fuel type.
      For further information and to compare all fuel model parameters in a
      single table click on <Span italic>"Fuel Models"</Span> link at the top of
      the page. This will take you to a table of the specific parameters used in
      each fuel model, you can click on each row and it will expand to reveal additional
      images and a short description.
    </P>
    <Heading tag="h4">6. Fuel moisture models</Heading>
    <P class="pt-5 pb-8">
      The FireInSite UK specific dead fuel model is selected as the default fuel
      moisture model for use with dead fuels. If you wish to change to the
      Fosberg (kestrel FFMC tables) or Simple FFMC (Nelson) fuel moisture models
      click <Span italic>"Settitngs"</Span> and select which you require.
    </P>
  </div>
</div>
