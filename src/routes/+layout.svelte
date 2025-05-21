<script context="module">
  export const ssr = false;
</script>

<script>
  import "../app.postcss";
  import { injectAnalytics } from "@vercel/analytics/sveltekit";
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
    Spinner,
    Drawer,
    Dropdown,
    DropdownDivider,
    Navbar,
    NavBrand,
    NavLi,
    NavUl,
    NavHamburger,
    CloseButton,
    Footer,
    FooterBrand,
  } from "flowbite-svelte";
  import {
    AdjustmentsHorizontalSolid,
    ColumnOutline,
    HomeOutline,
  } from "flowbite-svelte-icons";
  import { timeFormat } from "d3-time-format";
  import FireInSiteLogo from "$lib/assets/FireInSitelogo.png";
  import ukfdrsLogo from "$lib/assets/ukfdrs-logo.png";
  import {
    getLocation,
    currentLocation,
  } from "$lib/shared/stores/locationStore";
  import { currentDateTime, timeMode } from "$lib/shared/stores/timeStore";
  import SettingsDropdown from "$lib/components/ui/SettingsDropdown.svelte";
  import DisclamerModal from "$lib/components/ui/DisclamerModal.svelte";

  import { authHandlers, authStore } from "$lib/shared/stores/authStore";

  let transitionParams = {
    x: -320,
    duration: 200,
    easing: sineIn,
  };
  onMount(() => {
    // const interval = setInterval(() => {
    //   if ($timeMode === "current") {
    //     $currentDateTime = new Date();
    //   } else {
    //   }
    // }, 1.8e9);

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

        currentLocation.update((current) => ({
          ...current,
          userLocation: false,
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
                  userLocation: false,
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
      // clearInterval(interval);
    };
  });

  let spanClass = "flex-1 ml-3 whitespace-nowrap";

  $: activeUrl = $page.url.pathname;
  $: console.log("layout activeURl", activeUrl);

  let hidden1 = true;
  const toggleDrawer = () => {
    hidden1 = false;
  };

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
  <DisclamerModal />;
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
      <!-- <NavUl> -->
      <!--   {#if !$authStore.currentUser} -->
      <!--     <NavLi href="/authenticate">Sign in</NavLi> -->
      <!--   {:else} -->
      <!--     <NavLi -->
      <!--       on:click={() => { -->
      <!--         authHandlers.logout(); -->
      <!--       }} -->
      <!--       href="/">Sign out</NavLi -->
      <!--     > -->
      <!--   {/if} -->
      <!-- </NavUl> -->
    </div>
    <NavUl>
      <NavLi class="cursor-pointer">
        <div class="flex-col items-center">
          <AdjustmentsHorizontalSolid
            class="w-4 h-4 ms-2 text-primary-900 dark:text-white inline"
          />
          Settings
        </div>
      </NavLi>
      <Dropdown>
        <SettingsDropdown />
      </Dropdown>
      <NavLi href="/fuelModels">Fuel Models</NavLi>
      <NavLi href="/about">About</NavLi>
      <NavLi href="/tutorial">Tutorial</NavLi>
      <NavLi href="/climate">Climate</NavLi>
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
        <SidebarItem label="About" href="/about">
          <svelte:fragment slot="icon">
            <ColumnOutline
              class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment>
        </SidebarItem>
        <SidebarItem label="Tutorial" href="/tutorial">
          <svelte:fragment slot="icon">
            <ColumnOutline
              class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment>
        </SidebarItem>

        <SidebarDropdownWrapper label="Settings">
          <svelte:fragment slot="icon">
            <AdjustmentsHorizontalSolid
              class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment>
          <DropdownDivider></DropdownDivider>

          <SettingsDropdown></SettingsDropdown>
        </SidebarDropdownWrapper>
      </SidebarGroup>
    </SidebarWrapper>
  </Sidebar>
</Drawer>
<main class="">
  {#if browser && !$authStore.isLoading && $authStore.currentUser}
    <!-- <heading class="p-8" tag="h1" customSize="text-3xl" -->
    <!--   >Private page user: {$authStore.currentUser.displayName} -->
    <!-- </heading> -->
    <!-- <AuthReset /> -->
    <slot />
  {:else if browser && !$authStore.isLoading}
    <slot />
  {:else}
    <div class="flex items-center justify-center h-screen">
      <Spinner size={8} />
    </div>
  {/if}
</main>
<Footer>
  <hr class="my-6 mx-auto" />
  <div class="flex items-center text-center text-xs justify-between px-10">
    <p>
      FireInSite fire behaviour predictions leverage BehavePlus fire behaviour
      modelling system, fuel models representative of UK vegetation and
      open-meteo forecasts and historical weather. Authors: Tadas Nikonovas,
      Claire M Belcher, Kerryn Little and the rest of Toward a UK Fire Danger
      Rating System (UKFDRS) project team. Implementation: Tadas Nikonovas,
      Centre for Wildfire Research, Swansea University. Supported by Higher
      Education Funding Council for Wales Impact Fellowship grant (RIG1062-117),
      NERC grant UK-FDRS ‘Toward a UK fire danger rating system: Understanding
      fuels, fire behaviour and impacts’ (NE/T003553/1) and funding from the
      European Union’s Horizon 2020 research and innovation programme under
      grant agreement No. 101003890 (FirEUrisk)
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
