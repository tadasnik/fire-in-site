<script lang="ts">
  import { Toggle } from "flowbite-svelte";
  import RangeSlider from "svelte-range-slider-pips";
  import { AccordionItem, Accordion } from "flowbite-svelte";
  import {
    fuelInputs,
    requiredFuelInputs,
  } from "$lib/shared/stores/modelStore.js";
  import { fuelNodes } from "$lib/data/fuelNodes.js";

  export let fuel;

  let timer: ReturnType<typeof setTimeout>;

  function just_set(e: Object, key: String) {
    $fuelInputs[fuel][key] = e.detail.values;
  }

  function debounce_set(e: Object, key: String) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      $fuelInputs[fuel][key] = e.detail.values;
    }, 0);
  }

  function valuesDisplay(key) {
    if ($fuelInputs[fuel][key].length > 1) {
      return $fuelInputs[fuel][key].join("-");
    } else {
      return $fuelInputs[fuel][key];
    }
  }

  $: isRange = (key) => {
    return $fuelInputs[fuel][key].length > 1;
  };

  $: rangeSwitch = (key) => {
    if ($fuelInputs[fuel][key].length > 1) {
      $fuelInputs[fuel][key] = [$fuelInputs[fuel][key][0]];
    } else {
      $fuelInputs[fuel][key] = [fuelNodes[key].min, fuelNodes[key].max];
    }
  };
  $: console.log("fuel inputs : ", $fuelInputs);
</script>

<div class="flex flex-col p-4">
  <h3 class="h3 font-bold">Required inputs for: {fuel}</h3>
  <Accordion multiple>
    {#each Object.keys($requiredFuelInputs[fuel]) as key}
      <AccordionItem id={key}>
        <span
          slot="header"
          class="flex flex-row basis-72 gap-1 align-middle text-base"
        >
          <div class="basis-2/3 text-right pr-3">
            <span class="align-middle">{fuelNodes[key].label}</span>
          </div>

          <div class="text-left align-middle">
            <span class="align-middle"><b>{valuesDisplay(key)}</b></span>
            <span class="text-xs align-middle">({fuelNodes[key].units}) </span>
          </div>
        </span>

        <div class="flex flex-row items-center">
          <div class="basis-32 grow pr-3">
            <RangeSlider
              pips
              all={false}
              first="label"
              last="label"
              rest={false}
              float
              range={isRange(key)}
              min={fuelNodes[key].min}
              max={fuelNodes[key].max}
              step={fuelNodes[key].step}
              values={$fuelInputs[fuel][key]}
              on:stop={(e, key) => {
                debounce_set(e, key);
              }}
            />
          </div>
          <div class="basis-10 justify-start text-left">
            <div class="flex-row">
              <div class="pb-2"><p class="text-sm">Range?</p></div>
              <div>
                <Toggle
                  name="slide"
                  size="small"
                  checked={isRange(key)}
                  on:click={rangeSwitch(key)}
                />
              </div>
            </div>
          </div>
        </div>
      </AccordionItem>
    {/each}
  </Accordion>
</div>
