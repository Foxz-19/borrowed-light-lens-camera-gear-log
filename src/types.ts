export const CATEGORIES = ["Whiskey", "Gin", "Rum", "Tequila", "Brandy", "Liqueur", "Bitters", "Mixer", "Garnish", "Other"] as const;
export const STATUSES = ["in-stock", "running-low", "out"] as const;

export type Category = typeof CATEGORIES[number];
export type StockStatus = typeof STATUSES[number];

export interface CabinetItem {
  id: string;
  name: string;
  category: Category;
  note: string;
  status: StockStatus;
  createdAt: number;
}

export interface CabinetSummary {
  total: number;
  inStock: number;
  runningLow: number;
  out: number;
}

export interface NewItemInput {
  name: string;
  category: string;
  note: string;
  status: string;
}

export interface ValidationResult {
  item?: CabinetItem;
  errors: Partial<Record<"name" | "category" | "status", string>>;
}
