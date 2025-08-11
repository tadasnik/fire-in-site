<script>
  import "$lib/styles/weather-icons.css";
  import "$lib/styles/weather-icons-wind.css";

  let { data, title } = $props();
  // export let displayProps;
  const displayProps = {
    Temperature: ["screenTemperature", 0, "wi wi-thermometer"],
    "Relative Humidity": ["screenRelativeHumidity", 0, "wi wi-humidity"],
    "Wind Speed at 10m": ["wind_speed_10m", 0, "wi wi-strong-wind"],
    "Wind From": ["windDirectionFrom10m", 0, "wi wi-wind-direction"],
  };
</script>

<div class="w-full bg-gray-100">
  {#if data}
    <div class="text-center pb-2">
      <h4><strong>{title}</strong></h4>
    </div>
    {#each Object.entries(displayProps) as [key, prop]}
      <span class="flex flex-row gap-1 align-middle">
        <div class="w-1/2 text-right pr-1 border-r-2">
          <i class={prop[2]}></i>
        </div>
        <div class="w-1/2 text-left align-middle">
          <b>{data[prop[0]].toFixed(prop[1])}</b>
          <span class="text-xs align-middle">C</span>
        </div>
      </span>
    {/each}
  {/if}
</div>
