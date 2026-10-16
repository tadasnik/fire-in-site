<script>
  import { onMount } from 'svelte';
  import { Spinner } from 'flowbite-svelte';
  import Map from '$lib/components/ui/Map.svelte';
  import SettingsSidebar from '$lib/components/ui/SettingsSidebar.svelte';
  import ForecastTimeControls from '$lib/components/visual/ForecastTimeControls.svelte';
  import { selectedOutput, chartType, selectedFuels, commonOutputs, fuelMoistureModel } from '$lib/shared/stores/modelStore.js';
  import { preloadDeadFFMC } from '$lib/model/fireInSiteFFMC';
  import { preloadLfmc } from '$lib/model/lfmcModel';
  import { preloadCuring } from '$lib/model/curingModel';
  import { forecastOpenMeteo, forecastMode, fetchingForecast, forecastDataMode, daysInForecast } from '$lib/shared/stores/forecastStore.js';
  import { changedHistoricalDate } from '$lib/shared/stores/timeStore.js';
  import CurrentBehaviour from '$lib/components/visual/CurrentBehaviour.svelte';
  import WeatherLine from '$lib/components/visual/WeatherLine.svelte';
  import EffisForecast from '$lib/components/visual/EffisForecast.svelte';
  import WeatherMeteogram from '$lib/components/visual/forecast/WeatherMeteogram.svelte';
  import FuelDayForecast from '$lib/components/visual/forecast/FuelDayForecast.svelte';
  import { dateTime, forecastUtcOffset, focusDay } from '$lib/shared/stores/timeStore';
  import { dateText, daylightSegments } from '$lib/shared/dayForecast.js';
  import { localHour } from '$lib/shared/forecastTime.js';
  import SelectOutput from '$lib/components/ui/SelectOutput.svelte';
  import UserInputControls from '$lib/components/ui/UserInputControls.svelte';
  import LocationSearch from '$lib/components/ui/LocationSearch.svelte';

  let { forecastHeading } = $props();
  let showMap = $state(false);
  let forecastView = $state('day');
  let timeline = $state();
  const multiday = $derived($forecastMode === 'forecast' && forecastView === 'multiday');
  const hasDaylight = $derived(daylightSegments($forecastOpenMeteo, rangeStart, Number(rangeStart) + (multiday ? 5 : 1) * 86400000).length > 0);
  const rangeStart = $derived(multiday ? ($daysInForecast[0] ?? $focusDay) : $focusDay);
  const ready = $derived(!$fetchingForecast && $forecastDataMode === $forecastMode);
  const dayReady = $derived(ready && ($forecastMode === 'forecast' || $changedHistoricalDate));
  const selectedHour = $derived(String(localHour($dateTime, $forecastUtcOffset)).padStart(2, '0') + ':00');
  const chartHeight = $derived($chartType === 'bars' && !($commonOutputs.includes($selectedOutput) && $fuelMoistureModel !== 'fireInSite')
    ? Math.max(340, $selectedFuels.length * 26 + 40) : 360);
  $effect(() => {
    const mode = multiday;
    timeline?.scrollTo({ left: 0 });
  });
  onMount(() => {
    preloadDeadFFMC();
    preloadLfmc();
    preloadCuring();
  });
</script>

