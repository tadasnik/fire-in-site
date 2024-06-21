<script>
  import { derived } from "svelte/store";
  import {
    LayerCake,
    Svg,
    calcExtents,
    Html,
    groupLonger,
    flatten,
  } from "layercake";

  import { scaleOrdinal, scaleTime } from "d3-scale";
  import { timeParse, timeFormat } from "d3-time-format";
  import { format, precisionFixed } from "d3-format";

  import MultiLine from "$lib/components/visual/MultiLine.svelte";
  import AxisX from "$lib/components/visual/AxisX.svelte";
  import AxisY from "$lib/components/visual/AxisY.svelte";
  import { outputNodes } from "$lib/data/outputNodes.js";
  import { selectedOutput } from "$lib/shared/stores/modelStore";
  import Labels from "$lib/components/visual/GroupLabels.html.svelte";
  import ScatterSvg from "./ScatterSvg.svelte";
  import SharedTooltip from "$lib/components/visual/SharedTooltip.html.svelte";
  import { _outputForecastArray } from "$lib/shared/stores/modelStore";

  // This example loads csv data as json using @rollup/plugin-dsv
  // import data from "./fruit.csv";

  export let data;
  export let xKey;
  export let yKey;
  export let zKey;
  /* --------------------------------------------
   * Set what is our x key to separate it from the other series
   */
  // const xKey = "month";
  // const yKey = "value";
  // const zKey = "fruit";

  // const xKeyCast = timeParse("%Y-%m-%d");

  // const seriesNames = Object.keys(data[0]).filter((d) => d !== xKey);

  const seriesColors = ["#ffe4b8", "#ffb3c0", "#ff7ac7", "#ff00cc"];

  const formatTickX = timeFormat("%H");
  const formatXtip = timeFormat("%b %d, %H:00");
  $: console.log("data :", data);
  $: seriesNames = Object.keys(data[0]).filter((d) => d !== xKey);
  // const formatTickY = (d) => format(`.${precisionFixed(d)}s`)(d);
  // const groupedData = [];

  $: groupedData = groupLonger(data, seriesNames, {
    groupTo: zKey,
    valueTo: yKey,
  });

  // $: $_outputForecastArray,
  // const groupedData = derived(_outputForecastArray, ($_outputForecastArray) => {
  //   const seriesNames = Object.keys($_outputForecastArray[0]).filter(
  //     (d) => d !== xKey
  //   );
  //   return groupLonger($_outputForecastArray, seriesNames, {
  //     groupTo: zKey,
  //     valueTo: yKey,
  //   });
  // });
  // $: console.log("_outputForecastArray ", $_outputForecastArray);
  $: console.log("groupedData ", groupedData);
  // const times = (data[0].values) => {
  //   values.map((d) => {
  //     return $xGet(d)
  //   })
  // }
  // console.log("data ", data);
  // $: path = (values) => {
  //   values.map((d) => {
  //     return $xGet(d);
  //   });
  // };
  // $: console.log(path(data.values));

  // const daysTransformed = $data[0].map((d) => {
  //   const parts = d.time.split("T");
  //   const time = parts[1]
  //     .replace("Z", "")
  //     .split(":")
  //     .map((q) => +q);
  //   d[xKey] = time[0] * 60 * 60 + time[1] * 60 + time[2];
  //   d[yKey] = parts[0];
  //   return d;
  // });
  // const extents = calcExtents(daysTransformed, {
  //   x: (d) => d.timestring,
  // });
  //
  // // Convert to string even though it is one to make Typescript happy
  // const minDate = extents.x[0]
  //   .toString()
  //   .split("T")[0]
  //   .split("-")
  //   .map((d) => +d);
  // const maxDate = extents.x[1]
  //   .toString()
  //   .split("T")[0]
  //   .split("-")
  //   .map((d) => +d);
  //
  // const allDays = timeDay
  //   .range(
  //     new Date(Date.UTC(minDate[0], minDate[1] - 1, minDate[2])),
  //     new Date(Date.UTC(maxDate[0], maxDate[1] - 1, maxDate[2] + 1))
  //   )
  //   .map((d) => d.toISOString().split("T")[0])
  //   .sort();
</script>

<div class="chart-container">
  <LayerCake
    padding={{ top: 7, right: 0, bottom: 20, left: 15 }}
    x={xKey}
    y={yKey}
    z={zKey}
    zScale={scaleOrdinal()}
    xScale={scaleTime()}
    zRange={seriesColors}
    flatData={flatten(groupedData, "values")}
    data={groupedData}
  >
    <Svg>
      <AxisX
        gridlines={false}
        tickMarks={true}
        ticks={10}
        baseline
        formatTick={formatTickX}
      />
      <AxisY
        ticks={4}
        axisLabel={outputNodes[$selectedOutput].label +
          " (" +
          outputNodes[$selectedOutput].units +
          ")"}
      />

      <MultiLine />
      <!-- <ScatterSvg /> -->
    </Svg>

    <Html>
      <Labels />
      <SharedTooltip formatTitle={formatXtip} dataset={$_outputForecastArray} />
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
    height: 250px;
  }
</style>
