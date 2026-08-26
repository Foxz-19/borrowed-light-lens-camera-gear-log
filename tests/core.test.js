import test from 'node:test';
import assert from 'node:assert/strict';
import {formToSouvenir, getSummary, isSouvenir, selectEntries} from '../src/data.js';

const entries = [
  {id:'1',name:'Tile',description:'',city:'Lisbon',country:'Portugal',date:'2024-06-01',category:'Decorative',mood:'joyful',memory:'Rain'},
  {id:'2',name:'Bracelet',description:'',city:'Kyoto',country:'Japan',date:'2025-02-10',category:'Wearable',mood:'awe',memory:'Lanterns'},
  {id:'3',name:'Postcard',description:'',city:'Porto',country:'Portugal',date:'2023-01-20',category:'Paper',mood:'funny',memory:'Lost'}
];
test('summary counts entries and unique countries case-insensitively', () => assert.deepEqual(getSummary(entries), {total:3,countries:2}));
test('filters by category, mood, and searches memory fields', () => { assert.equal(selectEntries(entries,'Wearable','', 'date-desc')[0].name,'Bracelet'); assert.equal(selectEntries(entries,'all','', 'date-desc','funny')[0].name,'Postcard'); assert.equal(selectEntries(entries,'all','lost','date-desc')[0].name,'Postcard'); });
test('sorts newest, oldest, and destination alphabetically', () => { assert.equal(selectEntries(entries,'all','', 'date-desc')[0].name,'Bracelet'); assert.equal(selectEntries(entries,'all','', 'date-asc')[0].name,'Postcard'); assert.deepEqual(selectEntries(entries,'all','', 'destination').map(x=>x.city),['Kyoto','Lisbon','Porto']); });
test('validates the complete stored data contract', () => { assert.equal(isSouvenir(entries[0]), true); assert.equal(isSouvenir({...entries[0], category:'Unknown'}), false); assert.equal(isSouvenir({...entries[0], memory:12}), false); });
test('rejects malformed dates before they can reach storage', () => { const OriginalFormData = globalThis.FormData; const fields = [['name','Tile'],['city','Lisbon'],['country','Portugal'],['date','not-a-date'],['category','Paper'],['mood','joyful'],['memory','A rainy afternoon']]; globalThis.FormData = class { entries() { return fields; } }; try { assert.match(formToSouvenir({}).error, /valid date/); } finally { globalThis.FormData = OriginalFormData; } });
