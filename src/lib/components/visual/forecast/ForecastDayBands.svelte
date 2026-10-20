<script>
  import { getContext } from 'svelte';
  import { dateText } from '$lib/shared/dayForecast.js';
  import { dayKey } from '$lib/weather/effis.js';
  import FwiBadge from '../FwiBadge.svelte';
  const { xScale } = getContext('LayerCake');
  let { hours, effis = null, axisHeight = 0 } = $props();
  const effisByDay = $derived(new Map((effis?.data?.days ?? []).map(day => [day.date, day])));
  const days = $derived.by(() => {
    const groups = new Map();
    for (const hour of hours) {
      const day = new Date(hour.time).toISOString().slice(0, 10);
      if (!groups.has(day)) groups.set(day, []);
      groups.get(day).push(hour);
    }
    return [...groups.values()];
  });
</script>

{#each days as day, i}
  <div class="forecast-day-band" class:alternate={i % 2 === 1}
    style:top="{-24 - axisHeight}px"
    style:left="{$xScale(day[0].time)}px"
    style:width="{$xScale(day[day.length - 1].periodEnd) - $xScale(day[0].periodStart)}px">
    <span>{dateText(day[0].time)}</span>
    {#if effis}<FwiBadge compact day={effisByDay.get(dayKey(day[0].time))} status={effis.status} />{/if}
  </div>
{/each}

<style>
  .forecast-day-band { position: absolute; top: -24px; height: 24px; display: flex; align-items: center; gap: 8px; padding-left: 6px; border-left: 1px solid #94a3b8; background: #f8fafc; font-size: 11px; font-weight: 600; color: #334155; white-space: nowrap; }
  .alternate { background: #f1f5f9; }
  :global(.dark) .forecast-day-band { color: #cbd5e1; background: #111827; }
  :global(.dark) .alternate { background: #1f2937; }
</style>
