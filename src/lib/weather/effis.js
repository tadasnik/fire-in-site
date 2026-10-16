// Daily Canadian FWI System indices supplied by CEMS / EFFIS, driven by ECMWF.
export const canadianIndices = [
  { key: 'fwi', label: 'FWI', name: 'Fire Weather Index', description: 'Overall fire weather intensity index.' },
  { key: 'ffmc', label: 'FFMC', name: 'Fine Fuel Moisture Code', description: 'Dryness of litter and fine dead fuels. This is an index, not a moisture percentage.' },
  { key: 'dmc', label: 'DMC', name: 'Duff Moisture Code', description: 'Dryness of moderately deep organic layers.' },
  { key: 'dc', label: 'DC', name: 'Drought Code', description: 'Long-term drying of deep organic layers.' },
  { key: 'isi', label: 'ISI', name: 'Initial Spread Index', description: 'Potential fire spread from wind and fine fuel dryness.' },
  { key: 'bui', label: 'BUI', name: 'Build Up Index', description: 'Availability of fuel for combustion from DMC and DC.' },
];

export function dayKey(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function isDay(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && dayKey(Date.parse(value)) === value;
}

export function fwiDanger(value) {
  if (!Number.isFinite(value) || value < 0) return null;
  // Half-open intervals: the lower boundary belongs to the higher class.
  // The published Very Extreme definition is strictly >70.
  if (value < 11.2) return { label: 'Low', color: '#99ffbb' };
  if (value < 21.3) return { label: 'Moderate', color: '#d4e645' };
  if (value < 38) return { label: 'High', color: '#ffcc00' };
  if (value < 50) return { label: 'Very High', color: '#ed8000' };
  if (value <= 70) return { label: 'Extreme', color: '#f50000' };
  return { label: 'Very Extreme', color: '#a8003b' };
}

export function normalizeEffis(payload, from, to) {
  if (!Array.isArray(payload?.x_data) || !payload?.y_data
    || !canadianIndices.every(({ key }) => Array.isArray(payload.y_data[key])
      && payload.y_data[key].length === payload.x_data.length)) {
    throw new Error('Invalid EFFIS forecast response');
  }
  const seen = new Set();
  return payload.x_data.map((timestamp, i) => {
    const date = typeof timestamp === 'string' ? timestamp.slice(0, 10) : '';
    if (!isDay(date) || seen.has(date)) throw new Error('Invalid EFFIS forecast dates');
    seen.add(date);
    const record = { date };
    for (const { key } of canadianIndices) {
      const value = payload.y_data[key][i];
      record[key] = typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
    }
    return { ...record, danger: fwiDanger(record.fwi) };
  }).filter(({ date }) => date >= from && date <= to).sort((a, b) => a.date.localeCompare(b.date));
}
