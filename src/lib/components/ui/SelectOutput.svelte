<script>
  import { ButtonGroup, Button, Select, Modal } from "flowbite-svelte";
  import { QuestionCircleOutline } from "flowbite-svelte-icons";
  import {
    selectedOutput,
    selectedOutputs,
  } from "$lib/shared/stores/modelStore";
  import { outputNodes } from "$lib/data/outputNodes.js";
  $: outputs = [...$selectedOutputs, "crown.fire.transition.minBaseHeight"];
  // $: console.log(outputNodes);
  export let clickOutsideModal;
  function showDescription() {}
</script>

<div>
  <ButtonGroup class="*:ring-primary-700!">
    <Select
      id="select-output"
      class=" rounded-none rounded-l-lg"
      size="sm"
      bind:value={$selectedOutput}
    >
      {#each outputs as output}
        <option value={output}
          >{outputNodes[output].label}
          ({outputNodes[output].displayUnits})</option
        >
      {/each}
    </Select>
    <Button on:click={() => (clickOutsideModal = true)}
      ><QuestionCircleOutline></QuestionCircleOutline></Button
    >
  </ButtonGroup>
</div>
<Modal
  title={outputNodes[$selectedOutput].label}
  bind:open={clickOutsideModal}
  autoclose
  outsideclose
  class="overflow"
>
  <div class="text-left">
    <p>{outputNodes[$selectedOutput].description}</p>
  </div>
</Modal>
