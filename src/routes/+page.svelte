<script>
  import { Select, Label, Badge } from "flowbite-svelte";
  import MultiSelect from "$lib/components/ui/MultiSelect.svelte";
  import Map from "$lib/components/ui/Map.svelte";
  import Auth from "$lib/components/Auth.svelte";
  import UKFuelModels from "$lib/data/UKFuelModels.json";
  import SveltyPicker from "svelty-picker";
  import {
    selectedOutput,
    modelConfigValues,
    requiredConfig,
    config,
    siteInputs,
    selectedFuels,
    selectedInput,
    requiredFuelInputs,
    requiredInputs,
    fuelInputs,
    scenarios,
    selectedScenario,
    _inputs,
    _output,
    advancedMode,
  } from "$lib/shared/stores/modelStore.js";
  import { forecastLocation } from "$lib/shared/stores/forecastStore.js";
  import { dateTime } from "$lib/shared/stores/timeStore.js";
  import MultiLinePage from "$lib/components/visual/MultiLinePage.svelte";
  import BarFigure from "$lib/components/visual/BarFigure.svelte";
  import FireCharacteristics from "$lib/components/visual/FireCharacteristics.svelte";

  export let data;
  let w;
  const selectOptions = [];
  for (const [key, value] of Object.entries(UKFuelModels)) {
    selectOptions.push({ name: key + ": " + value.label, value: key });
  }

  function configOptions(configKey) {
    const options = [];
    $modelConfigValues[configKey].options.forEach((element) => {
      options.push({ name: element });
    });
    return options;
  }

  let currentDateTime = new Date($dateTime).toString();

  $: console.log("CurrentDateTime :", currentDateTime);

  // $: console.log("inputs  ", $_inputs);
  // $: console.log("required inputs  ", $requiredSiteInputs);
  // $scenarios = data.scenarios;
  // $: console.log("selected Output", $selectedOutput);
  // $: console.log("selectedScenario", $selectedScenario);

  // $: console.log("output", $_output);
  // );
  // $: console.log("fuel inputs", $fuelInputs);
  //
</script>

<section class="p-2">
  <h1>
    Current fire behaviour prediction for: <strong
      >{$forecastLocation.name}</strong
    >
    <br />
    <p>
      lon: {$forecastLocation.coordinates[0]}, lat: {$forecastLocation
        .coordinates[1]} elev.: {$forecastLocation.coordinates[2]}m

      <br />
      {new Date($dateTime)}
    </p>
  </h1>
</section>
<!-- <section class="pb-2"> -->
<!-- <Label for="select-sm" class="mb-2">Select site scenario</Label> -->
<!-- <Select id="select-sm" size="sm" class="mb-6" bind:value={$selectedScenario}> -->
<!--   {#each $scenarios as scenario} -->
<!--     <option value={scenario}>{scenario.label}</option> -->
<!--   {/each} -->
<!-- </Select> -->
<!-- </section> -->
<!-- <div /> -->
<div class="w-full aspect-square container" bind:clientWidth={w}>
  {#if $advancedMode}
    <FireCharacteristics
      parentWidth={w}
      data={$_output}
      xKey="surface.weighted.fire.heatPerUnitArea"
      yKey="surface.weighted.fire.spreadRate"
      zKey="surface.primary.fuel.model.catalogKey"
    />
  {:else}
    <BarFigure
      data={$_output}
      xKey={$selectedOutput}
      yKey="surface.primary.fuel.model.catalogKey"
    />
  {/if}

  <!-- <MultiLinePage -->
  <!--   data={$_output} -->
  <!--   xKey="site.moisture.dead.category" -->
  <!--   yKey="surface.weighted.fire.spreadRate" -->
  <!--   zKey="surface.primary.fuel.model.catalogKey" -->
  <!-- /> -->
</div>
<div class="w-full aspect-video container" bind:clientWidth={w}>
  <section>
    <Map />
  </section>
</div>
<section class="pt-2 space-y-2">
  <heading class="p-2" tag="h1" customSize="text-3xl"
    >Select fuel models</heading
  >
  <div>
    <MultiSelect
      items={selectOptions}
      bind:value={$selectedFuels}
      let:item
      let:clear
    >
      <Badge
        dismissable={$selectedFuels.length > 1}
        params={{ duration: 100 }}
        on:close={clear}
      >
        {item.name}
      </Badge>
    </MultiSelect>
  </div>
</section>
<section>
  <SveltyPicker
    bind:value={currentDateTime}
    mode="datetime"
    format="mm-dd hh"
    displayFormat="mm-dd HH P"
    placeholder="Set date and time"
  />
</section>
<section class="pt-20 space-y-2">
  <h3 class="h3 font-bold">Required config options:</h3>
  {#each $requiredConfig as configKey}
    <Label for="select-sm" class="mb-2">{configKey}</Label>
    <Select
      id="select-sm"
      size="sm"
      class="mb-6"
      bind:value={$modelConfigValues[configKey].value}
    >
      {#each $modelConfigValues[configKey].options as option}
        <option value={option}>{option}</option>
      {/each}
    </Select>
  {/each}
</section>

<style>
</style>
