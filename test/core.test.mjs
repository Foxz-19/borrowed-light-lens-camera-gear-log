import test from 'node:test';
import assert from 'node:assert/strict';
import { pickIndex, targetRotation, validateChore, wheelGradient } from '../src/core.js';

test('validation trims, rejects empty, duplicates, and an eleventh chore', () => {
  assert.deepEqual(validateChore('  Wash   dishes ', []), { name: 'Wash dishes' });
  assert.equal(validateChore(' ', []).error, 'Enter a chore first.');
  assert.match(validateChore('WASH DISHES', [{ id:'1', name:'Wash dishes' }]).error, /already/);
  assert.match(validateChore('New', Array.from({length:10}, (_,i) => ({id:String(i),name:String(i)}))).error, /full/);
});

test('random picker stays in range at both edges', () => {
  assert.equal(pickIndex(4, 0), 0); assert.equal(pickIndex(4, 1), 3);
  assert.throws(() => pickIndex(0), RangeError);
});

test('target rotation lands selected wedge center under top pointer', () => {
  const rotation = targetRotation(720, 4, 2);
  assert.ok(rotation > 720 + 4 * 360);
  assert.equal(((rotation + (2.5 * 90)) % 360 + 360) % 360, 0);
});

test('gradient creates one even stop pair per chore', () => {
  const gradient = wheelGradient([{id:'1',name:'A'},{id:'2',name:'B'}]);
  assert.match(gradient, /0% 50%/); assert.match(gradient, /50% 100%/);
});
