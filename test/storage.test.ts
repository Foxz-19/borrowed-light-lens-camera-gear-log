import { describe, expect, it } from "vitest";
import { CabinetStorage } from "../src/storage";
import type { CabinetItem } from "../src/types";

const item: CabinetItem = { id: "1", name: "Angostura", category: "Bitters", note: "Aromatic", status: "in-stock", createdAt: 1 };

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length(): number { return this.data.size; }
  clear(): void { this.data.clear(); }
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  key(index: number): string | null { return [...this.data.keys()][index] ?? null; }
  removeItem(key: string): void { this.data.delete(key); }
  setItem(key: string, value: string): void { this.data.set(key, value); }
}

describe("CabinetStorage", () => {
  it("round-trips valid data", () => {
    const store = new CabinetStorage(new MemoryStorage());
    expect(store.save([item]).ok).toBe(true);
    expect(store.load()).toEqual({ items: [item] });
  });

  it("reports corrupt data without silently reseeding", () => {
    const memory = new MemoryStorage();
    memory.setItem("test", "not json");
    const result = new CabinetStorage(memory, "test").load();
    expect(result.items).toEqual([]);
    expect(result.warning).toContain("data was invalid");
  });

  it("reports read and write failures", () => {
    const denied = { ...new MemoryStorage(), getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("full"); } } as unknown as Storage;
    expect(new CabinetStorage(denied).load().warning).toContain("blocked access");
    expect(new CabinetStorage(denied).save([item]).error).toContain("could not be saved");
  });
});
