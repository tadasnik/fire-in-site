<!--
  @component
  Generates an SVG bar chart.
 -->
<script>
  import { LayerCake, Svg, flatten } from "layercake";
  import { scaleBand } from "d3-scale";

  import AxisX from "$lib/components/visual/AxisX.svelte";
  import AxisY from "$lib/components/visual/AxisY.svelte";
  import Bars from "$lib/components/visual/Bars.svelte";
  import { outputNodes } from "$lib/data/outputNodes.js";

  export let data;
  export let xKey;
  export let yKey;

  $: flatData = flatten(data, "values");

  // data.forEach((d) => {
  //   d[xKey] = +d[xKey];
  // });
  // $: console.log("???????????? data after BARPLOT:", data);
</script>

<div class="chart-container">
  <LayerCake
    padding={{ bottom: 20, left: 35 }}
    x={xKey}
    y={yKey}
    yScale={scaleBand().paddingInner(0.05)}
    xDomain={[0, null]}
    {flatData}
    {data}
  >
    <Svg>
      <Bars />
      <AxisX
        gridlines={true}
        ticks={4}
        snapTicks={true}
        tickMarks={true}
        axisLabel={outputNodes[xKey].label +
          " (" +
          outputNodes[xKey].units +
          ")"}
      />
      <AxisY
        gridlines={true}
        ticks={4}
        snapTicks={true}
        tickMarks={true}
        axisLabel={outputNodes[yKey].label}
      />
    </Svg>
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
    height: 250px;
  }
</style>
