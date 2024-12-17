<script>
  import { getContext } from "svelte";
  import { scaleCanvas } from "layercake";

  export let height = 22;
  export let width = 100;

  const { ctx } = getContext("canvas");
  const { zScale, zDomain } = getContext("LayerCake");

  $: {
    if ($ctx) {
      scaleCanvas($ctx, width, height);
      $ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < width; ++i) {
        $ctx.fillStyle = $zScale((i / (width - 1)) * $zDomain[1]);
        $ctx.fillRect(i, 0, width, height);
      }
    }
  }
</script>
