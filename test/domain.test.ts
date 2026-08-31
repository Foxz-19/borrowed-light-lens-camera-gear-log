import { describe, expect, it } from "vitest";
import { filterItems, getSummary, validateDraft } from "../src/domain";
import type { GearDraft, GearItem } from "../src/types";

const draft: GearDraft = { name: "Nikon F3", category: "Camera body", condition: "Good", isLent: false, borrower: "", note: "Meter runs a little hot", dateAdded: "2026-08-31" };
const items: GearItem[] = [
  { ...draft, id: "1" },
  { ...draft, id: "2", name: "50mm Summicron", category: "Lens", isLent: true, borrower: "Mara" },
];

describe("gear domain", () => {
  it("requires a name and borrower only when lent", () => {
    expect(validateDraft({ ...draft, name: "" }).errors.name).toBeTruthy();
    expect(validateDraft({ ...draft, isLent: true }).errors.borrower).toBeTruthy();
    expect(validateDraft(draft).valid).toBe(true);
  });

  it("calculates all summary states", () => {
    expect(getSummary(items)).toEqual({ total: 2, lent: 1, available: 1 });
  });

  it("combines category, loan, and text filters", () => {
    expect(filterItems(items, { category: "Lens", loan: "lent", query: "mara" }).map((item) => item.id)).toEqual(["2"]);
    expect(filterItems(items, { category: "all", loan: "available", query: "" })).toHaveLength(1);
  });
});
