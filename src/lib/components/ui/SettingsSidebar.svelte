<script>
  import { onMount } from 'svelte';
  import { AdjustmentsHorizontalSolid, CloseOutline } from 'flowbite-svelte-icons';
  import ModelSettings from './ModelSettings.svelte';
  import { forecastModel, forecastModels, forecastMode } from '$lib/shared/stores/forecastStore';
  import { fuelMoistureModel } from '$lib/shared/stores/modelStore';

  let wide = $state(false);
  let drawer;
  let open = $state(false);
  const weatherLabel = $derived($forecastMode === 'historical' ? 'ERA5 reanalysis' : $forecastModels.find(model => model.value === $forecastModel)?.displayName);
  const moistureLabel = $derived($fuelMoistureModel === 'Nelson' ? 'SimpleFFMC' : $fuelMoistureModel === 'fireInSite' ? 'FireInSite' : $fuelMoistureModel);

  onMount(() => {
    const media = window.matchMedia('(min-width: 1280px)');
    function update() {
      if (media.matches) {
        if (drawer?.open) drawer.close();
        open = false;
      }
      wide = media.matches;
    }
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  });

  function showSettings() {
    drawer.showModal();
    open = true;
  }
</script>

{#snippet content()}
  <ModelSettings />
{/snippet}

<div class="settings-slot">
  {#if wide}
    <aside class="settings-sidebar workspace-section" aria-labelledby="settings-heading">
      <div class="settings-panel-heading">
        <h2 id="settings-heading" class="section-title">Model settings</h2>
        <p class="control-help">Changes apply automatically.</p>
      </div>
      {@render content()}
    </aside>
  {:else}
    <div class="settings-mobile-bar">
      <div class="min-w-0 text-sm">
        <span class="block font-medium text-gray-800 dark:text-gray-100">{weatherLabel}</span>
        <span class="text-xs text-gray-500 dark:text-gray-400">{moistureLabel} moisture</span>
      </div>
      <button type="button" class="button-secondary shrink-0" aria-haspopup="dialog" aria-controls="model-settings-drawer" aria-expanded={open} onclick={showSettings}>
        <AdjustmentsHorizontalSolid class="h-4 w-4" /> Model settings
      </button>
    </div>
    <dialog id="model-settings-drawer" class="settings-drawer" aria-labelledby="drawer-heading" bind:this={drawer} onclose={() => open = false}>
      <div class="settings-drawer-header">
        <h2 class="section-title" id="drawer-heading">Model settings</h2>
        <button type="button" class="button-icon" aria-label="Close model settings" onclick={() => drawer.close()}><CloseOutline class="h-5 w-5" /></button>
      </div>
      <div class="settings-drawer-body">{@render content()}</div>
      <div class="settings-drawer-footer"><button type="button" class="button-primary w-full" onclick={() => drawer.close()}>Done</button></div>
    </dialog>
  {/if}
</div>
