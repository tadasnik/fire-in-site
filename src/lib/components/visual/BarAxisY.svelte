<!--
  @component
  Generates an SVG y-axis. This component is also configured to detect if your y-scale is an ordinal scale. If so, it will place the markers in the middle of the bandwidth.
 -->
<script>
  import { selectedFuel } from "$lib/shared/stores/modelStore.js";

  import UKFuelModels from "$lib/data/UKFuelModels.json";
  import FuelModal from "$lib/components/visual/FuelModal.svelte";
  import { fuelCodeFormat } from "$lib/shared/utils.js";
  import { getContext } from "svelte";

  const { padding, height, xRange, yRange, yScale, y } =
    getContext("LayerCake");

  /** @type {Boolean} [gridlines=true] - Extend lines from the ticks into the chart space */
  export let gridlines = true;

  /** @type {Boolean} [tickMarks=false] - Show a vertical mark for each tick. */
  export let tickMarks = false;

  /** @type {Function} [formatTick=d => d] - A function that passes the current tick value and expects a nicely formatted value in return. */
  export let formatTick = (d) => d;

  /** @type {Number|Array|Function} [ticks=4] - If this is a number, it passes that along to the [d3Scale.ticks](https://github.com/d3/d3-scale) function. If this is an array, hardcodes the ticks to those values. If it's a function, passes along the default tick values and expects an array of tick values in return. */
  export let ticks = 4;

  const tickLen = 5;
  $: isBandwidth = typeof $yScale.bandwidth === "function";

  $: tickVals = Array.isArray(ticks)
    ? ticks
    : isBandwidth
      ? $yScale.domain()
      : typeof ticks === "function"
        ? ticks($yScale.ticks())
        : $yScale.ticks(ticks);
  let clickOutsideModal = false;

  function handleFuelClick(fuel) {
    $selectedFuel = fuel;
    clickOutsideModal = !clickOutsideModal;
  }
  // $: console.log("BarsYaxis", ticks);
</script>

<div class="absolute w-full h-full">
  {#each ticks as fuel, i}
    {@const tickLines = UKFuelModels[fuel].displayLabel.split("\n")}
    <div
      class="absolute"
      style:left="{-$padding.left}px"
      style:top="{$yScale.step() * i}px"
      style:width="{$padding.left}px"
    >
      <div
        class="absolute border-t-2 border-gray-400"
        style:top="{$yScale.step() / 2 - 4}px"
        style:left="{$padding.left - tickLen}px"
        style:width="{tickLen}px"
      ></div>

      <div
        class="pr-2"
        role="button"
        on:click={() => handleFuelClick(fuel)}
        data-id={i}
        transform="translate(-60px, {$yScale.step() * i + 30})"
      >
        <div
          class="text-right whitespace-nowrap hover:text-primary-900 items-end"
        >
          <p class="font-bold">{tickLines[0]}</p>
          <p class="font-light">{tickLines[1]}</p>
        </div>
      </div>
    </div>
    <!-- <Popover -->
    <!--   class="w-64 text-sm font-light relative" -->
    <!--   arrow={false} -->
    <!--   title="" -->
    <!--   placement="right" -->
    <!--   offset={20} -->
    <!--   triggeredBy={"#" + "is" + i}>{prop[0]}</Popover -->
    <!-- > -->
  {/each}
  {#if clickOutsideModal}
    <FuelModal bind:clickOutsideModal />
  {/if}
</div>

<!-- <g -->
<!--   class="transition duration-300" -->
<!--   transform="translate({isBandwidth ? -$padding.left : 0} , 0)" -->
<!-- > -->
<!--   {#each tickVals as tickVal, nr} -->
<!--     {@const tickLines = tickVal.split("\n")} -->
<!--     <g -->
<!--       class="tick tick-{tickVal}" -->
<!--       transform="translate({$xRange[0] + -->
<!--         (isBandwidth ? $padding.left : 0)}, {isBandwidth -->
<!--         ? $yScale.step() * nr -->
<!--         : $yScale(tickVal)})" -->
<!--     > -->
<!--       {#if gridlines !== false} -->
<!--         <line -->
<!--           class="gridline" -->
<!--           x2="100%" -->
<!--           y1={isBandwidth ? $yScale.bandwidth() / 2 : 0} -->
<!--           y2={isBandwidth ? $yScale.bandwidth() / 2 : 0} -->
<!--         /> -->
<!--       {/if} -->
<!--       {#if tickMarks === true} -->
<!--         <line -->
<!--           class="tick-mark" -->
<!--           x1="0" -->
<!--           x2={isBandwidth ? -6 : -6} -->
<!--           y1={isBandwidth ? $yScale.bandwidth() / 2 : 0} -->
<!--           y2={isBandwidth ? $yScale.bandwidth() / 2 : 0} -->
<!--         /> -->
<!--       {/if} -->
<!--       <text -->
<!--         x={xTick} -->
<!--         y={isBandwidth ? $yScale.bandwidth() / 2 + yTick : yTick} -->
<!--         dy={isBandwidth ? 4 : dyTick} -->
<!--         style="text-anchor:{isBandwidth ? 'end' : textAnchor};" -->
<!--         class="fill-current text-gray-600 hover:text-primary-500" -->
<!--       > -->
<!--         {#each tickLines as line, i} -->
<!--           <tspan -->
<!--             font-weight={i === 0 ? "bold" : "normal"} -->
<!--             x={xTick} -->
<!--             dx="-9" -->
<!--             dy="1em">{line}</tspan -->
<!--           > -->
<!--         {/each} -->
<!--       </text> -->
<!--     </g> -->
<!--   {/each} -->
<!--   {#if axisLabel} -->
<!--     <text -->
<!--       text-anchor="middle" -->
<!--       y={isBandwidth ? 0 : -$padding.left} -->
<!--       x={-$height / 2} -->
<!--       dy=".75em" -->
<!--       transform="rotate(-90)">{axisLabel}</text -->
<!--     > -->
<!--   {/if} -->
<!-- </g> -->

<style>
  p {
    line-height: 0.6rem;
    font-size: 0.7rem;
  }
</style>
