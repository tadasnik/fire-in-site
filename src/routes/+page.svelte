<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { Spinner } from "flowbite-svelte";
  import { currentLocation } from "$lib/shared/stores/locationStore";

  // The interactive app pulls in browser-only libraries (Mapbox, the fire
  // model). Load it dynamically on the client so this route can be
  // server-rendered for its SEO head + hero without those libraries.
  let HomeApp = $state(null);
  onMount(async () => {
    HomeApp = (await import("$lib/components/HomeApp.svelte")).default;
  });

  const title = "FireInSite — Wildfire Behaviour & Fire Danger Prediction";
  const description =
    "FireInSite predicts wildfire behaviour across UK heath, shrub and grassland fuels — fire spread rate, flame length and intensity from live weather forecasts, free in your browser.";

  // Live location shown as the hero subtitle (client-side only, once known).
  let locationLabel = $derived.by(() => {
    const loc = $currentLocation;
    if (!loc || (!loc.name && !loc.latitude && !loc.longitude)) return "";
    const lat = loc.latitude ?? 0;
    const lon = loc.longitude ?? 0;
    const coords =
      `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}, ` +
      `${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;
    return loc.name ? `${loc.name}, ${coords}` : coords;
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
</svelte:head>

<section class="container mx-auto px-4 pt-4 text-center">
  <h1 class="text-xl md:text-xl text-gray-600 dark:text-white">
    Wildfire Behaviour Prediction
  </h1>
  {#if browser && locationLabel}
    <p class="mt-1 text-xl text-semibold text-gray-800 dark:text-gray-400">
      {locationLabel}
    </p>
  {/if}
</section>

{#if HomeApp}
  <HomeApp />
{:else}
  <div class="flex justify-center p-16">
    <Spinner size={8} />
  </div>
{/if}
