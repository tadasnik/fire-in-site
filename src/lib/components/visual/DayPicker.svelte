<script>
  import { timeFormat } from "d3-time-format";
  import { isEqual, startOfDay } from "date-fns";
  import { dateTime } from "$lib/shared/stores/timeStore";
  import {
    currentTimeIndex,
    forecastMode,
    focusDayIndex,
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
  import heli from "$lib/assets/icons/helicop.png";

  const dateFormatShort = timeFormat("%a %e");
  const dateFormatLong = timeFormat("%a %e %b");

  // $: console.log("focusDay", $focusDay);
  Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + h * 60 * 60 * 1000);
    return this;
  };

  function handleDayClick(day) {
    if ($timeMode === "current") {
      $timeMode = "user";
    }
    // day is local-as-UTC midnight; subtract offset to get true UTC, then set to noon.
    $currentDateTime = new Date(day - $forecastUtcOffset * 1000).addHours(12);
  }

  function formatDayShort(d) {
    return dateFormatShort(d);
  }

  function formatDayLong(d) {
    return dateFormatLong(d);
  }
  let isSelectedDayClass = $derived((d) => {
    return isEqual(startOfDay(d), startOfDay($focusDay))
      ? "min-h-10 sm:min-h-14 md:min-h-16 font-bold text-primary-900 bg-white border-slate-500 border-t-2 border-l-2 border-r-2 rounded-t-lg"
      : "border-slate-500 border-b-2";
  });

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

<div
  class="flex flex-row items-end justify-start sm:justify-center p-2 space-x-0.5 divide-slate-500 min-w-full"
>
  {#each $daysInForecast as day}
    {@const info = dayInfo(day)}
    <div
      class="w-22 sm:w-26 md:w-36 lg:w-40 shrink-0 p-1 sm:p-2 md:p-3 lg:p-4 text-xs sm:text-sm md:text-base bg-gray-100 {isSelectedDayClass(
        day,
      )}"
      role="button"
      onclick={() => handleDayClick(day)}
    >
      <div class="flex items-center justify-between gap-1">
        <span class="sm:hidden">{formatDayShort(day)}</span>
        <span class="hidden sm:inline">{formatDayLong(day)}</span>
        {#if info?.code != null && !Number.isNaN(info.code)}
          <i
            class="wi {iconForWmoCode(info.code, info.precip)} text-base sm:text-lg md:text-xl text-slate-600"
            title="WMO code {info.code}{info.precip != null ? ` — ${info.precip.toFixed(1)} mm` : ''}"
            aria-label="WMO weather code {info.code}"
          ></i>
        {/if}
      </div>
    </div>
  {/each}
</div>
