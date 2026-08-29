import { describe, expect, it } from "vitest";
import { isCabinetItem, summarize, validateNewItem } from "../src/domain";
import type { CabinetItem } from "../src/types";

const bottle: CabinetItem = { id: "a", name: "Rye", category: "Whiskey", note: "Spicy", status: "in-stock", createdAt: 1 };

describe("cabinet domain", () => {
  it("normalizes and validates a new item", () => {
    const result = validateNewItem({ name: "  Campari ", category: "Liqueur", note: " Bitter orange ", status: "running-low" }, "id", 10);
    expect(result.item).toEqual({ id: "id", name: "Campari", category: "Liqueur", note: "Bitter orange", status: "running-low", createdAt: 10 });
  });

  it("rejects missing names and invalid boundary values", () => {
    const result = validateNewItem({ name: " ", category: "Paint", note: "", status: "maybe" });
    expect(result.errors).toEqual({ name: "Give this bottle a name.", category: "Choose a valid category.", status: "Choose a valid stock status." });
    expect(isCabinetItem({ ...bottle, category: "Paint" })).toBe(false);
  });

  it("calculates every stock state", () => {
    const items = [bottle, { ...bottle, id: "b", status: "running-low" as const }, { ...bottle, id: "c", status: "out" as const }];
    expect(summarize(items)).toEqual({ total: 3, inStock: 1, runningLow: 1, out: 1 });
  });
});
