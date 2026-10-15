// Shared by map, search, and startup geolocation: the latest user intent wins,
// even when an older terrain or forecast request finishes later.
let version = 0;

export function currentLocationSelection() {
  const selection = version;
  return () => selection === version;
}

export function beginLocationSelection() {
  version += 1;
  return currentLocationSelection();
}
