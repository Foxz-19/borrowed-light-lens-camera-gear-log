export type WeightUnit='oz'|'g';
export interface Candle{id:string;name:string;weight:number;unit:WeightUnit;wicks:number;diameter:number;burnMinutes:number;createdAt:string}
export interface CandleDraft{name:string;weight:string;unit:string;wicks:string;diameter:string}
export type EstimateResult={ok:true;value:Omit<Candle,'id'|'createdAt'>}|{ok:false;field:keyof CandleDraft;error:string};
export type StorageResult<T>={ok:true;value:T}|{ok:false;value:T;error:string;corrupt?:boolean};
export interface StorageLike{getItem(key:string):string|null;setItem(key:string,value:string):void}
