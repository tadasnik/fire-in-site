<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot (legend-title to legend_title) making the component unusable -->
<script>
  import { getContext } from "svelte";
  import { Canvas, Svg } from "layercake";
  import ColorbarCanvas from "./ColorbarCanvas.svelte";
  import ColorbarAxisX from "./ColorbarAxisX.svelte";

  // TODO width should depend on spiral width and centre fraction
  let legendWidth = 180;

  $: colorbarRatio = legendWidth * 0.07;
  $: colorbarHeight = 12 > colorbarRatio ? 12 : colorbarRatio;
</script>

<div class="legend">
  <div class="legend__title">
    <slot name="legend-title" />
  </div>
  <div class="legend__colorbar" bind:clientWidth={legendWidth}>
    <Canvas zIndex={0}>
      <ColorbarCanvas width={legendWidth} height={colorbarHeight} />
    </Canvas>
    <svg
      width={legendWidth}
      height={colorbarHeight}
      style="z-index: 2; position:absolute; overflow: visible;"
    >
      <ColorbarAxisX width={legendWidth} height={colorbarHeight} />
    </svg>
  </div>
</div>

<style>
  .legend {
    display: row;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    overflow: visible;
  }
  .legend__title {
    text-align: center;
    font-size: 0.8em;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    line-height: 1.2em;
    color: #999;
    max-width: 24em;
    margin-bottom: 1em;
  }
  .legend__colorbar {
    min-width: 100px;
    min-height: 20px;
    margin: 5px;
    position: relative;
    overflow: visible;
  }
</style>
