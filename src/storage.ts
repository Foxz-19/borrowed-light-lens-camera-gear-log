import { isGearItem } from "./domain";
import type { GearItem, LoadResult } from "./types";

export const STORAGE_KEY = "borrowed-light.gear.v1";

export function loadItems(storage: Storage = localStorage): LoadResult {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return { items: [], warning: null };
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isGearItem)) throw new Error("Invalid gear data");
    return { items: parsed, warning: null };
  } catch (error) {
    const reason = error instanceof SyntaxError || (error instanceof Error && error.message === "Invalid gear data")
      ? "Saved gear data was damaged, so the catalog opened empty. The original data has not been overwritten."
      : "Browser storage could not be read. Changes will stay in this tab, but may not survive a refresh.";
    return { items: [], warning: reason };
  }
}

export function saveItems(items: readonly GearItem[], storage: Storage = localStorage): string | null {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(items));
    return null;
  } catch {
    return "This change is visible now, but browser storage rejected it. Free storage or allow site data, then try again.";
  }
}
