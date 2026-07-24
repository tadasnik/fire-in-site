// Open-Meteo daily/hourly `weather_code` uses WMO weather interpretation codes.
// Map each WMO code to a class from weather-icons (https://erikflowers.github.io/weather-icons/).
export const wmoIconClass = {
  0: "wi-day-sunny",            // Clear sky
  1: "wi-day-sunny-overcast",   // Mainly clear
  2: "wi-day-cloudy",           // Partly cloudy
  3: "wi-cloudy",               // Overcast
  45: "wi-fog",                 // Fog
  48: "wi-fog",                 // Depositing rime fog
  51: "wi-sprinkle",            // Drizzle: light
  53: "wi-sprinkle",            // Drizzle: moderate
  55: "wi-sprinkle",            // Drizzle: dense
  56: "wi-rain-mix",            // Freezing drizzle: light
  57: "wi-rain-mix",            // Freezing drizzle: dense
  61: "wi-rain",                // Rain: slight
  63: "wi-rain",                // Rain: moderate
  65: "wi-rain",                // Rain: heavy
  66: "wi-rain-mix",            // Freezing rain: light
  67: "wi-rain-mix",            // Freezing rain: heavy
  71: "wi-snow",                // Snow fall: slight
  73: "wi-snow",                // Snow fall: moderate
  75: "wi-snow",                // Snow fall: heavy
  77: "wi-snowflake-cold",      // Snow grains
  80: "wi-showers",             // Rain showers: slight
  81: "wi-showers",             // Rain showers: moderate
  82: "wi-showers",             // Rain showers: violent
  85: "wi-snow",                // Snow showers: slight
  86: "wi-snow",                // Snow showers: heavy
  95: "wi-thunderstorm",        // Thunderstorm
  96: "wi-storm-showers",       // Thunderstorm with slight hail
  99: "wi-storm-showers",       // Thunderstorm with heavy hail
};

// Open-Meteo often flags convective potential as code 95 (thunderstorm), drizzle
// (51-57) or showers (80-82) on hot, dry summer days even when forecast precipitation
// is effectively zero. If the daily precipitation_sum is below DRY_THRESHOLD mm, swap
// in a "sun + small indicator" day-variant icon — communicates "mostly clear with
// X potential" rather than "raining/storming".
const DRY_THRESHOLD_MM = 0.2;
const DRY_REPLACEMENTS = {
  51: "wi-day-sprinkle",        // Mostly clear w/ drizzle chance
  53: "wi-day-sprinkle",
  55: "wi-day-sprinkle",
  56: "wi-day-rain-mix",
  57: "wi-day-rain-mix",
  80: "wi-day-showers",         // Mostly clear w/ shower chance
  81: "wi-day-showers",
  82: "wi-day-showers",
  95: "wi-day-thunderstorm",    // Mostly clear w/ thunderstorm chance
  96: "wi-day-storm-showers",
  99: "wi-day-storm-showers",
};

export function iconForWmoCode(code, precipitationMm = null) {
  if (code == null || Number.isNaN(code)) return "";
  if (precipitationMm != null && precipitationMm < DRY_THRESHOLD_MM && DRY_REPLACEMENTS[code]) {
    return DRY_REPLACEMENTS[code];
  }
  return wmoIconClass[code] ?? "wi-na";
}
