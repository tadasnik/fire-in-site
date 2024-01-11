<script>
  import "../app.postcss";

  import { onMount } from "svelte";
  import { auth, db } from "$lib/firebase/firebase.client";
  import { page } from "$app/stores";
  import { browser } from "$app/environment";
  import { doc, getDoc, getDocs, collection, setDoc } from "firebase/firestore";
  import {
    Sidebar,
    Navbar,
    NavBrand,
    NavLi,
    NavUl,
    NavHamburger,
    Button,
    CloseButton,
  } from "flowbite-svelte";
  import { DarkMode } from "flowbite-svelte";
  import SiteInputs from "$lib/components/SiteInputs.svelte";
  import FuelInputs from "$lib/components/fuelInputs.svelte";
  import {
    selectedFuels,
    requiredFuelInputs,
  } from "$lib/shared/stores/modelStore";
  import { authHandlers, authStore } from "$lib/shared/stores/authStore";
  import AuthReset from "$lib/components/AuthReset.svelte";

  let userScenarios;
  onMount(() => {
    const unsuscribe = auth.onAuthStateChanged(async (user) => {
      // console.log("user changed ", user);
      authStore.update((curr) => {
        return { ...curr, isLoading: false, currentUser: user };
      });
      if (
        // if browser and no user
        browser &&
        !$authStore.currentUser &&
        !$authStore.isLoading
        // window.location.pathname !== "/"
      ) {
        // window.location.href = "/";
        console.log(
          "current User ",
          $authStore.currentUser,
          $authStore.isLoading
        );
        return;
      }
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
          { merge: true }
        );
      } else {
        userScenarios = userDocContent.data();
      }
    });
    return unsuscribe;
  });

  $: console.log("user data ", userScenarios);
  let spanClass = "flex-1 ml-3 whitespace-nowrap";

  $: activeUrl = $page.url.pathname;
  $: console.log("layout activeURl", activeUrl);

  let hidden1 = true;
  const toggleDrawer = () => {
    hidden1 = false;
  };
</script>

<header
  class="sticky top-0 z-40 flex-none w-full mx-auto bg-white border-b border-gray-200 dark:border-gray-600 dark:bg-gray-800"
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
      <span class="self-center whitespace-nowrap text-xl font-bold uppercase">
        UKFDRS
      </span>
      <span class="pl-4 whitespace-nowrap">misBehavePlus</span>
    </NavBrand>
    <NavUl>
      <NavLi href="/">Home</NavLi>
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
      <DarkMode
        size="lg"
        class="inline-block dark:hover:text-white hover:text-gray-900"
      />
    </div>
  </Navbar>
</header>

{#if activeUrl === "/"}
  <Sidebar
    {activeUrl}
    asideClass="hidden overflow-y-auto md:block fixed inset-0 pt-20 z-30 flex-none h-full w-96 border-r border-gray-200 dark:border-gray-600"
  >
    <SiteInputs />
    <h3 class="pl-4 h3 font-bold">Fuel inputs</h3>

    {#each $selectedFuels as fuel}
      {@const key = Object.keys($requiredFuelInputs[fuel])}
      <section class="space-y-1">
        <div class="pl-4 flex flex-wrap">
          <!-- {#if key === "surface.primary.fuel.model.catalogKey" || key === "surface.secondary.fuel.model.catalogKey"} -->
          {#if key.length === 1}
            <p>Fuel model: {fuel}</p>
          {:else}
            <FuelInputs {fuel} />
          {/if}
        </div>
      </section>
    {/each}
  </Sidebar>
{/if}

<main class="p-4 md:ml-96 h-auto pt-20">
  {#if $authStore.currentUser}
    <heading class="p-8" tag="h1" customSize="text-3xl"
      >Private page user: {$authStore.currentUser.displayName}
    </heading>
    <AuthReset />
  {:else}
    <h1>Loading....</h1>
  {/if}

  <slot />
</main>
