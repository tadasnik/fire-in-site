<script>
  import { getContext } from 'svelte';
  import { currentDateTime, dateTime, forecastUtcOffset, timeMode } from '$lib/shared/stores/timeStore';
  import { hourText } from '$lib/shared/dayForecast.js';
  const { xScale, width } = getContext('LayerCake');
  let { hours, height, describe = row => hourText(row.time), label = 'Select forecast hour', multiday = false } = $props();
  const selected = $derived($dateTime + $forecastUtcOffset * 1000);
  function select(time) {
    timeMode.set('user');
    currentDateTime.set(new Date(time - $forecastUtcOffset * 1000));
  }
</script>

<div role="group" aria-label={label}>
  {#each hours as row, i}
    <button type="button" class="hour-column" class:selected={selected >= (row.periodStart ?? row.time) && selected < (row.periodEnd ?? row.time + 3600000)}
      class:day-start={multiday && new Date(row.periodStart ?? row.time).getUTCHours() === 0}
      style:left="{$xScale(row.time)}px" style:width="{$xScale(row.periodEnd) - $xScale(row.periodStart)}px" style:height="{height}px"
      disabled={!row.available} aria-label={describe(row)} aria-pressed={selected >= (row.periodStart ?? row.time) && selected < (row.periodEnd ?? row.time + 3600000)}
      title={describe(row)} onclick={() => select(row.time)}>
      <span class:first={i === 0}>{hourText(row.time).slice(0, 2)}</span>
    </button>
  {/each}
  <span class="closing-tick" style:left="{$width}px">{hourText(hours[hours.length - 1].periodEnd).slice(0, 2)}</span>
</div>

<style>
  .hour-column { position: absolute; top: 0; padding: 0; border: 0; border-left: 1px solid rgb(148 163 184 / 12%); border-radius: 0; background: transparent; text-align: center; color: #64748b; font: 11px system-ui; }
  .hour-column span { position: absolute; top: 5px; left: 0; transform: translateX(-50%); }
  .hour-column span.first { transform: none; left: 2px; }
  .closing-tick { position: absolute; top: 5px; transform: translateX(-100%); color: #64748b; font: 11px system-ui; }
  .hour-column.day-start { border-left-color: #94a3b8; }
  .hour-column:hover { background: rgb(148 163 184 / 10%); }
  .hour-column.selected { background: rgb(234 88 12 / 7%); box-shadow: inset 1px 0 #ea580c, inset -1px 0 #ea580c; color: #c2410c; }
  .hour-column:focus-visible { outline: 2px solid #c2410c; outline-offset: -2px; }
  .hour-column:disabled { cursor: default; color: #cbd5e1; }
  :global(.dark) .hour-column { color: #cbd5e1; }
  :global(.dark) .hour-column.selected { color: #fb923c; }
</style>
