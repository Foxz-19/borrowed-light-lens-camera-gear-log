import { describe, expect, it } from "vitest";
import { catalogMarkup, gearCardMarkup } from "../src/view";
import type { GearItem } from "../src/types";

const item: GearItem = { id: "x", name: "<img onerror=alert(1)>", category: "Lens", condition: "Mint", isLent: true, borrower: "Rae & Co", note: "Fast & light", dateAdded: "2026-08-31" };

describe("catalog rendering", () => {
  it("escapes user content and renders loan context", () => {
    const markup = gearCardMarkup(item, 0);
    expect(markup).not.toContain("<img onerror");
    expect(markup).toContain("&lt;img onerror=alert(1)&gt;");
    expect(markup).toContain("Rae &amp; Co");
  });

  it("renders clear empty states for empty and filtered catalogs", () => {
    expect(catalogMarkup([], 0)).toContain("catalog is waiting");
    expect(catalogMarkup([], 2)).toContain("No frames match");
  });
});
