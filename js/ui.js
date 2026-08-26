import { money, unitInfo } from './calculator.js';
const $ = (selector, parent = document) => parent.querySelector(selector);
/** @param {HTMLTemplateElement} template */
export function renderProducts(template) {
  const root = $('#products'); root.replaceChildren();
  for (let i = 0; i < 3; i++) { const node = template.content.cloneNode(true); const card = /** @type {HTMLElement} */ (node.querySelector('.product')); card.dataset.index = String(i); card.setAttribute('aria-label',`Product ${i+1}`); card.querySelectorAll('input,select').forEach(field=>field.name=`product-${i+1}-${field.className}`); $('.number', card).textContent = String(i + 1).padStart(2, '0'); const relative=document.createElement('p'); relative.className='relative'; relative.hidden=true; card.append(relative); root.append(node); }
}
/** @returns {import('./calculator.js').Product[]} */
export function readProducts() { return [...document.querySelectorAll('.product')].map(card => ({name: /** @type {HTMLInputElement} */($('.name',card)).value.trim(), price:Number(/** @type {HTMLInputElement} */($('.price',card)).value), quantity:Number(/** @type {HTMLInputElement} */($('.quantity',card)).value), unit:/** @type {HTMLSelectElement} */($('.unit',card)).value })); }
/** @param {ReturnType<import('./calculator.js').compare>} result */
export function showResults(result) {
  const error = $('#form-error'); error.hidden = true; clearComparison();
  if (result.error) { error.textContent = result.error; error.hidden = false; $('#results').hidden = true; return false; }
  const winners=result.values.filter(v=>v.cheapest); const base=unitInfo[result.values[0].unit].base; const winner=winners[0]; result.values.forEach(value => { const card = document.querySelector(`.product[data-index="${value.index}"]`); const output = $('.unit-result',card); const relative=$('.relative',card); output.textContent = `${money(value.rate)} / ${value.unit}`; output.hidden = false; relative.textContent=value.cheapest?'Lowest price per unit':`${Math.round((value.normalized/winner.normalized-1)*100)}% more per ${base}`; relative.hidden=false; card.classList.toggle('winner', value.cheapest); const old = $('.badge', card); if(old) old.remove(); if(value.cheapest){const badge=document.createElement('span');badge.className='badge';badge.textContent='Best deal';$('.product-top',card).append(badge);} });
  $('#result-summary').textContent = winners.length === 1 ? `${winner.name} is the best deal at ${money(winner.normalized)} per ${base}.${winner.saving ? ` That’s ${money(winner.saving)} less per ${base} than the next best option.` : ''}` : `It’s a tie — these options have the same price per ${base}.`; $('#results').hidden=false; return true;
}
export function clearComparison() { document.querySelectorAll('.unit-result,.relative').forEach(node=>{node.textContent='';node.hidden=true}); document.querySelectorAll('.badge').forEach(node=>node.remove()); document.querySelectorAll('.product').forEach(card=>card.classList.remove('winner')); $('#results').hidden=true; }
export function clearUI() { document.querySelectorAll('.name,.price,.quantity').forEach(field=>field.value=''); document.querySelectorAll('.unit').forEach(field=>field.selectedIndex=0); clearComparison(); $('#form-error').hidden=true; }
/** @param {string} message */
export function toast(message) { const item=$('#toast'); item.textContent=message; item.hidden=false; window.setTimeout(()=>item.hidden=true,3500); }
