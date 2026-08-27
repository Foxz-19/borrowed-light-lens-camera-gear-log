import { AppData, Jar, progress, remaining, savedAmount, status, summarize } from "./domain";
const currency=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:0,maximumFractionDigits:2});
const shortDate=new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric"});
const el=<K extends keyof HTMLElementTagNameMap>(tag:K,className?:string,text?:string):HTMLElementTagNameMap[K]=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node};
const get=(id:string):HTMLElement=>{const node=document.getElementById(id);if(!node)throw new Error(`Missing #${id}`);return node};
const formatDate=(value:string,createdAt:string):string=>{const date=new Date(value?`${value}T12:00:00`:createdAt);return Number.isNaN(date.valueOf())?"Date unavailable":shortDate.format(date)};

export function renderApp(data:AppData,options:{celebrateId?:string}={}):void{
  const summary=summarize(data.jars);
  get("total-saved").textContent=currency.format(summary.saved);get("goal-count").textContent=`${summary.total} ${summary.total===1?"goal":"goals"}`;get("reached-count").textContent=String(summary.reached);
  get("status-counts").textContent=`${summary.notStarted} not started · ${summary.inProgress} in progress · ${summary.reached} reached`;
  get("empty-state").hidden=data.jars.length>0;const list=get("jar-list");list.replaceChildren(...data.jars.map(jar=>renderJar(jar,jar.id===options.celebrateId)));
}

export function renderJar(jar:Jar,celebrate=false):HTMLElement{
  const article=el("article",`jar-item${celebrate?" celebrate":""}`);article.dataset.jarId=jar.id;
  const visual=el("div","jar-visual");visual.setAttribute("aria-label",`${Math.round(progress(jar))}% funded`);
  const glass=el("div","glass"),liquid=el("span","liquid");liquid.style.setProperty("--fill",`${progress(jar)}%`);glass.append(liquid,el("span","shine"));
  const label=el("span","jar-label",jar.emoji||"◎");visual.append(glass,label);
  const content=el("div","jar-content"),heading=el("div","jar-heading"),titleWrap=el("div");
  const badge=el("span",`badge badge-${status(jar).split(" ")[0].toLowerCase()}`,status(jar));
  const h3=el("h3","",jar.name),amount=el("p","amount",`${currency.format(savedAmount(jar))} `);amount.append(el("span","",`of ${currency.format(jar.target)}`));titleWrap.append(badge,h3,amount);
  const actions=el("div","jar-actions"),deposit=el("button","deposit-button","＋ Deposit"),remove=el("button","icon-button","×");
  deposit.type="button";deposit.dataset.action="deposit";deposit.dataset.jarId=jar.id;remove.type="button";remove.dataset.action="delete";remove.dataset.jarId=jar.id;remove.setAttribute("aria-label",`Delete ${jar.name}`);actions.append(deposit,remove);heading.append(titleWrap,actions);
  const meter=el("div","meter"),bar=el("span");bar.style.width=`${progress(jar)}%`;meter.append(bar);meter.setAttribute("role","progressbar");meter.setAttribute("aria-valuenow",String(Math.round(progress(jar))));meter.setAttribute("aria-valuemin","0");meter.setAttribute("aria-valuemax","100");meter.setAttribute("aria-label",`${jar.name} progress`);
  const meta=el("div","progress-meta");meta.append(el("span","",`${Math.round(progress(jar))}% funded`),el("span","",remaining(jar)>0?`${currency.format(remaining(jar))} to go`:"Goal complete"));
  content.append(heading,meter,meta,renderHistory(jar));article.append(visual,content);return article;
}

function renderHistory(jar:Jar):HTMLElement{
  const details=el("details","history"),summary=el("summary","",`Recent deposits (${jar.deposits.length})`);details.append(summary);
  if(!jar.deposits.length){details.append(el("p","history-empty","No deposits yet. Add one to get this jar moving."));return details}
  const list=el("ol");jar.deposits.slice(0,5).forEach(item=>{const row=el("li"),copy=el("div");copy.append(el("b","",item.note||"Deposit"),el("time","",formatDate(item.date,item.createdAt)));row.append(copy,el("strong","",`+${currency.format(item.amount)}`));list.append(row)});details.append(list);if(jar.deposits.length>5)details.append(el("p","history-more",`${jar.deposits.length-5} earlier ${jar.deposits.length-5===1?"entry":"entries"} safely stored.`));return details;
}
