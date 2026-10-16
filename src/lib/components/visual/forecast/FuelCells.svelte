<script>
  import { getContext } from 'svelte';
  import { scaleSequential } from 'd3-scale';
  import { interpolateOranges } from 'd3-scale-chromatic';
  import { formatValue } from '$lib/shared/dayForecast.js';
  const { xScale } = getContext('LayerCake');
  let { fuels, max, decimals } = $props();
  const color = $derived(scaleSequential(interpolateOranges).domain([0, max || 1]));
</script>

{#each fuels as fuel, i}
  {#each fuel.values as point}
    <rect class="fuel-cell" data-start={point.periodStart} data-end={point.periodEnd} x={$xScale(point.time) + 1} y={30 + i * 30 + 1} width={Math.max(0, $xScale(point.periodEnd) - $xScale(point.periodStart) - 2)} height="28" rx="2" fill={point.value === null ? 'transparent' : color(point.value)} />
    <text x={($xScale(point.periodStart) + $xScale(point.periodEnd)) / 2} y={49 + i * 30} text-anchor="middle" fill={point.value === null ? 'currentColor' : max > 0 && point.value / max > 0.6 ? '#fff' : '#7c2d12'}>{formatValue(point.value, point.value !== null && Math.abs(point.value) < 10 ? Math.min(decimals, Math.abs(point.value) < 1 ? 2 : 1) : 0)}</text>
  {/each}
{/each}

<style>text { font: 10px system-ui, sans-serif; }</style>
