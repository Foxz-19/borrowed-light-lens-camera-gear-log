import {isSouvenir} from './data.js';
const KEY = 'sunburn-summits:souvenirs:v1';

/** @returns {{entries?: import('./data.js').Souvenir[], error?:string, recovered?:boolean}} */
export function loadEntries() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {entries: []};
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.some(x => !isSouvenir(x))) throw new Error('invalid collection shape');
    return {entries: parsed, recovered: false};
  } catch (error) {
    console.error('Unable to load collection', error);
    return {entries: [], error: 'Your saved collection could not be read. A fresh logbook is open; existing data was left untouched.', recovered: true};
  }
}

/** @param {import('./data.js').Souvenir[]} entries @returns {{ok:boolean,error?:string}} */
export function saveEntries(entries) {
  try { localStorage.setItem(KEY, JSON.stringify(entries)); return {ok: true}; }
  catch (error) { console.error('Unable to save collection', error); return {ok: false, error: 'Could not save this entry. Check your browser storage permissions and try again.'}; }
}
