import test from 'node:test';
import assert from 'node:assert/strict';
import { loadChores, saveChores } from '../src/storage.js';

const memory = (value = null) => ({ value, getItem(){return this.value}, setItem(_k,v){this.value=v}, removeItem(){this.value=null} });

test('storage round-trips valid chores', () => {
  const store = memory(); const chores = [{id:'1',name:'Dishes'}];
  assert.equal(saveChores(store, chores), null); assert.deepEqual(loadChores(store).chores, chores);
});

test('corrupt storage resets with a user-facing error', () => {
  const store = memory('{broken'); const loaded = loadChores(store);
  assert.deepEqual(loaded.chores, []); assert.match(loaded.error, /safely reset/);
});

test('blocked storage produces explicit load and save errors', () => {
  const blocked = { getItem(){throw Error('blocked')}, setItem(){throw Error('blocked')}, removeItem(){} };
  assert.match(loadChores(blocked).error, /blocked/); assert.match(saveChores(blocked, []), /could not be saved/);
});
