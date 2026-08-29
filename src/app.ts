import "./styles.css";
import { categoriesIn, isCategory, isStatus, summarize, validateNewItem } from "./domain";
import { CabinetStorage } from "./storage";
import type { CabinetItem, Category, StockStatus } from "./types";
import { renderFilters, renderInventory, renderSummary, type ViewActions } from "./view";

const byId = <T extends HTMLElement>(id: string): T => {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Required UI element #${id} is missing.`);
  return node as T;
};

class CabinetApp implements ViewActions {
  private items: CabinetItem[] = [];
  private filter: Category | "All" = "All";
  private pendingDeleteId: string | null = null;
  private deleteTrigger: HTMLButtonElement | null = null;
  private toastTimer = 0;
  private readonly store = new CabinetStorage(localStorage);
  private readonly form = byId<HTMLFormElement>("add-form");
  private readonly inventory = byId("inventory");
  private readonly summary = byId("summary");
  private readonly filters = byId<HTMLFieldSetElement>("filters");
  private readonly notice = byId("notice");
  private readonly dialog = byId<HTMLDialogElement>("delete-dialog");

  start(): void {
    const loaded = this.store.load();
    this.items = loaded.items;
    const urlCategory = new URLSearchParams(window.location.search).get("category");
    this.filter = isCategory(urlCategory) && this.items.some(item => item.category === urlCategory) ? urlCategory : "All";
    if (loaded.warning) this.showPersistentError(loaded.warning);
    this.bindForm();
    this.bindDialog();
    byId("today").textContent = new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date());
    byId("loading").hidden = true;
    this.inventory.setAttribute("aria-busy", "false");
    window.addEventListener("popstate", () => {
      const category = new URLSearchParams(window.location.search).get("category");
      this.filter = isCategory(category) ? category : "All";
      this.render();
    });
    this.render();
  }

  private bindForm(): void {
    const note = byId<HTMLTextAreaElement>("item-note");
    note.addEventListener("input", () => { byId("note-count").textContent = `${note.value.length} / 180`; });
    this.form.addEventListener("submit", event => {
      event.preventDefault();
      this.clearFormErrors();
      const data = new FormData(this.form);
      const result = validateNewItem({ name: String(data.get("name") ?? ""), category: String(data.get("category") ?? ""), note: String(data.get("note") ?? ""), status: String(data.get("status") ?? "") });
      if (!result.item) {
        Object.entries(result.errors).forEach(([field, message]) => { byId(`${field}-error`).textContent = message; });
        byId("form-error").textContent = "Please check the highlighted fields.";
        this.form.querySelector<HTMLElement>(".field-error:not(:empty)")?.closest(".field")?.querySelector<HTMLInputElement>("input, select")?.focus();
        return;
      }
      const next = [result.item, ...this.items];
      if (!this.persist(next, "form-error")) return;
      this.items = next;
      this.filter = "All";
      this.form.reset();
      byId("note-count").textContent = "0 / 180";
      this.render();
      this.showToast(`${result.item.name} added to the cabinet.`);
      byId<HTMLInputElement>("item-name").focus();
    });
  }

  private bindDialog(): void {
    this.dialog.addEventListener("close", () => {
      const trigger = this.deleteTrigger;
      if (this.dialog.returnValue === "confirm" && this.pendingDeleteId) this.deletePending();
      this.pendingDeleteId = null;
      (trigger?.isConnected ? trigger : byId("cabinet-title")).focus();
      this.deleteTrigger = null;
    });
  }

  onStatus(id: string, status: StockStatus, trigger: HTMLButtonElement): void {
    if (!isStatus(status)) return this.showPersistentError("An invalid stock status was rejected. Your cabinet was not changed.");
    const item = this.items.find(entry => entry.id === id);
    if (!item) return this.showPersistentError("That bottle could not be found. Refresh the cabinet and try again.");
    if (item.status === status) return;
    const next = this.items.map(entry => entry.id === id ? { ...entry, status } : entry);
    if (!this.persist(next)) return;
    this.items = next;
    this.render();
    this.showToast(`${item.name} marked ${status.replace("-", " ")}.`);
    this.inventory.querySelector<HTMLButtonElement>(`[data-item-id="${CSS.escape(id)}"][data-status="${status}"]`)?.focus();
    trigger.blur();
  }

  onDelete(id: string, trigger: HTMLButtonElement): void {
    if (!id || !this.items.some(item => item.id === id)) return this.showPersistentError("That bottle could not be found. Nothing was removed.");
    const item = this.items.find(entry => entry.id === id)!;
    this.pendingDeleteId = id;
    this.deleteTrigger = trigger;
    byId("delete-description").textContent = `Remove “${item.name}” and its 1 inventory record? This cannot be undone.`;
    this.dialog.returnValue = "";
    this.dialog.showModal();
  }

  private deletePending(): void {
    const item = this.items.find(entry => entry.id === this.pendingDeleteId);
    if (!item) return this.showPersistentError("The bottle was already removed. No further changes were made.");
    const next = this.items.filter(entry => entry.id !== item.id);
    if (!this.persist(next)) return;
    this.items = next;
    if (this.filter !== "All" && !isCategory(this.filter)) this.filter = "All";
    if (this.filter !== "All" && !next.some(entry => entry.category === this.filter)) this.filter = "All";
    this.render();
    this.showToast(`${item.name} removed from the cabinet.`);
  }

  private persist(next: CabinetItem[], inlineId?: string): boolean {
    const saved = this.store.save(next);
    if (saved.ok) return true;
    const message = saved.error ?? "The cabinet could not be saved.";
    this.showPersistentError(message);
    if (inlineId) byId(inlineId).textContent = message;
    return false;
  }

  private render(): void {
    renderSummary(this.summary, summarize(this.items));
    renderFilters(this.filters, this.filter, categoriesIn(this.items), value => this.setFilter(value));
    renderInventory(this.inventory, this.items, this, this.filter);
  }

  private setFilter(value: Category | "All"): void {
    this.filter = value;
    const query = value === "All" ? "" : `?category=${encodeURIComponent(value)}`;
    window.history.replaceState(null, "", `${window.location.pathname}${query}`);
    this.render();
  }

  private clearFormErrors(): void {
    ["name-error", "category-error", "status-error", "form-error"].forEach(id => { const node = document.getElementById(id); if (node) node.textContent = ""; });
  }

  private showPersistentError(message: string): void {
    this.notice.textContent = message;
    this.notice.hidden = false;
    this.showToast(message, true);
  }

  private showToast(message: string, error = false): void {
    const toast = byId("toast");
    window.clearTimeout(this.toastTimer);
    toast.textContent = message;
    toast.classList.toggle("toast-error", error);
    toast.hidden = false;
    this.toastTimer = window.setTimeout(() => { toast.hidden = true; }, error ? 7000 : 3200);
  }
}

try {
  new CabinetApp().start();
} catch (error) {
  const app = document.getElementById("app");
  if (app) {
    const fallback = document.createElement("div");
    fallback.className = "fatal-error";
    fallback.setAttribute("role", "alert");
    fallback.textContent = "The cabinet could not open. Refresh the page or check that browser storage is available.";
    app.prepend(fallback);
  }
  console.error(error);
}
