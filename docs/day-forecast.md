# Point forecast charts

`WeatherMeteogram` and `FuelDayForecast` share a continuous LayerCake/D3 UTC
scale, one horizontally scrolling viewport and pinned row labels. The Day view
shows 24 one-hour intervals. The 5 days view shows 40 three-hour intervals,
anchored to the first forecast date. The 5 days view is the default; historical
weather uses the Day view. Day tabs show the EFFIS **Fire danger class** instead
of the numeric FWI, plus daily maximum firebrand ignition probability, surface
rate of spread (m/min), and flame length (m). Maxima use available local-day
hourly predictions across the selected fuels, independently of the chart metric
and interval. Each metric may peak at a different hour/fuel; tooltips identify
its peak. Partial days summarize available hours, not an assumed complete day.
Missing predictions stay unavailable and loading cannot expose stale maxima.
On small screens the day tabs scroll horizontally to keep summaries readable;
desktop retains five equal-width tabs.
The left-hand summary uses `Ignition prob.`, `ROS up to`, and `Flames up to`.
One generic flame photo fades into the background from the bottom of each day
card, independent of fuel category. It appears only when peak ROS is positive
and peak flame length is at least 1.5 m. This is an explicit display-only cutoff,
not a danger classification; low, zero and missing behaviour show no photo.
The photo is illustrative, not predicted fire occurrence, fuel category or size.
Category names (Gorse, Grass, etc.) replace model codes on the card;
both metrics identify their category if their peaks differ. Full model details and
peak hours are in tooltips and the tab's accessible label. These identify the
model producing the forecast maximum, not the likelihood of that fuel burning.
Zero/missing predictions do not identify a worst fuel. Ties use the first peak
encountered as a representative, rather than claiming a unique worst fuel.

Day cards use a taller portrait layout, a larger weather icon and 16 px category
markers. The EFFIS fire-danger class sits at the bottom without a separate box;
the background photo stays subtle to preserve text readability. Suppression symbols are not shown on the cards;
the fire-characteristics chart keeps its original artwork.

Ignition uses app-defined percentage bands, with the same six labels and colours
as EFFIS: Low <10%, Moderate 10–<30%, High 30–<50%, Very High 50–<70%, Extreme
70–<90%, Very Extreme ≥90%. These are **not an official EFFIS ignition scale**;
firebrand ignition probability is not the chance of a fire occurring. The band
definitions and distinction are exposed in tooltips and accessible labels.

The numeric FWI remains available in the tab's tooltip/accessibility detail, and
the weather chart's date bands repeat the coloured FWI marker and value.
Their shared EFFIS request also supplies the detailed indices panel. Missing or
failed EFFIS forecasts display no data, never a Low severity classification.
Weather row labels use compact icons and units, with VPD kept as an abbreviation.
Full names remain available in hover titles and screen-reader text. Weather and
fuel charts share the same 96 px pinned label column to keep their hours aligned.

## Time geometry and interaction

The chart is a forecast-time table with a temperature sparkline, not a mixture
of point-aligned rows and interval-aligned rows. Each column has one centred hour
label, icon, temperature, heatmap values and fuel values. The temperature line
connects those column centres. Short weather ticks sit below the hour labels.
There are 24 columns per day or 40 in the five-day view; no extra midnight column.

Columns retain explicit `periodStart` and `periodEnd` for widths, day bands, hit
targets and highlights. The 09 column occupies [09,12) in the overview and selects
09:00, but its rain/gust accumulation is the **preceding** [06,09] period. Tooltip
dates make the previous-day boundary explicit at midnight.

Forecast timestamps encode location wall time as UTC milliseconds, as elsewhere
in this application. Axis formatting uses UTC methods to avoid browser time-zone
drift. Hour selection subtracts `forecastUtcOffset` before updating
`currentDateTime`. Selecting a column selects its starting hour; any selected
hour inside that interval highlights the same column. Switching to Day retains
the selected date/hour. Missing data breaks curves and displays dashes in cells.

