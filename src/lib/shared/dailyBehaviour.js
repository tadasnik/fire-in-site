// Presentation bands, not an EFFIS classification of ignition probability.
// Colours/labels intentionally match the six EFFIS fire-danger ranks.
const IGNITION_BANDS = [
  [10, 'Low', '#99ffbb'],
  [30, 'Moderate', '#d4e645'],
  [50, 'High', '#ffcc00'],
  [70, 'Very High', '#ed8000'],
  [90, 'Extreme', '#f50000'],
  [Infinity, 'Very Extreme', '#a8003b'],
];

export function ignitionRank(value) {
  if (!Number.isFinite(value) || value < 0 || value > 100) return null;
  const [, label, color] = IGNITION_BANDS.find(([upper]) => value < upper);
  return { label, color };
}

export const DAILY_METRICS = {
  ignition: 'ignition.firebrand.probability',
  ros: 'surface.weighted.fire.spreadRate',
  flame: 'surface.weighted.fire.flameLength',
};

// Display-only cutoff, not a fire-danger or suppression classification.
export const FLAME_PHOTO_MIN_METRES = 1.5;
export function showDailyFirePhoto(ros, flame) {
  return Number.isFinite(ros?.value) && ros.value > 0
    && Number.isFinite(flame?.value) && flame.value >= FLAME_PHOTO_MIN_METRES;
}

// Raw model output: Map<local-as-UTC timestamp, Array<{ [fuel]: values }>>.
// Independent of selectedOutput and chart interval. Each metric can peak at a
// different hour/fuel; missing samples are never coerced to zero.
export function dailyBehaviour(forecast, selectedFuels) {
  const days = new Map();
  const fuels = new Set(selectedFuels);
  for (const [time, rows] of forecast) {
    if (!Number.isFinite(time)) continue;
    const date = new Date(time).toISOString().slice(0, 10);
    for (const row of rows) {
      for (const [fuel, values] of Object.entries(row)) {
        if (!fuels.has(fuel)) continue;
        for (const [metric, key] of Object.entries(DAILY_METRICS)) {
          const value = values[key];
          if (typeof value !== 'number' || !Number.isFinite(value) || value < 0
            || (metric === 'ignition' && value > 100)) continue;
          if (!days.has(date)) days.set(date, {});
          const summary = days.get(date);
          if (!summary[metric] || value > summary[metric].value) {
            summary[metric] = { value, time, fuel };
          }
        }
      }
    }
  }
  return days;
}
