// @ts-check
/** @typedef {import('./types').Chore} Chore */
/** @typedef {import('./types').LoadResult} LoadResult */
const KEY = 'chore-roulette-v1';

/** @param {Storage} storage @returns {LoadResult} */
export function loadChores(storage) {
  let raw;
  try { raw = storage.getItem(KEY); }
  catch {
    return { chores: [], error: 'Saved chores could not be read. Storage may be blocked; changes may not persist.' };
  }
  if (!raw) return { chores: [] };
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || data.some((item) => !item || typeof item.id !== 'string' || typeof item.name !== 'string')) throw new TypeError('Invalid chore data');
    return { chores: data.slice(0, 10) };
  } catch {
    try { storage.removeItem(KEY); } catch { /* recovery is still safe in memory */ }
    return { chores: [], error: 'Saved chores were damaged, so the wheel was safely reset.' };
  }
}

/** @param {Storage} storage @param {Chore[]} chores @returns {string | null} */
export function saveChores(storage, chores) {
  try { storage.setItem(KEY, JSON.stringify(chores)); return null; }
  catch { return 'This change works for now, but could not be saved on this device.'; }
}
