<script context="module">
  export const ssr = false;
</script>

<script>
  import "../app.postcss";

  import { onMount } from "svelte";
  import { sineIn } from "svelte/easing";
  import { auth, db } from "$lib/firebase/firebase.client";
  import { page } from "$app/stores";
  import { browser } from "$app/environment";
  import { doc, getDoc, getDocs, collection, setDoc } from "firebase/firestore";
  import {
    Sidebar,
    Drawer,
    Dropdown,
    DropdownDivider,
    DropdownItem,
    Navbar,
    NavBrand,
    NavLi,
    NavUl,
    NavHamburger,
    Toggle,
    Button,
    CloseButton,
    Radio,
    Helper,
    Footer,
    FooterBrand,
  } from "flowbite-svelte";
  import { ChevronDownOutline } from "flowbite-svelte-icons";
  import { timeFormat } from "d3-time-format";
  import ukfdrsLogo from "$lib/assets/ukfdrs-logo.png";

  import {
    fuelMoistureModel,
    selectedOutput,
    selectedOutputs,
    modelConfigValues,
    advancedMode,
  } from "$lib/shared/stores/modelStore";
  import {
    getForecastOpenMeteo,
    forecastOpenMeteo,
    forecastMode,
    forecastModes,
    fetchingForecast,
  } from "$lib/shared/stores/forecastStore";
  import {
    getLocation,
    currentLocation,
  } from "$lib/shared/stores/locationStore";
  import { currentDateTime, timeMode } from "$lib/shared/stores/timeStore";
  import { outputNodes } from "$lib/data/outputNodes.js";

  import { authHandlers, authStore } from "$lib/shared/stores/authStore";
  import AuthReset from "$lib/components/AuthReset.svelte";

  function handleFuelMoistureChange(value) {
    console.log("Fuel moisture model changed to ", value);
    if (value === "Fosberg") {
      $fuelMoistureModel = "Fosberg";
      console.log(
        "modelConfigValues ",
        $modelConfigValues["configure.fuel.moisture"],
      );
      $modelConfigValues["configure.fuel.moisture"].value = "fosberg";
      console.log("Fuel moisture model changed to ", value);
    } else {
      $fuelMoistureModel = "Nelson";
      $modelConfigValues["configure.fuel.moisture"].value = "individual";
      console.log("Fuel moisture model changed to ", value);
    }
  }
  function handleTimeModeChange(value) {
    console.log("Time mode changed to ", value);
    $forecastMode = value;
    if (value === "historical") {
      if ($timeMode === "current") {
        console.log("current time mode changing to USER");
        $timeMode = "user";
        $fetchingForecast = true;
      }
    } else {
      $fetchingForecast = true;
      getForecastOpenMeteo();
    }
  }

  let transitionParams = {
    x: -320,
    duration: 200,
    easing: sineIn,
  };
  onMount(() => {
    const interval = setInterval(() => {
      if ($timeMode === "current") {
        console.log("current time mode");
        $currentDateTime = new Date();
      } else {
        console.log("user time mode");
      }
    }, 10000);

    // differenceHours($dateTime - Date($forecast.timeSeries[0].time));
    const unsuscribe = auth.onAuthStateChanged(async (user) => {
      // console.log("user changed ", user);
      authStore.update((curr) => {
        return { ...curr, currentUser: user };
      });
      console.log("user changed", user);
      if (
        // if browser and no user
        browser &&
        !$authStore.currentUser
        // !$authStore.isLoading
        // window.location.pathname !== "/"
      ) {
        // window.location.href = "/";
        console.log(
          " NOOO current User ",
          $authStore.currentUser,
          $authStore.isLoading,
        );
        const [latitude, longitude] = await getLocation();
        console.log(" GOT longitude", longitude, "GOT latitude", latitude);
        currentLocation.update((current) => ({
          ...current,
          userLocation: true,
          distanceFromPrevious: 10000,
          latitude: latitude,
          longitude: longitude,
        }));
      } else if (browser && $authStore.currentUser) {
        console.log(" ++++++++++++current User ", $authStore.currentUser);
        const userDocRef = doc(db, "users", user.uid);
        const userDocContent = await getDoc(userDocRef);
        if (!userDocContent.exists()) {
          const userRef = doc(db, "users", user.uid);
          await setDoc(
            userRef,
            {
              email: user.email,
              displayName: user.displayName,
            },
            { merge: true },
          );
        } else {
          const defLocationRef = doc(
            db,
            "users",
            user.uid,
            "Locations",
            "default",
          );
          getDoc(defLocationRef)
            .then((defLoc) => {
              if (defLoc.exists()) {
                console.log("Document data:", defLoc.data());
                currentLocation.update((current) => ({
                  ...current,
                  userLocation: true,
                  distanceFromPrevious: 10000,
                  latitude: defLoc.data().latitude,
                  longitude: defLoc.data().longitude,
                }));
              } else {
                console.log("No default location for user!");
                getLocation();
              }
            })

            .catch((error) => {
              console.error("Error getting documents: ", error);
            });
        }
      } else {
      }
      console.log("executing isLoading false");
      authStore.update((curr) => {
        console.log("curr", curr);
        return { ...curr, isLoading: false };
      });
    });
    return () => {
      unsuscribe;
      clearInterval(interval);
    };
  });

  let spanClass = "flex-1 ml-3 whitespace-nowrap";

  $: activeUrl = $page.url.pathname;
  $: console.log("layout activeURl", activeUrl);

  $: $currentLocation, getForecastOpenMeteo(); // promise.then(fetchForecast());

  let hidden1 = true;
  const toggleDrawer = () => {
    hidden1 = false;
  };

  $: console.log(" $$$$$$$ currentLocation:", $currentLocation);
  // $: console.log(" $$$$$$$ currentWeather:", $currentWeather);
  // $: console.log(" $$$$$$$ forecastTimeSeries:", $forecastTimeSeries);
  // $: console.log(" $$$$$$$ time:", $dateTime);
  // $: console.log(" $$$$$$$ fuel moisture:", $fuelM&oistureModel);
  // $: console.log(" $$$$$$$ config options :", $modelConfigValues);
  // $: console.log(
  // " $$$$$$$ requiredSiteInputsForecast:",
  // $requiredSiteInputsForecast
  // );
  const dateFormat = timeFormat("%a %b %e, %H %p");
