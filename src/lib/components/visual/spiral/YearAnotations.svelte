<script>
  import { getContext } from "svelte";
  import { getTime, getYear, getDayOfYear } from "date-fns";
  import { cartesianFromPolarRad } from "$lib/components/visual/spiral/utils.js";
  import { cy } from "date-fns/locale";

  const { width, height, xDomain, xScale, yScale, data } =
    getContext("LayerCake");

  export let polarProps = {};

  const range = (start, stop, step) =>
    Array.from(
      { length: Math.ceil((stop + 1 - start) / step) },
      (_, i) => start + i * step,
    );

  const yearsIn = range(
    getYear($data[0].date),
    getYear($data[$data.length - 1].date),
    1,
  );

  const yearLabelAngle = $yScale(16);

  $: years = yearsIn.map((year) => {
    let yearDate = new Date(year, 0, 17);
    const distance = polarProps.radiusScale(getTime(yearDate));
    const angle =
      polarProps.angleScale(getDayOfYear(yearDate)) + polarProps.angleRotate;

    const { x, y } = cartesianFromPolarRad(distance, angle);
    return {
      name: year,
      x: $xScale(x),
      y: $yScale(y),
    };
  });
</script>

<div class="">
  {#each years as { name, x, y }}
    <div
      class="absolute text-center text-xs text-gray-400 font-bold"
      style="
      left: {x + 'px'};
      top: {y + 'px'};
      transform: translate(-50%, -50%)
      "
    >
      {name}
    </div>
  {/each}
</div>
