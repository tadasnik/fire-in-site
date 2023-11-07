<script lang="ts">
  import { Toggle } from "flowbite-svelte";
  import RangeSlider from "svelte-range-slider-pips";
  import { AccordionItem, Accordion } from "flowbite-svelte";
  import {
    siteInputs,
    requiredSiteInputs,
  } from "$lib/shared/stores/modelStore.js";

  let timer: ReturnType<typeof setTimeout>;

  function debounce_set(e: Object, key: String) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      $siteInputs[key] = e.detail.values;
    }, 100);
  }

  function valuesDisplay(key) {
    if ($siteInputs[key].value.length > 1) {
      return $siteInputs[key].value.join("-");
    } else {
      return $siteInputs[key].value;
    }
  }

  $: isRange = (key) => {
    return $siteInputs[key].value.length > 1;
  };

  $: rangeSwitch = (key) => {
    if ($siteInputs[key].value.length > 1) {
      $siteInputs[key].value = [$siteInputs[key].defValue];
    } else {
      $siteInputs[key].value = [$siteInputs[key].min, $siteInputs[key].max];
    }
  };
</script>

<div class="flex flex-col p-4">
  <h3 class="h3 font-bold">Required site inputs:</h3>
  <Accordion multiple>
    {#each Object.keys($requiredSiteInputs) as key}
      <AccordionItem id={key}>
        <span
          slot="header"
          class="flex flex-row basis-72 gap-1 align-middle text-base"
        >
          <div class="basis-2/3 text-right pr-3">
            <span class="align-middle">{$siteInputs[key].label}</span>
          </div>

          <div class="text-left align-middle">
            <span class="align-middle"><b>{valuesDisplay(key)}</b></span>
            <span class="text-xs align-middle"
              >({$siteInputs[key].units})
            </span>
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
              min={$siteInputs[key].min}
              max={$siteInputs[key].max}
              step={$siteInputs[key].step}
              values={$siteInputs[key].value}
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
