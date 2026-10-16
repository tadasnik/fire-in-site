import { writable } from 'svelte/store'

export const currentLocation = writable({
  userLocation: false,
  distanceFromPrevious: false,
  name: '',
  latitude: 53,
  longitude: 0,
  elevation: 0,
  slope: 0,
  aspect: 0
})

export async function getLocation({ fetcher = fetch, token = import.meta.env?.VITE_GEOAPIFY_TOKEN } = {}) {
  const fallback = [52, -1.5];
  if (!token?.trim()) return fallback;
  try {
    const response = await fetcher(
      "https://api.geoapify.com/v1/ipinfo?apiKey=" + encodeURIComponent(token),
      { signal: AbortSignal.timeout(5000) },
    )
    if (response.ok) {
      const { location } = await response.json();
      const latitude = parseFloat(location?.latitude);
      const longitude = parseFloat(location?.longitude);
      if (Number.isFinite(latitude) && Number.isFinite(longitude)
        && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180) {
        return [latitude, longitude];
      }
    }
  } catch { /* Use the default UK location when IP geolocation is unavailable. */ }
  return fallback;
}
