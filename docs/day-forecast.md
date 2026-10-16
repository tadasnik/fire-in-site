# Point forecast charts

`WeatherMeteogram` and `FuelDayForecast` share a continuous LayerCake/D3 UTC
scale, one horizontally scrolling viewport and pinned row labels. The Day view
shows 24 one-hour intervals. The 5 days view shows 40 three-hour intervals,
anchored to the first forecast date. Historical weather uses the Day view.

## Time geometry and interaction

An interval has explicit `periodStart` and `periodEnd`; its left boundary is the
labelled hour. For example, the 00 tick starts [00:00, 03:00) in the overview.
Cell widths, day bands, hit targets and highlights all use those endpoints.
Fuel values stay centred in cells. Weather curves use actual sample timestamps,
including the closing midnight: 25 samples per day or 41 samples in the overview.
The right edge has a closing 00 tick.

Forecast timestamps encode location wall time as UTC milliseconds, as elsewhere
in this application. Axis formatting uses UTC methods to avoid browser time-zone
drift. Hour selection subtracts `forecastUtcOffset` before updating
`currentDateTime`. Selecting a column selects its starting hour; any selected
hour inside that interval highlights the same column. Switching to Day retains
the selected date/hour. Missing data breaks curves and displays dashes in cells.

## Interval values

Temperature, humidity, cloud cover, weather codes and wind speed/direction are
sampled at their timestamps. Precipitation is an accumulation for the preceding
hour in Open-Meteo. Thus the 00–03 rain bar sums values timestamped 01, 02 and 03.
Gust maxima for that interval use the same preceding-hour convention, and the
dashed gust curve places the maximum at the interval's right endpoint.

Fuel cells use hourly predictions at 00, 01 and 02 for [00,03), retaining each
fuel's maximum and its actual peak hour in the tooltip. The selected output's
existing display units are preserved. Colour is scaled across every fuel and
interval in the visible range; it does not represent danger classes. A missing
input hourly value makes a rain/gust/fuel aggregate unavailable, avoiding an
understated total or maximum. Single-hour bars and fire characteristics remain
available in the expandable comparison. EFFIS remains separate daily context.

## Boundary and solar data

The weather fetch includes a sample at the visible closing midnight. Forecast
requests fetch one extra day then retain only the requested days, past days and
one closing sample. Historical requests similarly extend their end date then
trim to the closing midnight. This keeps the visible forecast at five days and
adds only one timestep to the downstream model calculations.

Daylight shading uses the daily sunrise/sunset epoch timestamps, decoded from
Open-Meteo SDK int64 seconds without hourly rounding. They are shifted with the
same UTC offset as the weather arrays. Each day's night/day/night rectangles
are clipped to the visible range, with boundaries at the returned seconds.
Daily daylight duration handles polar day/night. Missing solar data leaves that
day unshaded. The hourly `is_day` flag remains useful for night weather icons.

Sources:
- https://open-meteo.com/en/docs (interval semantics and sunrise/sunset fields)
- https://www.windy.com/50.094/14.414/meteogram (point forecast layout reference)
