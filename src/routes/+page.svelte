<script>
  import { randomInt } from "d3-random";
  import { Select, Label, Badge } from "flowbite-svelte";
  import MultiSelect from "$lib/components/ui/MultiSelect.svelte";
  import Auth from "$lib/components/Auth.svelte";
  import UKFuels from "$lib/data/UKFuels.json";
  import {
    selectedOutput,
    modelConfigValues,
    requiredConfig,
    config,
    requiredSiteInputs,
    siteInputs,
    selectedFuels,
    selectedInput,
    requiredFuelInputs,
    requiredInputs,
    fuelInputs,
    scenarios,
    _inputs,
    _output,
  } from "$lib/shared/stores/modelStore.js";
  import MultiLinePage from "$lib/components/visual/MultiLinePage.svelte";
  import FireCharacteristics from "$lib/components/visual/FireCharacteristics.svelte";

  export let data;
  let w;
  const selectOptions = [];
  for (const [key, value] of Object.entries(UKFuels)) {
    selectOptions.push({ name: key + ": " + value.label, value: key });
  }

  function configOptions(configKey) {
    const options = [];
    $modelConfigValues[configKey].options.forEach((element) => {
      options.push({ name: element });
    });
    return options;
  }

  $scenarios = data.scenarios;
  $: console.log("scenarios", $scenarios);
  // $: console.log("output", $_output);
  // $_output[$selectedFuels[0]].get($selectedOutputs[0])
  // );
  // $: console.log("fuel inputs", $fuelInputs);
  //
</script>

<section class="pb-5">
  <heading class="p-8" tag="h1" customSize="text-3xl"
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
<div />
<div class="w-full aspect-square container" bind:clientWidth={w}>
  <FireCharacteristics
    parentWidth={w}
    data={$_output}
    xKey="surface.weighted.fire.heatPerUnitArea"
    yKey="surface.weighted.fire.spreadRate"
    zKey="surface.primary.fuel.model.catalogKey"
  />
  <!-- <MultiLinePage -->
  <!--   data={$_output} -->
  <!--   xKey="site.moisture.dead.category" -->
  <!--   yKey="surface.weighted.fire.spreadRate" -->
  <!--   zKey="surface.primary.fuel.model.catalogKey" -->
  <!-- /> -->
</div>
<section class="space-y-1">
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
