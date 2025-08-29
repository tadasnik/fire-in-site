<script>
  import { getContext } from "svelte";
  import { fade } from "svelte/transition";
  import { getDayOfYear, getYear } from "date-fns";
  import { xFromPolar, yFromPolar } from "./utils.js";
  import { cartesianFromPolarRad } from "./utils.js";

  let { polarProps = {} } = $props();

  const { xScale, yScale, zGet, data } = getContext("LayerCake");

  // $: cartesianCoords = data.map((object) => {
  //   let angle = polarProps.angleScale(object.doy) + polarProps.angleRotate;
  //   let dist = polarProps.radiusScale(object.date);
  //   const { x: x1, y: y1 } = cartesianFromPolarRad(
  //     dist,
  //     angle - polarProps.doyAngle * 0.5,
  //   );
  //   const { x: x2, y: y2 } = cartesianFromPolarRad(
  //     dist,
  //     angle + polarProps.doyAngle * 0.5,
  //   );
  //   return {
  //     ...object,
  //     dist,
  //     x1,
  //     y1,
  //     x2,
  //     y2,
  //   };
  // });

  let cycleDistance =
    $derived(Math.abs($xScale($data[365].dist) - $xScale($data[0].dist)) * 0.9);

  let getArc = $derived((d) => {
    return [
      "M",
      $xScale(d.x1),
      $yScale(d.y1),
      "A",
      $xScale(d.dist) / 2,
      $xScale(d.dist) / 2,
      0,
      0,
      1,
      $xScale(d.x2),
      $yScale(d.y2),
    ].join(" ");
  });
</script>

<g>
  {#each $data || [] as d, i}
    <path
      class="transition"
      in:fade={{ delay: i / 3 }}
      d={getArc(d)}
      stroke={$zGet(d)}
      stroke-width={cycleDistance}
    />
  {/each}
</g>
