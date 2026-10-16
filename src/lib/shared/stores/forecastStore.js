import { readable, writable, derived, get } from 'svelte/store'
import { add, sub } from "date-fns";
import { currentLocation } from '$lib/shared/stores/locationStore'
import {
  dateTime, currentDateTime, differenceHours,
  getMonth, dateString, focusDay, getDateString, forecastUtcOffset
} from '$lib/shared/stores/timeStore'
import { fetchForecastMeteo } from "$lib/weather/openMeteo.ts";
import { fuelMoistureCalcs } from "$lib/model/fuelMoisture.js";
import { lfmcCalcs } from "$lib/model/lfmcModel.js";
import { curingCalcs } from "$lib/model/curingModel.js";
import { currentLocationSelection } from '$lib/shared/locationSelection';

const DAY_MS = 86400000;
let latestForecastRequest = 0;

/**
 * Daily-max VPD for the days preceding the forecast window, used to seed the
 * LFMC 7-day trailing mean (the main forecast fetch only carries 1 past day).
 *
 * This is a reduced (T + RH + VPD only) hourly fetch, not a daily one, on
 * purpose: (1) the daily `vapour_pressure_deficit_max` product from the forecast
 * endpoint is unusable on ukmo_seamless, whose hourly VPD the app already
 * overrides with a local Tetens computation from T+RH; and (2) the ERA5 archive
 * daily product lags ~5 days, so it cannot cover a window ending today. The
 * forecast endpoint's past_days backfill has no such lag. Daily max is reduced
 * from the locally-computed hourly VPD, matching how the forecast-window days
 * are derived — so past and forecast portions of the window are consistent.
 *
 * Returns a { dayIndex: vpdmax } map (dayIndex = floor(ms / DAY_MS)), or {} on
 * failure so the caller falls back to forecast-window data only.
 */
export async function fetchPastDailyVpdMax(forecast_mode, pastDays = 8) {
  try {
    const hourlyVars = ["temperature_2m", "relative_humidity_2m", "vapour_pressure_deficit"];
    const params = forecast_mode === "historical"
      ? fillParams({
        hourlyVars, forecast_mode,
        start_date: getDateString(sub(get(currentDateTime), { days: pastDays })),
        end_date: getDateString(get(currentDateTime)),
      })
      : fillParams({ hourlyVars, forecast_mode, forecast_days_past: pastDays, forecast_days: 1 });
    const res = await fetchForecastMeteo(params);
    const times = res.time || [];
    const vpd = res["vapour_pressure_deficit"] || [];
    const byDay = {};
    for (let i = 0; i < times.length; i++) {
      const v = vpd[i];
      const day = Math.floor(times[i] / DAY_MS);
      if (v != null && !Number.isNaN(v) && (byDay[day] == null || v > byDay[day])) byDay[day] = v;
    }
    return byDay;
  } catch {
    return {};
  }
}

export const forecastOpenMeteo = writable({
  time: [1403984000],
  temperature_2m: [15.05],
  relative_humidity_2m: [78.61],
  precipitation: [0],
  weather_code: [3],
  cloud_cover: [75],
  wind_speed_10m: [3.12],
  wind_direction_10m: [150],
  windGusts10m: [5.05],
  global_tilted_irradiance: [0],
})

export const forecastTimeSeries = writable([{
  feelsLikeTemperature: 15.05,
  max10mWindGust: 5.05,
  maxScreenAirTemp: 15.94,
  minScreenAirTemp: 15.66,
  mslp: 102390,
  precipitationRate: 0,
  probOfPrecipitation: 1,
  screenDewPointTemperature: 12.26,
  screenRelativeHumidity: 78.61,
  screenTemperature: 15.93,
  significantWeatherCode: 3,
  time: "2024-06-03T09:00Z",
  totalPrecipAmount: 0,
  totalSnowAmount: 0,
  uvIndex: 4,
  visibility: 19389,
  windDirectionFrom10m: 330,
  windGustSpeed10m: 5.05,
  wind_speed_10m: 3.12
}])

export const climateOpenMeteo = writable([{
  date: [1403984000],
  vapour_pressure_deficit: [0],
}])

export const forecastLocation = writable({ coordinates: [-3, 53, 100], name: "" })
export const forecastMode = writable('forecast')
export const forecastModes = ['forecast', 'historical']
export const forecastModel = writable('ecmwf_ifs')
export const forecastModels = readable([{ 'value': 'ukmo_seamless', 'displayName': 'UK Met Office', 'description': 'UK Met Office 2km (UK) and 10km (global) model' },
{ 'value': 'ecmwf_ifs', 'displayName': 'ECMWF IFS', 'description': 'ECMWF IFS 9km global model' },
{ 'value': 'icon_seamless', 'displayName': 'ICON', 'description': 'German Weather service (DWD) ICON model with 2km (central Europe), 7km (Europe) and 11km (global) resolution for central Europe, Europe and globe' }])
export const fetchingForecast = writable(true)
export const forecastDataMode = writable(null) // tracks which mode the current forecastOpenMeteo data belongs to
export const forecastCache = writable(null) // last known good forecast-mode data, cleared on location change
export const forecastDays = writable(5)
export const forecastDaysPast = writable(1)
export const hourlyVarsFull = [
  "global_tilted_irradiance",
  "temperature_2m",
  "relative_humidity_2m",
  "precipitation",
  "weather_code",
  "is_day",
  "cloud_cover",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
  "vapour_pressure_deficit",
]

