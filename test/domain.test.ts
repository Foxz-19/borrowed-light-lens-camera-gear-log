import { describe, expect, it } from "vitest";
import { filterItems, getSummary, validateDraft } from "../src/domain";
import type { GearDraft, GearItem } from "../src/types";

const base: GearDraft = { name: "Nikon F3", category: "Camera body", condition: "Good", isLent: false, borrower: "", note: "Meter runs hot", dateAdded: "2026-08-31" };
const items: GearItem[] = [{ ...base, id: "1" }, { ...base, id: "2", name: "50mm Summicron", category: "Lens", isLent: true, borrower: "Mara" }];

describe("gear domain", () => {
  it("validates name and conditional borrower", () => {
    expect(validateDraft({ ...base, name: "" }).errors.name).toBeTruthy();
    expect(validateDraft({ ...base, isLent: true }).errors.borrower).toBeTruthy();
    expect(validateDraft(base).valid).toBe(true);
  });
  it("summarizes every loan state", () => expect(getSummary(items)).toEqual({ total: 2, lent: 1, available: 1 }));
  it("combines category, loan, and text filters", () => {
    expect(filterItems(items, { category: "Lens", loan: "lent", query: "mara" }).map((x) => x.id)).toEqual(["2"]);
    expect(filterItems(items, { category: "all", loan: "available", query: "" })).toHaveLength(1);
  });
});
