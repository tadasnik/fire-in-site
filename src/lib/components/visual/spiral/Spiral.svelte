<script>
  import { LayerCake, Svg, Html } from "layercake";
  import { scaleLinear, scaleSequential } from "d3-scale";
  import {
    interpolateYlOrRd,
    interpolateReds,
    interpolateInferno,
  } from "d3-scale-chromatic";
  import { getDayOfYear, addYears } from "date-fns";
  import ArcSvgSpiral from "$lib/components/visual/spiral/ArcSvgSpiral.svelte";
  import AxesLines from "$lib/components/visual/spiral/AxesLines.svelte";
  import Legend from "$lib/components/visual/spiral/Legend.svelte";
  import YearAnotations from "$lib/components/visual/spiral/YearAnotations.svelte";
  import Tooltip from "$lib/components/visual/spiral/Tooltip.html.svelte";
  import { xFromPolar, yFromPolar, cartesianFromPolarRad } from "./utils.js";
  import { currentLocation } from "$lib/shared/stores/locationStore.js";

  export let data = [];
  export let z = "vapour_pressure_deficit";
  export let parentWidth, parentHeight;
  $: console.log("Spiral width and height", parentWidth, parentHeight);

  //Rotate the spiral so that mid-January is align with y axis
  // const angleRotate = 360 / 4.8;
  // Rotate the spiral so that today is align with y axis
  // const doyToday = getDayOfYear(new Date());
  const doyAngle = ((360 / 365) * Math.PI) / 180;
  console.log("currentLocation", $currentLocation);

  const doyToday = getDayOfYear(new Date("2024-07-15"));
  const angleRotate = (-90 + (365 - doyToday) * (360 / 365)) * (Math.PI / 180); //360 / 4.8;

  const minSpiralSize = 500;
  $: minParentDim = parentWidth < parentHeight ? parentWidth : parentHeight;
  $: minDim = minParentDim < minSpiralSize ? minSpiralSize : minParentDim;

  //days for a full cycle
  const fullCycle = 365;
  //full data date range
  const dateRange = [data[0].date, data[data.length - 1].date];

  const angleScale = scaleLinear()
    .domain([1, fullCycle + 1])
    .range([0, 2 * Math.PI]);

  const radiusScale = scaleLinear().domain(dateRange).range([0.6, 0.95]);

  // distance between the successive  and last point
  const cycleDistance =
    Math.abs(radiusScale(data[365].date) - radiusScale(data[0].date)) * 0.9;

  const polarProps = {
    fullCycle,
    angleRotate,
    doyAngle,
    fullCycle,
    angleScale: scaleLinear()
      .domain([1, fullCycle + 1])
      .range([0, 2 * Math.PI]),
    radiusScale: scaleLinear().domain(dateRange).range([0.5, 0.95]),
  };

  const cartesianData = data.map((object) => {
    let angle = polarProps.angleScale(object.doy) + angleRotate;
    let dist = polarProps.radiusScale(object.date);
    const { x: x1, y: y1 } = cartesianFromPolarRad(
      dist,
      angle - doyAngle * 0.5,
    );
    const { x: x2, y: y2 } = cartesianFromPolarRad(
      dist,
      angle + doyAngle * 0.5,
    );
    return {
      ...object,
      dist,
      x1,
      y1,
      x2,
      y2,
    };
  });
</script>

<div class="w-full h-full p-10 overflow-hidden">
  <LayerCake
    x={"x1"}
    xRange={[0, minDim * 0.9]}
    xDomain={[-1, 1]}
    y={"y1"}
    yRange={[0, minDim * 0.9]}
    yDomain={[-1, 1]}
    {z}
    zScale={scaleSequential(interpolateReds)}
    data={cartesianData}
  >
    <Svg>
      <ArcSvgSpiral {polarProps} />
      <AxesLines {polarProps} />
    </Svg>
    <Legend {z}>
      <span slot="legend-title">
        <h2>Vapour pressure deficit</h2>
        <h2>
          lat: {$currentLocation.latitude.toFixed(2)} lon: {$currentLocation.longitude.toFixed(
            2,
          )}
        </h2>
        <br /><span style="opacity: 0.6">(Maximum daily value)</span>
      </span>
    </Legend>
    <Html>
      <YearAnotations {polarProps} />
      <Tooltip dataset={cartesianData} />
    </Html>
  </LayerCake>
</div>

<style>
</style>
