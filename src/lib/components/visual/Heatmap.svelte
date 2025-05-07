<script>
  import { LayerCake, Svg, Html, groupLonger, flatten } from "layercake";
  import { scaleBand } from "d3-scale";
  import { scaleSequential, scaleDiverging } from "d3-scale";
  import {
    interpolatePuOr,
    interpolateYlOrRd,
    interpolateReds,
    interpolateBlues,
    interpolateInferno,
    interpolateRdYlGn,
  } from "d3-scale-chromatic";
  import { timeParse, timeFormat } from "d3-time-format";

  import { outputNodes } from "$lib/data/outputNodes.js";
  import {
    _maxVal,
    selectedOutput,
    _outputForecastArray,
  } from "$lib/shared/stores/modelStore";
  import {
    forecastMode,
    focusDayIndex,
    forecastOpenMeteo,
  } from "$lib/shared/stores/forecastStore";
  import { dateString } from "$lib/shared/stores/timeStore";

  import Heatmap from "$lib/components/visual/HeatmapInner.svelte";
  import HeatmapAnotate from "$lib/components/visual/HeatmapAnotate.html.svelte";
  import AxisXTop from "$lib/components/visual/AxisXTop.html.svelte";
  import GroupLabels from "./GroupLabels.html.svelte";
  import HeatmapWindDir from "$lib/components/visual/HeatmapWindDir.html.svelte";

  export let xKey;
  export let yKey;
  export let zKey;

  //define colour scales
  const scaleTemp = scaleSequential(interpolatePuOr).domain([0, 30]);
  const scaleHum = scaleSequential(interpolatePuOr).domain([99, 30]);
  const scalePrec = scaleSequential(interpolateBlues).domain([0, 2]);
  const scaleWind = scaleSequential(interpolateRdYlGn).domain([15, 0]);
  const scaleProb = scaleSequential(interpolateRdYlGn).domain([60, 0]);
  const scaleMoist = scaleSequential(interpolatePuOr).domain([60, 0]);
  const scaleFlame = scaleSequential(interpolateReds).domain([0, 10]);
  const scaleSpread = scaleSequential(interpolateReds).domain([0, 60]);
  const scaleHeat = scaleSequential(interpolateReds).domain([0, 60]);
  const scaleTransition = scaleSequential(interpolateReds).domain([0, 20]);
  // const scaleTransition = scaleDiverging([0, 1, 10], interpolatePuOr);

  const weatherProps = {
    temperature_2m: [
      "temerature2m",
      "wi wi-thermometer",
      scaleTemp,
      0,
      [13, 26],
      "Temp. (C)",
      "Air temperature at 2 metres",
    ],
    relative_humidity_2m: [
      "screenRelativeHumidity",
      "wi wi-humidity",
      scaleHum,
      0,
      [42, 80],
      "Rel. Hum. (%)",
      "Relative humidity",
    ],
    precipitation: [
      "totalPrecipAmount",
      "wi wi-rain",
      scalePrec,
      1,
      [0, 2],
      "Rain (mm)",
      "Total precipitation (rain + showers + snow)",
    ],
    wind_speed_10m: [
      "wind_speed_10m",
      "wi wi-windy",
      scaleWind,
      0,
      [3, 14],
      "Wind (km/h)",
      "Wind speed at 10 metres",
    ],
    wind_gusts_10m: [
      "windGustSpeed10m",
      "wi wi-strong-wind",
      scaleWind,
      0,
      [3, 14],
      "Wind gust (km/h)",
      "Wind gust speed at 10 metres",
    ],
    wind_direction_10m: [
      "windDirectionFrom10m",
      "wi wi-wind-direction",
      scaleTemp,
      0,
      [0, 360],
      "Wind dir.",
      "Wind direction",
    ],
  };
  const modelOutputProps = {
    "site.moisture.dead.category": {
      scale: scaleMoist,
      roundTo: 0,
      scaleLimits: [15, 40],
      showSmallVals: true,
    },

    "site.moisture.dead.tl1h": {
      scale: scaleMoist,
      roundTo: 0,
      scaleLimits: [15, 40],
      showSmallVals: true,
    },
    "ignition.firebrand.probability": {
      scale: scaleProb,
      roundTo: 0,
      scaleLimits: [10, 50],
      showSmallVals: true,
    },
    "surface.weighted.fire.flameLength": {
      scale: scaleFlame,
      roundTo: 1,
      scaleLimits: [0, 5],
      showSmallVals: true,
    },
    "surface.weighted.fire.spreadRate": {
      scale: scaleSpread,
      roundTo: 0,
      scaleLimits: [0, 40],
      showSmallVals: true,
    },
    "surface.weighted.fire.heatPerUnitArea": {
      scale: scaleHeat,
      roundTo: 1,
      scaleLimits: [0, 20],
      showSmallVals: true,
    },
    "surface.weighted.fire.firelineIntensity": {
      scale: scaleHeat,
      roundTo: 1,
      scaleLimits: [0, 20],
      showSmallVals: true,
    },

    "crown.fire.initiation.transitionRatio": {
      scale: scaleTransition,
      roundTo: 0,
      scaleLimits: [0, 10],
      showSmallVals: false,
    },
    "crown.fire.transition.minBaseHeight": {
      scale: scaleTransition,
      roundTo: 0,
      scaleLimits: [0, 10],
      showSmallVals: true,
    },
  };

  function isCommonOutput(output) {
    return Object.values(commonOutputProps)
      .map((values) => values[0])
      .includes(output);
  }

  // $: selectedTimeIndex = () => {
  // return d == $dateTime ? "font-bold text-primary-500" : "";
  // };

  // $: console.log("Selected output", $selectedOutput);
  $: fireBehaviourData = $_outputForecastArray.slice(
    $focusDayIndex[0] < 0 ? 0 : $focusDayIndex[0],
    $focusDayIndex[1] < 0 ? $_outputForecastArray.length : $focusDayIndex[1],
  );
  // $: console.log("forecastOpenMeteo", $forecastOpenMeteo);

  $: forecastData = $forecastOpenMeteo;
  $: seriesNames = Object.keys(fireBehaviourData[0]).filter((d) => d !== xKey);
  $: groupedData = groupLonger(fireBehaviourData, seriesNames, {
    groupTo: yKey,
    valueTo: zKey,
  });

  function formatTickXLong(tick) {
    let format = timeFormat("%H");
    let longFormat = timeFormat("%a");
    if (format(tick) === "00") {
      return longFormat(tick);
    } else {
      return format(tick);
    }
  }
  const formatTickX = timeFormat("%H");
  const leftMargin = 102;
  const topMargin = 60;
  const bottomMargin = 20;
  const cellSize = 25;
  const gapSize = 1.9;

  $: fuelsTicks = Object.keys(fireBehaviourData[0]);
  $: yCountWeather = Object.keys(weatherProps).length;
  $: yCount = Object.keys(fireBehaviourData[0]).length;
  $: chartHeight = (yCountWeather + yCount) * cellSize + cellSize;
  $: heatmapWidth = fireBehaviourData.length * cellSize;
  $: dayPickerHeight = 40;
  // $: console.log("Heatmap fireBehaviourData data", $_outputForecastArray);
  // $: console.log("Heatmap forecast data", forecastData);
  // $: console.log("Heatmap output data", fireBehaviourData);
