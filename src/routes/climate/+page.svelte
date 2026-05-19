<script>
  import { Spinner } from "flowbite-svelte";
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
    climateOpenMeteo,
    fillParams,
  } from "$lib/shared/stores/forecastStore";
  import { fetchForecastMeteo } from "$lib/weather/openMeteo.ts";
  import { currentLocation } from "$lib/shared/stores/locationStore";
  import Spiral from "$lib/components/visual/spiral/Spiral.svelte";
  import ColorbarAxisX from "$lib/components/visual/spiral/ColorbarAxisX.svelte";

  let daily = {};
  let fetchingHistory = $state(false);
  let w = $state(),
    h = $state();
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

  const isArr = (v) =>
    Array.isArray(v) || (ArrayBuffer.isView(v) && !(v instanceof DataView));

  function mergeObjects(obj1, obj2) {
    const merged = {};
    for (const key of new Set([...Object.keys(obj1), ...Object.keys(obj2)])) {
      const v1 = obj1[key];
      const v2 = obj2[key];
      if (isArr(v1) || isArr(v2)) {
        merged[key] = [...(isArr(v1) ? v1 : []), ...(isArr(v2) ? v2 : [])];
      } else {
        merged[key] = v1 ?? v2;
      }
    }
    return merged;
  }
  async function getClimate() {
    fetchingHistory = true;
    const endDate = format(subDays(new Date(), 6), "yyyy-MM-dd");
    const startDate = format(
      startOfYear(subYears(startOfYear(new Date()), 10)),
      "yyyy-MM-dd",
    );
    // console.log("endDate = ", endDate);
    // console.log("startDate = ", startDate);
    const vpdHist = await fetchForecastMeteo(
      fillParams({
        hourlyVars: [weatherVar],
        forecast_mode: "historical",
        start_date: startDate,
        end_date: endDate,
      }),
    );
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
    climateOpenMeteo.set(daily);
    fetchingHistory = false;
  }

  $effect(() => {
    const _lat = $currentLocation.latitude;
    const _lon = $currentLocation.longitude;
    climateOpenMeteo.set([]);
    getClimate();
  });
</script>

<div
  class="h-[500px] w-[500px] md:h-[800px] md:w-[800px] flex relative items-center mx-auto overflow-x-auto"
>
  {#if fetchingHistory}
    <div class="flex flex-1 flex-col gap-3 justify-center items-center">
      <Spinner size="10"></Spinner>
      <p class="text-slate-500">Fetching data</p>
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
  {/if}
</div>

<style>
</style>
