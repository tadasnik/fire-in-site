<script>
  import { getContext } from 'svelte';
  import { scaleLinear } from 'd3-scale';
  import { WEATHER_ROWS, formatValue, rowDomain, linePath, areaPath } from '$lib/shared/dayForecast.js';
  const { xScale, width } = getContext('LayerCake');
  let { hours, points } = $props();
  const center = hour => ($xScale(hour.periodStart) + $xScale(hour.periodEnd)) / 2;
  const labelX = time => Math.max(8, Math.min($width - 8, $xScale(time)));
  const y = row => scaleLinear().domain(rowDomain([...points, ...hours], row)).range([row.top + row.height - (row.key === 'wind_speed_10m' ? 21 : 5), row.key === 'temperature_2m' ? 22 : row.top + 22]);
</script>

{#each WEATHER_ROWS as row}
  <line x1="0" x2={$width} y1={row.top + row.height} y2={row.top + row.height} stroke="currentColor" opacity="0.12" />
  {#if row.key === 'cloud_cover'}
    {#each hours as hour}
      <rect x={$xScale(hour.time) + 1} y={row.top + 3} width={Math.max(0, $xScale(hour.periodEnd) - $xScale(hour.periodStart) - 2)} height="22" fill={row.color} opacity={hour[row.key] === null ? 0 : 0.08 + hour[row.key] / 150} />
      <text x={center(hour)} y={row.top + 18} text-anchor="middle">{formatValue(hour[row.key])}</text>
    {/each}
  {:else}
    {@const scale = y(row)}
    {#if row.bars}
      {#each hours as hour}
        {#if hour[row.key] !== null}
          <rect x={center(hour) - 5} y={scale(hour[row.key])} width="10" height={Math.max(0, scale(0) - scale(hour[row.key]))} fill={row.color} opacity="0.6" />
        {/if}
      {/each}
    {:else}
      {#if row.key === 'temperature_2m'}
        <path class="temperature-area" d={areaPath(points, row.key, $xScale, scale)} fill={row.color} opacity="0.14" />
        <line class="temperature-zero" x1="0" x2={$width} y1={scale(0)} y2={scale(0)} stroke={row.color} stroke-dasharray="3 3" opacity="0.35" />
        <text x="3" y={scale(0) - 3}>0°C</text>
      {/if}
      <path class:temperature-curve={row.key === 'temperature_2m'} d={linePath(points, row.key, $xScale, scale)} fill="none" stroke={row.color} stroke-width="1.8" />
      {#if row.key === 'wind_speed_10m'}
        <path d={linePath(points, 'wind_gusts_10m', $xScale, scale)} fill="none" stroke={row.color} stroke-width="1.3" stroke-dasharray="3 2" opacity="0.7" />
      {/if}
    {/if}
    {#each hours as hour}
      <text x={row.bars ? center(hour) : labelX(hour.time)} y={row.top + 13} text-anchor="middle" fill={row.color}>{formatValue(hour[row.key], row.bars && hour[row.key] > 0 ? 1 : 0)}</text>
      {#if row.key === 'wind_speed_10m' && hour.wind_direction_10m !== null}
        <g transform="translate({labelX(hour.time)}, {row.top + row.height - 10}) rotate({hour.wind_direction_10m + 180})">
          <path d="M0,6 V-5 M-3,-2 L0,-5 L3,-2" fill="none" stroke="currentColor" stroke-width="1.2" />
        </g>
      {/if}
    {/each}
  {/if}
{/each}

<style>
  text { font: 10px system-ui, sans-serif; fill: currentColor; }
</style>
