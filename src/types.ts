export const CATEGORIES = ["Camera body", "Lens", "Filter", "Accessory", "Lighting", "Other"] as const;
export const CONDITIONS = ["Mint", "Good", "Worn"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Condition = (typeof CONDITIONS)[number];
export type LoanFilter = "all" | "available" | "lent";

export interface GearItem {
  id: string;
  name: string;
  category: Category;
  condition: Condition;
  isLent: boolean;
  borrower: string;
  note: string;
  dateAdded: string;
}

export interface GearDraft extends Omit<GearItem, "id"> {}

export interface Filters {
  category: Category | "all";
  loan: LoanFilter;
  query: string;
}

export interface LoadResult {
  items: GearItem[];
  warning: string | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof GearDraft, string>>;
}
