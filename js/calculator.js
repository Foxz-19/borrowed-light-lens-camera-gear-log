/** @typedef {'oz'|'g'|'kg'|'lb'|'L'|'mL'|'count'} Unit */
/** @typedef {{name:string, price:number, quantity:number, unit:Unit}} Product */
const validUnits = new Set(['oz','g','kg','lb','L','mL','count']);
/** Base-unit conversion lets equivalent package sizes compare fairly. */
export const unitInfo = {oz:{kind:'mass',factor:28.3495,base:'g'},g:{kind:'mass',factor:1,base:'g'},kg:{kind:'mass',factor:1000,base:'g'},lb:{kind:'mass',factor:453.592,base:'g'},L:{kind:'volume',factor:1000,base:'mL'},mL:{kind:'volume',factor:1,base:'mL'},count:{kind:'count',factor:1,base:'item'}};
/** @param {unknown} product @returns {string|null} */
export function validateProduct(product) {
  if (!product || typeof product !== 'object') return 'Enter a valid product.';
  const p = /** @type {Product} */ (product);
  if (!Number.isFinite(p.price) || p.price <= 0) return 'Enter a price greater than zero for every product.';
  if (!Number.isFinite(p.quantity) || p.quantity <= 0) return 'Enter a quantity greater than zero for every product.';
  if (!validUnits.has(p.unit)) return 'Choose a valid unit for every product.';
  if (!p.name || !p.name.trim()) return 'Enter a product name for every filled-in product.';
  return null;
}
/** @param {Product} product */
export function perUnit(product) { return product.price / product.quantity; }
/** @param {Product} product */
export function normalizedRate(product) { return product.price / (product.quantity * unitInfo[product.unit].factor); }
/** @param {Product[]} products */
export function compare(products) {
  if (!Array.isArray(products) || products.length > 3) return { error:'Compare between one and three products.', values: [] };
  const active = products.filter(product => product && (product.name?.trim() || Number.isFinite(product.price) || Number.isFinite(product.quantity)));
  if (!active.length) return { error:'Add at least one product to compare.', values: [] };
  const error = active.map(validateProduct).find(Boolean); if (error) return { error, values: [] };
  const kinds = new Set(active.map(product => unitInfo[product.unit].kind));
  if (kinds.size > 1) return { error:'Compare like with like: weight, volume, and item counts need separate comparisons.', values: [] };
  const values = products.flatMap((product, index) => active.includes(product) ? [{ ...product, index, rate: perUnit(product), normalized: normalizedRate(product) }] : []);
  const cheapest = Math.min(...values.map(value => value.normalized));
  const nextBest = Math.min(...values.filter(value=>Math.abs(value.normalized-cheapest)>=1e-9).map(value=>value.normalized));
  return { error: null, values: values.map(value => ({ ...value, cheapest: Math.abs(value.normalized - cheapest) < 1e-9, saving: Math.abs(value.normalized-cheapest)<1e-9 && Number.isFinite(nextBest) ? Math.max(0,nextBest-cheapest) : 0 })) };
}
/** @param {number} value */
export const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:4}).format(value);
