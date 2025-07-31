<!--
  @component
  Generates an SVG bar chart.
 -->
<script>
  import { Popover } from "flowbite-svelte";
  import { onMount, getContext } from "svelte";

  import UKFuelModels from "$lib/data/UKFuelModels.json";
  import { fuelRootCode } from "$lib/shared/utils.js";
  const { data, xGet, yGet, y, xScale, yScale, xRange, x } =
    getContext("LayerCake");

  function rootFuelCode(fuel) {}
  const images = import.meta.glob(["$lib/assets/bars_background/**.webp"], {
    eager: true,
    as: "url",
  });
  // $: console.log("Bars data", $data);
</script>

<g class="bar-group">
  {#each $data as d, i}
    <defs>
      <pattern
        id={i}
        x={$xScale.range()[0]}
        y={$yScale.step() * i}
        patternUnits="userSpaceOnUse"
        width={$xGet(d.values)}
        height={$yScale.bandwidth()}
      >
        <image
          xlink:href={images[
            "/src/lib/assets/bars_background/" +
              fuelRootCode(d["surface.primary.fuel.model.catalogKey"]) +
              ".webp"
          ]}
        />
      </pattern>
    </defs>

    <rect
      class="group-rect"
      id={"rect-" + i}
      data-id={i}
      x={$xScale.range()[0]}
      y={$yScale.step() * i}
      height={$yScale.bandwidth()}
      width={$xGet(d.values) === 0 ? 1 : $xGet(d.values)}
      fill="url(#{i})"
      stroke-width="1"
      stroke="grey"
    />
  {/each}
</g>
