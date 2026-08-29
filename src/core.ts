import type{Candle,CandleDraft,EstimateResult,WeightUnit}from'./types.ts';
const clean=(v:string)=>v.trim().replace(/\s+/g,' ');
export const isUnit=(v:unknown):v is WeightUnit=>v==='oz'||v==='g';
export function estimateMinutes(weight:number,unit:WeightUnit,wicks:number,diameter:number):number{
 const oz=unit==='g'?weight/28.3495:weight,wick=.85**(wicks-1),pool=Math.min(1.3,Math.max(.7,3/diameter));
 return Math.max(1,Math.round(oz*8*wick*pool*60));
}
export function validateDraft(d:CandleDraft,requireName=true):EstimateResult{
 const name=clean(d.name),weight=Number(d.weight),wicks=Number(d.wicks),diameter=Number(d.diameter);
 if(!name&&requireName)return{ok:false,field:'name',error:'Give this candle a name.'};
 if(name.length>50)return{ok:false,field:'name',error:'Keep the name to 50 characters or fewer.'};
 if(!isUnit(d.unit))return{ok:false,field:'unit',error:'Choose ounces or grams.'};
 if(!Number.isFinite(weight)||weight<=0||weight>(d.unit==='g'?10000:350))return{ok:false,field:'weight',error:`Enter a weight between 0 and ${d.unit==='g'?'10,000 grams':'350 ounces'}.`};
 if(!Number.isInteger(wicks)||wicks<1||wicks>8)return{ok:false,field:'wicks',error:'Choose between 1 and 8 wicks.'};
 if(!Number.isFinite(diameter)||diameter<1||diameter>12)return{ok:false,field:'diameter',error:'Enter a diameter between 1 and 12 inches.'};
 return{ok:true,value:{name,weight,unit:d.unit,wicks,diameter,burnMinutes:estimateMinutes(weight,d.unit,wicks,diameter)}};
}
export function formatDuration(m:number):string{const h=Math.floor(m/60),r=m%60;if(!h)return`${r} ${r===1?'minute':'minutes'}`;return`${h} ${h===1?'hour':'hours'}${r?` ${r} ${r===1?'minute':'minutes'}`:''}`}
export const resultMessage=(m:number)=>`Your candle will burn for approximately ${formatDuration(m)}.`;
export const formatWeight=(c:Pick<Candle,'weight'|'unit'>)=>`${c.weight.toLocaleString()} ${c.unit}`;
export function isCandle(v:unknown):v is Candle{
 if(!v||typeof v!=='object')return false;const c=v as Record<string,unknown>;
 return typeof c.id==='string'&&!!c.id&&typeof c.name==='string'&&!!c.name&&c.name.length<=50&&typeof c.weight==='number'&&c.weight>0&&isUnit(c.unit)&&Number.isInteger(c.wicks)&&Number(c.wicks)>=1&&Number(c.wicks)<=8&&typeof c.diameter==='number'&&c.diameter>=1&&c.diameter<=12&&Number.isInteger(c.burnMinutes)&&Number(c.burnMinutes)>0&&typeof c.createdAt==='string'&&!Number.isNaN(Date.parse(c.createdAt));
}
