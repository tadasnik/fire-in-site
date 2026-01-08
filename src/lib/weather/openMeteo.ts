import { fetchWeatherApi } from 'openmeteo';


export async function fetchForecastMeteo(params: {
  latitude: number,
  longitude: number,
  hourly: string[],
  slope: number | undefined
  aslope: number | undefined,
  forecast_model: string | undefined,
  start_date: string | undefined,
  end_date: string | undefined,
  forecast_mode: string | undefined,
  forecast_days: number | undefined,
  timezone: string | undefined,
}): Promise<any> {

  // console.log("fetchForecastMeteo params", params)

  if (!params.forecast_mode) { params.forecast_mode = "forecast" }
  const url = params.forecast_mode === 'forecast' ? "https://api.open-meteo.com/v1/forecast" : "https://archive-api.open-meteo.com/v1/archive"
  const responses = await fetchWeatherApi(url, params)

  // Helper function to form time ranges
  const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

  // Process first location. Add a for-loop for multiple locations or weather models
  const response = responses[0];

  // Attributes for timezone and location
  const utcOffsetSeconds = response.utcOffsetSeconds();
  const timezone = response.timezone();
  // const timezoneAbbreviation = response.timezoneAbbreviation();
  // const forecastLatitude = response.latitude();
  // const forecastLongitude = response.longitude();
  // const forecastLocationId = response.locationId();
  // const forecastMod = response.model();

  const hourly = response.hourly();

  // console.log("openMeteo utcOffsetSeconds", utcOffsetSeconds)
  // console.log("openMeteo timezone", timezone)
  // Note: The order of weather variables in the URL query and the indices below need to match!
  const weatherData = {
    "time": range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
      (t) => Number(3600000 * (Math.round(Number(new Date((t + utcOffsetSeconds) * 1000)) / 3600000))))
  }

  for (let [nr, variable] of params.hourly.entries()) {
    weatherData[variable] = hourly.variables(nr)!.valuesArray()!
  }

  if ((params.forecast_model === "ukmo_seamless") && (params.forecastDays > 2) && (params.forecastMode === "forecast")) {
    // console.log("openMeteo fetching gti")
    const gti = await fetchForecastMeteo({ ...params, forecast_model: "icon_seamless", hourlyVars: ["global_tilted_irradiance"] })
    for (let [nr, value] of weatherData["global_tilted_irradiance"].entries()) {
      if (Number.isNaN(value)) {
        weatherData["global_tilted_irradiance"][nr] = gti["global_tilted_irradiance"][nr]

      };
    }
  }
  weatherData["timeZone"] = timezone
  console.log("timezone", timezone)
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


