<script>
  import { getContext } from "svelte";
  import { format } from "date-fns";

  let { hover = null, varLabel = "VPD", varUnits = "kPa" } = $props();

  const { width } = getContext("LayerCake");

  const w = 150;
  const offset = -20;

  function tipDate(h) {
    if (h.isMean) return "Mean";
    const y = typeof h.year === "number" ? h.year : new Date().getFullYear();
    return format(new Date(y, 0, h.doy), "yyyy-MM-dd");
  }

  function translation(h) {
    return h.x > $width / 2 ? "translate(-100%, -100%)" : "translate(0%, -100%)";
  }
</script>

{#if hover}
  <div
    class="absolute text-sm border border-gray-300 bg-white rounded-lg shadow-md p-2"
    style="
      width:{w}px;
      top:{hover.y + offset}px;
      left:{hover.x + -0.2 * offset}px;
      transform: {translation(hover)};
      pointer-events: none;
    "
  >
    <span class="key">
      {tipDate(hover)}
      <br />
      {varLabel}: {hover.value.toFixed(1)} ({varUnits})
    </span>
  </div>
{/if}

<style>
  .key {
    color: #999;
  }
</style>
