import { CATEGORIES, STATUSES, type CabinetItem, type CabinetSummary, type Category, type StockStatus } from "./types";

export const STATUS_LABELS: Record<StockStatus, string> = { "in-stock": "In stock", "running-low": "Running low", out: "Out" };

export interface ViewActions {
  onStatus(id: string, status: StockStatus, trigger: HTMLButtonElement): void;
  onDelete(id: string, trigger: HTMLButtonElement): void;
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function statusControl(item: CabinetItem, actions: ViewActions): HTMLElement {
  const group = element("div", "status-control");
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", `Stock status for ${item.name}`);
  STATUSES.forEach(status => {
    const button = element("button", `status-dot status-${status}`) as HTMLButtonElement;
    button.type = "button";
    button.dataset.itemId = item.id;
    button.dataset.status = status;
    button.setAttribute("aria-label", `Mark ${item.name} as ${STATUS_LABELS[status]}`);
    button.setAttribute("aria-pressed", String(item.status === status));
    button.title = STATUS_LABELS[status];
    button.addEventListener("click", () => actions.onStatus(item.id, status, button));
    group.append(button);
  });
  return group;
}

export function createItemRow(item: CabinetItem, actions: ViewActions): HTMLElement {
  const article = element("article", "bottle-row");
  article.dataset.id = item.id;
  const bottle = element("div", `bottle-shape bottle-${item.category.toLowerCase()}`);
  bottle.setAttribute("aria-hidden", "true");
  bottle.append(element("span", "bottle-label", item.name.slice(0, 1).toUpperCase()));
  const details = element("div", "bottle-details");
  const category = element("p", "category", item.category);
  const title = element("h3", undefined, item.name);
  details.append(category, title);
  if (item.note) details.append(element("p", "note", item.note));
  else details.append(element("p", "note note-empty", "No tasting note"));
  const controls = element("div", "row-controls");
  const current = element("span", `status-badge status-${item.status}`, STATUS_LABELS[item.status]);
  current.setAttribute("aria-hidden", "true");
  const remove = element("button", "remove", "Remove") as HTMLButtonElement;
  remove.type = "button";
  remove.dataset.itemId = item.id;
  remove.setAttribute("aria-label", `Remove ${item.name}`);
  remove.addEventListener("click", () => actions.onDelete(item.id, remove));
  controls.append(current, statusControl(item, actions), remove);
  article.append(bottle, details, controls);
  return article;
}

export function renderInventory(container: HTMLElement, items: CabinetItem[], actions: ViewActions, filter: Category | "All"): void {
  container.replaceChildren();
  const visible = filter === "All" ? items : items.filter(item => item.category === filter);
  if (!visible.length) {
    const empty = element("div", "empty-state");
    empty.append(element("span", "empty-icon", "◇"), element("h3", undefined, filter === "All" ? "The shelf is waiting" : `No ${filter.toLowerCase()} here yet`), element("p", undefined, filter === "All" ? "Add your first bottle using the form." : "Choose another category or add one to the cabinet."));
    container.append(empty);
    return;
  }
  visible.forEach(item => container.append(createItemRow(item, actions)));
}

export function renderSummary(container: HTMLElement, summary: CabinetSummary): void {
  const data: [string, number, string][] = [["Bottles", summary.total, "total"], ["In stock", summary.inStock, "in"], ["Low", summary.runningLow, "low"], ["Out", summary.out, "out"]];
  container.replaceChildren(...data.map(([label, value, kind]) => {
    const wrap = element("div", `summary-item summary-${kind}`);
    const dt = element("dt", undefined, label);
    const dd = element("dd", undefined, String(value));
    wrap.append(dd, dt);
    return wrap;
  }));
}

export function renderFilters(container: HTMLFieldSetElement, active: Category | "All", present: Category[], onFilter: (value: Category | "All") => void): void {
  const legend = container.querySelector("legend") ?? element("legend", undefined, "Filter by category");
  container.replaceChildren(legend);
  const values: (Category | "All")[] = ["All", ...CATEGORIES.filter(category => present.includes(category))];
  values.forEach(value => {
    const button = element("button", "filter", value) as HTMLButtonElement;
    button.type = "button";
    button.setAttribute("aria-pressed", String(value === active));
    button.addEventListener("click", () => onFilter(value));
    container.append(button);
  });
}
