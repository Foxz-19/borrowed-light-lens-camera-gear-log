import { AppData, isAppData } from "./domain";
export const STORAGE_KEY="nest-egg:v1";
export type LoadResult={data:AppData;warning?:string};
export type SaveResult={ok:true}|{ok:false;error:string};

export function loadData(storage:Pick<Storage,"getItem"|"setItem">=localStorage):LoadResult{
  let raw:string|null;
  try{raw=storage.getItem(STORAGE_KEY)}catch{return{data:{version:1,jars:[]},warning:"Browser storage is blocked. You can use Nest Egg for now, but changes may not survive a refresh."}}
  if(raw===null)return{data:{version:1,jars:[]}};
  try{
    const parsed:unknown=JSON.parse(raw);
    if(!isAppData(parsed))throw new Error("invalid schema");
    return{data:parsed};
  }catch{
    try{storage.setItem(`${STORAGE_KEY}:recovery:${Date.now()}`,raw)}catch{/* warning below remains visible */}
    return{data:{version:1,jars:[]},warning:"Saved data was damaged and could not be loaded. A recovery copy was kept where browser storage allowed; your shelf starts empty until you replace it."};
  }
}

export function saveData(data:AppData,storage:Pick<Storage,"setItem">=localStorage):SaveResult{
  try{storage.setItem(STORAGE_KEY,JSON.stringify(data));return{ok:true}}
  catch{return{ok:false,error:"This change could not be saved. Check private-browsing or storage settings, then try again."}}
}