<div class="forecast-workspace">
  <SettingsSidebar />
  <div class="workspace-main">
    <section class="workspace-section location-card" aria-label="Forecast location">
      <div class="location-toolbar">
        <div class="location-search-controls">
          <div class="location-search-field">
            <label for="location-search" class="sr-only">Forecast location</label>
            <LocationSearch />
          </div>
          <button type="button" class="button-secondary shrink-0" aria-expanded={showMap} aria-controls="location-map-panel" onclick={() => showMap = !showMap}>
            {showMap ? 'Hide map' : 'Show map'}
          </button>
        </div>
      </div>
      <div id="location-map-panel" class="location-map-panel" role="region" aria-label="Location map" hidden={!showMap}>
        {#if showMap}<Map />{/if}
      </div>
    </section>

    {#if $forecastMode !== 'user'}<ForecastTimeControls />{/if}

    {#if $forecastMode !== 'user'}
      <section class="workspace-section day-forecast" aria-labelledby="behaviour-heading" aria-busy={$fetchingForecast}>
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
          {@render forecastHeading()}
          {#if $forecastMode === 'forecast'}
            <div class="chart-view-switch" role="group" aria-label="Forecast view">
              <button type="button" class:active={forecastView === 'day'} aria-pressed={forecastView === 'day'} onclick={() => forecastView = 'day'}>Day</button>
              <button type="button" class:active={forecastView === 'multiday'} aria-pressed={forecastView === 'multiday'} onclick={() => forecastView = 'multiday'}>5 days</button>
            </div>
          {/if}
        </div>
        <p class="control-help mb-2">{multiday ? 'Three-hour intervals start at the labelled hour. Weather curves show conditions at their timestamps; rain totals and gust maxima cover each interval. Fuel cells retain the maximum of its three hourly predictions.' : 'Explore the whole day. Select an hour for a detailed fuel comparison below.'}</p>
        {#if dayReady}
          {#if hasDaylight}
            <p class="daylight-legend control-help mb-2" title="Daylight boundaries use Open-Meteo sunrise and sunset timestamps.">
              <span class="daylight-key"></span> Daylight <span class="night-key"></span> Night <span class="text-gray-400">· sunrise / sunset from Open-Meteo</span>
            </p>
          {/if}
          <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to focus and scroll the shared forecast timeline.) -->
          <div class="day-forecast-scroll" bind:this={timeline} role="region" aria-label="Daily weather and fuel forecasts" tabindex="0">
            <div class="day-forecast-content" class:multiday>
              <h2 class="day-forecast-heading section-title" id="hourly-weather-heading">{multiday ? 'Weather · 3-hourly' : 'Hourly weather'}</h2>
              <WeatherMeteogram start={rangeStart} {multiday} />
              <div class="day-fuels-heading">
                <h2 class="section-title" id="fuel-forecast-heading">{multiday ? 'Fire behaviour · 3-hour maxima' : 'Fire behaviour by fuel'}</h2>
                <div class="day-output-select"><SelectOutput /></div>
              </div>
              <FuelDayForecast start={rangeStart} {multiday} />
            </div>
          </div>
        {:else if $fetchingForecast}
          <div class="forecast-placeholder" role="status"><Spinner size={6} /><span>Loading daily forecast…</span></div>
        {:else}
          <p class="control-help">{$forecastMode === 'historical' ? 'Choose a date and retrieve historical weather to see the daily forecast.' : 'Choose a location and load weather to see the daily forecast.'}</p>
        {/if}
      </section>
    {/if}

    {#snippet hourComparison()}
      <div class="flex flex-wrap items-start justify-between gap-3">
        <h2 class="section-title">{$forecastMode === 'user' ? 'Fire behaviour' : `Fuel comparison · ${selectedHour}`}</h2>
        <div class="chart-view-switch" role="group" aria-label="Chart view">
          <button type="button" class:active={$chartType === 'bars'} aria-pressed={$chartType === 'bars'} onclick={() => chartType.set('bars')}>Bars</button>
          <button type="button" class:active={$chartType === 'fireChar'} aria-pressed={$chartType === 'fireChar'} onclick={() => chartType.set('fireChar')}>Characteristics</button>
        </div>
      </div>
      {#if $forecastMode === 'user'}<div class="mt-2"><SelectOutput /></div>{/if}
      {#if ready && $forecastMode !== 'user'}
        <div class="weather-context"><WeatherLine data={$forecastOpenMeteo} /></div>
      {/if}
      <div class="behaviour-chart-frame" style:height="{chartHeight}px" aria-busy={$fetchingForecast}>
        {#if ready || $forecastMode === 'user'}
          <CurrentBehaviour />
        {:else if $fetchingForecast}
          <div class="forecast-placeholder" role="status"><Spinner size={6} /><span>Loading fire behaviour…</span></div>
        {:else}
          <div class="forecast-placeholder">Choose a location and load weather to see fire behaviour.</div>
        {/if}
      </div>
      {#if $forecastMode === 'user'}<UserInputControls />{/if}
    {/snippet}

    {#if $forecastMode === 'user'}
      <section class="workspace-section behaviour-card">
        <div class="mb-2">{@render forecastHeading()}</div>
        {@render hourComparison()}
      </section>
    {:else}
      <details class="hour-comparison workspace-section">
        <summary>Selected hour details · {multiday ? dateText($focusDay) + ' · ' : ''}{selectedHour}</summary>
        <div class="pt-3">{@render hourComparison()}</div>
      </details>
      <EffisForecast />
    {/if}
  </div>
</div>
