export type GoalStatus = "Not Started" | "In Progress" | "Reached 🎉";
export interface Deposit { id:string; amount:number; note:string; date:string; createdAt:string }
export interface Jar { id:string; name:string; emoji:string; target:number; deposits:Deposit[]; createdAt:string }
export interface AppData { version:1; jars:Jar[] }
export interface Summary { saved:number; target:number; total:number; notStarted:number; inProgress:number; reached:number }
export type ValidationResult<T> = { ok:true; value:T } | { ok:false; errors:Record<string,string> };

const finitePositive = (value:unknown, max=999_999_999): value is number => typeof value === "number" && Number.isFinite(value) && value > 0 && value <= max;
const text = (value:unknown, max:number): value is string => typeof value === "string" && value.length <= max;
const isoDate = (value:string): boolean => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`));

export function validateJarInput(input:{name:string;emoji:string;target:string}):ValidationResult<{name:string;emoji:string;target:number}>{
  const name=input.name.trim(), emoji=input.emoji.trim(), target=Number(input.target), errors:Record<string,string>={};
  if(!name) errors.name="Give this goal a name."; else if(name.length>50) errors.name="Use 50 characters or fewer.";
  if(emoji.length>8) errors.emoji="Keep the icon to one emoji.";
  if(!finitePositive(target)) errors.target="Enter an amount between $0.01 and $999,999,999.";
  return Object.keys(errors).length ? {ok:false,errors} : {ok:true,value:{name,emoji,target:money(target)}};
}

export function validateDepositInput(input:{amount:string;note:string;date:string}):ValidationResult<{amount:number;note:string;date:string}>{
  const amount=Number(input.amount), note=input.note.trim(), date=input.date, errors:Record<string,string>={};
  if(!finitePositive(amount)) errors.amount="Enter a deposit between $0.01 and $999,999,999.";
  if(note.length>80) errors.note="Use 80 characters or fewer.";
  if(!isoDate(date)) errors.date="Choose a valid date or leave it blank.";
  return Object.keys(errors).length ? {ok:false,errors} : {ok:true,value:{amount:money(amount),note,date}};
}

export const savedAmount=(jar:Jar):number=>money(jar.deposits.reduce((sum,item)=>sum+item.amount,0));
export const progress=(jar:Jar):number=>Math.min(100,Math.max(0,savedAmount(jar)/jar.target*100));
export const status=(jar:Jar):GoalStatus=>{const saved=savedAmount(jar); return saved<=0?"Not Started":saved>=jar.target?"Reached 🎉":"In Progress"};
export const remaining=(jar:Jar):number=>money(Math.max(0,jar.target-savedAmount(jar)));
export const money=(value:number):number=>Math.round((value+Number.EPSILON)*100)/100;
export function summarize(jars:Jar[]):Summary{
  return jars.reduce<Summary>((sum,jar)=>{sum.saved=money(sum.saved+savedAmount(jar));sum.target=money(sum.target+jar.target);sum.total++;const state=status(jar);if(state==="Not Started")sum.notStarted++;else if(state==="In Progress")sum.inProgress++;else sum.reached++;return sum},{saved:0,target:0,total:0,notStarted:0,inProgress:0,reached:0});
}

export function isAppData(value:unknown):value is AppData{
  if(!value||typeof value!=="object") return false;
  const data=value as Partial<AppData>;
  return data.version===1 && Array.isArray(data.jars) && data.jars.every(isJar);
}
function isJar(value:unknown):value is Jar{
  if(!value||typeof value!=="object")return false;const jar=value as Partial<Jar>;
  return text(jar.id,100)&&text(jar.name,50)&&jar.name.trim().length>0&&text(jar.emoji,8)&&finitePositive(jar.target)&&text(jar.createdAt,40)&&Array.isArray(jar.deposits)&&jar.deposits.every(isDeposit);
}
function isDeposit(value:unknown):value is Deposit{
  if(!value||typeof value!=="object")return false;const item=value as Partial<Deposit>;
  return text(item.id,100)&&finitePositive(item.amount)&&text(item.note,80)&&text(item.date,10)&&isoDate(item.date)&&text(item.createdAt,40);
}
