<script>
  import "../app.postcss";
  import { sineIn } from "svelte/easing";
  import { page } from "$app/stores";
  import {
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
    Drawer,
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
    ColumnOutline,
    HomeOutline,
    InfoCircleOutline,
    BookOpenOutline,
    ChartLineUpOutline,
  } from "flowbite-svelte-icons";
  import FireInSiteLogo from "$lib/assets/FireInSitelogo.png";
  import ukfdrsLogo from "$lib/assets/ukfdrs-logo.png";
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
  class="site-header sticky top-0 z-40 flex-none w-full mx-auto bg-white border-b border-gray-100 dark:border-gray-800 dark:bg-gray-950"
  style="padding-top: env(safe-area-inset-top);"
>
  <DisclamerModal />
  <Navbar
    color="default"
    fluid
    class="flex items-center justify-between w-full mx-auto py-1 px-3"
  >
    {#snippet children({ hidden, toggle })}
      <NavBrand href="/">
        <img
          src={FireInSiteLogo}
          class="me-3 h-9"
          alt="fireInSite Logo"
        />
      </NavBrand>

      <div class="flex md:order-2">
        <NavHamburger onclick={toggleDrawer} class="m-0 p-1.5 md:hidden" />
      </div>
      <NavUl>
        {#if activeUrl !== "/"}
          <NavLi href="/">The Model</NavLi>
        {/if}

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

      </SidebarGroup>
    </SidebarWrapper>
  </Sidebar>
</Drawer>
<main class="flex-1">
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
