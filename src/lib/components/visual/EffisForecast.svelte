<script>
  import { currentLocation } from '$lib/shared/stores/locationStore';
  import { forecastMode } from '$lib/shared/stores/forecastStore';
  import { focusDay } from '$lib/shared/stores/timeStore';
  import { createEffisStore } from '$lib/shared/stores/effisStore.js';
  import { canadianIndices, dayKey } from '$lib/weather/effis.js';

  const effis = createEffisStore();
  const dateFormat = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
  });
  let refresh = $state(0);
  const selectedDate = $derived(dayKey($focusDay));
  const selected = $derived($effis.data?.days.find((day) => day.date === selectedDate));
  const hasValues = $derived(selected && canadianIndices.some(({ key }) => selected[key] !== null));

  $effect(() => {
    const { latitude, longitude, userLocation } = $currentLocation;
    const mode = $forecastMode;
    refresh;
    if (mode === 'forecast' && userLocation) void effis.load(latitude, longitude);
    else effis.reset();
    return () => effis.reset();
  });

  function formatDate(date) {
    return dateFormat.format(new Date(`${date}T00:00:00Z`));
  }

  function formatValue(value) {
    return value == null ? '—' : value.toFixed(1);
  }
</script>

{#if $forecastMode === 'forecast'}
  <section
    class="workspace-section effis-card text-gray-800 dark:text-gray-100"
    aria-labelledby="effis-heading"
    aria-busy={$effis.status === 'loading'}
  >
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div>
        <h2 id="effis-heading" class="section-title">Canadian fire weather indices</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">EFFIS · ECMWF · daily · approximately 8 km</p>
      </div>
      <button
        type="button"
        class="button-secondary"
        disabled={$effis.status === 'loading' || !$currentLocation.userLocation}
        onclick={() => refresh += 1}
      >{$effis.status === 'error' ? 'Retry' : 'Refresh'}</button>
    </div>

    <div aria-live="polite" class="mt-3">
      {#if $effis.status === 'idle'}
        <p class="text-sm">Select a location to load its daily fire danger forecast.</p>
      {:else if $effis.status === 'loading'}
        <p class="text-sm text-gray-500 dark:text-gray-400">Loading EFFIS fire danger forecast…</p>
      {:else if $effis.status === 'error'}
        <p class="text-sm">EFFIS fire danger forecasts are temporarily unavailable. Please try again.</p>
      {:else}
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <h3 class="text-sm font-medium">{formatDate(selectedDate)}</h3>
          {#if selected?.danger}
            <span class="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1 text-sm dark:border-gray-500">
              <span class="h-3 w-3 rounded-full border border-gray-500" style:background-color={selected.danger.color}></span>
              {selected.danger.label} fire danger
            </span>
          {/if}
        </div>
        {#if hasValues}
          <dl class="effis-values">
            {#each canadianIndices as index}
              <div class="effis-value" title={index.description}>
                <dt class="text-sm font-semibold">{index.label}</dt>
                <dd class="my-1 text-xl tabular-nums">{formatValue(selected[index.key])}</dd>
                <dd class="text-xs text-gray-500 dark:text-gray-300">{index.name}</dd>
              </div>
            {/each}
          </dl>
        {:else}
          <p class="text-sm">No EFFIS forecast is available for this location on {formatDate(selectedDate)}.</p>
        {/if}

        {#if $effis.data.days.some((day) => canadianIndices.some(({ key }) => day[key] !== null))}
          <details class="mt-4">
            <summary class="cursor-pointer text-sm font-medium">Daily forecast and index guide</summary>
            <div class="mt-2 overflow-x-auto">
              <table class="w-full text-left text-sm tabular-nums">
                <caption class="sr-only">Daily EFFIS indices for the selected location; a dash means no data.</caption>
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-600">
                    <th scope="col" class="p-2">Date</th>
                    {#each canadianIndices as index}
                      <th scope="col" class="p-2" title={index.name}>{index.label}</th>
                    {/each}
                    <th scope="col" class="p-2">Danger</th>
                  </tr>
                </thead>
                <tbody>
                  {#each $effis.data.days as day}
                    <tr class="border-b border-gray-100 dark:border-gray-700" class:font-semibold={day.date === selectedDate}>
                      <th scope="row" class="whitespace-nowrap p-2">{formatDate(day.date)}</th>
                      {#each canadianIndices as index}
                        <td class="p-2">{formatValue(day[index.key])}</td>
                      {/each}
                      <td class="whitespace-nowrap p-2">{day.danger?.label ?? '—'}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
            <dl class="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-300">
              {#each canadianIndices as index}
                <div><dt class="inline font-semibold">{index.label}: </dt><dd class="inline">{index.description}</dd></div>
              {/each}
            </dl>
          </details>
        {/if}
        <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Retrieved {new Date($effis.data.retrievedAt).toLocaleString('en-GB')}.
          Coordinates {$effis.data.latitude.toFixed(3)}, {$effis.data.longitude.toFixed(3)}.
          — means no data.
        </p>
      {/if}
    </div>

    <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
      Regional daily fire weather context; independent of the selected fuel, terrain and FireInSite weather model.
      Select a day above to compare with the hourly fire behaviour forecast.
      <a class="underline" href="https://forest-fire.emergency.copernicus.eu/about-effis/technical-background/fire-danger-forecast" target="_blank" rel="noreferrer">Source: © European Union, Copernicus Emergency Management Service / EFFIS</a>
      (<a class="underline" href="https://forest-fire.emergency.copernicus.eu/about-effis/data-license" target="_blank" rel="noreferrer">CC BY 4.0</a>); values rounded for display.
    </p>
  </section>
{/if}
