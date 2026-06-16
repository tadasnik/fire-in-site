<script>
  import { Spinner } from "flowbite-svelte";
  import { subDays, subYears, startOfYear, getDayOfYear, format } from "date-fns";
  import { climateOpenMeteo } from "$lib/shared/stores/forecastStore";
  import { fetchDailyMeteo } from "$lib/weather/openMeteo.ts";
  import { currentLocation } from "$lib/shared/stores/locationStore";
  import Spiral from "$lib/components/visual/spiral/Spiral.svelte";
  import ColorbarAxisX from "$lib/components/visual/spiral/ColorbarAxisX.svelte";

  let fetchingHistory = $state(false);
  let w = $state(), h = $state();
  let margin = 20;
  const weatherVar = "vapour_pressure_deficit_max";

  async function getClimate() {
    fetchingHistory = true;
    const endDate = format(subDays(new Date(), 6), "yyyy-MM-dd");
    const startDate = format(startOfYear(subYears(new Date(), 10)), "yyyy-MM-dd");

    const baseParams = {
      latitude: $currentLocation.latitude,
      longitude: $currentLocation.longitude,
      daily: [weatherVar],
      timezone: "auto",
      timeformat: "unixtime",
    };

    const [hist, fcast] = await Promise.all([
      fetchDailyMeteo({
        ...baseParams,
        forecast_mode: "historical",
        start_date: startDate,
        end_date: endDate,
        models: "era5_seamless",
      }),
      fetchDailyMeteo({
        ...baseParams,
        forecast_mode: "forecast",
        forecast_model: "ecmwf_ifs025",
        forecast_days: 14,
        past_days: 6,
      }),
    ]);

    // Merge by timestamp; forecast takes precedence for the 6-day overlap
    const byTime = new Map();
    for (let i = 0; i < hist.time.length; i++) byTime.set(hist.time[i], hist[weatherVar][i]);
    for (let i = 0; i < fcast.time.length; i++) byTime.set(fcast.time[i], fcast[weatherVar][i]);

    const daily = Array.from(byTime.entries())
      .sort(([a], [b]) => a - b)
      .map(([t, value]) => ({ date: t, doy: getDayOfYear(new Date(t)), [weatherVar]: value }));

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
