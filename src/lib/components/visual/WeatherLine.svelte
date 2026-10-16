<script>
  import "$lib/styles/weather-icons.css";
  import "$lib/styles/weather-icons-wind.css";
  import { utcFormat } from "d3-time-format";
  import {
    currentTimeIndex,
    forecastMode,
    forecastModel,
    forecastModels,
  } from "$lib/shared/stores/forecastStore";
  import { forecastUtcOffset } from "$lib/shared/stores/timeStore";
  import { iconForWmoCode } from "$lib/data/wmoWeatherIcons.js";

  // The weather annotation for the fire-behaviour viz: which model, which hour,
  // and the conditions at that hour. Split out of the former WeatherInfo so it
  // can sit atop the current-behaviour chart to indicate which hour the results
  // are for. `data` is the forecast object ($forecastOpenMeteo).
  let { data } = $props();

  const cardinalDirections = {
    0: "N", 1: "NNE", 2: "NNE", 3: "NE", 4: "NE", 5: "ENE", 6: "ENE", 7: "E",
    8: "E", 9: "ESE", 10: "ESE", 11: "SE", 12: "SE", 13: "SSE", 14: "SSE",
    15: "S", 16: "S", 17: "SSW", 18: "SSW", 19: "SW", 20: "SW", 21: "WSW",
    22: "WSW", 23: "W", 24: "W", 25: "WNW", 26: "WNW", 27: "NW", 28: "NW",
    29: "NNW", 30: "NNW", 31: "N",
  };

  function getWindCardinalDirection(windDir) {
    const integerWindDir = parseInt(windDir / 11.25);
    return cardinalDirections[Math.min(Math.max(integerWindDir, 0), 31)].toLowerCase();
  }

  let modelLabel = $derived.by(() => {
    if ($forecastMode === "historical") return "ERA5 reanalysis";
    const m = $forecastModels.find((x) => x.value === $forecastModel);
    return m ? `${m.displayName} forecast` : `${$forecastModel} forecast`;
  });

  // "current weather:" when the selected timestep is the real current hour,
  // otherwise the selected local time (e.g. "3PM:"). Times are "local-as-UTC ms"
  // (offset baked in), so format with utcFormat and build the current hour the
  // same way.
  const hourLabel = utcFormat("%-I%p");
  let weatherLabel = $derived.by(() => {
    const times = data?.time;
    if (!Array.isArray(times)) return "weather:";
    const selectedMs = times[$currentTimeIndex];
    const nowHourMs =
      3600000 * Math.round(Date.now() / 3600000) + $forecastUtcOffset * 1000;
    return selectedMs === nowHourMs ? "current weather:" : hourLabel(selectedMs) + ":";
  });
</script>

{#if data}
  <div class="text-center text-xs text-gray-500">
    {modelLabel}
  </div>
  <div class="flex align-middle justify-center items-end space-x-2 text-xs">
    <div>{weatherLabel}</div>
    <div>
      <i class="text-2xl wi {iconForWmoCode(data.weather_code?.[$currentTimeIndex], null, data.is_day?.[$currentTimeIndex]) || 'wi-na'}"></i>
    </div>
    <div class="space-x-0">
      <span>{data.temperature_2m[$currentTimeIndex].toFixed(0)}</span
      ><i class="text-xl wi wi-degrees"></i><span class="font-bold">C</span>
    </div>
    <div>
      <span class="pl-0">{data.relative_humidity_2m[$currentTimeIndex].toFixed(0)}</span>
      <i class="wi wi-humidity"></i>
    </div>
    <div>
      <i
        class="text-xl wi wi-wind wi-from-{getWindCardinalDirection(
          data.wind_direction_10m[$currentTimeIndex],
        )}"
      ></i>
      <span class="pl-0">{data.wind_speed_10m[$currentTimeIndex].toFixed(0)}</span
      ><span class="font-bold pl-1"> km/h</span>
    </div>
  </div>
{/if}
