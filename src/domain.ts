import { CATEGORIES, STATUSES, type CabinetItem, type CabinetSummary, type Category, type NewItemInput, type StockStatus, type ValidationResult } from "./types";

export const isCategory = (value: unknown): value is Category => typeof value === "string" && CATEGORIES.includes(value as Category);
export const isStatus = (value: unknown): value is StockStatus => typeof value === "string" && STATUSES.includes(value as StockStatus);

export function isCabinetItem(value: unknown): value is CabinetItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && item.id.length > 0 && typeof item.name === "string" && item.name.length > 0 && item.name.length <= 60 && isCategory(item.category) && typeof item.note === "string" && item.note.length <= 180 && isStatus(item.status) && typeof item.createdAt === "number" && Number.isFinite(item.createdAt);
}

export function validateNewItem(input: NewItemInput, id: string = crypto.randomUUID(), now: number = Date.now()): ValidationResult {
  const name = input.name.trim();
  const note = input.note.trim();
  const errors: ValidationResult["errors"] = {};
  if (!name) errors.name = "Give this bottle a name.";
  else if (name.length > 60) errors.name = "Keep the name to 60 characters.";
  if (!isCategory(input.category)) errors.category = "Choose a valid category.";
  if (!isStatus(input.status)) errors.status = "Choose a valid stock status.";
  if (Object.keys(errors).length || !isCategory(input.category) || !isStatus(input.status)) return { errors };
  return { item: { id, name, category: input.category, note: note.slice(0, 180), status: input.status, createdAt: now }, errors };
}

export function summarize(items: CabinetItem[]): CabinetSummary {
  return items.reduce<CabinetSummary>((sum, item) => {
    sum.total += 1;
    if (item.status === "in-stock") sum.inStock += 1;
    if (item.status === "running-low") sum.runningLow += 1;
    if (item.status === "out") sum.out += 1;
    return sum;
  }, { total: 0, inStock: 0, runningLow: 0, out: 0 });
}

export function categoriesIn(items: CabinetItem[]): Category[] {
  return CATEGORIES.filter(category => items.some(item => item.category === category));
}
