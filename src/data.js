/** @typedef {{id:string,name:string,description:string,city:string,country:string,date:string,category:string,mood:string,memory:string}} Souvenir */

export const CATEGORIES = ['Wearable', 'Edible', 'Decorative', 'Paper', 'Other'];
export const MOODS = {joyful: '😄', sentimental: '🥺', funny: '😂', awe: '🤩'};
export const moodNames = {joyful: 'Joyful', sentimental: 'Sentimental', funny: 'Funny', awe: 'Awe-struck'};
export const isSouvenir = value => Boolean(value && typeof value === 'object' && typeof value.id === 'string' && typeof value.name === 'string' && typeof value.description === 'string' && typeof value.city === 'string' && typeof value.country === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.date) && CATEGORIES.includes(value.category) && Object.prototype.hasOwnProperty.call(MOODS, value.mood) && typeof value.memory === 'string');
const createId = () => globalThis.crypto?.randomUUID?.() || `souvenir-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** @param {HTMLFormElement} form @returns {{value?:Souvenir,error?:string}} */
export function formToSouvenir(form) {
  const data = new FormData(form);
  const value = Object.fromEntries(data.entries());
  const required = [['name','Item name'],['city','City'],['country','Country'],['date','Date acquired'],['memory','Memory note']];
  const missing = required.find(([key]) => !String(value[key] || '').trim());
  if (missing) return {error: `${missing[1]} is required.`};
  if (!CATEGORIES.includes(value.category)) return {error: 'Choose a valid category.'};
  if (!MOODS[value.mood]) return {error: 'Choose a mood tag.'};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value.date))) return {error: 'Choose a valid date acquired.'};
  return {value: {id:createId(), name:String(value.name).trim(), description:String(value.description || '').trim(), city:String(value.city).trim(), country:String(value.country).trim(), date:String(value.date), category:String(value.category), mood:String(value.mood), memory:String(value.memory).trim()}};
}

/** @param {Souvenir[]} entries @returns {{total:number,countries:number}} */
export function getSummary(entries) { return {total: entries.length, countries: new Set(entries.map(x => x.country.trim().toLowerCase())).size}; }

/** @param {Souvenir[]} entries @param {string} filter @param {string} search @param {string} sort @returns {Souvenir[]} */
export function selectEntries(entries, filter, search, sort, mood = 'all') {
  const query = search.trim().toLowerCase();
  return entries.filter(x => (filter === 'all' || x.category === filter) && (mood === 'all' || x.mood === mood) && (!query || [x.name,x.city,x.country,x.memory].some(v => v.toLowerCase().includes(query)))).slice().sort((a,b) => sort === 'destination' ? `${a.country}${a.city}`.localeCompare(`${b.country}${b.city}`) : sort === 'date-asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
}
