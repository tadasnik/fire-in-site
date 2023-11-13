<script>
  import { getContext } from "svelte";
  import { contourDensity } from "d3-contour";
  import { geoPath } from "d3-geo";
  import { scaleOrdinal } from "d3-scale";
  import { schemeCategory10 } from "d3-scale-chromatic";
  import { fuelScenarios } from "$lib/data/scenarios";
  const {
    z,
    x,
    y,
    xGet,
    yGet,
    zGet,
    xScale,
    yScale,
    xDomain,
    yDomain,
    xRange,
    yRange,
    width,
    height,
  } = getContext("LayerCake");

  const fuelCats = { sh4: "#e377c2", sh6: "#bcbd22" };
  const cat10colors = [
    "1f77b4",
    "ff7f0e",
    "2ca02c",
    "d62728",
    "9467bd",
    "8c564b",
    "e377c2",
    "7f7f7f",
    "bcbd22",
    "17becf",
  ];

  export let data;

  /** @type {Number} [r=5] – The circle's radius. */
  export let r = 5;

  /** @type {String} [fill='#0cf'] – The circle's fill color. */
  export let fill = "#0cf";

  /** @type {String} [stroke='#000'] – The circle's stroke color. */
  export let stroke = "#000";

  /** @type {Number} [strokeWidth=0] – The circle's stroke width. */
  export let strokeWidth = 0;

  const fuels = ["sh4", "sh6"];
  const myColor = scaleOrdinal(schemeCategory10); //.domain(fuels).range(schemeCategory10);

  $: geoPathFn = geoPath();

  $: fuelContours = (fuelData) => {
    const contours = contourDensity()
      .x($xGet)
      .y($yGet)
      .size([$width, $height])
      .bandwidth(10)
      .thresholds(5)(fuelData);
    return contours;
  };

  $: contours = contourDensity()
    .x($xGet)
    .y($yGet)
    .size([$width, $height])
    .bandwidth(10)
    .thresholds(5)(data);

  $: console.log(myColor($z(data[0])));
  $: console.log(myColor($z(data[1])));
</script>

<g class="">
  {#each data as fuelData}
    {#each fuelContours(fuelData.values) as contour}
      <path
        d={geoPathFn(contour)}
        stroke-width="1"
        stroke="steelblue"
        fill={fuelCats[$z(fuelData)]}
        opacity="0.2"
        stroke-linejoin="round"
      />
    {/each}
  {/each}
</g>
