<script>
  import { run } from 'svelte/legacy';

  import { randomInt } from "d3-random";
  import { Select, Label, Badge, Heading } from "flowbite-svelte";
  import MultiSelect from "$lib/components/ui/MultiSelect.svelte";
  import Auth from "$lib/components/Auth.svelte";
  import UKFuels from "$lib/data/UKFuels.json";
  import {
    modelConfigValues,
    requiredConfig,
    selectedFuels,
  } from "$lib/shared/stores/modelStore.js";
  import MultiLinePage from "$lib/components/visual/MultiLinePage.svelte";
  import FireCharacteristics from "$lib/components/visual/FireCharacteristics.svelte";
  import { authStore } from "$lib/shared/stores/authStore";
  import AuthReset from "$lib/components/auth/AuthReset.svelte";

  let email = $state();

  let w = $state();
  const selectOptions = [];
  for (const [key, value] of Object.entries(UKFuels)) {
    selectOptions.push({ name: key + ": " + value.label, value: key });
  }

  authStore.subscribe((curr) => {
    email = curr?.currentUser?.email;
  });

  function configOptions(configKey) {
    const options = [];
    $modelConfigValues[configKey].options.forEach((element) => {
      options.push({ name: element });
    });
    return options;
  }

  const generator = randomInt(50, 100);
  run(() => {
    console.log("rand into, ", generator(100));
  });
</script>

{#if $authStore.currentUser}
  <heading class="p-8" tag="h1" customSize="text-3xl"
    >Private page user: {email}
  </heading>
  <AuthReset />
{:else}
  <Heading>Loading....</Heading>
{/if}

<section class="pb-5">
  <heading class="p-8" tag="h1" customSize="text-3xl"
    >Select fuel models</heading
  >
  <div>
    <MultiSelect
      items={selectOptions}
      bind:value={$selectedFuels}
      
      
    >
      {#snippet children({ item, clear })}
            <Badge
          dismissable={$selectedFuels.length > 1}
          params={{ duration: 100 }}
          on:close={clear}
        >
          {item.name}
        </Badge>
                {/snippet}
        </MultiSelect>
  </div>
</section>
<div></div>
<div class="w-full aspect-square container" bind:clientWidth={w}>
  <FireCharacteristics
    parentWidth={w}
    data={$_output}
    xKey="surface.weighted.fire.heatPerUnitArea"
    yKey="surface.weighted.fire.spreadRate"
    zKey="surface.primary.fuel.model.catalogKey"
  />
  <MultiLinePage
    data={$_output}
    xKey="site.moisture.dead.category"
    yKey="surface.weighted.fire.spreadRate"
    zKey="surface.primary.fuel.model.catalogKey"
  />
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