## Interval values

Temperature, humidity, vapour pressure deficit (VPD, kPa), cloud cover, weather codes and wind speed/direction are
sampled at the labelled forecast hour. Precipitation is an accumulation for the
preceding hour in Open-Meteo. The hourly 09 column uses API precipitation at 09;
the three-hour 09 column sums API timestamps 07, 08 and 09 (rain during 06–09).
Gust maxima use the same preceding-period convention. Row labels explicitly say
`prev 1h` or `prev 3h`. Wind cells show speed and direction above the smaller gust
maximum, all within the same column. Missing preceding samples stay unavailable,
including at the beginning of an incomplete historical range.

Precipitation probability is fetched separately from Best Match ensembles through
the existing customer API proxy, independently of the selected deterministic
model. Samples are joined by local timestamp, not array index. It means the chance
of >0.1 mm in the preceding hour, so the 09 column uses the 09:00 probability.
In the three-hour view, `% max` means the maximum of the three hourly chances,
not the probability for the entire preceding three-hour period. Missing hours make the
aggregate unavailable. Optional fetch failures leave unshaded dashes and do not
fail the weather forecast. ERA5 historical views do not request probability.

Only temperature uses a line and area fill. Other variables use thin coloured
cells with numerical values: humidity, VPD, precipitation, precipitation chance,
wind and cloud cover.
Darker shading means a higher value within that row's scale, not a danger class.
Humidity, precipitation chance and cloud cover use fixed 0–100% scales; other cell
scales adapt to the visible data. Missing values remain unshaded dashes. The
weather plot and hour axis are 282 px tall, excluding the five-day date header.

Fuel cells are unchanged: the 00 column uses predictions at 00, 01 and 02 for
[00,03), retaining each
fuel's maximum and its actual peak hour in the tooltip. The selected output's
existing display units are preserved. Colour is scaled across every fuel and
interval in the visible range; it does not represent danger classes. A missing
input hourly value makes a rain/gust/fuel aggregate unavailable, avoiding an
understated total or maximum. Single-hour bars and fire characteristics remain
available in the expandable comparison. EFFIS remains separate daily context.
The overview heading explicitly says `next 3h maxima`, distinguishing fire
behaviour from the preceding rain/gust statistics. A maximum can precede a later
rain event; it is not a prediction at the end of the three-hour window.

## Rain response in fuel moisture

Nelson applies `precipitation[n]` while calculating moisture at timestamp `n`:
this is rain already fallen during the preceding hour. The FireInSite dead-FMC
model uses VPD/radiation features and is raised to Nelson moisture when Nelson
exceeds 30% and the model estimate is drier. This correction must use the same
timestamp: ONNX outputs are interleaved by fuel, so `floor(outputIndex / 5)` is
the matching weather index. Do not advance it before reading Nelson moisture,
which would apply the next hour's wetting early and miss the final correction.
Precipitation probability is display-only and never weights model rainfall.

## Boundary and solar data

The weather fetch retains a sample at the visible closing midnight. Forecast
requests fetch one extra day then retain only the requested days, past days and
one closing sample. Historical requests similarly extend their end date then
trim to the closing midnight. It remains available in the underlying data but
is not drawn as an extra forecast-time column. This keeps the visible forecast
at five days and adds only one timestep to the downstream model calculations.

Daylight shading uses the daily sunrise/sunset epoch timestamps, decoded from
Open-Meteo SDK int64 seconds without hourly rounding. They are shifted with the
same UTC offset as the weather arrays. Each day's night/day/night rectangles
are clipped to the visible range, with boundaries at the returned seconds.
Daily daylight duration handles polar day/night. Missing solar data leaves that
day unshaded. The hourly `is_day` flag remains useful for night weather icons.

Sources:
- https://open-meteo.com/en/docs (interval semantics and sunrise/sunset fields)
- https://www.windy.com/50.094/14.414/meteogram (point forecast layout reference)
