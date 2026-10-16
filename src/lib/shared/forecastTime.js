export const HOUR_MS = 3600000;

// Forecast arrays use location-local wall time encoded as UTC milliseconds.
export function localHour(instant, utcOffsetSeconds) {
  return new Date(Number(instant) + utcOffsetSeconds * 1000).getUTCHours();
}

export function instantForLocalHour(day, hour, utcOffsetSeconds) {
  return new Date(Number(day) + Number(hour) * HOUR_MS - utcOffsetSeconds * 1000);
}

export function availableHours(times, day) {
  const available = new Set(times);
  return Array.from({ length: 24 }, (_, hour) => hour).filter(hour => available.has(Number(day) + hour * HOUR_MS));
}
