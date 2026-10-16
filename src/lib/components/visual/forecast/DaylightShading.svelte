<script>
  import { getContext } from 'svelte';
  import { forecastOpenMeteo } from '$lib/shared/stores/forecastStore';
  import { daylightSegments } from '$lib/shared/dayForecast.js';
  const { xScale } = getContext('LayerCake');
  let { start, end, height } = $props();
  const segments = $derived(daylightSegments($forecastOpenMeteo, start, end));
</script>

{#each segments as segment}
  <rect class="daylight-shade" class:daylight={segment.isDay} class:night={!segment.isDay}
    data-start={segment.start} data-end={segment.end}
    x={$xScale(segment.start)} y="0" width={Math.max(0, $xScale(segment.end) - $xScale(segment.start))} {height} />
{/each}

<style>
  .daylight { fill: #fef3c7; fill-opacity: 0.35; }
  .night { fill: #e2e8f0; fill-opacity: 0.45; }
  :global(.dark) .daylight { fill: #fbbf24; fill-opacity: 0.08; }
  :global(.dark) .night { fill: #94a3b8; fill-opacity: 0.04; }
</style>
