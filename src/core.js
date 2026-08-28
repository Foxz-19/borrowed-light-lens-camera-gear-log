// @ts-check
/** @typedef {import('./types').FoodLabel} FoodLabel */
export const COLORS = ['#f6b94b','#91b78f','#ef7868','#8ba5be','#e5a36a','#b997c8'];
export const MAX_NOTE = 120;

/** @param {string} food @param {string} stored @param {string} note @param {FoodLabel[]} labels */
export function validateLabel(food, stored, note, labels) {
  const cleanFood = food.trim().replace(/\s+/g, ' '); const cleanNote = note.trim().replace(/\s+/g, ' ');
  if (!cleanFood) return { error: 'Give this leftover a name.' };
  if (cleanFood.length > 52) return { error: 'Food names must be 52 characters or fewer.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(stored) || Number.isNaN(parseDate(stored).getTime())) return { error: 'Choose a valid stored date.' };
  if (cleanNote.length > MAX_NOTE) return { error: 'Notes must be 120 characters or fewer.' };
  if (labels.some((label) => label.food.toLocaleLowerCase() === cleanFood.toLocaleLowerCase() && label.stored === stored)) return { error: 'That food already has a label for this date.' };
  return { food: cleanFood, stored, note: cleanNote };
}
/** @param {string} iso */
export function parseDate(iso) { const [year, month, day] = iso.split('-').map(Number); return new Date(year, month - 1, day); }
/** @param {string} iso @param {Date} [today] */
export function daysAgo(iso, today = new Date()) {
  const stored = parseDate(iso); const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.max(0, Math.floor((now.getTime() - stored.getTime()) / 86400000));
}
/** @param {string} iso */
export function formatStored(iso) { return parseDate(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
/** @param {number} age */
export function ageText(age) { return age === 0 ? 'Stored today' : age === 1 ? 'Stored yesterday' : `Stored ${age} days ago`; }
