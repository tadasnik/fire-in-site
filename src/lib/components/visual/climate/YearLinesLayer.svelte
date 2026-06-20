<script>
  import { getContext } from "svelte";
  import { line as d3line } from "d3-shape";
  import { getDayOfYear } from "date-fns";

  let {
    previousYearLines = [],
    currentYearLine = [],
    currentYear = new Date().getFullYear(),
    meanLine = [],
    varLabel = "",
    varUnits = "",
    hover = $bindable(null),
  } = $props();

  const { xScale, yScale, width, height } = getContext("LayerCake");
  const todayDoy = getDayOfYear(new Date());

  let lineGen = $derived(
    d3line()
      .x((d) => $xScale(d.doy))
      .y((d) => $yScale(d.value))
      .defined((d) => d.value != null && !isNaN(d.value))
  );

  const monthStarts = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  let allLines = $derived([
    ...previousYearLines,
    ...(currentYearLine.length > 0
      ? [{ year: currentYear, points: currentYearLine, isCurrent: true }]
      : []),
    ...(meanLine.length > 0
      ? [{ year: "Mean", points: meanLine, isMean: true }]
      : []),
  ]);

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const doy = Math.round($xScale.invert(px));
    if (doy < 1 || doy > 366) {
      hover = null;
      return;
    }
    let best = null;
    let bestDist = Infinity;
    for (const line of allLines) {
      const pt = line.points.find((p) => p.doy === doy);
      if (!pt) continue;
      const ySvg = $yScale(pt.value);
      const dist = Math.abs(ySvg - py);
      if (dist < bestDist) {
        bestDist = dist;
        best = {
          doy,
          year: line.year,
          value: pt.value,
          x: $xScale(doy),
          y: ySvg,
          isMean: line.isMean,
          isCurrent: line.isCurrent,
          points: line.points,
        };
      }
    }
    hover = best;
  }

  function onLeave() {
    hover = null;
  }
</script>

<g>
  {#each $yScale.ticks(5) as tick}
    <line x1={0} x2={$width} y1={$yScale(tick)} y2={$yScale(tick)} stroke="#eee" stroke-width="1" pointer-events="none" />
    <text x={-8} y={$yScale(tick)} text-anchor="end" dominant-baseline="middle" font-size="10" fill="#666" pointer-events="none">
      {tick.toFixed(1)}
    </text>
  {/each}

  {#if varLabel}
    <text
      transform="translate({-38}, {$height / 2}) rotate(-90)"
      text-anchor="middle"
      font-size="11"
      fill="#444"
      pointer-events="none"
    >
      {varLabel}{varUnits ? ` (${varUnits})` : ""}
    </text>
  {/if}

  {#each monthStarts as doy, i}
    <line x1={$xScale(doy)} x2={$xScale(doy)} y1={0} y2={$height} stroke="#f5f5f5" stroke-width="1" pointer-events="none" />
    <text x={$xScale(doy + 15)} y={$height + 18} text-anchor="middle" font-size="10" fill="#666" pointer-events="none">
      {monthLabels[i]}
    </text>
  {/each}

  {#each previousYearLines as { year, points } (year)}
    <path d={lineGen(points)} fill="none" stroke="#bbb" stroke-width="0.6" opacity="0.7" pointer-events="none" />
  {/each}

  {#if meanLine.length > 0}
    <path d={lineGen(meanLine)} fill="none" stroke="black" stroke-width="1.5" pointer-events="none" />
  {/if}

  {#if currentYearLine.length > 0}
    <path d={lineGen(currentYearLine)} fill="none" stroke="#dc2626" stroke-width="2.5" pointer-events="none" />
  {/if}

  <line
    x1={$xScale(todayDoy)}
    x2={$xScale(todayDoy)}
    y1={0}
    y2={$height}
    stroke="#333"
    stroke-width="1"
    stroke-dasharray="4 3"
    pointer-events="none"
  />
  <text
    x={$xScale(todayDoy)}
    y={-6}
    text-anchor="middle"
    font-size="10"
    fill="#333"
    pointer-events="none"
  >
    Today
  </text>

  <line x1={0} x2={$width} y1={$height} y2={$height} stroke="#333" stroke-width="1" pointer-events="none" />
  <line x1={0} x2={0} y1={0} y2={$height} stroke="#333" stroke-width="1" pointer-events="none" />

  {#if hover}
    <line
      x1={hover.x}
      x2={hover.x}
      y1={0}
      y2={$height}
      stroke="#666"
      stroke-width="0.5"
      stroke-dasharray="2 2"
      pointer-events="none"
    />
    <path
      d={lineGen(hover.points)}
      fill="none"
      stroke={hover.isMean ? "#000" : hover.isCurrent ? "#dc2626" : "#2563eb"}
      stroke-width={hover.isCurrent || hover.isMean ? 2.8 : 2}
      pointer-events="none"
    />
    <circle
      cx={hover.x}
      cy={hover.y}
      r="3.5"
      fill={hover.isMean ? "#000" : hover.isCurrent ? "#dc2626" : "#2563eb"}
      stroke="white"
      stroke-width="1"
      pointer-events="none"
    />
  {/if}

  <rect
    x={0}
    y={0}
    width={$width}
    height={$height}
    fill="transparent"
    onmousemove={onMove}
    onmouseleave={onLeave}
  />
</g>
