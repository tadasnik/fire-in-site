<script>
  import { Button, Spinner } from "flowbite-svelte";
  import {
    subDays,
    subYears,
    startOfYear,
    fromUnixTime,
    getDayOfYear,
    format,
    parse,
  } from "date-fns";
  // import { tz } from "@date-fns/tz";
  import {
    forecastMode,
    fetchingForecast,
    getHistory,
    climateOpenMeteo,
    fillParams,
  } from "$lib/shared/stores/forecastStore";
  import { fetchForecastMeteo } from "$lib/weather/openMeteo.ts";
  import { currentLocation } from "$lib/shared/stores/locationStore";
  import Spiral from "$lib/components/visual/spiral/Spiral.svelte";
  import ColorbarAxisX from "$lib/components/visual/spiral/ColorbarAxisX.svelte";

  let daily = {};
  let fetchingHistory = true;
  let w, h;
  let margin = 20;
  let weatherVar = "vapour_pressure_deficit";
  // function dailyMaxGrouped(data, propToCalc, timeZone) {
  //   const formattedData = data.time.map((timestamp, index) => {
  //     // console.log("timestamp", timestamp, timeZone);
  //     const formattedDate = format(fromUnixTime(timestamp), "yyyy-MM-dd", {
  //       in: timeZone,
  //     });
  //     // const formattedDate = format(dateInZone, "yyyy-MM-dd", { timeZone });
  //     return { date: formattedDate, propToCalc: data[propToCalc][index] };
  //   });
  //
  //   const groupedByDate = formattedData.reduce((acc, curr) => {
  //     acc[curr.date] = acc[curr.date] || [];
  //     acc[curr.date].push(curr[propToCalc]);
  //     return acc;
  //   }, {});
  //
  //   // Calculate the maximum temperature for each date
  //   const maxValues = Object.keys(groupedByDate).map((date) => {
  //     const temperatures = groupedByDate[date];
  //     const maxVal = Math.max(...temperatures);
  //     return { date, maxProp: maxVal };
  //   });
  //   console.log(maxValues);
  //   return maxValues;
  // }

  function getDailyMaxMin(data, propToCalc, timeZone) {
    console.log("propToCalc = ", propToCalc);
    const dailyTemps = {};
    data.time.forEach((timestamp, index) => {
      // const zonedDate = fromUnixTime(timestamp);
      // timestamp to seconds
      const date = format(fromUnixTime(timestamp * 0.001), "yyyy-MM-dd");
      // const date = format(zonedDate, "yyyy-MM-dd");
      // console.log(date);
      const value = data[propToCalc][index];

      // Initialize or update daily max temperature
      if (!dailyTemps[date] || dailyTemps[date] < value) {
        dailyTemps[date] = value;
      }
    });
    const dailyArray = [];
    for (const [key, value] of Object.entries(dailyTemps)) {
      const parsedDate = parse(key, "yyyy-MM-dd", new Date());
      dailyArray.push({
        date: Math.floor(parsedDate.getTime()),
        [propToCalc]: value,
        doy: getDayOfYear(parsedDate),
      });
    }
    return dailyArray;
  }

  function getSortedValuesByProperty(array, property) {
    return array
      .slice()
      .sort((a, b) => a[property] - b[property])
      .map((obj) => obj[property]);
  }

  function mergeObjects(obj1, obj2) {
    const merged = {};

    // Iterate through properties of both objects
    for (const key of new Set([...Object.keys(obj1), ...Object.keys(obj2)])) {
      merged[key] = [
        ...(obj1[key] || []), // Add array from obj1 if exists, otherwise empty array
        ...(obj2[key] || []), // Add array from obj2 if exists, otherwise empty array
      ];
    }

    return merged;
  }
  async function getClimate() {
    const endDate = format(subDays(new Date(), 6), "yyyy-MM-dd");
    const startDate = format(
      startOfYear(subYears(startOfYear(new Date()), 10)),
      "yyyy-MM-dd",
    );
    // console.log("endDate = ", endDate);
    // console.log("startDate = ", startDate);
    const vpdHist = await getHistory([weatherVar], startDate, endDate);
    const vpdForecast = await fetchForecastMeteo(
      fillParams({
        hourlyVars: [weatherVar],
        forecast_mode: "forecast",
        forecast_model: "ecmwf_ifs025",
        forecast_days: 14,
        forecast_days_past: 6,
      }),
    );
    const vpd = mergeObjects(vpdHist, vpdForecast);

    let daily = getDailyMaxMin(vpd, weatherVar, vpd.timeZone);
    // console.log("daily = ", daily);
    climateOpenMeteo.set(daily);
    fetchingHistory = false;
  }

  // const sortedValues = getSortedValuesByProperty($climateOpenMeteo, weatherVar);
  // console.log("sortedValues = ", sortedValues);

  // $: console.log("climateOpenMeteo ", $climateOpenMeteo);
  // $: console.log("fetchingForecast = ", $fetchingForecast);
</script>

<div class="flex flex-row mx-auto min-h-44 p-5 justify-center">
  <div>
    <Button on:click={getClimate}>Fetch data</Button>
  </div>
</div>
<div
  class="h-[500px] w-[500px] md:h-[800px] md:w-[800px] flex relative items-center mx-auto overflow-x-auto"
>
  {#if fetchingHistory}
    <div class="flex flex-1 justify-center items-center">
      <Spinner></Spinner>
    </div>
  {:else if $climateOpenMeteo.length > 1}
    <div class="h-full w-full" bind:clientWidth={w} bind:clientHeight={h}>
      <Spiral
        data={$climateOpenMeteo}
        z={weatherVar}
        parentWidth={w - margin}
        parentHeight={h - margin}
      />
    </div>
  {:else}
    <p>No data</p>
  {/if}
</div>

<style>
</style>
