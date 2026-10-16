<script>
  // Reactive location label (name + coordinates). Split out of the former
  // WeatherInfo; the weather part now lives in WeatherLine.svelte, atop the
  // fire-behaviour viz.
  let { fireLocation } = $props();

  let locationName = $derived(fireLocation?.name ?? "");
  let locationCoords = $derived.by(() => {
    if (!fireLocation || (fireLocation.latitude == null && fireLocation.longitude == null))
      return "";
    const lat = fireLocation.latitude ?? 0;
    const lon = fireLocation.longitude ?? 0;
    return (
      `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}, ` +
      `${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`
    );
  });
</script>

{#if locationName || locationCoords}
  <div class="selected-location text-gray-900 dark:text-gray-100" aria-live="polite">
    {#if locationName}<span class="location-name">{locationName}</span>{/if}
    <span class="location-coordinates" class:coordinates-only={!locationName}>{locationCoords}</span>
  </div>
{/if}

<style>
  .selected-location { line-height: 1.4; overflow-wrap: anywhere; }
  .location-name { display: block; font-size: 16px; font-weight: 600; }
  .location-coordinates { display: block; font-size: 14px; }
  .coordinates-only { font-size: 16px; font-weight: 600; }
</style>
