<script>
  import { Select, Spinner } from "flowbite-svelte";
  import { subDays, subYears, startOfYear, getDayOfYear, format } from "date-fns";
  import { climateOpenMeteo } from "$lib/shared/stores/forecastStore";
  import { fetchDailyMeteo } from "$lib/weather/openMeteo.ts";
  import { currentLocation } from "$lib/shared/stores/locationStore";
  import Spiral from "$lib/components/visual/spiral/Spiral.svelte";
  import ColorbarAxisX from "$lib/components/visual/spiral/ColorbarAxisX.svelte";
  import LocationSearch from "$lib/components/ui/LocationSearch.svelte";
  import YearLines from "$lib/components/visual/climate/YearLines.svelte";

  const variables = [
    { value: "vapour_pressure_deficit_max", name: "VPD daily max", units: "kPa" },
    { value: "temperature_2m_mean", name: "Temperature daily mean", units: "°C" },
    { value: "temperature_2m_max", name: "Temperature daily max", units: "°C" },
    { value: "temperature_2m_min", name: "Temperature daily min", units: "°C" },
    { value: "relative_humidity_2m_max", name: "Humidity daily max", units: "%" },
    { value: "relative_humidity_2m_min", name: "Humidity daily min", units: "%" },
  ];

  let fetchingHistory = $state(false);
  let w = $state(), h = $state();
  let yearLinesW = $state(800), yearLinesH = $state(360);
  let margin = 20;
  let weatherVar = $state("vapour_pressure_deficit_max");
  let varMeta = $derived(variables.find((v) => v.value === weatherVar) ?? variables[0]);

  const HIST_START_YEAR = 1990;
  const SPIRAL_YEARS = 10;

  async function getClimate() {
    fetchingHistory = true;
    const endDate = format(subDays(new Date(), 6), "yyyy-MM-dd");
    const startDate = `${HIST_START_YEAR}-01-01`;

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
        models: "ecmwf_ifs025",
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

  let spiralData = $derived.by(() => {
    if ($climateOpenMeteo.length < 2) return $climateOpenMeteo;
    const cutoff = startOfYear(subYears(new Date(), SPIRAL_YEARS)).getTime();
    return $climateOpenMeteo.filter((d) => d.date >= cutoff);
  });

  $effect(() => {
    const _lat = $currentLocation.latitude;
    const _lon = $currentLocation.longitude;
    const _v = weatherVar;
    climateOpenMeteo.set([]);
    getClimate();
  });
</script>

<div class="container mx-auto px-4 pt-3 max-w-sm md:max-w-3xl">
  <div class="flex flex-col md:flex-row gap-2 md:items-center">
    <div class="flex-1 min-w-0">
      <LocationSearch />
    </div>
    <div class="md:w-60 shrink-0">
      <Select
        size="sm"
        items={variables}
        bind:value={weatherVar}
        placeholder="Select variable"
      />
    </div>
  </div>
</div>

<div
  class="h-[500px] w-[500px] md:h-[800px] md:w-[800px] flex relative items-center mx-auto overflow-x-auto"
>
  {#if fetchingHistory}
    <div class="flex flex-1 flex-col gap-3 justify-center items-center">
      <Spinner size="10"></Spinner>
      <p class="text-slate-500">Fetching data</p>
    </div>
  {:else if spiralData.length > 1}
    <div class="h-full w-full" bind:clientWidth={w} bind:clientHeight={h}>
      <Spiral
        data={spiralData}
        z={weatherVar}
        varLabel={varMeta.name}
        varUnits={varMeta.units}
        parentWidth={w - margin}
        parentHeight={h - margin}
      />
    </div>
  {/if}
</div>

{#if !fetchingHistory && $climateOpenMeteo.length > 1}
  <div class="mx-auto max-w-5xl px-4 pb-8">
    <div
      class="h-[360px] w-full"
      bind:clientWidth={yearLinesW}
      bind:clientHeight={yearLinesH}
    >
      <YearLines
        data={$climateOpenMeteo}
        z={weatherVar}
        varLabel={varMeta.name}
        varUnits={varMeta.units}
        parentWidth={yearLinesW}
        parentHeight={yearLinesH}
      />
    </div>
  </div>
{/if}

<style>
</style>