</script>

<header
  class="top-0 z-40 flex-none w-full mx-auto bg-white border-b border-gray-200 dark:border-gray-600 dark:bg-gray-800"
>
  <Navbar
    color="default"
    fluid
    class="flex items-center justify-between w-full mx-auto py-1.5 px-4 max-w-8xl"
    let:hidden
    let:toggle
  >
    <NavHamburger onClick={toggleDrawer} class="m-0 mr-3 lg:hidden" />
    <NavBrand href="/">
      <span class="px-4 text-xl text-primary-800">UKBehavePlus</span>
    </NavBrand>
    <NavUl>
      <NavLi href="/fuelModels">Fuel Models</NavLi>
      <NavLi class="cursor-pointer">
        Fuel Moisture {$fuelMoistureModel}<ChevronDownOutline
          class="w-4 h-4 ms-2 text-primary-800 dark:text-white inline"
        />
      </NavLi>
      <Dropdown class="w-60 p-3 space-y-1">
        <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
          <Radio
            name="fuelMoistureModel"
            bind:group={$fuelMoistureModel}
            value={"Fosberg"}
            on:change={() => handleFuelMoistureChange("Fosberg")}>Fosberg</Radio
          >
          <Helper class="ps-6"
            >Calculate dead fuel mosture using Fosberg model.</Helper
          >
        </li>
        <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
          <Radio
            name="fuelMoistureModel"
            bind:group={$fuelMoistureModel}
            value={"Nelson"}
            on:change={() => handleFuelMoistureChange("Nelson")}>Nelson</Radio
          >
          <Helper class="ps-6"
            >Use simple Nelson dead fuel moisture model.</Helper
          >
        </li>
      </Dropdown>
      <NavLi class="cursor-pointer">
        {$forecastMode} Weather<ChevronDownOutline
          class="w-4 h-4 ms-2 text-primary-800 dark:text-white inline"
        />
      </NavLi>

      <Dropdown class="w-60 p-3 space-y-1">
        <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
          {#each forecastModes as mode}
            <Radio
              bind:group={$forecastMode}
              value={mode}
              on:change={() => handleTimeModeChange(mode)}
            >
              {mode}
            </Radio>
          {/each}
        </li>
      </Dropdown>
      <NavLi class="cursor-pointer">
        {outputNodes[$selectedOutput].label}<ChevronDownOutline
          class="w-4 h-4 ms-2 text-primary-800 dark:text-white inline"
        />
      </NavLi>
      <Dropdown class="w-60 p-3 space-y-1">
        <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
          {#each $selectedOutputs as output}
            <Radio bind:group={$selectedOutput} value={output}
              >{outputNodes[output].label}</Radio
            >
          {/each}
        </li>
      </Dropdown>

      {#if !$authStore.currentUser}
        <NavLi href="/authenticate">Log in</NavLi>
      {:else}
        <NavLi
          on:click={() => {
            authHandlers.logout();
          }}
          href="/">Log out</NavLi
        >
      {/if}
    </NavUl>

    <div class="flex items-center ml-auto">
      <Toggle size="small" bind:checked={$advancedMode}
        >Fire Characteristics</Toggle
      >
    </div>
  </Navbar>
</header>
{#if activeUrl === "/"}
  <!-- <Sidebar -->
  <!--   {activeUrl} -->
  <!--   asideClass="hidden overflow-y-auto md:block fixed inset-0 pt-20 z-30 flex-none h-full w-96 border-r border-gray-200 dark:border-gray-600" -->
  <!-- > -->
  <!--   <section class="p-4"> -->
  <!--     <div class="flex mb-4"> -->
  <!--       <InfoTable -->
  <!--         data={$forecastTimeIndex.get($dateTime)} -->
  <!--         title="Forecast for {dateFormat(new Date($dateTime))}" -->
  <!--       /> -->
  <!--     </div> -->
  <!--   </section> -->
  <!--   <SiteInputs /> -->
  <!--   <h3 class="pl-4 h3 font-bold">Fuel inputs</h3> -->
  <!---->
  <!--   {#each $selectedFuels as fuel} -->
  <!--     {@const key = Object.keys($requiredFuelInputs[fuel])} -->
  <!--     <section class="space-y-1"> -->
  <!--       <div class="pl-4 pt-2 flex flex-wrap"> -->
  <!--         <!-- {#if key === "surface.primary.fuel.model.catalogKey" || key === "surface.secondary.fuel.model.catalogKey"} -->
  <!--         {#if key.length === 1} -->
  <!--           <p>{fuel}</p> -->
  <!--         {:else} -->
  <!--           <FuelInputs {fuel} /> -->
  <!--         {/if} -->
  <!--       </div> -->
  <!--     </section> -->
  <!--   {/each} -->
  <!-- </Sidebar> -->
{/if}
<Drawer
  transitionType="fly"
  {transitionParams}
  bind:hidden={hidden1}
  id="sidebar1"
>
  <CloseButton on:click={() => (hidden1 = true)} class="mb-4 dark:text-white" />
  <div class="p-4">
    <h1 class="h1">Sidebar</h1>
    <p class="text-sm">This is a sidebar</p>
  </div></Drawer
>
<main class="">
  {#if !$authStore.isLoading && $authStore.currentUser}
    <!-- <heading class="p-8" tag="h1" customSize="text-3xl" -->
    <!--   >Private page user: {$authStore.currentUser.displayName} -->
    <!-- </heading> -->
    <!-- <AuthReset /> -->
    <slot />
  {:else if !$authStore.isLoading && $forecastOpenMeteo.time.length > 1}
    <div><p>{$currentLocation.longitude}</p></div>
    <slot />
  {:else}
    <h1>Loading....</h1>
  {/if}
</main>
<Footer footerType="logo">
  <hr class="my-6 border-gray-200 mx-auto dark:border-gray-700" />
  <div class="flex items-center justify-between px-10">
    <p>
      Fire behaviour predictions leverage BehavePlus fire behaviour model, fuel
      models representative of UK vegetation and MetOffice forecasts.
      Implementation: Tadas Nikonovas, Centre for Wildfire Research, Swansea
      University. Scientific data: Toward a UK Fire Danger Rating System project
      team.
    </p>
  </div>
  <div class="px-10 flex items-center justify-center">
    <FooterBrand
      href="https://ukfdrs.com/"
      src={ukfdrsLogo}
      alt="UKFDRS Logo"
      name="UKFDRS"
    />
  </div>
</Footer>
