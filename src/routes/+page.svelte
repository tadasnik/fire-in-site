<script>
  import { Select, Label, MultiSelect, Badge } from "flowbite-svelte";

  import UKFuels from "$lib/data/UKFuels.json";
  import {
    selectedOutputs,
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
    _inputs,
    _output,
    displayDataset,
  } from "$lib/shared/stores/modelStore.js";
  import MultiLinePage from "$lib/components/visual/MultiLinePage.svelte";
  import { outputNodes } from "$lib/data/outputNodes.js";
  import MultiLine from "$lib/components/visual/MultiLine.svelte";

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

  $: console.log($selectedOutputs);
  // $: console.log('fuelInputs', $fuelInputs['gs3']);
  // $: console.log("requiredeFuelInputs", $requiredFuelInputs);

  $: console.log(
    "outputs",
    $_output
    // $_output[$selectedFuels[0]].get("Surface Weighted Fire Spread Rate")
  );

  $: console.log("modelConfigValues", $modelConfigValues);
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
