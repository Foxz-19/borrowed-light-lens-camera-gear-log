import "./styles.css";
import { createItem, emptyDraft, filterItems, sanitizeItem, validateDraft } from "./domain";
import { loadItems, saveItems } from "./storage";
import { CATEGORIES, type Category, type Filters, type GearDraft, type GearItem, type LoanFilter, type ValidationResult } from "./types";
import { appMarkup, catalogMarkup } from "./view";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) throw new Error("Application root is missing");
const app: HTMLDivElement = root;

let items: GearItem[] = [];
let draft = emptyDraft();
let filters: Filters = { category: "all", loan: "all", query: "" };
let errors: ValidationResult["errors"] = {};
let editingId: string | null = null;
let pendingDeleteId: string | null = null;
let persistentWarning: string | null = null;
let toastTimer = 0;

function readDraft(form: HTMLFormElement): GearDraft {
  const data = new FormData(form);
  return {
    name: String(data.get("name") ?? ""),
    category: String(data.get("category")) as Category,
    condition: String(data.get("condition")) as GearDraft["condition"],
    isLent: data.get("isLent") === "on",
    borrower: String(data.get("borrower") ?? ""),
    note: String(data.get("note") ?? ""),
    dateAdded: String(data.get("dateAdded") ?? ""),
  };
}

function renderShell(): void {
  app.innerHTML = appMarkup(items, draft, filters, errors, editingId);
  app.setAttribute("aria-busy", "false");
  renderCatalog();
  renderWarning();
  bindEvents();
}

function renderCatalog(): void {
  const region = document.querySelector<HTMLDivElement>("#result-region");
  if (!region) return;
  region.innerHTML = catalogMarkup(filterItems(items, filters), items.length);
}

function renderWarning(): void {
  document.querySelector(".storage-warning")?.remove();
  if (!persistentWarning) return;
  const banner = document.createElement("div");
  banner.className = "storage-warning";
  banner.setAttribute("role", "alert");
  banner.innerHTML = `<strong>Storage needs attention</strong><span></span><button aria-label="Dismiss storage warning">×</button>`;
  const message = banner.querySelector("span");
  if (message) message.textContent = persistentWarning;
  banner.querySelector("button")?.addEventListener("click", function dismissWarning() {
    persistentWarning = null;
    banner.remove();
  });
  document.body.prepend(banner);
}

function persist(successMessage: string): boolean {
  const failure = saveItems(items);
  if (failure) {
    persistentWarning = failure;
    renderWarning();
    showInlineFailure(failure);
    return false;
  }
  persistentWarning = null;
  renderWarning();
  showToast(successMessage);
  return true;
}

function showInlineFailure(message: string): void {
  const status = document.querySelector<HTMLElement>("#form-status");
  if (status) status.textContent = message;
}

function showToast(message: string): void {
  const toast = document.querySelector<HTMLDivElement>(".toast");
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(function hideToast() { toast.classList.remove("is-visible"); }, 3200);
}

function handleSubmit(event: SubmitEvent): void {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  draft = readDraft(form);
  const result = validateDraft(draft);
  errors = result.errors;
  if (!result.valid) {
    renderShell();
    const firstInvalid = document.querySelector(".field-error:not(:empty)")?.closest("label")?.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input,select,textarea");
    firstInvalid?.focus();
    showInlineFailure("Check the marked fields before adding this entry.");
    return;
  }
  if (editingId) {
    items = items.map((item) => item.id === editingId ? sanitizeItem({ ...draft, id: item.id }) : item);
  } else {
    items = [createItem(draft), ...items];
  }
  const message = editingId ? "Field entry updated." : "Gear added to the catalog.";
  draft = emptyDraft();
  editingId = null;
  errors = {};
  renderShell();
  persist(message);
  document.querySelector<HTMLElement>("#catalog-title")?.focus({ preventScroll: true });
}

function handleFormInput(event: Event): void {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  if (target.name === "isLent" && target instanceof HTMLInputElement) {
    const borrower = document.querySelector<HTMLElement>(".borrower-field");
    borrower?.classList.toggle("is-visible", target.checked);
    borrower?.querySelector("input")?.toggleAttribute("required", target.checked);
  }
  if (target.name === "note") {
    const count = document.querySelector<HTMLElement>("[data-note-count]");
    if (count) count.textContent = String(target.value.length);
  }
  const error = document.querySelector<HTMLElement>(`#${target.name}-error`);
  if (error) error.textContent = "";
}

