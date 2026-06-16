const KEY = 'fire-in-site-search-history';
const MAX = 10;

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

function save(entries) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function getHistory() {
  return load();
}

export function recordSearch(result) {
  const entries = load();
  const idx = entries.findIndex(
    (e) => e.latitude === result.latitude && e.longitude === result.longitude
  );
  if (idx >= 0) {
    entries[idx].count += 1;
    entries[idx].lastUsed = Date.now();
  } else {
    entries.push({ ...result, count: 1, lastUsed: Date.now() });
  }
  entries.sort((a, b) => b.count - a.count);
  save(entries.slice(0, MAX));
}
