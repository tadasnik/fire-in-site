<script>
  import { Select, Button, Popover, Label, Spinner } from "flowbite-svelte";

  import {
    dateTime,
    currentDateTime,
    historicalYear,
    historicalMonth,
    historicalDay,
    historicalDate,
    focusDay,
    timeMode,
    yearsOptions,
    monthOptions,
    dayOptions,
  } from "$lib/shared/stores/timeStore.js";
  import {
    getForecastOpenMeteo,
    fetchingForecast,
  } from "$lib/shared/stores/forecastStore.js";
  import CurrentBehaviour from "./CurrentBehaviour.svelte";

  function fetchHistoricalForecast() {
    $fetchingForecast = true;
    let dateTime = new Date(
      $historicalYear,
      $historicalMonth - 1,
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

<div class="w-full text-center pt-4 mt-6">Historical Weather</div>
<div class="flex flex-row pt-2 justify-center space-x-2">
  <div>
    <Select
      id="select-year"
      size="sm"
      items={$yearsOptions}
      bind:value={$historicalYear}
      placeholder="Select year"
    />
  </div>
  {#if $historicalYear}
    <div>
      <Select
        id="select-month"
        size="sm"
        items={$monthOptions}
        bind:value={$historicalMonth}
        placeholder="Select month"
      />
    </div>
  {/if}
  {#if $historicalYear && $historicalMonth}
    <div>
      <Select
        id="select-day"
        size="sm"
        items={$dayOptions}
        bind:value={$historicalDay}
        placeholder="Select day"
      />
    </div>
  {/if}
  <div>
    <Button
      size="sm"
      disabled={$historicalYear &&
      $historicalMonth &&
      $historicalDay &&
      $historicalDate
        ? false
        : true}
      on:click={() => fetchHistoricalForecast()}>Retrieve</Button
    >
  </div>
</div>
