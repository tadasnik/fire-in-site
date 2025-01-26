<script>
  import { Range, Label } from "flowbite-svelte";
  import {
    siteInputsStore,
    fuelsInputs,
    userInputs,
    inputNodesStore,
    _outputForecastCanopy,
    _outputUserInputs,
  } from "$lib/shared/stores/modelStore.js";

  import { dateTime } from "$lib/shared/stores/timeStore";
  import { currentLocation } from "$lib/shared/stores/locationStore";
  import { inputNodes } from "$lib/data/inputNodes.js";
  import { onMount } from "svelte";
  import InputControl from "../InputControl.svelte";
  import FuelInputs from "../fuelInputs.svelte";

  let timer;

  onMount(() => {
    console.log("fuelsInputs", $fuelsInputs);
    const currentForecast = $_outputForecastCanopy.get($dateTime)[0].values;
    console.log("currentForecast", currentForecast);
    const tempStore = {};
    Object.entries($siteInputsStore).forEach(([key, value]) => {
      console.log(key, value);
      tempStore[key] = Math.round(currentForecast[key]);
    });
    $siteInputsStore = tempStore;
    // console.log("inputNodesStore", inputNodesStore);
  });

  function debounce_set(value, key) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      $siteInputsStore[key] = value;
    }, 100);
  }

  function valuesDisplay(key) {
    if ($siteInputsStore[key].length > 1) {
      return $siteInputsStore[key].join("-");
    } else {
      return $siteInputsStore[key];
    }
  }

  const key = "site.canopy.fuel.foliar.moistureContent";
  function debounce(callback, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        callback(...args);
      }, delay);
    };
  }
  let sliderValue = 50; // Initial slider value
  let debouncedValue = sliderValue;

  // Create a debounced function for value changes
  const debouncedUpdate = debounce((value) => {
    debouncedValue = value;
    console.log("Debounced Value:", debouncedValue); // Handle the value change
  }, 300); // 300ms debounce delay

  // Update slider value and trigger the debounced function
  function handleSliderChange(event) {
    sliderValue = event.target.valueAsNumber;
    debouncedUpdate(sliderValue);
  }

  $: console.log("user Inputs", $userInputs);
  $: console.log("user outputs", $_outputUserInputs);
</script>

<div class="flex flex-col mx-auto">
  {#each Object.entries($siteInputsStore) as [key, value]}
    <div class="py-3">
      <Label>{inputNodes[key]["label"]}: {value}({inputNodes[key].units})</Label
      >
      <Range
        id={key}
        size="sm"
        min={inputNodes[key].min}
        max={inputNodes[key].max}
        {value}
        on:change={(event) => {
          debounce_set(event.target.valueAsNumber, key);
        }}
      />
    </div>
  {/each}
</div>
