<script>
  import { Range, Label } from "flowbite-svelte";
  import {
    canopyInputs,
    inputNodesStore,
  } from "$lib/shared/stores/modelStore.js";
  import { inputNodes } from "$lib/data/inputNodes.js";
  import InputControl from "../InputControl.svelte";

  let timer;

  // $: console.log("inputNodes", inputNodes);

  function debounce_set(value, key) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      $canopyInputs[key][0] = value;
    }, 100);
  }

  function valuesDisplay(key) {
    if ($canopyInputs[key].length > 1) {
      return $canopyInputs[key].join("-");
    } else {
      return $canopyInputs[key];
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
</script>

<div class="flex flex-col mx-auto">
  {#each Object.entries($canopyInputs) as [key, value]}
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
