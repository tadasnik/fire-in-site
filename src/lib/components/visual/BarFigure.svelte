<!--
  @component
  Generates an SVG bar chart.
 -->
<script>
  import { LayerCake, Svg, Html, flatten } from "layercake";
  import { scaleBand } from "d3-scale";
  import { format } from "d3-format";
  import AxisX from "$lib/components/visual/AxisX.svelte";
  import AxisY from "$lib/components/visual/AxisY.svelte";
  import Bars from "$lib/components/visual/Bars.svelte";
  import { outputNodes } from "$lib/data/outputNodes.js";
  import { _maxVal, selectedFuels } from "$lib/shared/stores/modelStore";
  import UKFuelModels from "$lib/data/UKFuelModels.json";
  import BarAxisY from "$lib/components/visual/BarAxisY.svelte";

  export let data;
  export let time;
  export let xKey;
  export let yKey;

  // $: plotData = data.get(time);
  $: flatData = flatten(data, "values");
  const formatLabelY = (d) => format(`.1f`)(d);

  $: xMax = Math.ceil($_maxVal / 1) * 1;
  $: yTicks = $selectedFuels.map((i) => UKFuelModels[i].displayLabel);
</script>

<div class="chart-container w-full h-80 md:h-4/5">
  <LayerCake
    padding={{ bottom: 20, left: 90 }}
    x={xKey}
    y={yKey}
    yScale={scaleBand().paddingInner(0.2)}
    xDomain={[0, xMax]}
    {flatData}
    {data}
  >
    <Svg>
      <Bars />
      <AxisX
        gridlines={true}
        baseline
        ticks={4}
        snapTicks={true}
        tickMarks={true}
        axisLabel={outputNodes[xKey].label +
          " (" +
          outputNodes[xKey].displayUnits +
          ")"}
        formatTick={formatLabelY}
      />
      <!-- <AxisY gridlines={false} tickMarks={true} ticks={yTicks} /> -->
    </Svg>
    <Html>
      <BarAxisY
        ticks={data.map((d) => d["surface.primary.fuel.model.catalogKey"])}
      ></BarAxisY>
    </Html>
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
</style>
