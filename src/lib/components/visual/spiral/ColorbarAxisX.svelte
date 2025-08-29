<!--
  @component
  Generates an SVG x-axis. This component is also configured to detect if
your x-scale is an ordinal scale. If so, it will place the markers in the middle of the bandwidth.
 -->
<script>
  import { getContext } from "svelte";
  import { scaleLinear } from "d3-scale";
  import { ticks } from "d3-array";

  const { zDomain } = getContext("LayerCake");

  

  

  

  

  

  

  
  /**
   * @typedef {Object} Props
   * @property {Number} [width] - Width of the parrent div
   * @property {Number} [height] - Height of the parrent div
   * @property {Boolean} [tickMarks] - Show a vertical mark for each tick.
   * @property {Boolean} [baseline]
   * @property {Boolean} [snapTicks] - Instead of centering the text on the first and the last items, align them to the edges of the chart.
   * @property {Number} [xTick] - How far over to position the text marker.
   * @property {Number} [tickNumber] - How far over to position the text marker.
   */

  /** @type {Props} */
  let {
    width = 100,
    height = 10,
    tickMarks = true,
    baseline = true,
    snapTicks = false,
    xTick = 0,
    tickNumber = 5
  } = $props();

  let axisScale = $derived(scaleLinear([0, $zDomain[1]], [0, width]));
  let isBandwidth = $derived(typeof axisScale.bandwidth === "function");

  let xTicks = $derived(ticks($zDomain[0], $zDomain[1], tickNumber));
  let tickVals = $derived(Array.isArray(xTicks)
    ? xTicks
    : isBandwidth
    ? axisScale.domain()
    : typeof xTicks === "function"
    ? xTicks(axisScale.ticks())
    : axisScale.ticks(xTicks));

  function textAnchor(i) {
    if (snapTicks === true) {
      if (i === 0) {
        return "start";
      }
      if (i === tickVals.length - 1) {
        return "end";
      }
    }
    return "middle";
  }
</script>

<g class="axis x-axis" class:snapTicks>
  {#each tickVals as tick, i (tick)}
    <g class="tick tick-{i}" transform="translate({axisScale(tick)},0)">
      {#if tickMarks === true}
        <line
          class="tick-mark"
          y1={0}
          y2={height + height / 4}
          x1={isBandwidth ? axisScale.bandwidth() / 2 : 0}
          x2={isBandwidth ? axisScale.bandwidth() / 2 : 0}
        />
      {/if}
      <text
        x={isBandwidth ? axisScale.bandwidth() / 2 + xTick : xTick}
        y={height + 20}
        dx=""
        dy=""
        text-anchor={textAnchor(i)}>{tick}</text
      >
    </g>
  {/each}
  {#if baseline === true}
    <line
      class="baseline"
      y1={height - 0.5}
      y2={height - 0.5}
      x1="0"
      x2={width}
    />
  {/if}
</g>

<style>
  .tick {
    font-size: 0.9em;
    font-weight: 200;
  }

  line,
  .tick line {
    stroke: #0f0f0f;
    stroke-width: 1;
    stroke-dasharray: 2;
  }

  .tick text {
    fill: #666;
  }

  .tick .tick-mark,
  .baseline {
    stroke-dasharray: 0;
    z-index: 8;
  }
  /* This looks slightly better */
  .axis.snapTicks .tick:last-child text {
    transform: translateX(3px);
  }
  .axis.snapTicks .tick.tick-0 text {
    transform: translateX(-3px);
  }
</style>
