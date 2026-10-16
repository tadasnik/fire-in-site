<script>
  import { LayerCake, Svg, Html } from 'layercake';
  import { scaleUtc } from 'd3-scale';
  import { viewWeather, weatherPoints, dateText, WEATHER_ROWS, WEATHER_HEIGHT, hourText, formatValue } from '$lib/shared/dayForecast.js';
  import { forecastOpenMeteo } from '$lib/shared/stores/forecastStore';
  import HourColumns from './HourColumns.svelte';
  import WeatherPlots from './WeatherPlots.svelte';
  import WeatherIcons from './WeatherIcons.svelte';
  import ForecastDayBands from './ForecastDayBands.svelte';
  import DaylightShading from './DaylightShading.svelte';
  let { start, multiday = false } = $props();
  const end = $derived(Number(start) + (multiday ? 5 : 1) * 86400000);
  const headerHeight = $derived(multiday ? 24 : 0);
  const hours = $derived(viewWeather($forecastOpenMeteo, start, { days: multiday ? 5 : 1, step: multiday ? 3 : 1 }));
  const points = $derived(weatherPoints($forecastOpenMeteo, start, { days: multiday ? 5 : 1, step: multiday ? 3 : 1 }));
  const describe = row => `${dateText(row.time)} ${hourText(row.time)}: ${formatValue(row.temperature_2m, 1)} °C, humidity ${formatValue(row.relative_humidity_2m)}%, precipitation ${formatValue(row.precipitation, 1)} mm during ${hourText(row.periodStart)}–${hourText(row.periodEnd)}, wind ${formatValue(row.wind_speed_10m, 1)} km/h, gusts ${formatValue(row.wind_gusts_10m, 1)} km/h (maximum during ${hourText(row.periodStart)}–${hourText(row.periodEnd)}), wind from ${formatValue(row.wind_direction_10m)}°, cloud ${formatValue(row.cloud_cover)}%`;
</script>

<div class="day-chart-row" aria-label={multiday ? "Five-day weather meteogram" : "Hourly weather meteogram"}>
  <div class="day-chart-labels" style:height="{WEATHER_HEIGHT + headerHeight}px">
    <span class="day-axis-label">{multiday ? 'Day / hour' : 'Hour'}</span>
    {#each WEATHER_ROWS as row}
      <div class="weather-row-label" style:top="{row.top + headerHeight}px" style:height="{row.height}px">
        <span>{row.label}</span><small>{multiday && row.bars ? 'mm / 3 hours' : row.unit}</small>
        {#if row.key === 'wind_speed_10m'}<small>gusts dashed · ↓ flow</small>{/if}
      </div>
    {/each}
  </div>
  <div class="day-chart-plot" style:height="{WEATHER_HEIGHT + headerHeight}px">
    <LayerCake padding={{ top: headerHeight, right: 0, bottom: 0, left: 0 }} data={hours} x="time" xScale={scaleUtc()} xDomain={[Number(start), end]}>
      <Svg pointerEvents={false}><DaylightShading {start} {end} height={WEATHER_HEIGHT} /><WeatherPlots {hours} {points} /></Svg>
      <Html>
        {#if multiday}<ForecastDayBands {hours} />{/if}
        <WeatherIcons {hours} />
        <HourColumns {multiday} {hours} height={WEATHER_HEIGHT} {describe} label="Weather forecast hours" />
      </Html>
    </LayerCake>
  </div>
</div>

<style>
  .weather-row-label { position: absolute; left: 0; right: 0; display: flex; flex-direction: column; justify-content: center; padding-right: 8px; border-bottom: 1px solid rgb(148 163 184 / 15%); }
  .weather-row-label span { font-size: 12px; font-weight: 500; }
  small { font-size: 10px; color: #64748b; }
</style>
