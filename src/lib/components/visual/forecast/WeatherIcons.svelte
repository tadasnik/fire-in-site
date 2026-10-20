<script>
  import { getContext } from 'svelte';
  import { iconForWmoCode } from '$lib/data/wmoWeatherIcons.js';
  import '$lib/styles/weather-icons.css';
  const { xScale } = getContext('LayerCake');
  let { hours } = $props();
</script>

{#each hours as hour}
  {@const icon = iconForWmoCode(hour.weather_code, null, hour.is_day)}
  {#if icon}
    <span class="hour-weather-icon" style:left="{($xScale(hour.periodStart) + $xScale(hour.periodEnd)) / 2 - 12}px" style:width="24px" aria-hidden="true">
      <i class="wi {icon}"></i>
    </span>
  {/if}
{/each}

<style>
  .hour-weather-icon { position: absolute; top: 1px; height: 26px; display: flex; align-items: center; justify-content: center; pointer-events: none; color: #64748b; }
  .wi { font-size: 18px; line-height: 1; }
  :global(.dark) .hour-weather-icon { color: #cbd5e1; }
</style>
