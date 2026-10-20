<script>
  import { LayerCake, Svg, Html } from 'layercake';
  import { scaleUtc } from 'd3-scale';
  import { viewWeather, dateText, WEATHER_ROWS, WEATHER_HEIGHT, WEATHER_AXIS_HEIGHT, hourText, formatValue } from '$lib/shared/dayForecast.js';
  import { forecastOpenMeteo } from '$lib/shared/stores/forecastStore';
  import HourColumns from './HourColumns.svelte';
  import WeatherPlots from './WeatherPlots.svelte';
  import WeatherIcons from './WeatherIcons.svelte';
  import ForecastDayBands from './ForecastDayBands.svelte';
  import DaylightShading from './DaylightShading.svelte';
  let { start, multiday = false, effis = null } = $props();
  const end = $derived(Number(start) + (multiday ? 5 : 1) * 86400000);
  const headerHeight = $derived((multiday ? 24 : 0) + WEATHER_AXIS_HEIGHT);
  const hours = $derived(viewWeather($forecastOpenMeteo, start, { days: multiday ? 5 : 1, step: multiday ? 3 : 1 }));
  const preceding = row => `${dateText(row.precedingStart)} ${hourText(row.precedingStart)}–${dateText(row.precedingEnd)} ${hourText(row.precedingEnd)}`;
  const describe = row => `${dateText(row.time)} ${hourText(row.time)}: ${formatValue(row.temperature_2m, 1)} °C, humidity ${formatValue(row.relative_humidity_2m)}%, vapour pressure deficit ${formatValue(row.vapour_pressure_deficit, 2)} kPa, precipitation ${formatValue(row.precipitation, 1)} mm in preceding period ${preceding(row)}, ${multiday ? 'maximum hourly precipitation chance' : 'precipitation chance'} ${formatValue(row.precipitation_probability)}% (Best Match ensembles; >0.1 mm, preceding period ${preceding(row)}), wind ${formatValue(row.wind_speed_10m, 1)} km/h, gusts ${formatValue(row.wind_gusts_10m, 1)} km/h (maximum in preceding period ${preceding(row)}), wind from ${formatValue(row.wind_direction_10m)}°, cloud ${formatValue(row.cloud_cover)}%`;
</script>

<div class="day-chart-row" aria-label={multiday ? "Five-day weather meteogram" : "Hourly weather meteogram"}>
  <div class="day-chart-labels" style:height="{WEATHER_HEIGHT + headerHeight}px">
    <span class="day-axis-label">{multiday ? 'Day / hour' : 'Hour'}</span>
    {#each WEATHER_ROWS as row}
      {@const unit = multiday && row.accumulation ? 'mm/3h' : multiday && row.key === 'precipitation_probability' ? '% max' : row.unit}
      <div class="weather-row-label" title={`${row.description ?? row.label} (${unit})${row.key === 'wind_speed_10m' ? ' · Smaller numbers show gust maxima; arrows show wind flow' : ''}`} style:top="{row.top + headerHeight}px" style:height="{row.height}px">
        <span class="sr-only">{row.description ?? row.label}: </span>
        <div class="weather-label-main">
          {#if row.icon}
            <i class="wi {row.icon}" aria-hidden="true"></i>
          {:else}
            <span class="weather-abbreviation" aria-hidden="true">{row.label}</span>
          {/if}
          <span class="weather-unit">{unit}</span>
        </div>
        {#if row.key === 'wind_speed_10m'}
          <span class="weather-period">gusts · prev {multiday ? 3 : 1}h</span>
        {:else if row.interval}
          <span class="weather-period">prev {multiday ? 3 : 1}h</span>
        {/if}
      </div>
    {/each}
  </div>
  <div class="day-chart-plot" style:height="{WEATHER_HEIGHT + headerHeight}px">
    <LayerCake padding={{ top: headerHeight, right: 0, bottom: 0, left: 0 }} data={hours} x="time" xScale={scaleUtc()} xDomain={[Number(start), end]}>
      <Svg pointerEvents={false}><DaylightShading {start} {end} height={WEATHER_HEIGHT} /><WeatherPlots {hours} /></Svg>
      <Html>
        {#if multiday}<ForecastDayBands {hours} {effis} axisHeight={WEATHER_AXIS_HEIGHT} />{/if}
        <WeatherIcons {hours} />
        <HourColumns {multiday} {hours} height={WEATHER_HEIGHT} {describe} axisHeight={WEATHER_AXIS_HEIGHT} label="Weather forecast hours" />
      </Html>
    </LayerCake>
  </div>
</div>

<style>
  .weather-row-label { position: absolute; left: 0; right: 0; display: flex; flex-direction: column; justify-content: center; padding-right: 8px; border-bottom: 1px solid rgb(148 163 184 / 15%); }
  .weather-label-main { display: flex; align-items: center; gap: 6px; }
  .weather-label-main .wi { width: 20px; text-align: center; font-size: 17px; }
  .weather-abbreviation { font-size: 10px; font-weight: 600; }
  .weather-unit { font-size: 11px; font-weight: 500; white-space: nowrap; }
  .weather-period { font-size: 9px; line-height: 10px; }
</style>
