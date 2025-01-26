<script>
  import { Select } from "flowbite-svelte";
  import {
    selectedOutput,
    selectedOutputs,
  } from "$lib/shared/stores/modelStore";
  import { outputNodes } from "$lib/data/outputNodes.js";
  $: outputs = [...$selectedOutputs, "crown.fire.transition.minBaseHeight"];
</script>

<div>
  <Select id="select-output" size="sm" bind:value={$selectedOutput}>
    {#each outputs as output}
      <option value={output}
        >{outputNodes[output].label}
        ({outputNodes[output].displayUnits})</option
      >
    {/each}
  </Select>
</div>
