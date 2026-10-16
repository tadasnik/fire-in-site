<script>
  import {
    fuelMoistureModel, modelConfigValues, grassCuringMode, liveMoistureMode,
    selectedOutput,
  } from '$lib/shared/stores/modelStore';
  import {
    forecastMode, forecastModel, forecastModels, fetchingForecast, getForecastOpenMeteo,
  } from '$lib/shared/stores/forecastStore';
  import { currentDateTime, historicalYear, historicalMonth, historicalDay } from '$lib/shared/stores/timeStore';
  import CanopyControls from './CanopyControls.svelte';

  function changeMode(value) {
    forecastMode.set(value);
    if (value === 'forecast') {
      currentDateTime.set(new Date());
      historicalYear.set(undefined);
      historicalMonth.set(undefined);
      historicalDay.set(undefined);
      void getForecastOpenMeteo();
    } else fetchingForecast.set(false);
  }

  function changeMoisture(value) {
    fuelMoistureModel.set(value);
    modelConfigValues.update(config => {
      if (value === 'Fosberg') config['configure.fuel.moisture'].value = 'fosberg';
      else if (config['configure.fuel.moisture'].value === 'fosberg') config['configure.fuel.moisture'].value = 'category';
      return config;
    });
  }
</script>

<div class="model-settings">
  <div class="settings-group">
    <label class="control-label" for="weather-mode">Weather mode</label>
    <select id="weather-mode" class="control-input" value={$forecastMode} onchange={(e) => changeMode(e.currentTarget.value)}>
      <option value="forecast">Forecast</option>
      <option value="historical">Historical weather</option>
    </select>
    {#if $forecastMode === 'forecast'}
      <label class="control-label mt-4" for="weather-model">Forecast model</label>
      <select id="weather-model" class="control-input" bind:value={$forecastModel} onchange={() => getForecastOpenMeteo()} aria-describedby="weather-model-help">
        {#each $forecastModels as model}
          <option value={model.value}>{model.displayName}</option>
        {/each}
      </select>
      <p id="weather-model-help" class="control-help">{$forecastModels.find(model => model.value === $forecastModel)?.description}</p>
    {:else}
      <p class="control-help">ERA5 reanalysis. Choose a date in the time controls to retrieve historical weather.</p>
    {/if}
  </div>

  <div class="settings-group">
    <label class="control-label" for="dead-moisture-model">Dead fuel moisture</label>
    <select id="dead-moisture-model" class="control-input" value={$fuelMoistureModel} onchange={(e) => changeMoisture(e.currentTarget.value)} aria-describedby="dead-moisture-help">
      <option value="fireInSite">FireInSite</option>
      <option value="Nelson">SimpleFFMC (Nelson)</option>
      <option value="Fosberg">Fosberg</option>
    </select>
    <p id="dead-moisture-help" class="control-help">
      {$fuelMoistureModel === 'fireInSite' ? 'Fuel-specific moisture estimates developed for UK vegetation.' : $fuelMoistureModel === 'Nelson' ? 'A simplified Nelson dead fuel moisture model.' : 'Equilibrium fuel moisture from temperature and humidity.'}
    </p>

    <label class="control-label mt-4" for="live-moisture-model">Live fuel moisture</label>
    <select id="live-moisture-model" class="control-input" bind:value={$liveMoistureMode} aria-describedby="live-moisture-help">
      <option value="lfmc">Weather-driven model</option>
      <option value="climatology">Monthly climatology</option>
    </select>
    <p id="live-moisture-help" class="control-help">{$liveMoistureMode === 'lfmc' ? 'Uses recent weather for grass, gorse, heather and bracken.' : 'Uses the monthly live moisture table.'}</p>
  </div>

  <div class="settings-group">
    <label class="control-label" for="grass-curing-model">Grass curing</label>
    <select id="grass-curing-model" class="control-input" bind:value={$grassCuringMode} aria-describedby="grass-curing-help">
      <option value="phenology">Phenology model</option>
      <option value="climatology">Monthly climatology</option>
    </select>
    <p id="grass-curing-help" class="control-help">{$grassCuringMode === 'phenology' ? 'Estimates curing from day length and recent weather.' : 'Uses the monthly grass curing table.'}</p>
    {#if $selectedOutput === 'crown.fire.transition.minBaseHeight'}
      <div class="mt-4">
        <h4 class="control-label">Canopy inputs</h4>
        <CanopyControls />
      </div>
    {/if}
  </div>

</div>