function beginEdit(id: string): void {
  const item = items.find((entry) => entry.id === id);
  if (!item) {
    persistentWarning = "That entry is no longer available. The catalog has been refreshed.";
    renderWarning();
    return;
  }
  draft = { name: item.name, category: item.category, condition: item.condition, isLent: item.isLent, borrower: item.borrower, note: item.note, dateAdded: item.dateAdded };
  editingId = id;
  errors = {};
  renderShell();
  document.querySelector<HTMLInputElement>("[name=name]")?.focus();
  document.querySelector(".ledger")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" });
}

function openDeleteDialog(id: string, trigger: HTMLButtonElement): void {
  const item = items.find((entry) => entry.id === id);
  const dialog = document.querySelector<HTMLDialogElement>("#delete-dialog");
  if (!item || !dialog) return;
  pendingDeleteId = id;
  dialog.dataset.returnFocus = id;
  const copy = dialog.querySelector<HTMLElement>("[data-delete-copy]");
  if (copy) copy.textContent = `“${item.name}” will be permanently removed. This affects exactly one catalog entry.`;
  dialog.showModal();
  trigger.setAttribute("data-dialog-trigger", "true");
}

function handleDialogClose(event: Event): void {
  const dialog = event.currentTarget as HTMLDialogElement;
  const id = pendingDeleteId;
  pendingDeleteId = null;
  if (dialog.returnValue === "confirm" && id) {
    const item = items.find((entry) => entry.id === id);
    if (item) {
      items = items.filter((entry) => entry.id !== id);
      if (editingId === id) { editingId = null; draft = emptyDraft(); }
      renderShell();
      persist(`“${item.name}” was removed.`);
      document.querySelector<HTMLElement>("#catalog-title")?.focus({ preventScroll: true });
    }
  }
}

function updateFilters(target: HTMLInputElement | HTMLSelectElement): void {
  if (target.name === "query-filter") filters.query = target.value;
  if (target.name === "category-filter" && (target.value === "all" || CATEGORIES.includes(target.value as Category))) filters.category = target.value as Filters["category"];
  if (target.name === "loan-filter" && ["all", "available", "lent"].includes(target.value)) filters.loan = target.value as LoanFilter;
  renderCatalog();
}

function handleAction(event: MouseEvent): void {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  const id = button.closest<HTMLElement>("[data-id]")?.dataset.id;
  if (action === "edit" && id) beginEdit(id);
  if (action === "delete" && id) openDeleteDialog(id, button);
  if (action === "focus-form") document.querySelector<HTMLInputElement>("[name=name]")?.focus();
  if (action === "cancel-edit") { editingId = null; draft = emptyDraft(); errors = {}; renderShell(); }
  if (action === "clear-filters") { filters = { category: "all", loan: "all", query: "" }; renderShell(); }
}

function bindEvents(): void {
  document.querySelector<HTMLFormElement>("#gear-form")?.addEventListener("submit", handleSubmit);
  document.querySelector<HTMLFormElement>("#gear-form")?.addEventListener("input", handleFormInput);
  document.querySelector<HTMLDialogElement>("#delete-dialog")?.addEventListener("close", handleDialogClose);
}

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

document.addEventListener("click", handleAction);
document.addEventListener("input", function handleFilterInput(event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement;
  if (target.name.endsWith("-filter")) updateFilters(target);
});

function initialize(): void {
  try {
    const loaded = loadItems();
    items = loaded.items;
    persistentWarning = loaded.warning;
    renderShell();
  } catch {
    app.setAttribute("aria-busy", "false");
    app.innerHTML = `<main class="fatal" role="alert"><p class="kicker">THE LOG COULD NOT OPEN</p><h1>Something caught in the shutter.</h1><p>Your saved catalog has not been changed. Reload the page to try opening it again.</p><button class="button button--primary" type="button">Reload field log</button></main>`;
    app.querySelector("button")?.addEventListener("click", function reloadApp() { window.location.reload(); });
  }
}

initialize();