export function fillParams({
  hourlyVars = hourlyVarsFull,
  forecast_mode = undefined,
  forecast_model = undefined,
  start_date = undefined,
  end_date = undefined,
  forecast_days = undefined,
  forecast_days_past = undefined,
} = {}) {
  // console.log("start_date, end_date in fillParams", start_date, end_date)
  if (forecast_mode === undefined) { forecast_mode = get(forecastMode) }
  if (forecast_model === undefined) { forecast_model = get(forecastModel) }
  if (forecast_days === undefined) { forecast_days = get(forecastDays) }
  if (forecast_days_past === undefined) { forecast_days_past = get(forecastDaysPast) }
  let baseParams = {
    "latitude": get(currentLocation).latitude,
    "longitude": get(currentLocation).longitude,
    "hourly": hourlyVars,
    // "wind_speed_unit": "km/h",
    "timeformat": "unixtime",
    "timezone": "auto",
    "forecast_mode": forecast_mode,
  };
  if (hourlyVars.includes("global_tilted_irradiance")) {
    baseParams = {
      ...baseParams,
      "tilt": get(currentLocation).slope,
      "azimuth": get(currentLocation).aspect - 180,
    }
  }
  if (forecast_mode === "forecast") {
    return {
      ...baseParams,
      "models": forecast_model,
      "past_days": forecast_days_past,
      "forecast_days": forecast_days,
      "daily": ["precipitation_sum", "sunrise", "sunset", "daylight_duration"],
    }
  } else if (forecast_mode === "historical") {
    if (start_date === undefined) {
      start_date = getDateString(sub(get(currentDateTime), { days: get(forecastDaysPast) }))
    }
    if (end_date === undefined) { end_date = getDateString(get(currentDateTime)) }
    return {
      ...baseParams,
      start_date,
      end_date,
      "daily": ["sunrise", "sunset", "daylight_duration"],
      "models": "era5_seamless"
    }
  }
}

export async function getForecastOpenMeteo({ hourlyVars, start_date, end_date, forecast_days, forecast_days_past, forecast_mode } = {}) {
  if (hourlyVars === undefined) { hourlyVars = hourlyVarsFull }
  if (forecast_mode === undefined) forecast_mode = get(forecastMode);

  // const start_date = getDateString(date.subtractDays(past_days))
  // const end_date = getDateString(date);
  if (!get(currentLocation).latitude) return;
  if (forecast_mode !== 'historical' && !get(currentLocation).userLocation) return;

  const request = ++latestForecastRequest;
  const selectionIsCurrent = currentLocationSelection();
  const isCurrent = () => request === latestForecastRequest && selectionIsCurrent();
  const latitude = get(currentLocation).latitude;
  fetchingForecast.set(true);
  console.log("fetching forecast openMeteo", forecast_mode)
  try {
    let result = {}
    const locationChanged = get(currentLocation).distanceFromPrevious > 4000;
    const modeChanged = get(forecastDataMode) !== forecast_mode;

    // Before overwriting forecastOpenMeteo with historical data, save the current forecast
    if (forecast_mode === 'historical' && get(forecastDataMode) === 'forecast') {
      forecastCache.set(get(forecastOpenMeteo));
    }

    // Kick off the reduced past-days VPD fetch concurrently with the main
    // (full-variable) fetch so it adds no wall-clock latency.
    const pastVpdPromise = fetchPastDailyVpdMax(forecast_mode);

    const cached = get(forecastCache);
    if (forecast_mode === 'historical' || locationChanged || (modeChanged && !cached)) {
      // Full fetch: historical mode, location changed, or switching to forecast with no cache
      result = await fetchForecastMeteo(fillParams({ hourlyVars, forecast_mode }));
    } else {
      // Restore cached forecast (mode switch back) or GTI-only refresh (same mode, same location)
      const base = (modeChanged && cached) ? cached : get(forecastOpenMeteo);
      const gti = await fetchForecastMeteo(fillParams({ hourlyVars: ["global_tilted_irradiance"], forecast_mode }));
      result = { ...base, global_tilted_irradiance: gti["global_tilted_irradiance"] };
    }

    // Daily max VPD for the days preceding the forecast window (LFMC 7-day mean).
    result._pastVpdMaxByDay = await pastVpdPromise;
    if (!isCurrent()) return;

    const resultMoist = await fuelMoistureCalcs(
      result,
      5,
      latitude,
    );
    if (!isCurrent()) return;
    // Add per-timestep live fuel moisture (used when live moisture mode = 'lfmc').
    await lfmcCalcs(resultMoist, latitude);
    if (!isCurrent()) return;
    // Add per-day grass curing (used when grass curing mode = 'phenology').
    await curingCalcs(resultMoist, latitude);
    if (!isCurrent()) return;
    forecastUtcOffset.set(result.utcOffsetSeconds ?? 0);
    forecastOpenMeteo.set(resultMoist);
    forecastDataMode.set(forecast_mode);
    fetchingForecast.set(false);
  } catch (error) {
    if (!isCurrent()) return;
    console.error("Error fetching forecast:", error);
    fetchingForecast.set(false);
  }
}

