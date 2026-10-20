import { HOUR_MS } from './forecastTime.js';

export const WEATHER_ROWS = [
  { key: 'temperature_2m', label: 'Temperature', icon: 'wi-thermometer', unit: '°C', top: 32, height: 60, color: '#c2410c' },
  { key: 'relative_humidity_2m', label: 'Humidity', icon: 'wi-humidity', unit: '%', top: 92, height: 26, color: '#0f766e', domain: [0, 100] },
  { key: 'vapour_pressure_deficit', label: 'VPD', description: 'Vapour pressure deficit', unit: 'kPa', top: 118, height: 26, color: '#7c3aed', digits: 2 },
  { key: 'precipitation', label: 'Precipitation', icon: 'wi-raindrop', unit: 'mm/h', top: 144, height: 26, color: '#2563eb', accumulation: true, interval: true },
  { key: 'precipitation_probability', label: 'Chance', description: 'Chance of precipitation >0.1 mm · Best Match ensembles; 3-hour view shows the maximum hourly chance, not the chance over the entire interval', unit: '%', top: 170, height: 26, color: '#0284c7', domain: [0, 100], interval: true },
  { key: 'wind_speed_10m', label: 'Wind / gusts', icon: 'wi-strong-wind', unit: 'km/h', top: 196, height: 38, color: '#475569' },
  { key: 'cloud_cover', label: 'Cloud cover', icon: 'wi-cloudy', unit: '%', top: 234, height: 26, color: '#64748b', domain: [0, 100] },
];
export const WEATHER_AXIS_HEIGHT = 22;
export const WEATHER_HEIGHT = 260;
export const finiteValue = value => typeof value === 'number' && Number.isFinite(value) ? value : null;
export const hourText = time => `${String(new Date(time).getUTCHours()).padStart(2, '0')}:00`;
export const formatValue = (value, digits = 0) => finiteValue(value) === null ? '—' : value.toFixed(digits);

// This is a forecast-time table with a temperature sparkline: all values for
// an hour share its column centre, regardless of their accumulation period.
export const forecastColumnTime = (time, step) => Number(time) + step / 2;

// The data source encodes location wall-clock time as UTC milliseconds.
// Keep a full day of columns; absent hours stay missing rather than becoming zero.
export function dayWeather(data, day) {
  const indices = new Map((data.time ?? []).map((time, index) => [time, index]));
  return Array.from({ length: 24 }, (_, hour) => {
    const time = Number(day) + hour * HOUR_MS;
    const index = indices.get(time);
    const row = { time, available: index !== undefined };
    for (const key of [...WEATHER_ROWS.map(row => row.key), 'wind_gusts_10m', 'wind_direction_10m', 'weather_code', 'is_day']) {
      row[key] = index === undefined ? null : finiteValue(data[key]?.[index]);
    }
    return row;
  });
}

// Instantaneous samples sit on the time axis; cells represent [start, end).
function weatherAt(data, time, indices) {
  const index = indices.get(time);
  const row = { time, available: index !== undefined };
  for (const key of [...WEATHER_ROWS.map(row => row.key), 'wind_gusts_10m', 'wind_direction_10m', 'weather_code', 'is_day']) {
    row[key] = index === undefined ? null : finiteValue(data[key]?.[index]);
  }
  return row;
}

function aggregate(data, indices, key, first, count, operation) {
  const values = Array.from({ length: count }, (_, i) => finiteValue(data[key]?.[indices.get(first + i * HOUR_MS)]));
  return values.every(value => value !== null) ? operation(values) : null;
}

export function viewWeather(data, start, { days = 1, step = 1 } = {}) {
  const indices = new Map((data.time ?? []).map((time, index) => [time, index]));
  return Array.from({ length: days * 24 / step }, (_, i) => {
    const time = Number(start) + i * step * HOUR_MS;
    return {
      ...weatherAt(data, time, indices),
      periodStart: time,
      periodEnd: time + step * HOUR_MS,
      precedingStart: time - step * HOUR_MS,
      precedingEnd: time,
      // At 09:00, the preceding 3h use API timestamps 07, 08 and 09.
      // Keep accumulation semantics separate from the column's hit target.
      precipitation: aggregate(data, indices, 'precipitation', time - (step - 1) * HOUR_MS, step, values => values.reduce((a, b) => a + b, 0)),
      precipitation_probability: aggregate(data, indices, 'precipitation_probability', time - (step - 1) * HOUR_MS, step, values => Math.max(...values)),
      wind_gusts_10m: aggregate(data, indices, 'wind_gusts_10m', time - (step - 1) * HOUR_MS, step, values => Math.max(...values)),
    };
  });
}

