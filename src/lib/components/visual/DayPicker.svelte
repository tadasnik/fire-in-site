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
  import FwiBadge from './FwiBadge.svelte';
  import { fwiDanger } from '$lib/weather/effis.js';
  import { ignitionRank } from '$lib/shared/dailyBehaviour.js';
  import { fuelCategory } from '$lib/data/fuelPhotos.js';
  import DailyFuelPeak from './DailyFuelPeak.svelte';
  let { effis = null, days = null, dailySummaries = new Map() } = $props();
  const effisByDay = $derived(new Map((effis?.data?.days ?? []).map(day => [day.date, day])));

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

  const number = (peak, digits = 1) => Number.isFinite(peak?.value) && peak.value >= 0 ? peak.value.toFixed(digits) : '—';
  const category = peak => peak?.value > 0 ? fuelCategory(peak.fuel)?.label : null;
  const peakFuel = peak => category(peak) ? `, ${category(peak)}` : '';
  function peakDescription(peak, label, unit) {
    return Number.isFinite(peak?.value) && peak.value >= 0
      ? `${label} ${peak.value.toFixed(label === 'Ignition prob.' ? 0 : 1)} ${unit} · ${String(new Date(peak.time).getUTCHours()).padStart(2, '0')}:00 location time · fuel ${peak.fuel}. Maximum across available hours and selected fuels; metrics may peak at different times.`
      : `${label} unavailable`;
  }
</script>

<div class="forecast-days" role="group" aria-label="Forecast day">
  {#each days ?? $daysInForecast as day}
    {@const info = dayInfo(day)}
    {@const fwi = effisByDay.get(dayKey(day))}
    {@const danger = effis?.status === 'ready' ? fwiDanger(fwi?.fwi) : null}
    {@const summary = dailySummaries.get(dayKey(day))}
    {@const ignition = ignitionRank(summary?.ignition?.value)}
    <button type="button" class="forecast-day" aria-pressed={dayKey(day) === dayKey($focusDay)}
      aria-label={`${formatDayLong(day)} · EFFIS Fire danger ${danger ? danger.label : effis?.status === 'loading' ? 'loading' : 'unavailable'} · Ignition prob. ${number(summary?.ignition, 0)}%${ignition ? `, ${ignition.label} (app-defined rank)` : ''} · ROS up to ${number(summary?.ros)} m/min${peakFuel(summary?.ros)} · Flames up to ${number(summary?.flame)} m${peakFuel(summary?.flame)}. Maxima across available hours and selected fuels. Background photo is illustrative, not a prediction of fire occurring.`} onclick={() => handleDayClick(day)}>
      <DailyFuelPeak ros={summary?.ros} flame={summary?.flame} />
      <span class="forecast-day-weather">
        <span class="font-medium">{formatDayShort(day)}</span>
        {#if info?.code != null && !Number.isNaN(info.code)}
          <i class="wi {iconForWmoCode(info.code, info.precip)} day-weather-icon"
            title="WMO code {info.code}{info.precip != null ? ` — ${info.precip.toFixed(1)} mm` : ''}"
            aria-label="WMO weather code {info.code}"></i>
        {:else}<span class="text-xs text-gray-400">—</span>{/if}
      </span>
      <span class="day-summary">
      <span class="day-summary-text">
      <span class="day-ignition" title={`${peakDescription(summary?.ignition, 'Ignition prob.', '%')} Firebrand ignition probability, not the chance of a fire occurring. App-defined bands: Low <10%; Moderate 10–<30%; High 30–<50%; Very High 50–<70%; Extreme 70–<90%; Very Extreme ≥90%. Not an EFFIS classification.`}>
        <span class="summary-label">Ignition prob.</span>
        <span class="summary-value">{number(summary?.ignition, 0)}%</span>
        <span class="summary-rank">{#if ignition}<span class="rank-dot" style:background-color={ignition.color}></span>{/if}{ignition?.label ?? 'No data'}</span>
      </span>
      <span class="day-metric" title={peakDescription(summary?.ros, 'ROS up to', 'm/min')}>ROS up to <span><strong>{number(summary?.ros)}</strong> m/min</span>{#if category(summary?.ros)}<span class="fuel-category">{category(summary.ros)}</span>{/if}</span>
      <span class="day-metric" title={peakDescription(summary?.flame, 'Flames up to', 'm')}>Flames up to <span><strong>{number(summary?.flame)}</strong> m</span>{#if category(summary?.flame)}<span class="fuel-category">{category(summary.flame)}</span>{/if}</span>
      </span>
      </span>
      <span class="day-danger">
        <FwiBadge classOnly prominent day={fwi} status={effis?.status ?? 'idle'} />
      </span>
    </button>
  {/each}
</div>

<style>
  .forecast-day-weather { display: flex; width: 100%; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px; }
  .forecast-day-weather, .day-summary, .day-danger { position: relative; z-index: 1; }
  .day-weather-icon { font-size: 30px; line-height: 1.3; }
  .day-summary { display: flex; justify-content: space-between; align-items: center; gap: 8px; width: 100%; }
  .day-summary-text { display: flex; flex-direction: column; gap: 9px; min-width: 0; }
  .day-metric { display: flex; flex-direction: column; font-size: 11px; line-height: 1.3; font-variant-numeric: tabular-nums; }
  .fuel-category { font-size: 11px; font-weight: 600; }
  .day-ignition { display: flex; flex-direction: column; gap: 3px; width: 100%; padding-top: 5px; margin-top: 2px; font-size: 11px; line-height: 1.25; }
  .summary-value { display: inline-flex; align-items: center; gap: 3px; font-weight: 600; font-variant-numeric: tabular-nums; flex-wrap: wrap; }
  .rank-dot { width: 16px; height: 16px; flex-shrink: 0; border: 1px solid rgb(71 85 105 / 45%); border-radius: 50%; }
  .summary-rank { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; overflow-wrap: anywhere; }
  .summary-label { font-weight: 400; }
  .day-danger { width: 100%; margin-top: auto; padding-top: 8px; }
</style>
