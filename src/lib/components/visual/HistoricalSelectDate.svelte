<script>
  import { Select, Button, Popover, Label, Spinner, P } from "flowbite-svelte";

  import {
    currentDateTime,
    historicalYear,
    historicalMonth,
    historicalDay,
    historicalDate,
    yearsOptions,
    monthOptions,
    dayOptions,
  } from "$lib/shared/stores/timeStore.js";
  import {
    getForecastOpenMeteo,
    fetchingForecast,
  } from "$lib/shared/stores/forecastStore.js";

  function fetchHistoricalForecast() {
    $fetchingForecast = true;
    let dateTime = new Date(
      $historicalYear,
      $historicalMonth,
      $historicalDay,
      12,
    );
    currentDateTime.set(dateTime);
    console.log(
      "Calling fetch forecast from handle historical, currentdateTime ",
      $currentDateTime,
      dateTime,
    );
    getForecastOpenMeteo();
  }
</script>

<div class="mt-4 flex flex-wrap items-end gap-3">
  <div class="min-w-24 flex-1">
    <label class="control-label" for="select-year">Year</label>
    <select id="select-year" class="control-input" bind:value={$historicalYear}>
      <option value={undefined} disabled>Year</option>
      {#each $yearsOptions as option}<option value={option.value}>{option.name}</option>{/each}
    </select>
  </div>
  <div class="min-w-28 flex-1">
    <label class="control-label" for="select-month">Month</label>
    <select id="select-month" class="control-input" bind:value={$historicalMonth} disabled={!$historicalYear}>
      <option value={undefined} disabled>Month</option>
      {#each $monthOptions || [] as option}<option value={option.value}>{option.name}</option>{/each}
    </select>
  </div>
  <div class="min-w-20 flex-1">
    <label class="control-label" for="select-day">Day</label>
    <select id="select-day" class="control-input" bind:value={$historicalDay} disabled={typeof $historicalMonth !== 'number'}>
      <option value={undefined} disabled>Day</option>
      {#each $dayOptions as option}<option value={option.value}>{option.name}</option>{/each}
    </select>
  </div>
  <button type="button" class="button-primary" disabled={!($historicalYear && typeof $historicalMonth === 'number' && $historicalDay && $historicalDate)} onclick={fetchHistoricalForecast}>Retrieve</button>
</div>
