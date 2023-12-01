<script>
  import { LayerCake, Svg, Html, groupLonger, flatten } from "layercake";

  import { scaleSequential } from "d3-scale";
  import {
    interpolateYlOrRd,
    interpolateReds,
    interpolateInferno,
  } from "d3-scale-chromatic";
  import { scaleOrdinal } from "d3-scale";
  import { timeParse, timeFormat } from "d3-time-format";
  import { format, precisionFixed } from "d3-format";
  import fireCharBackg from "$lib/assets/fire_char_backg.svg";

  import ScatterSvg from "$lib/components/visual/ScatterSvg.svelte";
  import AxisX from "$lib/components/visual/AxisX.svelte";
  import AxisY from "$lib/components/visual/AxisY.svelte";
  import FireCharAnotations from "$lib/components/visual/FireCharAnotations.svelte";
  import DensityContours from "./DensityContours.svelte";

  export let parentWidth;
  export let data;
  export let xKey;
  export let yKey;
  export let zKey;

  $: flatData = flatten(data, "values");
  $: console.log("data charChar:", data);
</script>

<div
  class="chart-container"
  style="width: {parentWidth}; height: {parentWidth};"
>
  <LayerCake
    padding={{ top: 7, right: 10, bottom: 20, left: 25 }}
    x={xKey}
    y={yKey}
    z={zKey}
    xDomain={[0, 30000000]}
    xRange={[0, parentWidth - (10 + 25)]}
    yDomain={[0, 60]}
    yRange={[parentWidth - 35, 0]}
    zScale={scaleSequential(interpolateReds)}
    {data}
    flatdata={flatten(data, "values")}
  >
    <Html>
      <img alt="The project logo" src={fireCharBackg} />
    </Html>

    <Svg>
      <AxisX gridlines={true} ticks={4} snapTicks={true} tickMarks={true} />
      <AxisY ticks={4} />
      <!-- <ScatterSvg data={flatData} /> -->
      <DensityContours {data} />
    </Svg>

    <Html>
      <FireCharAnotations />
    </Html>
    <!-- <Html> -->
    <!--   <Labels /> -->
    <!--   <SharedTooltip formatTitle={formatTickX} dataset={data} /> -->
    <!-- </Html> -->
  </LayerCake>
</div>

<style>
  /*
    The wrapper div needs to have an explicit width and height in CSS.
    It can also be a flexbox child or CSS grid element.
    The point being it needs dimensions since the <LayerCake> element will
    expand to fill it.
  */
  .chart-container {
    width: 100%;
    height: 100%;
  }
  img {
    width: 100%;
    height: auto;
  }
</style>
