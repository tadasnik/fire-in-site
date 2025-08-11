<script lang="ts">
  import { Button, Modal, Toggle } from "flowbite-svelte";
  import { Input, Label, Helper } from "flowbite-svelte";
  import RangeSlider from "svelte-range-slider-pips";
  import { AccordionItem, Accordion } from "flowbite-svelte";
  import { db, auth } from "$lib/firebase/firebase.client";
  import { doc, getDoc, getDocs, collection, setDoc } from "firebase/firestore";
  import {
    siteInputs,
    // requiredSiteInputs,
    requiredSiteInputsForecast,
    scenarios,
    selectedScenario,
  } from "$lib/shared/stores/modelStore.js";
  import { authStore } from "$lib/shared/stores/authStore";
  import type { fromJSON } from "postcss";

  let timer: ReturnType<typeof setTimeout>;
  let defaultModal = $state(false);

  let currScenario = $state({
    label: "",
    description: "",
  });

  async function readGlobalScenarios() {
    const scenariosQuerry = await getDocs(collection(db, "scenarios"));
    let globalScenarios = [];
    scenariosQuerry.forEach((doc) => {
      globalScenarios.push(doc.data());
    });
    return globalScenarios;
  }

  async function readUserScenarios(user) {
    const scenariosQuerry = await getDocs(
      collection(db, "users", user.uid, "scenarios")
    );
    let userScenarios = [];
    scenariosQuerry.forEach((doc) => {
      userScenarios.push(doc.data());
    });
    return userScenarios;
  }

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      //do your logged in user stuff here
      const userScenarios = await readUserScenarios(user);
      userScenarios.forEach((element) => {
        $scenarios.push(element);
      });
      $scenarios = $scenarios;
    } else {
      // TODO remove user content from store!?
    }
  });

  async function addScenario(currScenario, dbCollectionPath) {
    try {
      console.log("adding to path ", ...dbCollectionPath);
      const userRef = doc(...dbCollectionPath);
      await setDoc(userRef, {
        ...currScenario,
      });
    } catch (error) {
      console.log("There was an error saving your information", error);
    }
  }

  function debounce_set(e: Object, key: String) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      $siteInputs[key] = e.detail.values;
    }, 100);
  }

  function valuesDisplayScenario(key) {
    if ($selectedScenario[key].length > 1) {
      return $selectedScenario[key].join("-");
    } else {
      return $selectedScenario[key];
    }
  }

  function valuesDisplay(key) {
    if ($siteInputs[key].value.length > 1) {
      return $siteInputs[key].value.join("-");
    } else {
      return $siteInputs[key].value;
    }
  }
  function prepareScenario() {
    Object.keys($requiredSiteInputsForecast).forEach((key) => {
      currScenario[key] = $siteInputs[key].value;
    });
    console.log("currScenario ", currScenario);
  }

  function activateScenarioModal() {
    prepareScenario();
  }

  let isRange = $derived((key) => {
    return $siteInputs[key].value.length > 1;
  });

  let rangeSwitch = $derived((key) => {
    if ($siteInputs[key].value.length > 1) {
      $siteInputs[key].value = [$siteInputs[key].defValue];
    } else {
      $siteInputs[key].value = [$siteInputs[key].min, $siteInputs[key].max];
    }
  });
  // $: console.log("authStore ", $authStore)
  // $: console.log("requiredSiteInputsForecast ", $requiredSiteInputsForecast);
  // $: console.log("defaultModal ", defaultModal);
</script>

<div class="flex flex-col p-4">
  <h3 class="h3 font-bold">Site inputs:</h3>
  <Accordion multiple>
    {#each Object.keys($requiredSiteInputsForecast) as key}
      <AccordionItem id={key}>
        {#snippet header()}
                <span
            
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
              {/snippet}

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

  {#if $authStore.currentUser}
    <div class="pt-4">
      <Button
        on:click={() => {
          prepareScenario();
          defaultModal = true;
        }}>Save this scenario</Button
      >
    </div>
  {/if}

  <Modal class="mt-20" title="Save Scenario" bind:open={defaultModal} autoclose>
    <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
      Save current site fuel moisture, slope and wind speed settings as a
      scenario in the database.
    </p>

    <form>
      <div class="grid gap-6 mb-6 md:grid-cols-1">
        <div>
          <Label for="scenario_label" class="mb-2">Unique label</Label>
          <Input
            type="text"
            bind:value={currScenario.label}
            id="scenario_label"
            placeholder="label"
            required
          />
        </div>
        <div>
          <Label for="scenario_description" class="mb-2">Description</Label>
          <Input
            type="text"
            bind:value={currScenario.description}
            id="scenario_description"
            placeholder="description"
            required
          />
        </div>

        <!-- {#each Object.keys(currScenario) as key} -->
        {#each Object.keys($requiredSiteInputsForecast) as key}
          <div>
            {#if currScenario[key].length === 1}
              <Label class="mb-2"
                >{$siteInputs[key].label}({$siteInputs[key].units})</Label
              >
              <Input
                type="number"
                id={$siteInputs[key].label}
                bind:value={currScenario[key][0]}
                placeholder=""
                required
              />
            {:else}
              <Label for={$siteInputs[key].label} class="mb-2"
                >{$siteInputs[key].label}({$siteInputs[key].units})</Label
              >
              <div class="grid gap-6 md:grid-cols-2">
                {#each $siteInputs[key].value as value, indx}
                  <div>
                    <Input
                      type="number"
                      id={$siteInputs[key].label + indx}
                      bind:value={currScenario[key][indx]}
                      placeholder=""
                      required
                    />
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </form>
    {#snippet footer()}
      
        <Button
          on:click={() =>
            addScenario(currScenario, [
              db,
              "users",
              $authStore.currentUser.uid,
              "scenarios",
              currScenario.label,
            ])}>Save</Button
        >
        <Button color="alternative">Cancel</Button>
        {#if $authStore.currentUser.uid === "SgbOOJpWvYVps3JY31UnfSgqKLX2"}
          <Button
            on:click={() => {
              addScenario(currScenario, [db, "scenarios", currScenario.label]);
            }}>Save to global</Button
          >
        {/if}
      
      {/snippet}
  </Modal>
</div>
