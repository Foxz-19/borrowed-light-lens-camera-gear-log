import { CATEGORIES, CONDITIONS, type Filters, type GearDraft, type GearItem, type ValidationResult } from "./types";

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function emptyDraft(): GearDraft {
  return { name: "", category: "Camera body", condition: "Good", isLent: false, borrower: "", note: "", dateAdded: today() };
}

export function validateDraft(draft: GearDraft): ValidationResult {
  const errors: ValidationResult["errors"] = {};
  if (!draft.name.trim()) errors.name = "Give this piece of gear a name.";
  else if (draft.name.trim().length > 80) errors.name = "Keep the name under 80 characters.";
  if (!CATEGORIES.includes(draft.category)) errors.category = "Choose a valid category.";
  if (!CONDITIONS.includes(draft.condition)) errors.condition = "Choose a valid condition.";
  if (draft.isLent && !draft.borrower.trim()) errors.borrower = "Add the name of the person who has it.";
  if (draft.borrower.trim().length > 80) errors.borrower = "Keep the borrower name under 80 characters.";
  if (draft.note.length > 240) errors.note = "Keep the note under 240 characters.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.dateAdded) || Number.isNaN(Date.parse(`${draft.dateAdded}T00:00:00`))) {
    errors.dateAdded = "Choose a valid date.";
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function createItem(draft: GearDraft, id = crypto.randomUUID()): GearItem {
  return sanitizeItem({ ...draft, id });
}

export function sanitizeItem(item: GearItem): GearItem {
  return {
    ...item,
    name: item.name.trim(),
    borrower: item.isLent ? item.borrower.trim() : "",
    note: item.note.trim(),
  };
}

export function getSummary(items: readonly GearItem[]): { total: number; lent: number; available: number } {
  const lent = items.filter((item) => item.isLent).length;
  return { total: items.length, lent, available: items.length - lent };
}

export function filterItems(items: readonly GearItem[], filters: Filters): GearItem[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return items.filter((item) => {
    const categoryMatch = filters.category === "all" || item.category === filters.category;
    const loanMatch = filters.loan === "all" || (filters.loan === "lent" ? item.isLent : !item.isLent);
    const queryMatch = !query || `${item.name} ${item.borrower} ${item.note}`.toLocaleLowerCase().includes(query);
    return categoryMatch && loanMatch && queryMatch;
  });
}

export function isGearItem(value: unknown): value is GearItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && item.id.length > 0 && typeof item.name === "string" && item.name.trim().length > 0 && item.name.length <= 80 && CATEGORIES.includes(item.category as never)
    && CONDITIONS.includes(item.condition as never) && typeof item.isLent === "boolean"
    && typeof item.borrower === "string" && (!item.isLent || item.borrower.trim().length > 0) && item.borrower.length <= 80
    && typeof item.note === "string" && item.note.length <= 240 && typeof item.dateAdded === "string"
    && /^\d{4}-\d{2}-\d{2}$/.test(item.dateAdded) && !Number.isNaN(Date.parse(`${item.dateAdded}T00:00:00`));
}
