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

<div class="w-full text-center pt-4 mt-6">Historical Weather</div>
<div class="flex flex-row pt-2 pb-2 justify-center space-x-2">
  <div class="min-w-20">
    <Select
      id="select-year"
      size="sm"
      items={$yearsOptions}
      bind:value={$historicalYear}
      placeholder="Year"
    />
  </div>
  {#if $historicalYear}
    <div class="w-24">
      <Select
        id="select-month"
        size="sm"
        items={$monthOptions}
        bind:value={$historicalMonth}
        placeholder="Month"
      />
    </div>
  {/if}
  {#if typeof $historicalMonth === "number"}
    <div class="w-16">
      <Select
        id="select-day"
        size="sm"
        items={$dayOptions}
        bind:value={$historicalDay}
        placeholder="Day"
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
      onclick={() => fetchHistoricalForecast()}>Retrieve</Button
    >
  </div>
</div>
