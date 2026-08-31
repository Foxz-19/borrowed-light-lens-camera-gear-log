import { describe, expect, it } from "vitest";
import { loadItems, saveItems, STORAGE_KEY } from "../src/storage";
import type { GearItem } from "../src/types";

const item: GearItem = { id: "1", name: "Nikon F3", category: "Camera body", condition: "Good", isLent: false, borrower: "", note: "", dateAdded: "2026-08-31" };

function memoryStorage(initial?: string): Storage {
  const map = new Map<string, string>();
  if (initial !== undefined) map.set(STORAGE_KEY, initial);
  return { get length() { return map.size; }, clear: () => map.clear(), getItem: (key) => map.get(key) ?? null, key: (index) => [...map.keys()][index] ?? null, removeItem: (key) => { map.delete(key); }, setItem: (key, value) => { map.set(key, value); } };
}

describe("gear storage", () => {
  it("round-trips validated entries", () => {
    const storage = memoryStorage();
    expect(saveItems([item], storage)).toBeNull();
    expect(loadItems(storage)).toEqual({ items: [item], warning: null });
  });

  it("surfaces corrupt data without overwriting it", () => {
    const storage = memoryStorage("{broken");
    expect(loadItems(storage).warning).toMatch(/damaged/);
    expect(storage.getItem(STORAGE_KEY)).toBe("{broken");
  });

  it("surfaces blocked reads and writes", () => {
    const blocked = { ...memoryStorage(), getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
    expect(loadItems(blocked).warning).toMatch(/could not be read/);
    expect(saveItems([item], blocked)).toMatch(/rejected/);
  });
});
