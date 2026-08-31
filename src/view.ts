import { CATEGORIES, CONDITIONS, type Filters, type GearDraft, type GearItem, type ValidationResult } from "./types";
import { getSummary } from "./domain";

export function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function options(values: readonly string[], selected: string): string {
  return values.map((value) => `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(value)}</option>`).join("");
}

function fieldError(field: keyof GearDraft, errors: ValidationResult["errors"]): string {
  const message = errors[field];
  return `<span class="field-error" id="${field}-error">${message ? escapeHtml(message) : ""}</span>`;
}

export function gearCardMarkup(item: GearItem, index: number): string {
  const date = new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${item.dateAdded}T00:00:00Z`));
  return `<article class="gear-card" style="--order:${index}" data-id="${escapeHtml(item.id)}">
    <div class="gear-card__top"><span class="frame-no">FRAME ${String(index + 1).padStart(2, "0")}</span><span class="condition condition--${item.condition.toLowerCase()}">${escapeHtml(item.condition)}</span></div>
    <div class="gear-card__aperture" aria-hidden="true"><span>${item.category === "Lens" ? "ƒ" : "●"}</span></div>
    <div class="gear-card__body"><p class="eyebrow">${escapeHtml(item.category)}</p><h3>${escapeHtml(item.name)}</h3>
      <p class="loan ${item.isLent ? "loan--out" : ""}"><span aria-hidden="true"></span>${item.isLent ? `With ${escapeHtml(item.borrower)}` : "In your kit"}</p>
      ${item.note ? `<p class="note">“${escapeHtml(item.note)}”</p>` : `<p class="note note--empty">No field note yet.</p>`}
    </div><footer><time datetime="${item.dateAdded}">Logged ${date}</time><div><button class="text-button" data-action="edit" aria-label="Edit ${escapeHtml(item.name)}">Edit</button><button class="text-button text-button--danger" data-action="delete" aria-label="Delete ${escapeHtml(item.name)}">Delete</button></div></footer>
  </article>`;
}

export function appMarkup(items: GearItem[], draft: GearDraft, filters: Filters, errors: ValidationResult["errors"], editingId: string | null): string {
  const summary = getSummary(items);
  return `<header class="masthead"><a class="brand" href="#catalog" aria-label="Borrowed Light home"><span class="brand__mark" aria-hidden="true"></span><span><strong>Borrowed Light</strong><small>Lens & camera gear log</small></span></a><button class="add-shortcut" data-action="focus-form">+ Log gear</button></header>
  <main class="workspace">
    <aside class="ledger" aria-labelledby="form-title">
      <div class="ledger__intro"><p class="kicker">FIELD REGISTER / 001</p><h1 id="form-title">${editingId ? "Revise the entry" : "Log a piece of gear"}</h1><p>${editingId ? "Update the details, then return it to the catalog." : "Keep the kit in your head on paper instead."}</p></div>
      <form id="gear-form" novalidate>
        <label>Item name<input name="name" maxlength="80" autocomplete="off" value="${escapeHtml(draft.name)}" aria-describedby="name-error" required />${fieldError("name", errors)}</label>
        <div class="field-pair"><label>Category<select name="category" aria-describedby="category-error">${options(CATEGORIES, draft.category)}</select>${fieldError("category", errors)}</label><label>Condition<select name="condition" aria-describedby="condition-error">${options(CONDITIONS, draft.condition)}</select>${fieldError("condition", errors)}</label></div>
        <label class="loan-toggle"><input type="checkbox" name="isLent" ${draft.isLent ? "checked" : ""} /><span><strong>Currently lent out</strong><small>Track who is carrying it</small></span></label>
        <label class="borrower-field ${draft.isLent ? "is-visible" : ""}">Borrowed by<input name="borrower" maxlength="80" value="${escapeHtml(draft.borrower)}" aria-describedby="borrower-error" ${draft.isLent ? "required" : ""} />${fieldError("borrower", errors)}</label>
        <label>Personal note<textarea name="note" maxlength="240" rows="3" aria-describedby="note-help note-error">${escapeHtml(draft.note)}</textarea><span class="field-help" id="note-help">A memory, serial detail, or reason it matters · <span data-note-count>${draft.note.length}</span>/240</span>${fieldError("note", errors)}</label>
        <label>Date added<input type="date" name="dateAdded" value="${draft.dateAdded}" aria-describedby="dateAdded-error" required />${fieldError("dateAdded", errors)}</label>
        <p class="form-status" id="form-status" role="alert"></p>
        <div class="form-actions"><button class="button button--primary" type="submit">${editingId ? "Save changes" : "Add to catalog"}</button>${editingId ? `<button class="button button--quiet" type="button" data-action="cancel-edit">Cancel</button>` : ""}</div>
      </form>
    </aside>
    <section class="catalog" id="catalog" aria-labelledby="catalog-title">
      <div class="catalog__heading"><div><p class="kicker">PRIVATE CATALOG</p><h2 id="catalog-title" tabindex="-1">The working kit</h2></div><p class="catalog__copy">Everything owned, borrowed, and temporarily elsewhere.</p></div>
      <dl class="summary" aria-label="Gear summary"><div><dt>Total pieces</dt><dd>${summary.total}</dd></div><div><dt>Out on loan</dt><dd>${summary.lent}</dd></div><div><dt>Ready to pack</dt><dd>${summary.available}</dd></div></dl>
      <div class="filters" aria-label="Catalog filters"><label><span>Find</span><input type="search" name="query-filter" value="${escapeHtml(filters.query)}" placeholder="Search the log" /></label><label><span>Category</span><select name="category-filter"><option value="all">All categories</option>${options(CATEGORIES, filters.category)}</select></label><label><span>Loan status</span><select name="loan-filter"><option value="all" ${filters.loan === "all" ? "selected" : ""}>All gear</option><option value="available" ${filters.loan === "available" ? "selected" : ""}>In my kit</option><option value="lent" ${filters.loan === "lent" ? "selected" : ""}>Lent out</option></select></label><button class="clear-filter" data-action="clear-filters">Clear</button></div>
      <div id="result-region" aria-live="polite" aria-atomic="true"></div>
    </section>
  </main>
  <dialog id="delete-dialog" aria-labelledby="delete-title"><form method="dialog"><p class="kicker">REMOVE ENTRY</p><h2 id="delete-title">Return this card to the dark?</h2><p data-delete-copy></p><div class="dialog-actions"><button class="button button--quiet" value="cancel">Keep it</button><button class="button button--danger" value="confirm">Delete one item</button></div></form></dialog>
  <div class="toast" role="status" aria-live="polite" aria-atomic="true"></div>`;
}

export function catalogMarkup(items: GearItem[], total: number): string {
  if (!items.length) return `<div class="empty"><span aria-hidden="true">⊘</span><h3>${total ? "No frames match" : "The catalog is waiting"}</h3><p>${total ? "Try clearing a filter to bring the gear back into view." : "Log your first camera, lens, filter, or faithful accessory."}</p></div>`;
  return `<p class="result-count">Showing ${items.length} ${items.length === 1 ? "entry" : "entries"}</p><div class="gear-grid">${items.map(gearCardMarkup).join("")}</div>`;
}
