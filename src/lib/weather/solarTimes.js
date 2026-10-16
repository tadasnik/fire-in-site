// The SDK encodes sunrise/sunset as epoch seconds in int64 vectors. Keep the
// sub-hour precision and shift to the chart's location-local-as-UTC convention.
export function solarTimestamps(variable, utcOffsetSeconds) {
  return Array.from({ length: variable.valuesInt64Length() }, (_, i) => {
    const seconds = Number(variable.valuesInt64(i));
    return Number.isFinite(seconds) && seconds > 0 ? (seconds + utcOffsetSeconds) * 1000 : null;
  });
}
