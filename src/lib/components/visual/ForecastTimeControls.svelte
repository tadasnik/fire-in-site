<script>
  import { currentDateTime, dateTime, focusDay, forecastUtcOffset, timeMode } from '$lib/shared/stores/timeStore';
  import { forecastMode, forecastOpenMeteo, forecastDataMode, fetchingForecast } from '$lib/shared/stores/forecastStore';
  import { availableHours, localHour, instantForLocalHour, HOUR_MS } from '$lib/shared/forecastTime.js';
  import DayPicker from './DayPicker.svelte';
  import HistoricalSelectDate from './HistoricalSelectDate.svelte';

  const dateFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  const ready = $derived($forecastDataMode === $forecastMode && !$fetchingForecast && $forecastOpenMeteo.time.length > 1);
  const hours = $derived(ready ? availableHours($forecastOpenMeteo.time, $focusDay) : []);
  const hour = $derived(localHour($dateTime, $forecastUtcOffset));
  const nowAvailable = $derived($forecastOpenMeteo.time.includes(Math.floor(Date.now() / HOUR_MS) * HOUR_MS + $forecastUtcOffset * 1000));
  const offset = $derived($forecastUtcOffset / 3600);
  const zoneLabel = $derived(`Location time · UTC${offset >= 0 ? '+' : '−'}${Math.abs(offset)}`);

  function selectHour(value) {
    timeMode.set('user');
    currentDateTime.set(instantForLocalHour($focusDay, value, $forecastUtcOffset));
  }

  function selectNow() {
    timeMode.set('user');
    currentDateTime.set(new Date(Math.floor(Date.now() / HOUR_MS) * HOUR_MS));
  }
</script>

<section class="workspace-section time-controls" aria-labelledby="time-controls-heading">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <div>
      <h2 id="time-controls-heading" class="section-title">{$forecastMode === 'historical' ? 'Historical weather' : 'Forecast time'}</h2>
    </div>
    {#if ready}
      <div class="time-selection">
        <label class="control-label mb-0" for="forecast-hour">Hour</label>
        <select id="forecast-hour" class="control-input hour-select" value={hour} disabled={!hours.length} onchange={(e) => selectHour(e.currentTarget.value)}>
          {#each hours as value}<option value={value}>{String(value).padStart(2, '0')}:00</option>{/each}
        </select>
        {#if $forecastMode === 'forecast'}<button type="button" class="button-secondary" disabled={!nowAvailable} onclick={selectNow}>Now</button>{/if}
      </div>
    {/if}
  </div>
  {#if $forecastMode === 'historical'}<HistoricalSelectDate />{/if}
  {#if ready}
    {#if $forecastMode === 'forecast'}<DayPicker />{/if}
    <p class="mt-2 text-xs text-gray-600 dark:text-gray-300">
      <span class="font-medium text-gray-900 dark:text-gray-100">{dateFormat.format($focusDay)} · {String(hour).padStart(2, '0')}:00</span>
      <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">{zoneLabel}</span>
    </p>
  {:else if $fetchingForecast}
    <p class="mt-4 text-sm text-gray-500" role="status">Loading forecast times…</p>
  {:else if $forecastMode === 'forecast'}
    <p class="mt-4 text-sm text-gray-500">Forecast times will appear when weather data is available.</p>
  {/if}
</section>
