import { readable, writable, derived, get } from 'svelte/store'
import { add, sub } from "date-fns";
import { currentLocation } from '$lib/shared/stores/locationStore'
import {
  dateTime, currentDateTime, differenceHours,
  getMonth, dateString, focusDay, getDateString
} from '$lib/shared/stores/timeStore'
import { fetchForecastMeteo } from "$lib/weather/openMeteo.ts";
import { fuelMoistureCalcs } from "$lib/model/fuelMoisture.js";

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
export const forecastModel = writable('ukmo_seamless')
export const forecastModels = readable([{ 'value': 'ukmo_seamless', 'displayName': 'UK Met Office', 'description': 'UK Met Office 2km (UK) and 10km (global) model' },
{ 'value': 'ecmwf_ifs025', 'displayName': 'ECMWF IFS', 'description': 'ECMWF IFS 0.25 degree global model' },
{ 'value': 'icon_seamless', 'displayName': 'ICON', 'description': 'German Weather service (DWD) ICON model with 2km (central Europe), 7km (Europe) and 11km (global) resolution for central Europe, Europe and globe' }])
export const fetchingForecast = writable(true)
export const forecastDays = writable(5)
export const forecastDaysPast = writable(1)
export const hourlyVarsFull = [
  "global_tilted_irradiance",
  "temperature_2m",
  "relative_humidity_2m",
  "precipitation",
  "weather_code",
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
  forecast_days_past = undefined
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
    "wind_speed_unit": "ms",
    "timeformat": "unixtime",
    "timezone": "auto",
    "forecast_mode": forecast_mode,
  };
  if ("global_tilted_irradiance" in hourlyVars) {
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
    }
  } else if (forecast_mode === "historical") {
    if (start_date === undefined) {
      start_date = getDateString(sub(get(currentDateTime), { days: get(forecastDaysPast) }))
    }
    if (end_date === undefined) { end_date = getDateString(get(currentDateTime)) }
    return { ...baseParams, start_date, end_date };
  }
}

export async function getForecastOpenMeteo({ hourlyVars, start_date, end_date, forecast_days, forecast_days_past, forecast_mode } = {}) {
  if (hourlyVars === undefined) { hourlyVars = hourlyVarsFull }
  if (forecast_mode === undefined) forecast_mode = get(forecastMode);

  // const start_date = getDateString(date.subtractDays(past_days))
  // const end_date = getDateString(date);
  if ((get(currentLocation).latitude) && (get(currentLocation).userLocation)) {
    // console.log("fetching forecast openMeteo")
    try {
      let result = {}
      if (get(currentLocation).distanceFromPrevious > 4000) {
        console.log("fetching forecast distanceFromPrevious > 4000", get(currentLocation).distanceFromPrevious, fillParams(hourlyVars, forecast_mode))
        result = await fetchForecastMeteo(fillParams(hourlyVars, forecast_mode));
      } else {
        console.log("fetching forecast distanceFromPrevious < 4000", get(currentLocation).distanceFromPrevious)

        hourlyVars = ["global_tilted_irradiance"]
        const gti = await fetchForecastMeteo(fillParams(["global_tilted_irradiance"], forecast_mode));
        result = get(forecastOpenMeteo)
        result["global_tilted_irradiance"] = gti["global_tilted_irradiance"]
      }

      // Second promise
      const resultMoist = await fuelMoistureCalcs(
        result,
        5,
        get(currentLocation).slope,
        get(currentLocation).aspect,
        get(currentLocation).elevation,
      );

      // Update stores
      forecastOpenMeteo.set(resultMoist);
      fetchingForecast.set(false);
      // currentDateTime.set(dateTime);
    } catch (error) {
      console.error("Error fetching forecast:", error);
      fetchingForecast.set(false);
    }
  }
}

export async function getHistory(hourlyVars = ['vapour_pressure_deficit'], start_date = undefined, end_date = undefined) {
  try {
    let result = {}
    if (get(currentLocation).distanceFromPrevious > 4000) {
      console.log("fetching forecast distanceFromPrevious > 4000", get(currentLocation).distanceFromPrevious)
      // console.log("params in getHistory", fillParams(hourlyVars, 'historical', start_date, end_date))
      result = await fetchForecastMeteo(fillParams({ hourlyVars, forecast_mode: "historical", start_date, end_date }));
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

export const currentTimeIndex = derived([dateTime], ([$dateTime]) => {
  const index = get(forecastOpenMeteo).time.indexOf($dateTime)
  return index > -1 ? index : 0
})

export const focusDayIndex = derived([focusDay], ([$focusDay]) => {
  const timeIndex = get(forecastOpenMeteo).time
  const indexMin = timeIndex.indexOf($focusDay.valueOf())
  const indexMax = timeIndex.indexOf($focusDay.valueOf() + 86400000);
  // console.log("time index calc", indexMin, indexMax, new Date($focusDay), new Date(timeIndex[0]), new Date(timeIndex[23]), new Date(timeIndex[-1]))
  return [indexMin, indexMax]
})
// export const currentDayTimeIndex = derived([dateTime], ([$dateTime]) => {
//   console.log("dateTime", $dateTime)
//   const index = get(forecastOpenMeteo).time.indexOf($dateTime)
//   return index > -1 ? index : 0
// })
