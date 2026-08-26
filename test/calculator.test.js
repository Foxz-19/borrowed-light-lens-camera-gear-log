import test from 'node:test';import assert from 'node:assert/strict';import {compare,perUnit,validateProduct} from '../js/calculator.js';
test('calculates per unit and marks the lowest rate',()=>{const r=compare([{name:'A',price:4,quantity:8,unit:'oz'},{name:'B',price:5,quantity:12,unit:'oz'}]);assert.equal(perUnit(r.values[0]),.5);assert.equal(r.values[1].cheapest,true)});
test('rejects invalid data',()=>{assert.match(validateProduct({price:0,quantity:1,unit:'oz'}),/price/);assert.match(compare([{price:1,quantity:0,unit:'oz'}]).error,/quantity/)});
