<script>
  import "../app.postcss";
  import { sineIn } from "svelte/easing";
  import { page } from "$app/stores";
  import {
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
    SidebarDropdownWrapper,
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
    InfoCircleOutline,
    BookOpenOutline,
    ChartLineUpOutline,
  } from "flowbite-svelte-icons";
  import FireInSiteLogo from "$lib/assets/FireInSitelogo.png";
  import ukfdrsLogo from "$lib/assets/ukfdrs-logo.png";
  import SettingsDropdown from "$lib/components/ui/SettingsDropdown.svelte";
  import DisclamerModal from "$lib/components/ui/DisclamerModal.svelte";
  import ValidationModal from "$lib/components/ui/ValidationModal.svelte";

  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();

  let openValidationModal = $state(false);

  // Single source of truth for the content-page nav links, rendered by both
  // the desktop navbar and the mobile drawer so they can't drift apart.
  const navItems = [
    { label: "Fuel Models", href: "/fuelModels", icon: ColumnOutline },
    { label: "About", href: "/about", icon: InfoCircleOutline },
    { label: "Tutorial", href: "/tutorial", icon: BookOpenOutline },
    { label: "Climate", href: "/climate", icon: ChartLineUpOutline },
  ];
  const sidebarIconClass =
    "w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white";

  let transitionParams = {
    x: -320,
    duration: 200,
    easing: sineIn,
  };
  let activeUrl = $derived($page.url.pathname);
  // Clean per-route canonical/OG URL (no query string).
  let canonicalUrl = $derived(`${$page.url.origin}${$page.url.pathname}`);
  let ogImage = $derived(`${$page.url.origin}/favicon/apple-touch-icon.png`);

  let drawerOpen = $state(false);
  const toggleDrawer = () => {
    drawerOpen = true;
  };

  // const dateFormat = timeFormat("%a %b %e, %H %p");
</script>

<svelte:head>
  <link rel="canonical" href={canonicalUrl} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="FireInSite" />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={ogImage} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content={ogImage} />
</svelte:head>

<header
  class="sticky top-0 z-40 flex-none w-full mx-auto bg-white border-b border-gray-200 dark:border-gray-600 dark:bg-gray-800"
  style="padding-top: env(safe-area-inset-top);"
>
  <DisclamerModal />
  <Navbar
    color="default"
    fluid
    class="flex items-center justify-between w-full mx-auto py-1.5 lg:py-0.5 px-4 max-w-8xl"
  >
    {#snippet children({ hidden, toggle })}
      <NavBrand href="/">
        <img
          src={FireInSiteLogo}
          class="me-3 h-6 sm:h-9 lg:h-7"
          alt="fireInSite Logo"
        />
      </NavBrand>

      <div class="flex md:order-2">
        <NavHamburger onClick={toggleDrawer} class="m-0 mr-3 lg:hidden" />
      </div>
      <NavUl>
        {#if activeUrl !== "/"}
          <NavLi href="/">The Model</NavLi>
        {/if}

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
        {#each navItems as item}
          <NavLi href={item.href}>{item.label}</NavLi>
        {/each}
        <ValidationModal bind:openValidationModal />
      </NavUl>
    {/snippet}
  </Navbar>
</header>
<Drawer
  transitionType="fly"
  {transitionParams}
  bind:open={drawerOpen}
  id="sidebar1"
>
  <CloseButton onclick={() => (drawerOpen = false)} class="mb-4 dark:text-white" />
  <Sidebar>
    <SidebarWrapper
      divClass="overflow-y-auto py-4 px-3 rounded dark:bg-gray-800"
    >
      <SidebarGroup>
        <SidebarItem label="Home" href="/">
          {#snippet icon()}
            <HomeOutline class={sidebarIconClass} />
          {/snippet}
        </SidebarItem>
        {#each navItems as item}
          {@const Icon = item.icon}
          <SidebarItem label={item.label} href={item.href}>
            {#snippet icon()}
              <Icon class={sidebarIconClass} />
            {/snippet}
          </SidebarItem>
        {/each}
        <ValidationModal bind:openValidationModal />
        <SidebarDropdownWrapper label="Settings">
          {#snippet icon()}
            <AdjustmentsHorizontalSolid
              class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          {/snippet}
          <DropdownDivider></DropdownDivider>

          <SettingsDropdown></SettingsDropdown>
        </SidebarDropdownWrapper>
      </SidebarGroup>
    </SidebarWrapper>
  </Sidebar>
</Drawer>
<main class="">
  {@render children?.()}
</main>
<Footer>
  <hr class="my-6 mx-auto" />
  <div class="flex flex-col items-center gap-4 px-10">
    <p class="text-center text-xs">
      FireInSite fire behaviour predictions leverage BehavePlus fire behaviour
      modelling system, fuel models representative of UK vegetation and
      open-meteo forecasts and historical weather. Authors: Tadas Nikonovas,
      Stefan Doerr, Claire M Belcher, Kerryn Little and the rest of Toward a UK
      Fire Danger Rating System (UKFDRS) project team. Implementation: Tadas
      Nikonovas, Centre for Wildfire Research, Swansea University. Supported by
      Higher Education Funding Council for Wales Impact Fellowship grant
      (RIG1062-117), NERC grant UK-FDRS ‘Toward a UK fire danger rating system:
      Understanding fuels, fire behaviour and impacts’ (NE/T003553/1) and
      funding from the European Union’s Horizon 2020 research and innovation
      programme under grant agreement No. 101003890 (FirEUrisk)
    </p>
    <FooterBrand
      href="https://ukfdrs.com/"
      src={ukfdrsLogo}
      alt="UKFDRS Logo"
      name="UKFDRS"
    />
  </div>
</Footer>
