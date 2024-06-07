<!--
  @component
  Generates an SVG bar chart.
 -->
<script>
  import { onMount, getContext } from "svelte";
  import fireCharBackg from "$lib/assets/fire_char_backg.svg";
  import grass_small from "$lib/assets/grass_small.jpg";
  import { getFuelImage } from "$lib/firebase/firebase.client";
  import UKFuelModels from "$lib/data/UKFuelModels.json";

  const { data, xGet, yGet, xScale, yScale, xDomain, xRange } =
    getContext("LayerCake");

  /** @type {String} [fill='#00bbff'] - The shape's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color. */
  // export let fill = "#00bbff";

  let imageUrl = "";

  // onMount(async () => {
  //   try {
  //     imageUrl = await getDownloadURL(ref(fuelImagesRef, "grass_small.jpg"));
  //   } catch (error) {
  //     console.error("Error fetching image URL:", error);
  //   }
  // });
</script>

<!-- <pattern -->
<!--   id="orange" -->
<!--   height="100%" -->
<!--   width="100%" -->
<!--   patternContentUnits="objectBoundingBox" -->
<!-- > -->
<!--   <image -->
<!--     height="500" -->
<!--     width="500" -->
<!--     preserveAspectRatio="none" -->
<!--     src={fireCharBackg} -->
<!--   /> -->
<!-- </pattern> -->
<g class="bar-group">
  {#each $data as d, i}
    {#await getFuelImage(UKFuelModels[d["surface.primary.fuel.model.catalogKey"]].photo) then url}
      <defs>
        <pattern id={i} patternUnits="userSpaceOnUse" width="500" height="500">
          <image xlink:href={url} x="-100" y="-200" height="500" width="500" />
        </pattern>
      </defs>

      <rect
        class="group-rect"
        data-id={i}
        x={$xScale.range()[0]}
        y={$yGet(d.values[0])}
        height={$yScale.bandwidth()}
        width={$xGet(d.values[0])}
        fill="url(#{i})"
      />
    {:catch error}
      <p style="color: red">{error.message}</p>
    {/await}
  {/each}
</g>
