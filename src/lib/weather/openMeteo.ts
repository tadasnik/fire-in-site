import { fetchWeatherApi } from 'openmeteo';


export async function fetchHistoryMeteo(latitude: Number, longitude: Number) {
  const params = {
    "latitude": latitude,
    "longitude": longitude,
    "start_date": "2020-07-19",
    "end_date": "2020-07-19",
    "hourly": ["temperature_2m", "relative_humidity_2m", "rain", "weather_code", "cloud_cover", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m"],
    "wind_speed_unit": "ms"
  };
  const url = "https://historical-forecast-api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);

  // Helper function to form time ranges
  const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

  // Process first location. Add a for-loop for multiple locations or weather models
  const response = responses[0];

  // Attributes for timezone and location
  const utcOffsetSeconds = response.utcOffsetSeconds();
  const timezone = response.timezone();
  const timezoneAbbreviation = response.timezoneAbbreviation();
  const forecastLatitude = response.latitude();
  const forecastLongitude = response.longitude();

  const hourly = response.hourly()!;


  // Note: The order of weather variables in the URL query and the indices below need to match!
  const weatherData = {

    hourly: {
      time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
        (t) => new Date((t + utcOffsetSeconds) * 1000)
      ),
      temperature2m: hourly.variables(0)!.valuesArray()!,
      relativeHumidity2m: hourly.variables(1)!.valuesArray()!,
      rain: hourly.variables(2)!.valuesArray()!,
      weatherCode: hourly.variables(3)!.valuesArray()!,
      cloudCover: hourly.variables(4)!.valuesArray()!,
      windSpeed10m: hourly.variables(5)!.valuesArray()!,
      windDirection10m: hourly.variables(6)!.valuesArray()!,
      windGusts10m: hourly.variables(7)!.valuesArray()!,
    },

  };

  // // `weatherData` now contains a simple structure with arrays for datetime and weather data
  // for (let i = 0; i < weatherData.hourly.time.length; i++) {
  //   console.log(
  //     weatherData.hourly.time[i].toISOString(),
  //     weatherData.hourly.temperature2m[i],
  //     weatherData.hourly.relativeHumidity2m[i],
  //     weatherData.hourly.rain[i],
  //     weatherData.hourly.weatherCode[i],
  //     weatherData.hourly.cloudCover[i],
  //     weatherData.hourly.windSpeed10m[i],
  //     weatherData.hourly.windDirection10m[i],
  //     weatherData.hourly.windGusts10m[i]
  //   );
  // }
}
export async function fetchForecastMeteo(latitude: number, longitude: number, slope: number, aspect: number, forecastMode: string, date: string) {
  function fillParams() {
    const past_days = 0;
    const forecast_days = 2;
    const start_date = date;
    const end_date = date;
    const baseParams = {
      "latitude": latitude,
      "longitude": longitude,
      "hourly": ["temperature_2m",
        "relative_humidity_2m",
        "precipitation",
        "weather_code",
        "cloud_cover",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
        "global_tilted_irradiance"],
      "wind_speed_unit": "ms",
      "tilt": slope,
      "azimuth": aspect - 180,
      "models": "best_match",
    };
    if (forecastMode === "forecast") {
      return { ...baseParams, past_days, forecast_days };
    } else if (forecastMode === "historical") {
      return { ...baseParams, start_date, end_date };
    }
  }
  const url = forecastMode === 'forecast' ? "https://api.open-meteo.com/v1/forecast" : "https://archive-api.open-meteo.com/v1/archive"
  const responses = await fetchWeatherApi(url, fillParams())

  // Helper function to form time ranges
  const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

  // Process first location. Add a for-loop for multiple locations or weather models
  const response = responses[0];

  // Attributes for timezone and location
  const utcOffsetSeconds = response.utcOffsetSeconds();
  const timezone = response.timezone();
  const timezoneAbbreviation = response.timezoneAbbreviation();
  const forecastLatitude = response.latitude();
  const forecastLongitude = response.longitude();
  const forecastLocationId = response.locationId();
  const forecastModel = response.model();

  const hourly = response.hourly();

  // Note: The order of weather variables in the URL query and the indices below need to match!
  const weatherData = {

    time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
      (t) => Number(3600000 * (Math.round(Number(new Date((t + utcOffsetSeconds) * 1000)) / 3600000)))
    ),
    temperature2m: hourly.variables(0)!.valuesArray()!,
    relativeHumidity2m: hourly.variables(1)!.valuesArray()!,
    precipitation: hourly.variables(2)!.valuesArray()!,
    weatherCode: hourly.variables(3)!.valuesArray()!,
    cloudCover: hourly.variables(4)!.valuesArray()!,
    windSpeed10m: hourly.variables(5)!.valuesArray()!,
    windDirection10m: hourly.variables(6)!.valuesArray()!,
    windGusts10m: hourly.variables(7)!.valuesArray()!,
    globalTiltedIrradiance: hourly.variables(8)!.valuesArray()!,

  };
  return weatherData;

  // `weatherData` now contains a simple structure with arrays for datetime and weather data
  // for (let i = 0; i < weatherData.hourly.time.length; i++) {
  //   console.log(
  //     weatherData.hourly.time[i].toISOString(),
  //     weatherData.hourly.temperature2m[i],
  //     weatherData.hourly.relativeHumidity2m[i],
  //     weatherData.hourly.rain[i],
  //     weatherData.hourly.cloudCover[i],
  //     weatherData.hourly.uvIndex[i]
  //   );
  // }
}

