<script>
  import { run } from 'svelte/legacy';

  import { getContext } from "svelte";
  import { scaleCanvas } from "layercake";

  /**
   * @typedef {Object} Props
   * @property {number} [height]
   * @property {number} [width]
   */

  /** @type {Props} */
  let { height = 22, width = 100 } = $props();

  const { ctx } = getContext("canvas");
  const { zScale, zDomain } = getContext("LayerCake");

  run(() => {
    if ($ctx) {
      scaleCanvas($ctx, width, height);
      $ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < width; ++i) {
        $ctx.fillStyle = $zScale((i / (width - 1)) * $zDomain[1]);
        $ctx.fillRect(i, 0, width, height);
      }
    }
  });
</script>
