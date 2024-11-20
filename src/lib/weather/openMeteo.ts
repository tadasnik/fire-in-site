import { fetchWeatherApi } from 'openmeteo';
import { get } from 'svelte/store';
import { forecastDays, forecastDaysPast } from '$lib/shared/stores/forecastStore';
import { getDateString } from '$lib/shared/stores/timeStore';

Date.prototype.subtractDays = function (days: number) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() - days);
  return date;
}


export async function fetchForecastMeteo(latitude: number, longitude: number, slope: number, aspect: number, forecastMode: string, forecastModel: string, hourlyVars: string[], date: Date) {
  console.log("fetchForecastMeteo", latitude, longitude, slope, aspect, forecastMode, forecastModel, hourlyVars, date)
  function fillParams() {
    const past_days = get(forecastDaysPast);
    const forecast_days = get(forecastDays);
    const start_date = getDateString(date.subtractDays(past_days))
    const end_date = getDateString(date);
    const baseParams = {
      "latitude": latitude,
      "longitude": longitude,
      "hourly": hourlyVars,
      "wind_speed_unit": "ms",
      "tilt": slope,
      "azimuth": aspect - 180,
    };
    if (forecastMode === "forecast") {
      return { ...baseParams, "models": forecastModel, past_days, forecast_days };
    } else if (forecastMode === "historical") {
      return { ...baseParams, start_date, end_date };
    }
  }
  console.log("fillParams", fillParams())
  const url = forecastMode === 'forecast' ? "https://api.open-meteo.com/v1/forecast" : "https://archive-api.open-meteo.com/v1/archive"
  const responses = await fetchWeatherApi(url, fillParams())

  // Helper function to form time ranges
  const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

  // Process first location. Add a for-loop for multiple locations or weather models
  const response = responses[0];

  // Attributes for timezone and location
  const utcOffsetSeconds = response.utcOffsetSeconds();
  // const timezone = response.timezone();
  // const timezoneAbbreviation = response.timezoneAbbreviation();
  // const forecastLatitude = response.latitude();
  // const forecastLongitude = response.longitude();
  // const forecastLocationId = response.locationId();
  // const forecastMod = response.model();

  const hourly = response.hourly();

  // Note: The order of weather variables in the URL query and the indices below need to match!
  const weatherData = {
    "time": range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
      (t) => Number(3600000 * (Math.round(Number(new Date((t + utcOffsetSeconds) * 1000)) / 3600000))))
  }

  for (let [nr, variable] of hourlyVars.entries()) {
    weatherData[variable] = hourly.variables(nr)!.valuesArray()!
  }

  console.log("openMeteo weatherData", weatherData)
  if ((forecastModel === "ukmo_seamless") && (get(forecastDays) > 2) && (forecastMode === "forecast")) {
    console.log("openMeteo fetching gti")
    const gti = await fetchForecastMeteo(latitude, longitude, slope, aspect, forecastMode, "icon_seamless", ["global_tilted_irradiance"], date)
    for (let [nr, value] of weatherData["global_tilted_irradiance"].entries()) {
      if (Number.isNaN(value)) {
        weatherData["global_tilted_irradiance"][nr] = gti["global_tilted_irradiance"][nr]

      };
    }
  }
  return weatherData;
}
//     "latitude": latitude,
//     "longitude": longitude,
// "start_date": "2020-07-19",
//   "end_date": "2020-07-19",
//     "hourly": ["temperature_2m", "relative_humidity_2m", "rain", "weather_code", "cloud_cover", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m"],
//     "wind_speed_unit": "ms"
   // };
//   const url = "https://historical-forecast-api.open-meteo.com/v1/forecast";
//   const responses = await fetchWeatherApi(url, params);
//
//   // Helper function to form time ranges
//   const range = (start: number, stop: number, step: number) =>
//     Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);
//
//   // Process first location. Add a for-loop for multiple locations or weather models
//   const response = responses[0];
//
//   // Attributes for timezone and location
//   const utcOffsetSeconds = response.utcOffsetSeconds();
//   // const timezone = response.timezone();
//   // const timezoneAbbreviation = response.timezoneAbbreviation();
//   // const forecastLatitude = response.latitude();
//   // const forecastLongitude = response.longitude();
//
//   const hourly = response.hourly()!;
//
//
//   // Note: The order of weather variables in the URL query and the indices below need to match!
//   const weatherData = {
//
//     hourly: {
//       time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
//         (t) => new Date((t + utcOffsetSeconds) * 1000)
//       ),
//       temperature2m: hourly.variables(0)!.valuesArray()!,
//       relativeHumidity2m: hourly.variables(1)!.valuesArray()!,
//       rain: hourly.variables(2)!.valuesArray()!,
//       weatherCode: hourly.variables(3)!.valuesArray()!,
//       cloudCover: hourly.variables(4)!.valuesArray()!,
//       windSpeed10m: hourly.variables(5)!.valuesArray()!,
//       windDirection10m: hourly.variables(6)!.valuesArray()!,
//       windGusts10m: hourly.variables(7)!.valuesArray()!,
//     },
//
//   };
//
// }
//


