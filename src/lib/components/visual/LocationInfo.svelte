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
  <div class="text-center text-base text-gray-600 dark:text-gray-400">
    {#if locationName}<span class="font-semibold">{locationName}</span>{", "}{/if}{locationCoords}
  </div>
{/if}