export function weatherPoints(data, start, { days = 1, step = 1 } = {}) {
  const indices = new Map((data.time ?? []).map((time, index) => [time, index]));
  return Array.from({ length: days * 24 / step + 1 }, (_, i) => {
    const time = Number(start) + i * step * HOUR_MS;
    return { ...weatherAt(data, time, indices), wind_gusts_10m: aggregate(data, indices, 'wind_gusts_10m', time - (step - 1) * HOUR_MS, step, values => Math.max(...values)) };
  });
}

// Solar timestamps use the same location-local-as-UTC convention as the axis.
export function daylightSegments(data, start, end) {
  const result = [];
  for (let i = 0; i < (data.daily_time?.length ?? 0); i++) {
    const day = data.daily_time[i];
    const lo = Math.max(Number(start), day);
    const hi = Math.min(Number(end), day + 24 * HOUR_MS);
    if (hi <= lo) continue;
    const rise = finiteValue(data.daily_sunrise?.[i]);
    const set = finiteValue(data.daily_sunset?.[i]);
    const duration = finiteValue(data.daily_daylight_duration?.[i]);
    const add = (a, b, isDay) => { if (b > a) result.push({ start: a, end: b, isDay }); };
    if (duration === 0) { add(lo, hi, false); continue; }
    if (duration !== null && duration >= 86399) { add(lo, hi, true); continue; }
    if (rise === null || set === null || rise <= 0 || set <= rise) continue;
    add(lo, Math.min(hi, rise), false);
    add(Math.max(lo, rise), Math.min(hi, set), true);
    add(Math.max(lo, set), hi, false);
  }
  return result;
}

export const dateText = time => new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(time);

export function dayFuels(rows, day, { days = 1, step = 1 } = {}) {
  const dayRows = rows.filter(row => row.time >= Number(day) && row.time < Number(day) + days * 24 * HOUR_MS);
  const fuels = [...new Set(dayRows.flatMap(row => Object.keys(row).filter(key => key !== 'time')))];
  const byTime = new Map(dayRows.map(row => [row.time, row]));
  const starts = Array.from({ length: days * 24 / step }, (_, i) => Number(day) + i * step * HOUR_MS);
  return fuels.map(fuel => ({ fuel, values: starts.map(start => {
    const samples = Array.from({ length: step }, (_, i) => ({ time: start + i * HOUR_MS, value: finiteValue(byTime.get(start + i * HOUR_MS)?.[fuel]) }));
    const complete = samples.every(point => point.value !== null);
    const peak = complete ? samples.reduce((peak, point) => point.value > peak.value ? point : peak) : null;
    return { time: start, periodStart: start, periodEnd: start + step * HOUR_MS, value: peak?.value ?? null, peakTime: peak?.time ?? null };
  }) }));
}

export function rowDomain(data, row) {
  if (row.domain) return row.domain;
  const values = data.flatMap(d => row.key === 'wind_speed_10m' ? [d[row.key], d.wind_gusts_10m] : [d[row.key]]).filter(v => finiteValue(v) !== null);
  if (!values.length) return [0, 1];
  const min = row.key === 'temperature_2m' ? Math.min(0, Math.floor(Math.min(...values) - 2)) : 0;
  return [min, Math.max(row.key === 'temperature_2m' ? 0 : min + 1, Math.ceil(Math.max(...values) + (row.key === 'temperature_2m' ? 2 : 0)))];
}

// Missing observations break a line, rather than connecting across a gap.
export function linePath(data, key, x, y) {
  let penDown = false;
  return data.map(d => {
    if (finiteValue(d[key]) === null) { penDown = false; return ''; }
    const command = penDown ? 'L' : 'M';
    penDown = true;
    return `${command}${x(d.time)},${y(d[key])}`;
  }).join(' ');
}

// Close each continuous segment against the actual zero baseline.
export function areaPath(data, key, x, y) {
  const segments = [];
  let segment = [];
  for (const point of data) {
    if (finiteValue(point[key]) === null) {
      if (segment.length) segments.push(segment);
      segment = [];
    } else {
      segment.push(point);
    }
  }
  if (segment.length) segments.push(segment);
  return segments.map(points => {
    const first = points[0];
    const last = points[points.length - 1];
    return `M${x(first.time)},${y(0)} ${points.map(point => `L${x(point.time)},${y(point[key])}`).join(' ')} L${x(last.time)},${y(0)} Z`;
  }).join(' ');
}
