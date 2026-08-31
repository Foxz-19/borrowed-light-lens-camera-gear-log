import { describe, expect, it } from "vitest";
import { loadItems, saveItems, STORAGE_KEY } from "../src/storage";
import type { GearItem } from "../src/types";

const item: GearItem = { id: "1", name: "Nikon F3", category: "Camera body", condition: "Good", isLent: false, borrower: "", note: "", dateAdded: "2026-08-31" };
function store(initial?: string): Storage {
  const map = new Map<string, string>(initial === undefined ? [] : [[STORAGE_KEY, initial]]);
  return { get length() { return map.size; }, clear: () => map.clear(), getItem: (key) => map.get(key) ?? null, key: (index) => [...map.keys()][index] ?? null, removeItem: (key) => void map.delete(key), setItem: (key, value) => void map.set(key, value) };
}

describe("gear storage", () => {
  it("round-trips validated entries", () => { const s = store(); expect(saveItems([item], s)).toBeNull(); expect(loadItems(s)).toEqual({ items: [item], warning: null }); });
  it("surfaces corrupt data without overwriting it", () => { const s = store("{broken"); expect(loadItems(s).warning).toMatch(/damaged/); expect(s.getItem(STORAGE_KEY)).toBe("{broken"); });
  it("surfaces blocked reads and writes", () => { const s = { ...store(), getItem: () => { throw Error("blocked"); }, setItem: () => { throw Error("blocked"); } }; expect(loadItems(s).warning).toMatch(/could not be read/); expect(saveItems([item], s)).toMatch(/rejected/); });
});
