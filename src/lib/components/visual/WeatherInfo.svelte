<script>
  import { timeFormat } from "d3-time-format";
  import "$lib/styles/weather-icons.css";
  import "$lib/styles/weather-icons-wind.css";
  import FireCharAnotations from "./FireCharAnotations.svelte";

  export let data;
  export let forecastLocation;
  export let fireLocation;
  // export let displayProps;
  const metOfficeWeatherTypes = {
    "-1": "wi wi-showers",
    0: "wi wi-night-clear",
    1: "wi wi-day-sunny",
    2: "wi wi-night-alt-partly-cloudy",
    3: "wi wi-day-cloudy",
    5: "wi wi-fog",
    6: "wi wi-fog",
    7: "wi wi-cloudy",
    8: "wi wi-cloudy",
    9: "wi wi-night-alt-showers",
    10: "wi wi-day-showers",
    11: "wi wi-showers",
    12: "wi wi-showers",
    13: "wi wi-night-showers",
    14: "wi wi-day-showers",
    15: "wi wi-rain",
    16: "wi wi-day-sleet",
    17: "wi wi-night-sleet",
    18: "wi wi-sleet",
    19: "wi wi-day-hail",
    20: "wi wi-night-alt-hail",
    21: "wi wi-hail",
    22: "wi wi-day-snow",
    23: "wi wi-night-alt-snow",
    24: "wi wi-snow",
    25: "wi wi-day-snow",
    26: "wi wi-night-alt-snow",
    27: "wi wi-snow",
    28: "wi wi-day-thunderstorm",
    29: "wi wi-night-alt-thunderstorm",
    30: "wi wi-thunderstorm",
  };
  const cardinalDirections = {
    0: "N",
    1: "NNE",
    2: "NNE",
    3: "NE",
    4: "NE",
    5: "ENE",
    6: "ENE",
    7: "E",
    8: "E",
    9: "ESE",
    10: "ESE",
    11: "SE",
    12: "SE",
    13: "SSE",
    14: "SSE",
    15: "S",
    16: "S",
    17: "SSW",
    18: "SSW",
    19: "SW",
    20: "SW",
    21: "WSW",
    22: "WSW",
    23: "W",
    24: "W",
    25: "WNW",
    26: "WNW",
    27: "NW",
    28: "NW",
    29: "NNW",
    30: "NNW",
    31: "N",
  };

  function getWindCardinalDirection(windDir) {
    return cardinalDirections[Math.floor(windDir / 11.25)].toLowerCase();
  }
  const dateFormat = timeFormat("%a %I%p");

  const displayProps = {
    Temperature: ["screenTemperature", 0, "wi wi-thermometer"],
    "Relative Humidity": ["screenRelativeHumidity", 0, "wi wi-humidity"],
    "Wind Speed at 10m": ["windSpeed10m", 0, "wi wi-strong-wind"],
    "Wind From": ["windDirectionFrom10m", 0, "wi wi-wind-direction"],
  };
  console.log("wEatheaInfo data ", data, fireLocation);
</script>

<div class="container mx-auto">
  {#if data}
    <!-- <div class="sm:w-full md:w-1/2 p-4 min-w-80 bg-gray-100"> -->
    <div class="w-full p-4 min-w-80 bg-gray-100">
      <div class="flex flex-wrap flex-row justify-center space-x-2 text-2xl">
        <div>Fire Behaviour prediction for</div>
        <div><strong>{forecastLocation}</strong></div>
        <div>
          {dateFormat(new Date(data.time))}
        </div>
      </div>

      <div class="flex align-middle justify-center items-end space-x-3">
        <div class="">
          <i
            class="text-2xl {metOfficeWeatherTypes[
              data.significantWeatherCode
            ]}"
          />
        </div>

        <div class="space-x-0">
          <span class="">{data.screenTemperature.toFixed(0)}</span><i
            class="text-xl wi wi-degrees"
          /><span class="font-bold">C</span>
        </div>
        <div>
          <span class="pl-0">{data.screenRelativeHumidity.toFixed(0)}</span>
          <i class="wi wi-humidity" />
        </div>
        <div>
          <i
            class="text-xl wi wi-wind
        wi-from-{getWindCardinalDirection(data.windDirectionFrom10m)}"
          />

          <span class="pl-0"> {data.windSpeed10m.toFixed(0)}</span><span
            class="font-bold pl-1"
          >
            m/s</span
          >
        </div>
      </div>
    </div>
    <!-- <div class="sm:w-full md:w-1/2 p-4 min-w-80"> -->
    <!--   <div class="text-2xl">Fire Location:</div> -->
    <!--   {fireLocation.latitude.toFixed(3)}<i -->
    <!--     class="text-xl wi wi-degrees" -->
    <!--   />{fireLocation.latitude >= 0 ? "N" : "S"}, {fireLocation.longitude.toFixed( -->
    <!--     3 -->
    <!--   )}<i class="text-xl wi wi-degrees" />{fireLocation.longitude >= 0 -->
    <!--     ? "E" -->
    <!--     : "W"}, {fireLocation.elevation.toFixed(0)}m asl, slope: {fireLocation.slope.toFixed( -->
    <!--     0 -->
    <!--   )}%, aspect: -->
    <!--   <i -->
    <!--     class="text-2xl wi wi-wind -->
    <!--     wi-towards-{getWindCardinalDirection(fireLocation.aspect)}" -->
    <!--   /> -->
    <!--   <strong -->
    <!--     >({cardinalDirections[Math.floor(fireLocation.aspect / 11.25)]})</strong -->
    <!--   > -->
    <!-- </div> -->
  {/if}
</div>
