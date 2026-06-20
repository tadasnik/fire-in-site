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

function rank(entries) {
  return entries.sort(
    (a, b) => (b.count ?? 0) - (a.count ?? 0) || (b.lastUsed ?? 0) - (a.lastUsed ?? 0)
  );
}

export function getHistory() {
  return rank(load());
}

export function recordSearch(result) {
  const entries = load();
  const idx = entries.findIndex(
    (e) => e.latitude === result.latitude && e.longitude === result.longitude
  );
  if (idx >= 0) {
    entries[idx].count = (entries[idx].count ?? 0) + 1;
    entries[idx].lastUsed = Date.now();
  } else {
    entries.push({ ...result, count: 1, lastUsed: Date.now() });
  }
  save(rank(entries).slice(0, MAX));
}
