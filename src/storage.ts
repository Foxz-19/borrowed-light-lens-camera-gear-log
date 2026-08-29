import{isCandle}from'./core.ts';import type{Candle,StorageLike,StorageResult}from'./types.ts';
export const STORAGE_KEY='ember.candles.v1';
export class CandleStore{
 private storage:StorageLike;constructor(storage:StorageLike){this.storage=storage}
 load():StorageResult<Candle[]>{try{const raw=this.storage.getItem(STORAGE_KEY);if(raw===null)return{ok:true,value:[]};const data:unknown=JSON.parse(raw);if(!Array.isArray(data)||!data.every(isCandle))throw Error('invalid');return{ok:true,value:data.sort((a,b)=>b.createdAt.localeCompare(a.createdAt))}}catch(e){const corrupt=e instanceof SyntaxError||e instanceof Error&&e.message==='invalid';return{ok:false,value:[],corrupt,error:corrupt?'Saved candle data was damaged and could not be opened. New estimates still work.':'Browser storage is unavailable. Saved candles may disappear after refresh.'}}}
 save(value:Candle[]):StorageResult<Candle[]>{try{this.storage.setItem(STORAGE_KEY,JSON.stringify(value));return{ok:true,value}}catch{return{ok:false,value,error:'This change could not be saved in your browser. Keep this page open and try again.'}}}
}
