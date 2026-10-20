<script>
  import { getContext } from 'svelte';
  import { scaleLinear } from 'd3-scale';
  import { WEATHER_ROWS, formatValue, rowDomain, linePath, areaPath, forecastColumnTime } from '$lib/shared/dayForecast.js';
  const { xScale, width } = getContext('LayerCake');
  let { hours } = $props();
  const center = hour => ($xScale(hour.periodStart) + $xScale(hour.periodEnd)) / 2;
  const sampleX = time => $xScale(forecastColumnTime(time, hours[0].periodEnd - hours[0].periodStart));
  const y = row => scaleLinear().domain(rowDomain(hours, row)).range([row.top + row.height - 5, row.top + 22]);
  const intensity = row => scaleLinear().domain(rowDomain(hours, row)).range([0.04, 0.42]).clamp(true);
</script>

{#each WEATHER_ROWS as row}
  <line x1="0" x2={$width} y1={row.top + row.height} y2={row.top + row.height} stroke="currentColor" opacity="0.12" />
  {#if row.key !== 'temperature_2m'}
    {@const opacity = intensity(row)}
    {#each hours as hour}
      {@const x = center(hour)}
      {@const value = formatValue(hour[row.key], row.digits ?? (row.accumulation && hour[row.key] > 0 ? 1 : 0))}
      <rect class="weather-cell" data-row={row.key} x={$xScale(hour.periodStart) + 1} y={row.top + 1} width={Math.max(0, $xScale(hour.periodEnd) - $xScale(hour.periodStart) - 2)} height={row.key === 'wind_speed_10m' ? 19 : row.height - 2} rx="2" fill={row.color} opacity={hour[row.key] === null ? 0 : opacity(hour[row.key])} />
      <text data-row={row.key} data-time={hour.time} x={row.key === 'wind_speed_10m' ? x - 4 : x} y={row.top + (row.key === 'wind_speed_10m' ? 12 : 17)} text-anchor="middle">{value}</text>
      {#if row.key === 'wind_speed_10m'}
        {#if hour.wind_direction_10m !== null}
          <g transform="translate({x + 9}, {row.top + 11}) rotate({hour.wind_direction_10m + 180})">
            <path d="M0,5 V-5 M-2,-2 L0,-5 L2,-2" fill="none" stroke="currentColor" stroke-width="1.1" />
          </g>
        {/if}
      {/if}
    {/each}
    {#if row.key === 'wind_speed_10m'}
      {#each hours as hour}
        <rect class="gust-cell" x={$xScale(hour.periodStart) + 1} y={row.top + 22} width={Math.max(0, $xScale(hour.periodEnd) - $xScale(hour.periodStart) - 2)} height="14" rx="2" fill={row.color} opacity={hour.wind_gusts_10m === null ? 0 : opacity(hour.wind_gusts_10m)} />
        <text class="gust-value" x={center(hour)} y={row.top + 33} text-anchor="middle">{formatValue(hour.wind_gusts_10m)}</text>
      {/each}
    {/if}
  {:else}
    {@const scale = y(row)}
    <path class="temperature-area" d={areaPath(hours, row.key, sampleX, scale)} fill={row.color} opacity="0.14" />
    <line class="temperature-zero" x1="0" x2={$width} y1={scale(0)} y2={scale(0)} stroke={row.color} stroke-dasharray="3 3" opacity="0.35" />
    <text x="3" y={scale(0) - 3}>0°C</text>
    <path class="temperature-curve" d={linePath(hours, row.key, sampleX, scale)} fill="none" stroke={row.color} stroke-width="1.8" />
    {#each hours as hour}
      <text class="temperature-value" data-time={hour.time} x={center(hour)} y={row.top + 13} text-anchor="middle">{formatValue(hour[row.key])}</text>
    {/each}
  {/if}
{/each}

<style>
  text { font: 10px system-ui, sans-serif; fill: currentColor; }
  .gust-value { font-size: 9px; }
</style>
