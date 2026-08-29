import assert from'node:assert/strict';import test from'node:test';import{estimateMinutes,formatDuration,isCandle,resultMessage,validateDraft}from'../src/core.ts';
const draft={name:'  Dinner   glow ',weight:'12',unit:'oz',wicks:'1',diameter:'3'};
test('normalizes and calculates the baseline',()=>assert.deepEqual(validateDraft(draft),{ok:true,value:{name:'Dinner glow',weight:12,unit:'oz',wicks:1,diameter:3,burnMinutes:5760}}));
test('converts units and adjusts burn factors',()=>{assert.equal(estimateMinutes(283.495,'g',1,3),4800);assert.ok(estimateMinutes(10,'oz',2,3)<estimateMinutes(10,'oz',1,3));assert.ok(estimateMinutes(10,'oz',1,6)<estimateMinutes(10,'oz',1,3))});
test('rejects invalid values',()=>{for(const patch of[{name:''},{weight:'-1'},{wicks:'1.5'},{diameter:'13'},{unit:'kg'}])assert.equal(validateDraft({...draft,...patch}).ok,false)});
test('can estimate before naming, while saving still requires a name',()=>{assert.equal(validateDraft({...draft,name:''},false).ok,true);assert.equal(validateDraft({...draft,name:''}).ok,false)});
test('formats accessible result copy',()=>{assert.equal(formatDuration(260),'4 hours 20 minutes');assert.equal(formatDuration(60),'1 hour');assert.equal(resultMessage(260),'Your candle will burn for approximately 4 hours 20 minutes.')});
test('guards persisted data at runtime',()=>{const c={id:'1',name:'Amber',weight:8,unit:'oz',wicks:1,diameter:3,burnMinutes:3840,createdAt:'2026-08-29T00:00:00.000Z'};assert.equal(isCandle(c),true);assert.equal(isCandle({...c,wicks:0}),false);assert.equal(isCandle({...c,createdAt:'bad'}),false)});
