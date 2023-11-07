<script>
  import "../app.postcss";

  import { page } from "$app/stores";
  import {
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
    Navbar,
    NavBrand,
    NavLi,
    NavUl,
    NavHamburger,
    Button,
    CloseButton,
  } from "flowbite-svelte";
  import {
    ChartPieSolid,
    GridSolid,
    MailBoxSolid,
    UserSolid,
    ArrowRightToBracketSolid,
    FileEditSolid,
  } from "flowbite-svelte-icons";
  import { DarkMode } from "flowbite-svelte";
  import { AccordionItem, Accordion } from "flowbite-svelte";
  import SiteInputs from "$lib/components/SiteInputs.svelte";
  import FuelInputs from "$lib/components/fuelInputs.svelte";
  import {
    selectedFuels,
    requiredFuelInputs,
  } from "$lib/shared/stores/modelStore";

  let spanClass = "flex-1 ml-3 whitespace-nowrap";

  $: activeUrl = $page.url.pathname;

  let hidden1 = true;
  const toggleDrawer = () => {
    console.log("hidden");
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
      <span class="pl-4 whitespace-nowrap">mis-BehavePlus kitchen sink</span>
    </NavBrand>
    <div class="flex items-center ml-auto">
      <DarkMode
        size="lg"
        class="inline-block dark:hover:text-white hover:text-gray-900"
      />
    </div>
  </Navbar>
</header>

<Sidebar
  {activeUrl}
  asideClass="hidden overflow-y-auto md:block fixed inset-0 pt-20 z-30 flex-none h-full w-96 border-r border-gray-200 dark:border-gray-600"
>
  <SiteInputs />
  <h3 class="pl-4 h3 font-bold">Required fuel inputs</h3>

  {#each $selectedFuels as fuel}
    {@const key = Object.keys($requiredFuelInputs[fuel])}
    <section class="space-y-1">
      <div class="flex flex-wrap">
        <!-- {#if key === "surface.primary.fuel.model.catalogKey" || key === "surface.secondary.fuel.model.catalogKey"} -->
        {#if key.length === 1}
          <p>{key}</p>
        {:else}
          <FuelInputs {fuel} />
        {/if}
      </div>
    </section>
  {/each}

  <!-- <SidebarWrapper> -->
  <!--   <SidebarGroup> -->
  <!--     <SidebarItem label="Dashboard"> -->
  <!--       <svelte:fragment slot="icon"> -->
  <!--         <ChartPieSolid -->
  <!--           class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" -->
  <!--         /> -->
  <!--       </svelte:fragment> -->
  <!--     </SidebarItem> -->
  <!--     <SidebarItem label="Kanban" {spanClass}> -->
  <!--       <svelte:fragment slot="icon"> -->
  <!--         <GridSolid -->
  <!--           class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" -->
  <!--         /> -->
  <!--       </svelte:fragment> -->
  <!--       <svelte:fragment slot="subtext"> -->
  <!--         <span -->
  <!--           class="inline-flex justify-center items-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300" -->
  <!--         > -->
  <!--           Pro -->
  <!--         </span> -->
  <!--       </svelte:fragment> -->
  <!--     </SidebarItem> -->
  <!--     <SidebarItem label="Inbox" {spanClass}> -->
  <!--       <svelte:fragment slot="icon"> -->
  <!--         <MailBoxSolid -->
  <!--           class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" -->
  <!--         /> -->
  <!--       </svelte:fragment> -->
  <!--       <svelte:fragment slot="subtext"> -->
  <!--         <span -->
  <!--           class="inline-flex justify-center items-center p-3 ml-3 w-3 h-3 text-sm font-medium text-primary-600 bg-primary-200 rounded-full dark:bg-primary-900 dark:text-primary-200" -->
  <!--         > -->
  <!--           3 -->
  <!--         </span> -->
  <!--       </svelte:fragment> -->
  <!--     </SidebarItem> -->
  <!--     <SidebarItem -->
  <!--       label="Sidebar" -->
  <!--       href="/docs/components/sidebar" -->
  <!--       active={activeUrl === "/docs/components/sidebar"} -->
  <!--     > -->
  <!--       <svelte:fragment slot="icon"> -->
  <!--         <UserSolid -->
  <!--           class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" -->
  <!--         /> -->
  <!--       </svelte:fragment> -->
  <!--     </SidebarItem> -->
  <!--     <SidebarItem label="Sign In"> -->
  <!--       <svelte:fragment slot="icon"> -->
  <!--         <ArrowRightToBracketSolid -->
  <!--           class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" -->
  <!--         /> -->
  <!--       </svelte:fragment> -->
  <!--     </SidebarItem> -->
  <!--     <SidebarItem label="Sign Up"> -->
  <!--       <svelte:fragment slot="icon"> -->
  <!--         <FileEditSolid -->
  <!--           class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" -->
  <!--         /> -->
  <!--       </svelte:fragment> -->
  <!--     </SidebarItem> -->
  <!--   </SidebarGroup> -->
  <!-- </SidebarWrapper> -->
</Sidebar>

<!-- <script lang="ts"> -->
<!--   import "../app.postcss"; -->
<!--   import { onMount, setContext } from "svelte"; -->
<!--   import { writable, type Writable } from "svelte/store"; -->
<!--   import { sineIn } from "svelte/easing"; -->
<!--   import { -->
<!--     Drawer, -->
<!--     Navbar, -->
<!--     NavBrand, -->
<!--     NavLi, -->
<!--     NavUl, -->
<!--     NavHamburger, -->
<!--     Button, -->
<!--     CloseButton, -->
<!--   } from "flowbite-svelte"; -->
<!--   import { InfoCircleSolid, ArrowRightOutline } from "flowbite-svelte-icons"; -->
<!--   import { DarkMode } from "flowbite-svelte"; -->
<!--   import { page } from "$app/stores"; -->
<!--   import { -->
<!--     Sidebar, -->
<!--     SidebarGroup, -->
<!--     SidebarItem, -->
<!--     SidebarWrapper, -->
<!--   } from "flowbite-svelte"; -->
<!--   import { -->
<!--     ChartPieSolid, -->
<!--     GridSolid, -->
<!--     MailBoxSolid, -->
<!--     UserSolid, -->
<!--     ArrowRightToBracketSolid, -->
<!--     FileEditSolid, -->
<!--   } from "flowbite-svelte-icons"; -->
<!--   let spanClass = "flex-1 ml-3 whitespace-nowrap"; -->
<!--   $: activeUrl = $page.url.pathname; -->
<!--   let hidden1 = true; -->
<!--   let transitionParams = { -->
<!--     x: -320, -->
<!--     duration: 200, -->
<!--     easing: sineIn, -->
<!--   }; -->
<!---->
<!---->
<!--   const drawerHiddenStore: Writable<boolean> = writable<boolean>(true); -->
<!--   setContext("drawer", drawerHiddenStore); -->
<!---->
<!--   let nonActiveClass = -->
<!--     "transition-colors duration-200 relative flex items-center flex-wrap font-medium hover:text-gray-900 hover:cursor-pointer text-gray-500 dark:text-gray-400 dark:hover:text-white"; -->
<!--   let activeClass = -->
<!--     "relative flex items-center flex-wrap font-medium cursor-default text-primary-700 dark:text-primary-700"; -->
<!-- </script> -->
<!---->
<!-- <Drawer -->
<!--   transitionType="fly" -->
<!--   {transitionParams} -->
<!--   bind:hidden={hidden1} -->
<!--   id="sidebar1" -->
<!-- > -->
<!--   <div class="flex items-center"> -->
<!--     <h5 -->
<!--       id="drawer-label" -->
<!--       class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400" -->
<!--     /> -->
<!--     <CloseButton -->
<!--       on:click={() => (hidden1 = true)} -->
<!--       class="mb-4 dark:text-white" -->
<!--     /> -->
<!--   </div> -->
<!--   <p class="mb-6 text-sm text-gray-500 dark:text-gray-400"> -->
<!--     Supercharge your hiring by taking advantage of our <a -->
<!--       href="/" -->
<!--       class="text-primary-600 underline dark:text-primary-500 hover:no-underline" -->
<!--     > -->
<!--       limited-time sale -->
<!--     </a> -->
<!--     for Flowbite Docs + Job Board. Unlimited access to over 190K top-ranked candidates -->
<!--     and the #1 design job board. -->
<!--   </p> -->
<!--   <div class="grid grid-cols-2 gap-4"> -->
<!--     <Button color="light" href="/">Learn more</Button> -->
<!--     <Button href="/" class="px-4" -->
<!--       >Get access <ArrowRightOutline class="w-3.5 h-3.5 ml-2" /></Button -->
<!--     > -->
<!--   </div> -->
<!-- </Drawer> -->
<!-- <Sidebar -->
<!--   {nonActiveClass} -->
<!--   asideClass=" -->
<!--   fixed top-0 left-0 z-40 w-96 h-screen pt-14 transition-transform -translate-x-full bg-white border-r border-gray-200 md:translate-x-0 dark:bg-gray-800 dark:border-gray-700 -->
<!--   " -->
<!-- > -->
<!--   <h4 id="sidebar-label" class="sr-only">Browse docs</h4> -->
<!--   <SidebarWrapper -->
<!--     divClass="overflow-y-auto px-4 pt-20 lg:pt-0 h-full bg-white scrolling-touch max-w-2xs lg:h-[calc(100vh-8rem)] lg:block dark:bg-gray-900 lg:mr-0 lg:sticky top-20" -->
<!--   > -->
<!--     <nav class="font-normal text-base lg:text-sm"> -->
<!--       <SidebarGroup ulClass="list-unstyled fw-normal small mb-4"> -->
<!--         <SidebarItem label="Dashboard"> -->
<!--           <svelte:fragment slot="icon"> -->
<!--             <ChartPieSolid -->
<!--               class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" -->
<!--             /> -->
<!--           </svelte:fragment> -->
<!--         </SidebarItem> -->
<!--         <SidebarItem label="Kanban" {spanClass}> -->
<!--           <svelte:fragment slot="icon"> -->
<!--             <GridSolid -->
<!--               class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" -->
<!--             /> -->
<!--           </svelte:fragment> -->
<!--           <svelte:fragment slot="subtext"> -->
<!--             <span -->
<!--               class="inline-flex justify-center items-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300" -->
<!--             > -->
<!--               Pro -->
<!--             </span> -->
<!--           </svelte:fragment> -->
<!--         </SidebarItem> -->
<!--         <SidebarItem label="Inbox" {spanClass}> --</span>
<!--           <svelte:fragment slot="icon"> -->
<!--             <MailBoxSolid -->
<!--               class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" -->
<!--             /> -->
<!--           </svelte:fragment> -->
<!--           <svelte:fragment slot="subtext"> -->
<!--             <span -->
<!--               class="inline-flex justify-center items-center p-3 ml-3 w-3 h-3 text-sm font-medium text-primary-600 bg-primary-200 rounded-full dark:bg-primary-900 dark:text-primary-200" -->
<!--             > -->
<!--               3 -->
<!--             </span> -->
<!--           </svelte:fragment> -->
<!--         </SidebarItem> -->
<!--         <SidebarItem -->
<!--           label="Sidebar" -->
<!--           href="/docs/components/sidebar" -->
<!--           active={activeUrl === "/docs/components/sidebar"} -->
<!--         > -->
<!--           <svelte:fragment slot="icon"> -->
<!--             <UserSolid -->
<!--               class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" -->
<!--             /> -->
<!--           </svelte:fragment> -->
<!--         </SidebarItem> -->
<!--         <SidebarItem label="Sign In"> -->
<!--           <svelte:fragment slot="icon"> -->
<!--             <ArrowRightToBracketSolid -->
<!--               class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" -->
<!--             /> -->
<!--           </svelte:fragment> -->
<!--         </SidebarItem> -->
<!--         <SidebarItem label="Sign Up"> -->
<!--           <svelte:fragment slot="icon"> -->
<!--             <FileEditSolid -->
<!--               class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" -->
<!--             /> -->
<!--           </svelte:fragment> -->
<!--         </SidebarItem> -->
<!--       </SidebarGroup> -->
<!--     </nav> -->
<!--   </SidebarWrapper> -->
<!-- </Sidebar> -->
<!-- <!-- <div hidden={$drawerHidden} class="fixed inset-0 z-20 bg-gray-900/50 dark:bg-gray-900/60" on:click={closeDrawer} on:keydown={closeDrawer} role="presentation" /> -->
<main class="p-4 md:ml-96 h-auto pt-20">
  <slot />
</main>
