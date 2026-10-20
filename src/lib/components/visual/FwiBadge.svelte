<script>
  import { fwiDanger } from '$lib/weather/effis.js';
  let { day = null, status = 'idle', compact = false, classOnly = false, prominent = false } = $props();
  const danger = $derived(status === 'ready' ? fwiDanger(day?.fwi) : null);
  const value = $derived(danger ? day.fwi.toFixed(1) : status === 'loading' ? '…' : '—');
  const description = $derived(danger
    ? `EFFIS FWI ${value} · ${danger.label} fire danger`
    : status === 'loading' ? 'EFFIS FWI loading' : 'EFFIS FWI unavailable');
</script>

<span class="fwi-badge" class:compact class:prominent role="img" aria-label={description} title={description}>
  <span class="fwi-value" aria-hidden="true">
    {#if danger && !prominent}<span class="fwi-dot" style:background-color={danger.color}></span>{/if}
    {classOnly ? 'Fire danger' : `FWI ${value}`}
  </span>
  <span class="fwi-severity" aria-hidden="true">{#if danger && prominent}<span class="fwi-dot" style:background-color={danger.color}></span>{/if}{danger ? (compact ? danger.label.replace('Very ', 'V. ') : danger.label) : status === 'loading' ? 'Loading' : 'No data'}</span>
</span>

<style>
  .fwi-badge { display: inline-flex; flex-direction: column; align-items: flex-start; gap: 2px; min-width: 0; font-size: 10px; line-height: 1.25; }
  .fwi-value { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; font-weight: 600; }
  .fwi-dot { width: 8px; height: 8px; flex-shrink: 0; border: 1px solid rgb(71 85 105 / 45%); border-radius: 50%; }
  .fwi-severity { overflow-wrap: anywhere; }
  .compact { flex-direction: row; align-items: center; gap: 5px; }
  .compact .fwi-severity { font-weight: 400; white-space: nowrap; }
  .prominent .fwi-value { font-size: 10px; font-weight: 400; }
  .prominent .fwi-severity { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; }
  .prominent .fwi-dot { width: 16px; height: 16px; }
</style>
