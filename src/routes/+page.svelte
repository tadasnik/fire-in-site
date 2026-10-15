<script>
  import { onMount } from "svelte";
  import { Spinner } from "flowbite-svelte";

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
  <h1 class="text-xl md:text-xl text-gray-600 dark:text-gray-400">
    Wildfire Behaviour Prediction
  </h1>
</section>

{#if HomeApp}
  <HomeApp />
{:else}
  <div class="flex justify-center p-16">
    <Spinner size={8} />
  </div>
{/if}
