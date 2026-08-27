import { AppData, Deposit, Jar, status, validateDepositInput, validateJarInput } from "./domain";
import { loadData, saveData } from "./storage";
import { renderApp } from "./render";

const byId=<T extends HTMLElement>(id:string):T=>{const node=document.getElementById(id);if(!node)throw new Error(`Missing #${id}`);return node as T};
const jarForm=byId<HTMLFormElement>("jar-form"), depositForm=byId<HTMLFormElement>("deposit-form");
const depositDialog=byId<HTMLDialogElement>("deposit-dialog"), deleteDialog=byId<HTMLDialogElement>("delete-dialog");
const list=byId("jar-list"), persistent=byId("persistent-message"), toast=byId("toast");
let data:AppData={version:1,jars:[]}, activeJarId:string|null=null, pendingDeleteId:string|null=null, returnFocus:HTMLElement|null=null, toastTimer=0;

const id=():string=>globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const now=():string=>new Date().toISOString();
const today=():string=>new Date().toLocaleDateString("en-CA");
const findJar=(jarId:string):Jar|null=>data.jars.find(jar=>jar.id===jarId)??null;

function report(message:string,kind:"success"|"error"="success",persistentError=false):void{
  window.clearTimeout(toastTimer);
  if(persistentError){toast.hidden=true;persistent.textContent=message;persistent.hidden=false;persistent.focus();return}
  toast.textContent=message;toast.dataset.kind=kind;toast.hidden=false;toastTimer=window.setTimeout(()=>toast.hidden=true,4200);
}
function clearPersistent():void{persistent.hidden=true;persistent.textContent=""}
function render(celebrateId?:string):void{renderApp(data,{celebrateId});list.setAttribute("aria-busy","false")}
function commit(next:AppData,success:string,celebrateId?:string,inline?:HTMLElement):boolean{
  const saved=saveData(next);
  if(!saved.ok){report(saved.error,"error",true);if(inline){inline.textContent=saved.error;inline.focus()}return false}
  data=next;clearPersistent();render(celebrateId);report(success);return true;
}
function setErrors(prefix:""|"deposit-",errors:Record<string,string>):void{
  const fields=prefix?['amount','note','date']:['name','emoji','target'];
  fields.forEach(field=>{const error=byId(`${prefix}${field}-error`);error.textContent=errors[field]??"";const input=byId<HTMLInputElement>(prefix?`deposit-${field}`:`jar-${field}`);input.setAttribute("aria-invalid",String(Boolean(errors[field]))) });
  const first=fields.find(field=>errors[field]);if(first)byId<HTMLInputElement>(prefix?`deposit-${first}`:`jar-${first}`).focus();
}

jarForm.addEventListener("submit",event=>{
  event.preventDefault();byId("form-message").textContent="";
  const form=new FormData(jarForm),result=validateJarInput({name:String(form.get("name")??""),emoji:String(form.get("emoji")??""),target:String(form.get("target")??"")});
  setErrors("",result.ok?{}:result.errors);if(!result.ok)return;
  const jar:Jar={id:id(),...result.value,deposits:[],createdAt:now()};
  if(commit({...data,jars:[jar,...data.jars]},`${jar.name} is ready for its first deposit.`,undefined,byId("form-message"))){jarForm.reset();byId<HTMLInputElement>("jar-name").focus()}
});

depositForm.addEventListener("submit",event=>{
  event.preventDefault();const jar=activeJarId&&findJar(activeJarId);if(!jar){report("That jar is no longer available.","error",true);closeDialog(depositDialog);return}
  const form=new FormData(depositForm),result=validateDepositInput({amount:String(form.get("amount")??""),note:String(form.get("note")??""),date:String(form.get("date")??"")});
  setErrors("deposit-",result.ok?{}:result.errors);if(!result.ok)return;
  const before=status(jar),deposit:Deposit={id:id(),...result.value,createdAt:now()};
  const updated={...jar,deposits:[deposit,...jar.deposits]},celebrated=before!=="Reached 🎉"&&status(updated)==="Reached 🎉";
  const next={...data,jars:data.jars.map(item=>item.id===jar.id?updated:item)};
  if(commit(next,celebrated?`${jar.name} reached its goal! 🎉`:`$${deposit.amount.toLocaleString()} added to ${jar.name}.`,celebrated?jar.id:undefined,byId("deposit-message")))closeDialog(depositDialog);
});

list.addEventListener("click",event=>{
  const button=(event.target as Element).closest<HTMLButtonElement>("button[data-action]");if(!button)return;
  const action=button.dataset.action,jarId=button.dataset.jarId;
  if((action!=="deposit"&&action!=="delete")||!jarId||!findJar(jarId)){report("That action is invalid or the jar is no longer available.","error",true);return}
  returnFocus=button;if(action==="deposit")openDeposit(jarId);else openDelete(jarId);
});
document.addEventListener("click",event=>{const button=(event.target as Element).closest<HTMLButtonElement>("button[data-action]");if(!button)return;if(button.dataset.action==="focus-form")byId<HTMLInputElement>("jar-name").focus();if(button.dataset.action==="close-deposit")closeDialog(depositDialog)});

function openDeposit(jarId:string):void{
  const jar=findJar(jarId);if(!jar)return;activeJarId=jarId;depositForm.reset();setErrors("deposit-",{});byId("deposit-message").textContent="";
  byId("deposit-context").textContent=`Adding to ${jar.emoji?`${jar.emoji} `:""}${jar.name}`;byId<HTMLInputElement>("deposit-date").value=today();depositDialog.showModal();
}
function openDelete(jarId:string):void{
  const jar=findJar(jarId);if(!jar)return;pendingDeleteId=jarId;
  byId("delete-copy").textContent=`“${jar.name}” and ${jar.deposits.length} ${jar.deposits.length===1?"deposit entry":"deposit entries"} will be removed from this device. This cannot be undone.`;deleteDialog.showModal();byId<HTMLButtonElement>("cancel-delete").focus();
}
function closeDialog(dialog:HTMLDialogElement):void{if(dialog.open)dialog.close();activeJarId=null;pendingDeleteId=null;returnFocus?.focus();returnFocus=null}
byId("cancel-delete").addEventListener("click",()=>closeDialog(deleteDialog));
byId("confirm-delete").addEventListener("click",()=>{
  const jar=pendingDeleteId&&findJar(pendingDeleteId);if(!jar){report("That jar is no longer available.","error",true);closeDialog(deleteDialog);return}
  if(commit({...data,jars:data.jars.filter(item=>item.id!==jar.id)},`${jar.name} was deleted.`,undefined,byId("delete-copy")))closeDialog(deleteDialog);
});
[depositDialog,deleteDialog].forEach(dialog=>{dialog.addEventListener("cancel",event=>{event.preventDefault();closeDialog(dialog)});dialog.addEventListener("click",event=>{if(event.target===dialog)closeDialog(dialog)})});

function initialize():void{
  try{const loaded=loadData();data=loaded.data;render();byId("boot-status").hidden=true;byId("main").hidden=false;if(loaded.warning)report(loaded.warning,"error",true)}
  catch(error){console.error(error);byId("boot-status").hidden=true;byId("fatal-error").hidden=false}
}
queueMicrotask(initialize);
