<script>
  import { LayerCake, Svg, groupLonger, flatten } from "layercake";
  import { nest } from "d3-collection";
  import {
    scaleOrdinal,
    scaleTime,
    scaleQuantize,
    scaleSequential,
  } from "d3-scale";
  import {
    interpolateYlOrRd,
    interpolateReds,
    interpolateInferno,
  } from "d3-scale-chromatic";
  import { timeParse, timeFormat } from "d3-time-format";

  import Heatmap from "$lib/components/visual/HeatmapInner.svelte";
  import AxisX from "$lib/components/visual/AxisX.svelte";
  import AxisY from "$lib/components/visual/AxisY.svelte";

  export let data;
  export let dataAxis;
  export let xKey;
  export let yKey;
  export let zKey;

  // This example loads csv data as json using @rollup/plugin-dsv
  const gutter = 10;
  const seriesColors = ["#fff5cc", "#ffeba9", "#ffe182", "#ffd754", "#ffcc00"];
  // $: fuelsCount = data[0].values.length;

  console.log("Heatmap data ", data[0]);
  $: seriesNames = Object.keys(data[0]).filter((d) => d !== xKey);
  $: groupedData = groupLonger(data, seriesNames, {
    groupTo: yKey,
    valueTo: zKey,
  });

  const formatTickX = timeFormat("%H");
  const leftMargin = 30;
  const bottomMargin = 20;
  const cellSize = 20;
  $: fuelsTicks = Object.keys(data[0]);
  // $: yCount = Object.keys(data[0]).length - 1;
  const yCount = 8;
  $: chartHeight = yCount * cellSize;
  $: heatmapWidth = data.length * cellSize;
  $: console.log("Grouped data Heatmap", groupedData);
  $: console.log("flat data Heatmap", flatten(groupedData, "values"));
</script>

<div
  class="flex relative"
  style="height:{chartHeight + bottomMargin}px; width:{heatmapWidth +
    leftMargin}px"
>
  <div
    class="flex-none sticky left-0 bg-gray-100 z-10"
    style="height:{chartHeight}px; width:{leftMargin}px"
  />
  <div
    class="flex-initial xcontainer z-0"
    style="height:{chartHeight + bottomMargin}px; width:{heatmapWidth}px"
  >
    <LayerCake
      padding={{ top: 0, right: 0, bottom: 20, left: 0 }}
      x={xKey}
      y={yKey}
      z={zKey}
      xScale={scaleTime()}
      yScale={scaleOrdinal()}
      zScale={scaleSequential(interpolateReds)}
      zDomain={[0, null]}
      data={groupedData}
      flatData={flatten(groupedData, "values")}
    >
      <Svg>
        <AxisX
          gridlines={true}
          tickMarks={true}
          ticks={10}
          baseline
          formatTick={formatTickX}
        />
        <Heatmap {cellSize} />
      </Svg>
    </LayerCake>
  </div>
</div>

<style>
  /*
    The wrapper div needs to have an explicit width and height in CSS.
    It can also be a flexbox child or CSS grid element.
    The point being it needs dimensions since the <LayerCake> element will
    expand to fill it.
    The width is being set inline below.
  */
  .xcontainer {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
  }
  .xcontainer::-webkit-scrollbar {
    /* WebKit */
    width: 0px;
  }
</style>
