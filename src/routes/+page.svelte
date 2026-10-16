<script>
  import { onMount } from "svelte";
  import { Spinner } from "flowbite-svelte";

  // The interactive app pulls in browser-only libraries (Mapbox, the fire
  // model). Load it dynamically on the client so this route can be
  // server-rendered for its SEO metadata and heading without those libraries.
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

{#snippet forecastHeading()}
  <h1 id="behaviour-heading" class="section-title">Wildfire behaviour forecast</h1>
{/snippet}

{#if HomeApp}
  <HomeApp {forecastHeading} />
{:else}
  <div class="forecast-workspace">
    <div class="workspace-loading">
      {@render forecastHeading()}
      <div class="flex justify-center p-8" role="status" aria-label="Loading forecast">
        <Spinner size={8} />
      </div>
    </div>
  </div>
{/if}
