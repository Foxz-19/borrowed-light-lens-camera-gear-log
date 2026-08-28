// @ts-check
/** @typedef {import('./types').FoodLabel} FoodLabel */
/** @typedef {import('./types').LoadResult} LoadResult */
const KEY = 'leftovers-labels-v1';
/** @param {Storage} storage @returns {LoadResult} */
export function loadLabels(storage) {
  let raw; try { raw = storage.getItem(KEY); } catch { return { labels: [], error: 'Fridge storage is blocked. Labels will work for this session only.' }; }
  if (!raw) return { labels: [] };
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || data.some((x) => !x || typeof x.id !== 'string' || typeof x.food !== 'string' || typeof x.stored !== 'string' || typeof x.note !== 'string')) throw new TypeError('Invalid label data');
    return { labels: data };
  } catch { try { storage.removeItem(KEY); } catch { /* in-memory reset remains safe */ } return { labels: [], error: 'Saved labels were damaged, so the fridge was safely reset.' }; }
}
/** @param {Storage} storage @param {FoodLabel[]} labels */
export function saveLabels(storage, labels) { try { storage.setItem(KEY, JSON.stringify(labels)); return null; } catch { return 'This label works now, but could not be saved on this device.'; } }
