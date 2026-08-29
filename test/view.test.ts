// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { renderInventory, renderSummary, type ViewActions } from "../src/view";
import type { CabinetItem } from "../src/types";

const item: CabinetItem = { id: "safe-id", name: "London Dry", category: "Gin", note: "Juniper", status: "in-stock", createdAt: 1 };
const actions: ViewActions = { onStatus: vi.fn(), onDelete: vi.fn() };

describe("cabinet rendering", () => {
  it("renders a useful empty state", () => {
    const root = document.createElement("div");
    renderInventory(root, [], actions, "All");
    expect(root.textContent).toContain("The shelf is waiting");
  });

  it("renders labeled status controls and safe text", () => {
    const root = document.createElement("div");
    renderInventory(root, [{ ...item, note: "<img src=x onerror=alert(1)>" }], actions, "All");
    expect(root.querySelector("img")).toBeNull();
    expect(root.querySelectorAll("[aria-pressed]")).toHaveLength(3);
    expect(root.querySelector("[role=group]")?.getAttribute("aria-label")).toContain("London Dry");
  });

  it("renders all summary values", () => {
    const root = document.createElement("dl");
    renderSummary(root, { total: 4, inStock: 2, runningLow: 1, out: 1 });
    expect(root.textContent).toContain("Bottles");
    expect(root.querySelectorAll("dd")).toHaveLength(4);
  });
});
