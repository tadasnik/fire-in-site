import { writable } from 'svelte/store';

// Separate lifecycle: EFFIS never blocks or mutates the fire behavior forecast.
export function createEffisStore(fetcher = (...args) => fetch(...args)) {
  const { subscribe, set } = writable({ status: 'idle', data: null });
  let version = 0;
  let controller;

  function reset() {
    version += 1;
    controller?.abort();
    set({ status: 'idle', data: null });
  }

  async function load(latitude, longitude) {
    reset();
    const request = version;
    controller = new AbortController();
    set({ status: 'loading', data: null });
    try {
      const params = new URLSearchParams({ lat: latitude, lon: longitude });
      const res = await fetcher(`/api/effis/point?${params}`, { signal: controller.signal });
      if (!res.ok) throw new Error('EFFIS unavailable');
      const data = await res.json();
      if (!Array.isArray(data?.days)) throw new Error('Invalid EFFIS response');
      if (request === version) set({ status: 'ready', data });
    } catch {
      if (request === version) set({ status: 'error', data: null });
    }
  }

  return { subscribe, load, reset };
}
