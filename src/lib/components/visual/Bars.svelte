<!--
  @component
  Generates an SVG bar chart.
 -->
<script>
  import { onMount, getContext } from "svelte";
  import {
    getFuelsImages,
    getFuelsFileNames,
  } from "$lib/firebase/firebase.client";
  import UKFuelModels from "$lib/data/UKFuelModels.json";

  const { data, xGet, yGet, xScale, yScale, xRange } = getContext("LayerCake");

  /** @type {String} [fill='#00bbff'] - The shape's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color. */
  // export let fill = "#00bbff";

  let imageNames;
  let images = {};

  const xDomain = [0, 100];
  onMount(async () => {
    imageNames = await getFuelsFileNames();
    images = await getFuelsImages(imageNames);
  });
</script>

<g class="bar-group">
  {#each $data as d, i}
    {#await images[UKFuelModels[d["surface.primary.fuel.model.catalogKey"]].photo.split(".")[0]] then imageUrl}
      <defs>
        <pattern
          id={i}
          x={$xScale.range()[0]}
          y={$yGet(d.values[0])}
          patternUnits="userSpaceOnUse"
          width={$xGet(d.values[0])}
          height={$yScale.bandwidth()}
        >
          <image xlink:href={imageUrl} y={-$yScale.bandwidth() * 2} />
        </pattern>
      </defs>

      <rect
        class="group-rect"
        data-id={i}
        x={$xScale.range()[0]}
        y={$yGet(d.values[0])}
        height={$yScale.bandwidth()}
        width={$xGet(d.values[0]) === 0 ? 1 : $xGet(d.values[0])}
        fill="url(#{i})"
        stroke-width="1"
        stroke="grey"
      />
    {:catch error}
      <p style="color: red">{error.message}</p>
    {/await}
  {/each}
</g>
