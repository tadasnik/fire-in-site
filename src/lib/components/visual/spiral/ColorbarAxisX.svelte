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

  /** @type {Number} [width=100] - Width of the parrent div */
  export let width = 100;

  /** @type {Number} [height=10] - Height of the parrent div */
  export let height = 10;

  /** @type {Boolean} [tickMarks=false] - Show a vertical mark for each tick. */
  export let tickMarks = true;

  /** @type {Boolean} [baseline=false] – Show a solid line at the bottom. */
  export let baseline = true;

  /** @type {Boolean} [snapTicks=false] - Instead of centering the text on the first and the last items, align them to the edges of the chart. */
  export let snapTicks = false;

  /** @type {Number} [xTick=0] - How far over to position the text marker. */
  export let xTick = 0;

  /** @type {Number} [tickNumber=5] - How far over to position the text marker. */
  export let tickNumber = 5;

  $: axisScale = scaleLinear([0, $zDomain[1]], [0, width]);
  $: isBandwidth = typeof axisScale.bandwidth === "function";

  $: xTicks = ticks($zDomain[0], $zDomain[1], tickNumber);
  $: tickVals = Array.isArray(xTicks)
    ? xTicks
    : isBandwidth
    ? axisScale.domain()
    : typeof xTicks === "function"
    ? xTicks(axisScale.ticks())
    : axisScale.ticks(xTicks);

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
