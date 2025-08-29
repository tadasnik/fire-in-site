<!--
  @component
  Generates an SVG y-axis. This component is also configured to detect if your y-scale is an ordinal scale. If so, it will place the markers in the middle of the bandwidth.
 -->
<script>
  import { getContext } from "svelte";

  const { padding, height, xRange, yRange, yScale } = getContext("LayerCake");

  

  

  

  

  

  

  

  

  

  
  /**
   * @typedef {Object} Props
   * @property {Boolean} [gridlines] - Extend lines from the ticks into the chart space
   * @property {Boolean} [tickMarks] - Show a vertical mark for each tick.
   * @property {Function} [formatTick] - A function that passes the current tick value and expects a nicely formatted value in return.
   * @property {Number|Array|Function} [ticks] - If this is a number, it passes that along to the [d3Scale.ticks](https://github.com/d3/d3-scale) function. If this is an array, hardcodes the ticks to those values. If it's a function, passes along the default tick values and expects an array of tick values in return.
   * @property {Number} [xTick] - How far over to position the text marker.
   * @property {Number} [yTick] - How far up and down to position the text marker.
   * @property {Number} [dxTick] - Any optional value passed to the `dx` attribute on the text marker and tick mark (if visible). This is ignored on the text marker if your scale is ordinal.
   * @property {Number} [dyTick] - Any optional value passed to the `dy` attribute on the text marker and tick mark (if visible). This is ignored on the text marker if your scale is ordinal.
   * @property {String} [textAnchor]
   * @property {String} [axisLabel] - Axis label
   */

  /** @type {Props} */
  let {
    gridlines = true,
    tickMarks = false,
    formatTick = (d) => d,
    ticks = 4,
    xTick = 0,
    yTick = 0,
    dxTick = 0,
    dyTick = -4,
    textAnchor = "start",
    axisLabel = "My label"
  } = $props();

  let isBandwidth = $derived(typeof $yScale.bandwidth === "function");

  let tickVals = $derived(Array.isArray(ticks)
    ? ticks
    : isBandwidth
      ? $yScale.domain()
      : typeof ticks === "function"
        ? ticks($yScale.ticks())
        : $yScale.ticks(ticks));
</script>

<g
  class="axis y-axis"
  transform="translate({isBandwidth ? -$padding.left : 0} , 0)"
>
  {#each tickVals as tickVal, nr}
    <g
      class="tick tick-{tickVal}"
      transform="translate({$xRange[0] +
        (isBandwidth ? $padding.left : 0)}, {isBandwidth
        ? $yScale.step() * nr
        : $yScale(tickVal)})"
    >
      {#if gridlines !== false}
        <line
          class="gridline"
          x2="100%"
          y1={isBandwidth ? $yScale.bandwidth() / 2 : 0}
          y2={isBandwidth ? $yScale.bandwidth() / 2 : 0}
        />
      {/if}
      {#if tickMarks === true}
        <line
          class="tick-mark"
          x1="0"
          x2={isBandwidth ? -6 : -6}
          y1={isBandwidth ? $yScale.bandwidth() / 2 : 0}
          y2={isBandwidth ? $yScale.bandwidth() / 2 : 0}
        />
      {/if}
      <text
        x={xTick}
        y={isBandwidth ? $yScale.bandwidth() / 2 + yTick : yTick}
        dx={isBandwidth ? -9 : dxTick}
        dy={isBandwidth ? 4 : dyTick}
        style="text-anchor:{isBandwidth ? 'end' : textAnchor};">{tickVal}</text
      >
    </g>
  {/each}
  <g class="tick">
    <text
      text-anchor="middle"
      y={isBandwidth ? 0 : -$padding.left}
      x={-$height / 2}
      dy=".75em"
      transform="rotate(-90)">{axisLabel}</text
    >
  </g>
</g>

<style>
  .tick {
    font-size: 0.725em;
    font-weight: 200;
  }

  .tick line {
    stroke: #aaa;
  }
  .tick .gridline {
    stroke-dasharray: 2;
  }

  .tick text {
    fill: #666;
  }

  .tick.tick-0 line {
    stroke-dasharray: 0;
  }
</style>