export async function getHistory(hourlyVars = ['vapour_pressure_deficit'], start_date = undefined, end_date = undefined) {
  try {
    let result = {}
    if (get(currentLocation).distanceFromPrevious > 4000) {
      // console.log("fetching forecast distanceFromPrevious > 4000", get(currentLocation).distanceFromPrevious)
      // console.log("params in getHistory", fillParams(hourlyVars, 'historical', start_date, end_date))
      result = await fetchForecastMeteo(fillParams({ hourlyVars, forecast_mode: "historical", start_date, end_date, }));
    } else {
      // result = await fetchForecastMeteo(fillParams(hourlyVars, 'historical', start_date, end_date));
    }
    return result
  } catch (error) {
    console.error("Error fetching forecast:", error);
  }
  fetchingForecast.set(false);
}

export function getIndexOf(dateObject) {
  return get(forecastOpenMeteo).time.indexOf(dateObject.getTime())
}

export const daysInForecast = derived([forecastOpenMeteo], ([$forecastOpenMeteo]) => {
  let days = []
  // skiping past days
  days.push(add(new Date($forecastOpenMeteo.time[0]), { days: get(forecastDaysPast) }).valueOf())
  for (let i = 1; i < get(forecastDays); i++) {
    days.push(add(new Date(days[i - 1]), { days: 1 }).valueOf())
  }
  // console.log("daysInForecast", days)
  return days
})

// export function getForecast() {
//   if ((get(currentLocation).latitude) && (get(currentLocation).userLocation) && (get(currentLocation).distanceFromPrevious > 5000)) {
//     // console.log("fetching forecast")
//     var promise = fetchForecastJSON(
//       get(currentLocation).latitude,
//       get(currentLocation).longitude,
//     );
//     promise.then(function (result) {
//       console.log("setting forecast location")
//       forecastLocation.set({ coordinates: result.features[0].geometry.coordinates, name: result.features[0].properties.location.name })
//       console.log("setting forecast timeSerie")
//       forecastTimeSeries.set(result.features[0].properties.timeSeries)
//     })
//   }
// }

export const forecastTimeIndex = derived(forecastTimeSeries, ($forecastTimeSeries) => {
  let indexMap = new Map()
  for (const [i, value] of $forecastTimeSeries.entries()) {
    indexMap.set(3600000 * (Math.round(new Date(value.time) / 3600000)), value)
  }
  console.log("forecastTimeIndex", indexMap)
  return indexMap
})

export const currentWeather = derived([forecastTimeSeries, dateTime], ([$forecastTimeSeries, $dateTime]) => {
  let currForecast = {}
  const indexCurrent = differenceHours(new Date($dateTime), new Date($forecastTimeSeries[0].time))
  if (indexCurrent < 5) {
    currForecast = $forecastTimeSeries[indexCurrent]
  } else {
    currForecast = $forecastTimeSeries[0]
  }
  return currForecast
});


export const elevationDiff = derived([forecastLocation, currentLocation], ([$forecastLocation, $currentLocation]) => {
  return $forecastLocation.coordinates[2] - $currentLocation.elevation
})

export const currentTimeIndex = derived([dateTime, forecastUtcOffset, forecastOpenMeteo], ([$dateTime, $forecastUtcOffset, $forecastOpenMeteo]) => {
  const localAsUtcMs = $dateTime + $forecastUtcOffset * 1000;
  const index = $forecastOpenMeteo.time.indexOf(localAsUtcMs);
  return index > -1 ? index : 0;
})

export const focusDayIndex = derived([focusDay, forecastOpenMeteo], ([$focusDay, $forecastOpenMeteo]) => {
  const timeIndex = $forecastOpenMeteo.time
  const indexMin = timeIndex.indexOf($focusDay.valueOf())
  const indexMax = timeIndex.indexOf($focusDay.valueOf() + 86400000);
  return [indexMin, indexMax]
})
// export const currentDayTimeIndex = derived([dateTime], ([$dateTime]) => {
//   console.log("dateTime", $dateTime)
//   const index = get(forecastOpenMeteo).time.indexOf($dateTime)
//   return index > -1 ? index : 0
// })
