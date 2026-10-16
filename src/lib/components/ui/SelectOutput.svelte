<script>
  import { Modal } from 'flowbite-svelte';
  import { QuestionCircleOutline } from 'flowbite-svelte-icons';
  import { selectedOutput, selectedOutputs } from '$lib/shared/stores/modelStore';
  import { outputNodes } from '$lib/data/outputNodes.js';
  let outputs = $derived([...$selectedOutputs, 'crown.fire.transition.minBaseHeight']);
  let { clickOutsideModal = $bindable(false) } = $props();
</script>

<div>
  <label class="sr-only" for="select-output">Model output</label>
  <div class="flex items-center gap-2">
    <select id="select-output" class="control-input min-w-0" bind:value={$selectedOutput}>
      {#each outputs as output}
        <option value={output}>{outputNodes[output].label} ({outputNodes[output].displayUnits})</option>
      {/each}
    </select>
    <button type="button" class="button-icon" aria-label="About the selected model output" onclick={() => clickOutsideModal = true}>
      <QuestionCircleOutline class="h-5 w-5" />
    </button>
  </div>
</div>
<Modal title={outputNodes[$selectedOutput].label} bind:open={clickOutsideModal} autoclose outsideclose>
  <p>{outputNodes[$selectedOutput].description}</p>
</Modal>
