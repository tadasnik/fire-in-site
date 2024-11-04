<script>
  import { timeFormat } from "d3-time-format";
  import "$lib/styles/weather-icons.css";
  import "$lib/styles/weather-icons-wind.css";
  import FireCharAnotations from "./FireCharAnotations.svelte";
  import { currentDateTime, dateTime } from "$lib/shared/stores/timeStore";
  import { currentTimeIndex } from "$lib/shared/stores/forecastStore";
  import { Spinner } from "flowbite-svelte";

  export let data;
  export let forecastLocation;
  export let fireLocation;
  // export let displayProps;
  const metOfficeWeatherTypes = {
    "-1": "wi wi-showers",
    0: "wi wi-day-sunny",
    1: "wi wi-day-sunny",
    2: "wi wi-day-claudy",
    3: "wi wi-claudy",
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
    const integerWindDir = parseInt(windDir / 11.25);
    return cardinalDirections[
      Math.min(Math.max(integerWindDir, 0), 31)
    ].toLowerCase();
  }
  const dateFormat = timeFormat("%Y-%m-%d %a %I%p");

  const displayProps = {
    Temperature: ["screenTemperature", 0, "wi wi-thermometer"],
    "Relative Humidity": ["screenRelativeHumidity", 0, "wi wi-humidity"],
    "Wind Speed at 10m": ["windSpeed10m", 0, "wi wi-strong-wind"],
    "Wind From": ["windDirectionFrom10m", 0, "wi wi-wind-direction"],
  };
  // $: console.log("Weather info data", data);
</script>

<div class="min-h-20">
  {#if data}
    <!-- <div class="sm:w-full md:w-1/2 p-4 min-w-80 bg-gray-100"> -->
    <div class="flex flex-wrap flex-row justify-center space-x-2 text-2xl">
      <div>Fire Behaviour prediction for</div>
      <div>
        <strong>{dateFormat(new Date($currentDateTime))}</strong>
      </div>
    </div>

    <div class="flex align-middle justify-center items-end space-x-2">
      <div>Weather :</div>

      <div class="">
        <i
          class="text-2xl {metOfficeWeatherTypes[data.significantWeatherCode]}"
        />
      </div>

      <div class="space-x-0">
        <span class="">{data.temperature2m[$currentTimeIndex].toFixed(0)}</span
        ><i class="text-xl wi wi-degrees" /><span class="font-bold">C</span>
      </div>
      <div>
        <span class="pl-0"
          >{data.relativeHumidity2m[$currentTimeIndex].toFixed(0)}</span
        >
        <i class="wi wi-humidity" />
      </div>
      <div>
        <i
          class="text-xl wi wi-wind
        wi-from-{getWindCardinalDirection(
            data.windDirection10m[$currentTimeIndex],
          )}"
        />

        <span class="pl-0">
          {data.windSpeed10m[$currentTimeIndex].toFixed(0)}</span
        ><span class="font-bold pl-1"> m/s</span>
      </div>
    </div>
  {:else}
    <div class="flex justify-center">
      <Spinner></Spinner>
    </div>
  {/if}
</div>
