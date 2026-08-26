export type Unit = 'oz'|'g'|'kg'|'lb'|'L'|'mL'|'count';
export interface Product { name: string; price: number; quantity: number; unit: Unit; }
export interface ComparedProduct extends Product { index: number; rate: number; normalized: number; cheapest: boolean; saving: number; }
export interface Comparison { error: string|null; values: ComparedProduct[]; }
