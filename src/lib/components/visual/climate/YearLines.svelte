<script>
  import { LayerCake, Svg, Html } from "layercake";
  import { getYear } from "date-fns";
  import { max } from "d3-array";
  import YearLinesLayer from "./YearLinesLayer.svelte";
  import YearLinesTooltip from "./YearLinesTooltip.svelte";
  import { currentLocation } from "$lib/shared/stores/locationStore";

  let {
    data = [],
    z = "vapour_pressure_deficit_max",
    varLabel = "VPD",
    varUnits = "kPa",
    parentWidth,
    parentHeight,
  } = $props();

  const currentYear = new Date().getFullYear();

  let series = $derived.by(() => {
    const groups = new Map();
    for (const d of data) {
      const y = getYear(new Date(d.date));
      if (!groups.has(y)) groups.set(y, []);
      groups.get(y).push({ doy: d.doy, value: d[z] });
    }
    for (const arr of groups.values()) arr.sort((a, b) => a.doy - b.doy);
    return groups;
  });

  let previousYearLines = $derived(
    Array.from(series.entries())
      .filter(([y]) => y !== currentYear)
      .map(([y, pts]) => ({ year: y, points: pts }))
  );

  let currentYearLine = $derived(series.get(currentYear) ?? []);

  let meanLine = $derived.by(() => {
    const sums = new Array(367).fill(0);
    const counts = new Array(367).fill(0);
    for (const [y, pts] of series) {
      if (y === currentYear) continue;
      for (const p of pts) {
        if (p.value == null || isNaN(p.value)) continue;
        sums[p.doy] += p.value;
        counts[p.doy] += 1;
      }
    }
    const out = [];
    for (let d = 1; d <= 366; d++) {
      if (counts[d] > 0) out.push({ doy: d, value: sums[d] / counts[d] });
    }
    return out;
  });

  let flatData = $derived(
    data
      .map((d) => ({ doy: d.doy, value: d[z] }))
      .filter((d) => d.value != null && !isNaN(d.value))
  );

  let yMax = $derived(max(flatData, (d) => d.value) ?? 1);

  let years = $derived(Array.from(series.keys()).sort((a, b) => a - b));
  let previousYearsRange = $derived.by(() => {
    const ys = years.filter((y) => y !== currentYear);
    if (ys.length === 0) return null;
    return ys.length === 1 ? `${ys[0]}` : `${ys[0]}–${ys[ys.length - 1]}`;
  });

  let hover = $state(null);
</script>

<div style="width: {parentWidth}px; height: {parentHeight}px; position: relative;">
  {#if flatData.length > 0}
    <div class="flex flex-wrap gap-x-5 gap-y-1 items-center justify-center text-xs text-gray-700 pb-1">
      {#if currentYearLine.length > 0}
        <span class="flex items-center gap-2">
          <svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke="#dc2626" stroke-width="2.5" /></svg>
          <span class="text-[#dc2626] font-semibold">{currentYear}</span>
        </span>
      {/if}
      {#if meanLine.length > 0 && previousYearsRange}
        <span class="flex items-center gap-2">
          <svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke="black" stroke-width="1.5" /></svg>
          <span>Mean {previousYearsRange}</span>
        </span>
      {/if}
      {#if previousYearsRange}
        <span class="flex items-center gap-2">
          <svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke="#bbb" stroke-width="0.8" /></svg>
          <span>Individual years {previousYearsRange}</span>
        </span>
      {/if}
    </div>
    <LayerCake
      x="doy"
      y="value"
      data={flatData}
      xDomain={[1, 366]}
      yDomain={[0, yMax]}
      padding={{ top: 20, right: 20, bottom: 30, left: 50 }}
    >
      <Svg>
        <YearLinesLayer
          {previousYearLines}
          {currentYearLine}
          {currentYear}
          {meanLine}
          {varLabel}
          {varUnits}
          bind:hover
        />
      </Svg>
      <Html pointerEvents={false}>
        <YearLinesTooltip {hover} {varLabel} {varUnits} />
        <div class="absolute top-1 left-12 text-xs text-gray-700 leading-tight">
          {#if $currentLocation.name}
            <div class="font-semibold">{$currentLocation.name}</div>
          {/if}
          <div class="text-gray-500 tabular-nums">
            {Math.abs($currentLocation.latitude).toFixed(2)}°{$currentLocation.latitude >= 0 ? "N" : "S"},
            {Math.abs($currentLocation.longitude).toFixed(2)}°{$currentLocation.longitude >= 0 ? "E" : "W"}
          </div>
        </div>
      </Html>
    </LayerCake>
  {/if}
</div>
