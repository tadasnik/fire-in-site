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

  // // console.log("fetchForecastMeteo params", params)
  //
  // if (!params.forecast_mode) { params.forecast_mode = "forecast" }
  const url = params.forecast_mode === 'forecast' ? "https://api.open-meteo.com/v1/forecast" : "https://archive-api.open-meteo.com/v1/archive"
  const { forecast_mode, ...apiParams } = params;
  const responses = await fetchWeatherApi(url, apiParams)

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

  console.log("openMeteo utcOffsetSeconds", utcOffsetSeconds)
  console.log("openMeteo timezone", timezone)
  // Note: The order of weather variables in the URL query and the indices below need to match!
  const weatherData = {
    "time": range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
      (t) => Number(3600000 * (Math.round(Number(new Date((t + utcOffsetSeconds) * 1000)) / 3600000))))
  }
  //Store utc offset value for later use in time conversion of weather data
  weatherData["utcOffsetSeconds"] = utcOffsetSeconds;
  for (let [nr, variable] of params.hourly.entries()) {
    weatherData[variable] = hourly.variables(nr)!.valuesArray()!
  }

  // Some models (e.g. ukmo_seamless) return 0 for most/all vapour_pressure_deficit
  // values even when RH < 100% (where VPD should be > 0). Compared to ECMWF the local
  // Tetens computation matches the API to within ~0.04 kPa, so when T+RH are present
  // we override the API value with a locally-computed one for a model-independent result.
  // VPD = 0.6108·exp(17.27T/(T+237.3))·(1 − RH/100)  [kPa, T in °C].
  if (
    params.hourly.includes("vapour_pressure_deficit") &&
    params.hourly.includes("temperature_2m") &&
    params.hourly.includes("relative_humidity_2m")
  ) {
    const t = weatherData["temperature_2m"] as Float32Array;
    const rh = weatherData["relative_humidity_2m"] as Float32Array;
    const out = new Float32Array(t.length);
    for (let i = 0; i < t.length; i++) {
      const ti = t[i], rhi = rh[i];
      if (Number.isNaN(ti) || Number.isNaN(rhi)) { out[i] = NaN; continue; }
      const es = 0.6108 * Math.exp((17.27 * ti) / (ti + 237.3));
      out[i] = es * (1 - rhi / 100);
    }
    weatherData["vapour_pressure_deficit"] = out;
  }

  if ((params.models === "ukmo_seamless") && (params.forecast_days > 2) && (params.forecast_mode === "forecast")) {
    const gti = await fetchForecastMeteo({ ...params, models: "icon_seamless", hourly: ["global_tilted_irradiance"] })
    for (let [nr, value] of weatherData["global_tilted_irradiance"].entries()) {
      if (Number.isNaN(value)) {
        weatherData["global_tilted_irradiance"][nr] = gti["global_tilted_irradiance"][nr]
      };
    }
  }
  // Optional daily block (e.g. daily weather_code for DayPicker icons)
  if (Array.isArray(params.daily) && params.daily.length > 0) {
    const daily = response.daily();
    if (daily) {
      const dailyTime = range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
        (t) => Number(3600000 * (Math.round(Number(new Date((t + utcOffsetSeconds) * 1000)) / 3600000)))
      );
      weatherData["daily_time"] = dailyTime;
      for (const [nr, variable] of (params.daily as string[]).entries()) {
        weatherData["daily_" + variable] = daily.variables(nr)!.valuesArray()!;
      }
    }
  }

  weatherData["timeZone"] = timezone
  console.log("timezone", timezone)
  console.log("openMeteo weatherData", weatherData)
  return weatherData;
}
export async function fetchDailyMeteo(params: Record<string, any>): Promise<any> {
  const url = params.forecast_mode === 'forecast'
    ? "https://api.open-meteo.com/v1/forecast"
    : "https://archive-api.open-meteo.com/v1/archive";

  const { forecast_mode, ...apiParams } = params;
  const responses = await fetchWeatherApi(url, apiParams);
  const response = responses[0];
  const utcOffsetSeconds = response.utcOffsetSeconds();
  const daily = response.daily()!;

  const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

  const result: Record<string, any> = {
    time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval())
      .map(t => (t + utcOffsetSeconds) * 1000),
  };

  for (const [nr, variable] of (params.daily as string[]).entries()) {
    result[variable] = daily.variables(nr)!.valuesArray()!;
  }

  return result;
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


