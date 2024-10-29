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
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
    SidebarDropdownWrapper,
    SidebarDropdownItem,
    Spinner,
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
  import {
    ChevronDownOutline,
    ChevronRightOutline,
    AdjustmentsHorizontalSolid,
    ColumnOutline,
    HomeOutline,
  } from "flowbite-svelte-icons";
  import { timeFormat } from "d3-time-format";
  import FireInSiteLogo from "$lib/assets/FireInSitlogo.png";
  import ukfdrsLogo from "$lib/assets/ukfdrs-logo.png";

  import {
    fuelMoistureModel,
    selectedOutput,
    selectedOutputs,
    modelConfigValues,
    chartType,
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

  function handleFuelMoistureChange(value) {
    if (value === "Fosberg") {
      $fuelMoistureModel = "Fosberg";
      $modelConfigValues["configure.fuel.moisture"].value = "fosberg";
      console.log("Fuel moisture model changed to ", value);
    } else {
      $fuelMoistureModel = "Nelson";
      $modelConfigValues["configure.fuel.moisture"].value = "individual";
      console.log("Fuel moisture model changed to ", value);
    }
  }
  function handleTimeModeChange(value) {
    $fetchingForecast = true;
    $forecastMode = value;
    if (value === "historical") {
      if ($timeMode === "current") {
        $timeMode = "user";
      }
    } else {
      $currentDateTime = new Date();
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
        $currentDateTime = new Date();
      } else {
      }
    }, 1.8e9);

    // differenceHours($dateTime - Date($forecast.timeSeries[0].time));
    const unsuscribe = auth.onAuthStateChanged(async (user) => {
      // console.log("user changed ", user);
      authStore.update((curr) => {
        return { ...curr, currentUser: user };
      });
      console.log("user changed");
      if (
        // if browser and no user
        browser &&
        !$authStore.currentUser
        // !$authStore.isLoading
        // window.location.pathname !== "/"
      ) {
        // window.location.href = "/";

        const [latitude, longitude] = await getLocation();
        // const [latitude, longitude] = [51.514463, -0.159742];

        currentLocation.update((current) => ({
          ...current,
          userLocation: true,
          distanceFromPrevious: 10000,
          latitude: latitude,
          longitude: longitude,
        }));
      } else if (browser && $authStore.currentUser) {
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
    <NavBrand href="/">
      <img src={FireInSiteLogo} class="me-3 h-6 sm:h-9" alt="fireInSite Logo" />
    </NavBrand>

    <div class="flex md:order-2">
      <NavHamburger onClick={toggleDrawer} class="m-0 mr-3 lg:hidden" />
      <NavUl>
        {#if !$authStore.currentUser}
          <NavLi href="/authenticate">Sign in</NavLi>
        {:else}
          <NavLi
            on:click={() => {
              authHandlers.logout();
            }}
            href="/">Sign out</NavLi
          >
        {/if}
      </NavUl>
    </div>
    <NavUl>
      <NavLi href="/fuelModels">Fuel Models</NavLi>
      <NavLi class="cursor-pointer">
        <div class="flex-col items-center">
          <AdjustmentsHorizontalSolid
            class="w-4 h-4 ms-2 text-primary-900 dark:text-white inline"
          />
          Settings
        </div>
      </NavLi>

      <Dropdown>
        <div class="px-4 py-2">
          <span class="block text-lg text-gray-900 dark:text-white"
            >Dead fuel moisture model:</span
          >
        </div>
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
            on:change={() => handleFuelMoistureChange("Nelson")}
            >SimpleFFMC</Radio
          >
          <Helper class="ps-6"
            >Use simple Nelson dead fuel moisture model.</Helper
          >
        </li>
        <DropdownDivider></DropdownDivider>
        <div class="px-4 py-2">
          <span class="block text-lg text-gray-900 dark:text-white"
            >Weather mode:</span
          >
        </div>

        {#each forecastModes as mode}
          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
            <Radio
              bind:group={$forecastMode}
              value={mode}
              on:change={() => handleTimeModeChange(mode)}
            >
              {mode}
            </Radio>
            <Helper class="ps-6"
              >Fetch {mode} weather{mode === "historical"
                ? " for a specific date."
                : "."}</Helper
            >
          </li>
        {/each}

        <DropdownDivider></DropdownDivider>
        <div class="px-4 py-2">
          <span class="block text-lg text-gray-900 dark:text-white"
            >Chart type :</span
          >
        </div>
        <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
          <Radio bind:group={$chartType} value={"bars"}>Bar chart</Radio>

          <Helper class="ps-6">Show fire behaviour for selected time.</Helper>
        </li>
        <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
          <Radio bind:group={$chartType} value={"fireChar"}>
            Fire Characteristics
          </Radio>

          <Helper class="ps-6">Show Fire Characteristics chart.</Helper>
        </li>

        <DropdownDivider></DropdownDivider>
        <div class="px-4 py-2">
          <span class="block text-lg text-gray-900 dark:text-white"
            >Select model output:</span
          >
        </div>

        {#each $selectedOutputs as output}
          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
            <Radio bind:group={$selectedOutput} value={output}
              >{outputNodes[output].label}</Radio
            >
          </li>
        {/each}
      </Dropdown>
      <Dropdown class="w-60 p-3 space-y-1">
        <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
          {#each $selectedOutputs as output}
            <Radio bind:group={$selectedOutput} value={output}
              >{outputNodes[output].label}</Radio
            >
          {/each}
        </li>
      </Dropdown>
      <NavLi href="/about">About</NavLi>
    </NavUl>
  </Navbar>
</header>
<Drawer
  transitionType="fly"
  {transitionParams}
  bind:hidden={hidden1}
  id="sidebar1"
>
  <CloseButton on:click={() => (hidden1 = true)} class="mb-4 dark:text-white" />
  <Sidebar>
    <SidebarWrapper
      divClass="overflow-y-auto py-4 px-3 rounded dark:bg-gray-800"
    >
      <SidebarGroup>
        <SidebarItem label="Home" href="/">
          <svelte:fragment slot="icon">
            <HomeOutline
              class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment>
        </SidebarItem>
        <SidebarItem label="Fuel Models" href="/fuelModels">
          <svelte:fragment slot="icon">
            <ColumnOutline
              class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment>
        </SidebarItem>
        <DropdownDivider></DropdownDivider>

        <SidebarDropdownWrapper label="Settings">
          <svelte:fragment slot="icon">
            <AdjustmentsHorizontalSolid
              class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment>
          <DropdownDivider></DropdownDivider>

          <div class="px-4 py-2">
            <span class="block text-lg text-gray-900 dark:text-white"
              >Dead fuel moisture model:</span
            >
          </div>

          <Radio
            name="fuelMoistureModel"
            bind:group={$fuelMoistureModel}
            value={"Fosberg"}
            on:change={() => handleFuelMoistureChange("Fosberg")}>Fosberg</Radio
          >
          <Helper class="ps-6"
            >Calculate dead fuel moisture using Fosberg model.</Helper
          >
          <Radio
            name="fuelMoistureModel"
            bind:group={$fuelMoistureModel}
            value={"Nelson"}
            on:change={() => handleFuelMoistureChange("Nelson")}>Nelson</Radio
          >
          <Helper class="ps-6">Use Nelson dead fuel moisture model.</Helper>

          <DropdownDivider></DropdownDivider>

          <div class="px-4 py-2">
            <span class="block text-lg text-gray-900 dark:text-white"
              >Weather mode:</span
            >
          </div>
          <ul class="w-56 bg-white rounded-lg dark:bg-gray-800">
            {#each forecastModes as mode}
              <li class="p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                <Radio
                  bind:group={$forecastMode}
                  value={mode}
                  on:change={() => handleTimeModeChange(mode)}
                >
                  {mode}
                </Radio>
                <Helper class="ps-6">Fetch {mode} weather.</Helper>
              </li>
            {/each}
          </ul>
          <DropdownDivider></DropdownDivider>

          <div class="px-4 py-2">
            <span class="block text-lg text-gray-900 dark:text-white"
              >Chart type :</span
            >
          </div>
          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
            <Radio bind:group={$chartType} value={"bars"}>Bar chart</Radio>

            <Helper class="ps-6">Show fire behaviour for selected time.</Helper>
          </li>
          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
            <Radio bind:group={$chartType} value={"fireChar"}>
              Fire Characteristics
            </Radio>

            <Helper class="ps-6">Show Fire Characteristics chart.</Helper>
          </li>

          <DropdownDivider></DropdownDivider>
          <div class="px-4 py-2">
            <span class="block text-lg text-gray-900 dark:text-white"
              >Select model output:</span
            >
          </div>

          {#each $selectedOutputs as output}
            <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
              <Radio bind:group={$selectedOutput} value={output}
                >{outputNodes[output].label}</Radio
              >
            </li>
          {/each}
        </SidebarDropdownWrapper>
      </SidebarGroup>
    </SidebarWrapper>
  </Sidebar>
</Drawer>
<main class="">
  {#if !$authStore.isLoading && $authStore.currentUser}
    <!-- <heading class="p-8" tag="h1" customSize="text-3xl" -->
    <!--   >Private page user: {$authStore.currentUser.displayName} -->
    <!-- </heading> -->
    <!-- <AuthReset /> -->
    <slot />
  {:else if !$authStore.isLoading && $forecastOpenMeteo.time.length > 1}
    <slot />
  {:else}
    <div class="flex items-center justify-center h-screen">
      <Spinner size={8} />
    </div>
  {/if}
</main>
<Footer footerType="logo">
  <hr class="my-6 border-gray-200 mx-auto dark:border-gray-700" />
  <div class="flex items-center text-center justify-between px-10">
    <p>
      Fire behaviour predictions leverage BehavePlus fire behaviour modelling
      system, fuel models representative of UK vegetation and open-meteo
      forecasts and historical weather. Authors: Tadas Nikonovas, Claire M
      Belcher, Kerryn Little and the rest of Toward a UK Fire Danger Rating
      System (UKFDRS) project team. Implementation: Tadas Nikonovas, Centre for
      Wildfire Research, Swansea University. Supported by Higher Education
      Funding Council for Wales Impact Fellowship grant (RIG1062-117) and NERC
      grant UK-FDRS ‘Toward a UK fire danger rating system: Understanding fuels,
      fire behaviour and impacts’ (NE/T003553/1)
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
