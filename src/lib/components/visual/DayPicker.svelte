<script>
  import { utcFormat } from "d3-time-format";
  import { localHour, instantForLocalHour } from "$lib/shared/forecastTime.js";
  import { dateTime } from "$lib/shared/stores/timeStore";
  import {
    daysInForecast,
    forecastOpenMeteo,
  } from "$lib/shared/stores/forecastStore";
  import {
    currentDateTime,
    timeMode,
    focusDay,
    forecastUtcOffset,
  } from "$lib/shared/stores/timeStore";
  import { iconForWmoCode } from "$lib/data/wmoWeatherIcons.js";
  import "$lib/styles/weather-icons.css";

  const dateFormatShort = utcFormat("%a %e");
  const dateFormatLong = utcFormat("%a %e %b");

  function handleDayClick(day) {
    $timeMode = "user";
    const hour = localHour($dateTime, $forecastUtcOffset);
    $currentDateTime = instantForLocalHour(day, hour, $forecastUtcOffset);
  }

  function formatDayShort(d) {
    return dateFormatShort(d);
  }

  function formatDayLong(d) {
    return dateFormatLong(d);
  }
  // Both hourly time and daysInForecast use "local-as-UTC ms", so keying by the
  // UTC date string of that ms gives the location-local day, independent of the
  // browser's own timezone.
  function dayKey(ms) {
    return new Date(ms).toISOString().slice(0, 10);
  }

  // The API's daily weather_code is "most severe of the day" — a few hours of
  // convective potential turn a sunny day into "Thunderstorm". Instead, take the
  // mode of hourly weather_code across daytime hours (08:00–18:00 local) so the
  // summary reflects the typical condition. Ties resolve to the higher code.
  const DAYTIME_START = 8;
  const DAYTIME_END = 18;

  let dailyByDay = $derived.by(() => {
    const result = new Map();
    const times = $forecastOpenMeteo.time;
    const codes = $forecastOpenMeteo.weather_code;
    if (!Array.isArray(times) || !codes) return result;

    const dayCounts = new Map(); // key -> Map<code, count>
    for (let i = 0; i < times.length; i++) {
      const date = new Date(times[i]);
      const hour = date.getUTCHours();
      if (hour < DAYTIME_START || hour >= DAYTIME_END) continue;
      const key = date.toISOString().slice(0, 10);
      let counts = dayCounts.get(key);
      if (!counts) { counts = new Map(); dayCounts.set(key, counts); }
      const c = codes[i];
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }

    // Daily precipitation, looked up by the same day-key.
    const dailyTimes = $forecastOpenMeteo.daily_time;
    const dailyPrecip = $forecastOpenMeteo.daily_precipitation_sum;
    const precipByDay = new Map();
    if (Array.isArray(dailyTimes) && dailyPrecip) {
      for (let i = 0; i < dailyTimes.length; i++) {
        precipByDay.set(dayKey(dailyTimes[i]), dailyPrecip[i]);
      }
    }

    for (const [key, counts] of dayCounts.entries()) {
      let modeCode = null;
      let modeCount = 0;
      for (const [c, n] of counts.entries()) {
        if (n > modeCount || (n === modeCount && c > modeCode)) {
          modeCode = c;
          modeCount = n;
        }
      }
      result.set(key, { code: modeCode, precip: precipByDay.get(key) ?? null });
    }
    return result;
  });

  function dayInfo(day) {
    return dailyByDay.get(dayKey(day));
  }
</script>

<div class="forecast-days" role="group" aria-label="Forecast day">
  {#each $daysInForecast as day}
    {@const info = dayInfo(day)}
    <button type="button" class="forecast-day" aria-pressed={dayKey(day) === dayKey($focusDay)}
      aria-label={formatDayLong(day)} onclick={() => handleDayClick(day)}>
      <span class="font-medium">{formatDayShort(day)}</span>
      {#if info?.code != null && !Number.isNaN(info.code)}
        <i class="wi {iconForWmoCode(info.code, info.precip)} text-lg"
          title="WMO code {info.code}{info.precip != null ? ` — ${info.precip.toFixed(1)} mm` : ''}"
          aria-label="WMO weather code {info.code}"></i>
      {:else}<span class="text-xs text-gray-400">—</span>{/if}
    </button>
  {/each}
</div>
