<script>
  import { currentLocation } from "$lib/shared/stores/locationStore";
  import { getForecastOpenMeteo } from "$lib/shared/stores/forecastStore";
  import { getHistory, recordSearch } from "$lib/shared/stores/searchHistory";
  import { SearchOutline, ClockOutline } from "flowbite-svelte-icons";

  let query = $state("");
  let results = $state([]);
  let open = $state(false);
  let showingHistory = $state(false);
  let activeIndex = $state(-1);
  let debounceTimer;
  let containerEl;

  function onFocus() {
    if (query.length < 2) {
      const history = getHistory();
      if (history.length > 0) {
        results = history;
        showingHistory = true;
        open = true;
      }
    }
  }

  function onInput() {
    clearTimeout(debounceTimer);
    activeIndex = -1;
    showingHistory = false;
    if (query.length < 2) {
      results = [];
      open = false;
      return;
    }
    debounceTimer = setTimeout(search, 300);
  }

  function parseCoords(str) {
    const m = str.trim().match(/^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/);
    if (!m) return null;
    const lat = parseFloat(m[1]);
    const lon = parseFloat(m[2]);
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
    return { lat, lon };
  }

  async function search() {
    const coords = parseCoords(query);
    if (coords) {
      results = [{ _coord: true, latitude: coords.lat, longitude: coords.lon }];
      open = true;
      return;
    }
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`
      );
      const data = await res.json();
      results = data.results ?? [];
      open = results.length > 0;
    } catch {
      results = [];
      open = false;
    }
  }

  async function select(result) {
    query = "";
    results = [];
    open = false;
    showingHistory = false;
    if (!result._coord) recordSearch(result);
    let elevation = result.elevation ?? 0;
    if (result._coord) {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/elevation?latitude=${result.latitude}&longitude=${result.longitude}`
        );
        const data = await res.json();
        elevation = data.elevation?.[0] ?? 0;
      } catch { /* keep 0 */ }
    }
    currentLocation.update((loc) => ({
      ...loc,
      latitude: result.latitude,
      longitude: result.longitude,
      elevation,
      name: result._coord ? '' : (result.name ?? ''),
      userLocation: true,
      distanceFromPrevious: 99999,
    }));
    getForecastOpenMeteo();
  }

  function formatResult(r) {
    const parts = [r.name];
    if (r.admin1) parts.push(r.admin1);
    if (r.country) parts.push(r.country);
    return parts.join(", ");
  }

  function countryFlag(code) {
    if (!code) return "";
    return code.toUpperCase().replace(/./g, c =>
      String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
    );
  }

  function onKeyDown(e) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, results.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      select(results[activeIndex]);
    } else if (e.key === "Escape") {
      open = false;
      activeIndex = -1;
    }
  }

  function onBlur() {
    // Delay so onmousedown on a result fires before blur closes the list
    setTimeout(() => { open = false; activeIndex = -1; }, 150);
  }
</script>

<div class="relative w-full" bind:this={containerEl}>
  <div class="pointer-events-none absolute inset-y-0 left-3 flex items-center">
    <SearchOutline class="h-4 w-4 text-gray-400 dark:text-gray-500" />
  </div>
  <input
    type="text"
    bind:value={query}
    oninput={onInput}
    onkeydown={onKeyDown}
    onblur={onBlur}
    placeholder="Location"
    autocomplete="off"
    onfocus={onFocus}
    class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
  />
  {#if open}
    <ul
      class="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700"
      role="listbox"
    >
      <li class="px-4 py-1 border-b border-gray-100 dark:border-gray-600">
        {#if showingHistory}
          <div class="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <ClockOutline class="w-3 h-3" />
            <span>Recent</span>
          </div>
        {:else}
          <div class="hidden md:flex items-center gap-2 w-full text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            <span class="shrink-0 w-5"></span>
            <span class="w-36 shrink-0">Place</span>
            <span class="w-36 shrink-0">Region</span>
            <span class="w-20 shrink-0">Lat</span>
            <span class="w-20 shrink-0">Lon</span>
            <span class="w-16 shrink-0">Elev</span>
          </div>
        {/if}
      </li>
      {#each results as result, i}
        <li role="option" aria-selected={i === activeIndex}>
          <button
            type="button"
            class="w-full px-4 py-2 text-left text-sm text-gray-900 dark:text-white
              {i === activeIndex ? 'bg-orange-50 dark:bg-gray-600' : 'hover:bg-orange-50 dark:hover:bg-gray-600'}
              {i === 0 ? 'rounded-t-lg' : ''}
              {i === results.length - 1 ? 'rounded-b-lg' : ''}"
            onmousedown={() => select(result)}
          >
            {#if result._coord}
              <div class="flex items-center gap-2 w-full">
                <span>📍</span>
                <span class="font-medium">{result.latitude}, {result.longitude}</span>
              </div>
            {:else}
              <div class="flex items-center gap-2 w-full">
                <span class="shrink-0">{countryFlag(result.country_code)}</span>
                <span class="font-medium w-32 md:w-36 shrink-0 truncate">{result.name}</span>
                <span class="text-gray-500 dark:text-gray-400 w-32 md:w-36 shrink-0 truncate">{result.admin1 ?? ''}</span>
                <span class="hidden md:block w-20 shrink-0 tabular-nums text-gray-500 dark:text-gray-400">{result.latitude.toFixed(3)}</span>
                <span class="hidden md:block w-20 shrink-0 tabular-nums text-gray-500 dark:text-gray-400">{result.longitude.toFixed(3)}</span>
                <span class="hidden md:block w-16 shrink-0 text-gray-500 dark:text-gray-400">{result.elevation != null ? Math.round(result.elevation) + ' m' : ''}</span>
              </div>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
