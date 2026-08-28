// @ts-check
/** @typedef {import('./types').Chore} Chore */

export const MAX_CHORES = 10;
export const COLORS = ['#ef6351','#f7b32b','#65b891','#3d7ea6','#8f6bb3','#ee7b9b','#e97844','#5c9eae','#a5a547','#7768ae'];

/** @param {string} raw @param {Chore[]} chores */
export function validateChore(raw, chores) {
  const name = raw.trim().replace(/\s+/g, ' ');
  if (!name) return { error: 'Enter a chore first.' };
  if (name.length > 48) return { error: 'Keep chores to 48 characters or fewer.' };
  if (chores.length >= MAX_CHORES) return { error: 'The wheel is full. Remove a chore before adding another.' };
  if (chores.some((chore) => chore.name.toLocaleLowerCase() === name.toLocaleLowerCase())) return { error: 'That chore is already on the wheel.' };
  return { name };
}

/** @param {number} count @param {number} [random] */
export function pickIndex(count, random = Math.random()) {
  if (!Number.isInteger(count) || count < 1) throw new RangeError('A positive chore count is required.');
  const safe = Number.isFinite(random) ? Math.min(Math.max(random, 0), 0.999999999) : 0;
  return Math.floor(safe * count);
}

/** @param {number} current @param {number} count @param {number} index @param {number} [turns] */
export function targetRotation(current, count, index, turns = 5) {
  if (count < 1 || index < 0 || index >= count) throw new RangeError('Invalid wheel selection.');
  const segment = 360 / count;
  const landing = (360 - (index + 0.5) * segment) % 360;
  const baseline = Math.ceil(current / 360) * 360 + turns * 360 + landing;
  return baseline <= current ? baseline + 360 : baseline;
}

/** @param {Chore[]} chores */
export function wheelGradient(chores) {
  if (!chores.length) return 'conic-gradient(#ded8cc 0 100%)';
  const size = 100 / chores.length;
  return `conic-gradient(${chores.map((_, i) => `${COLORS[i]} ${i * size}% ${(i + 1) * size}%`).join(',')})`;
}
