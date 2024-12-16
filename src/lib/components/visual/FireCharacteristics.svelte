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
  import HistoricalSelectDate from "./HistoricalSelectDate.svelte";
  import SharedTooltip from "$lib/components/visual/SharedTooltip.html.svelte";

  export let parentWidth;
  export let data;
  export let xKey;
  export let yKey;
  export let zKey;

  $: flatData = flatten(data, "values");
  let evt;
  let hideTooltip = true;
  const addCommas = format(",");
  $: console.log("flatData FireChars", flatData);
  const formatXtip = timeFormat("%b %d, %H:00");
</script>

<div class="flex grow">
  <LayerCake
    padding={{ top: 10, right: 10, bottom: 30, left: 40 }}
    x={xKey}
    y={yKey}
    z={zKey}
    xDomain={[0, 38]}
    yDomain={[0, 60]}
    zScale={scaleSequential(interpolateReds)}
    {data}
    flatdata={flatten(data, "values")}
  >
    <Html>
      <img
        alt="Background with countour lines fire characteristics figure"
        src={fireCharBackg}
      />
    </Html>

    <Svg>
      <AxisX
        gridlines={true}
        ticks={4}
        tickMarks={true}
        axisLabel="Heat per
unit area (MJ/m2)"
      />
      <AxisY
        ticks={4}
        dxTick={-20}
        tickMarks={true}
        axisLabel="Rate of spread
(m/min)"
      />
      <ScatterSvg
        data={flatData}
        on:mousemove={(event) => (evt = hideTooltip = event)}
        on:mouseout={() => (hideTooltip = false)}
      />
    </Svg>
    <!-- <DensityContours {data} /> -->

    <Html>
      <FireCharAnotations />
      <SharedTooltip formatTitle={formatXtip} dataset={flatData} />
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
</style>
