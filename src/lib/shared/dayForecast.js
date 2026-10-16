import { HOUR_MS } from './forecastTime.js';

export const WEATHER_ROWS = [
  { key: 'temperature_2m', label: 'Temperature', unit: '°C', top: 54, height: 60, color: '#c2410c' },
  { key: 'relative_humidity_2m', label: 'Humidity', unit: '%', top: 114, height: 48, color: '#0f766e', domain: [0, 100] },
  { key: 'precipitation', label: 'Precipitation', unit: 'mm / hour', top: 162, height: 48, color: '#2563eb', bars: true },
  { key: 'wind_speed_10m', label: 'Wind / gusts', unit: 'km/h', top: 210, height: 64, color: '#475569' },
  { key: 'cloud_cover', label: 'Cloud cover', unit: '%', top: 274, height: 28, color: '#64748b' },
];
export const WEATHER_HEIGHT = 302;
export const finiteValue = value => typeof value === 'number' && Number.isFinite(value) ? value : null;
export const hourText = time => `${String(new Date(time).getUTCHours()).padStart(2, '0')}:00`;
export const formatValue = (value, digits = 0) => finiteValue(value) === null ? '—' : value.toFixed(digits);

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
      // Open-Meteo rain/gusts describe the preceding hour, so a 00–03
      // interval uses the amounts/maxima timestamped 01, 02 and 03.
      precipitation: aggregate(data, indices, 'precipitation', time + HOUR_MS, step, values => values.reduce((a, b) => a + b, 0)),
      wind_gusts_10m: aggregate(data, indices, 'wind_gusts_10m', time + HOUR_MS, step, values => Math.max(...values)),
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
