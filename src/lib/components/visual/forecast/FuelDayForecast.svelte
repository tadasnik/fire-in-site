<script>
  import { LayerCake, Svg, Html } from 'layercake';
  import { scaleUtc } from 'd3-scale';
  import { _outputForecastArray, selectedOutput } from '$lib/shared/stores/modelStore';
  import { forecastOpenMeteo } from '$lib/shared/stores/forecastStore';
  import { dayFuels, viewWeather, formatValue, hourText, dateText } from '$lib/shared/dayForecast.js';
  import { outputNodes } from '$lib/data/outputNodes.js';
  import fuelModels from '$lib/data/UKFuelModels.json';
  import HourColumns from './HourColumns.svelte';
  import FuelCells from './FuelCells.svelte';
  import ForecastDayBands from './ForecastDayBands.svelte';
  import DaylightShading from './DaylightShading.svelte';
  let { start, multiday = false } = $props();
  const end = $derived(Number(start) + (multiday ? 5 : 1) * 86400000);
  const headerHeight = $derived(multiday ? 24 : 0);
  const options = $derived({ days: multiday ? 5 : 1, step: multiday ? 3 : 1 });
  const fuels = $derived(dayFuels($_outputForecastArray, start, options));
  const hours = $derived(viewWeather($forecastOpenMeteo, start, options));
  const output = $derived(outputNodes[$selectedOutput]);
  const max = $derived(Math.max(0, ...fuels.flatMap(fuel => fuel.values.map(point => point.value ?? 0))));
  const height = $derived(30 + fuels.length * 30);
  const describe = hour => `${dateText(hour.time)} ${hourText(hour.time)}${multiday ? `–${hourText(hour.periodEnd)} · 3-hour interval; peak per fuel` : ''} · ${output.label}: ${fuels.map(fuel => {
    const point = fuel.values.find(point => point.time === hour.time);
    return `${fuelModels[fuel.fuel]?.label ?? fuel.fuel} ${formatValue(point?.value, output.decimals ?? 1)} ${output.displayUnits ?? output.units ?? ''}${multiday && point?.peakTime != null ? ` (peak at ${hourText(point.peakTime)})` : ''}`;
  }).join('; ')}`;
</script>

<div class="day-chart-row" aria-label={multiday ? "Five-day fire behaviour by fuel" : "Hourly fire behaviour by fuel"}>
  <div class="day-chart-labels" style:height="{height + headerHeight}px">
    <span class="day-axis-label">{multiday ? 'Fuel / day / hour' : 'Fuel / hour'}</span>
    {#each fuels as fuel, i}
      <div class="fuel-row-label" style:top="{headerHeight + 30 + i * 30}px" title={fuelModels[fuel.fuel]?.label ?? fuel.fuel}>
        <span>{fuelModels[fuel.fuel]?.displayLabel ?? fuel.fuel}</span>
      </div>
    {/each}
  </div>
  <div class="day-chart-plot" style:height="{height + headerHeight}px">
    <LayerCake padding={{ top: headerHeight, right: 0, bottom: 0, left: 0 }} data={hours} x="time" xScale={scaleUtc()} xDomain={[Number(start), end]}>
      <Svg pointerEvents={false}><DaylightShading {start} {end} height={height} /><FuelCells {fuels} {max} decimals={output.decimals ?? 1} /></Svg>
      <Html>{#if multiday}<ForecastDayBands {hours} />{/if}<HourColumns {multiday} {hours} {height} {describe} label="Fire behaviour forecast hours" /></Html>
    </LayerCake>
  </div>
</div>
{#if !fuels.length}<p class="control-help">No fuel predictions are available for this period.</p>{/if}
<div class="fuel-scale control-help"><span>Lower</span><span class="fuel-scale-ramp"></span><span>{formatValue(max, 1)} {output.displayUnits ?? output.units}</span><span>Colour scaled to {multiday ? 'five-day' : 'daily'} values; — unavailable.</span></div>

<style>
  .fuel-row-label { position: absolute; left: 0; right: 0; height: 30px; display: flex; align-items: center; padding-right: 8px; font-size: 10px; line-height: 1.15; border-bottom: 1px solid rgb(148 163 184 / 12%); }
  .fuel-row-label span { white-space: pre-line; }
  .fuel-scale { display: flex; align-items: center; gap: 6px; padding: 4px 0; }
  .fuel-scale-ramp { width: 64px; height: 6px; background: linear-gradient(to right, #fff5eb, #7f2704); }
</style>