</script>

<div
  class="flex relative"
  style="height:{topMargin +
    chartHeight +
    bottomMargin}px; width:{heatmapWidth + leftMargin}px"
>
  <div
    class="flex sticky
    left-0 bg-white z-10 justify-end"
    style="height:{topMargin +
      chartHeight +
      bottomMargin}px; width:{leftMargin}px"
  >
    <LayerCake
      padding={{ top: topMargin, right: 0, bottom: bottomMargin, left: 0 }}
      y={yKey}
      data={groupedData}
    >
      <Html>
        <!-- <Annotations {annotations} /> -->
        <HeatmapAnotate
          {cellSize}
          {gapSize}
          {forecastData}
          {weatherProps}
          forecastLabel={$forecastMode === "forecast"
            ? "Weather forecast"
            : "Weather " + $dateString}
          axisLabel={outputNodes[$selectedOutput].label +
            " (" +
            outputNodes[$selectedOutput].displayUnits +
            ")"}
          commonOutput={modelOutputProps[$selectedOutput][2]}
          {leftMargin}
          {topMargin}
        />
      </Html>
    </LayerCake>
  </div>
  <div
    class="flex-initial xcontainer z-0 overflow-x-scroll"
    style="height:{topMargin +
      chartHeight +
      bottomMargin}px; width:{heatmapWidth}px"
  >
    <LayerCake
      padding={{ top: topMargin, right: 0, bottom: bottomMargin, left: 0 }}
      x={xKey}
      y={yKey}
      z={zKey}
      xScale={scaleBand()}
      yScale={scaleBand()}
      data={groupedData}
      flatData={flatten(groupedData, "values")}
    >
      <Svg>
        <Heatmap
          {cellSize}
          {gapSize}
          {forecastData}
          {weatherProps}
          {modelOutputProps}
        />
      </Svg>
      <Html>
        <AxisXTop format={formatTickXLong} />
        <HeatmapWindDir {cellSize} {forecastData} />
      </Html>
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
