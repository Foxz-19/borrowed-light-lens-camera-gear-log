// @ts-check
import { COLORS, ageText, daysAgo, formatStored, validateLabel } from './core.js';
import { loadLabels, saveLabels } from './storage.js';
/** @typedef {import('./types').FoodLabel} FoodLabel */
const get = (/** @type {string} */ id) => { const node = document.getElementById(id); if (!node) throw Error(`Missing UI: ${id}`); return node; };
const createId = () => typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `label-${Date.now()}-${Math.random().toString(36).slice(2)}`;

try {
  const ui = { app:get('app'), form:/** @type {HTMLFormElement} */(get('label-form')), food:/** @type {HTMLInputElement} */(get('food')), stored:/** @type {HTMLInputElement} */(get('stored')), note:/** @type {HTMLTextAreaElement} */(get('note')), error:get('form-error'), grid:get('label-grid'), empty:get('empty'), loader:get('loader'), count:get('label-count'), today:get('today'), status:get('persistent-status'), toast:get('toast'), dialog:/** @type {HTMLDialogElement} */(get('delete-dialog')), dialogCopy:get('dialog-copy') };
  const today = new Date(); const todayIso = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`; ui.stored.value = todayIso; ui.today.textContent = `Today · ${formatStored(todayIso)}`;
  const loaded = loadLabels(localStorage); /** @type {FoodLabel[]} */ let labels = loaded.labels;
  /** @type {string | null} */
  let pending = null; let toastTimer = 0;
  function notify(/** @type {string} */ message) { clearTimeout(toastTimer); ui.toast.textContent = message; ui.toast.hidden = false; toastTimer = setTimeout(() => ui.toast.hidden = true, 4200); }
  function persist() { const error = saveLabels(localStorage, labels); if (error) { ui.status.textContent = error; ui.status.hidden = false; notify(error); } }
  function render() {
    ui.count.textContent = String(labels.length); ui.grid.replaceChildren(...labels.map((label, index) => {
      const card = document.createElement('article'); card.className = `label-card${daysAgo(label.stored) > 5 ? ' is-old' : ''}`; card.style.setProperty('--label-color', COLORS[index % COLORS.length]); card.dataset.id = label.id;
      const tape = document.createElement('span'); tape.className = 'tape'; tape.setAttribute('aria-hidden','true'); const food = document.createElement('h3'); food.textContent = label.food;
      const date = document.createElement('p'); date.className = 'stored-date'; date.textContent = `${formatStored(label.stored)} · ${ageText(daysAgo(label.stored))}`;
      card.append(tape, food, date); if (label.note) { const note = document.createElement('p'); note.className = 'note'; note.textContent = label.note; card.append(note); }
      if (daysAgo(label.stored) > 5) { const warning = document.createElement('p'); warning.className = 'warning'; warning.innerHTML = '<span aria-hidden="true">!</span> Check freshness'; card.append(warning); }
      const remove = document.createElement('button'); remove.className = 'remove'; remove.type = 'button'; remove.dataset.remove = label.id; remove.setAttribute('aria-label', `Delete label for ${label.food}`); remove.textContent = '×'; card.append(remove); return card;
    })); ui.empty.hidden = labels.length > 0; ui.grid.hidden = labels.length === 0; }
  ui.form.addEventListener('submit', (event) => { event.preventDefault(); const checked = validateLabel(ui.food.value, ui.stored.value, ui.note.value, labels); ui.error.textContent = checked.error || ''; if (!checked.food) { (checked.error?.includes('date') ? ui.stored : ui.food).focus(); return; } labels.unshift({ id:createId(), food:checked.food, stored:checked.stored, note:checked.note || '' }); persist(); ui.form.reset(); ui.stored.value = todayIso; render(); ui.food.focus(); notify(`${checked.food} label added.`); });
  ui.grid.addEventListener('click', (event) => { const button = event.target instanceof HTMLElement ? event.target.closest('button[data-remove]') : null; if (!button) return; const id = button.getAttribute('data-remove'); const label = labels.find((x) => x.id === id); if (!label) { ui.status.textContent = 'That label is no longer available. Refresh and try again.'; ui.status.hidden = false; return; } pending = id; ui.dialogCopy.textContent = `Delete the label for “${label.food}”?`; ui.dialog.showModal(); });
  ui.dialog.addEventListener('close', () => { if (ui.dialog.returnValue === 'confirm' && pending) { const index = labels.findIndex((x) => x.id === pending); if (index >= 0) { const [removed] = labels.splice(index, 1); persist(); render(); notify(`${removed.food} label deleted.`); } } pending = null; });
  if (loaded.error) { ui.status.textContent = loaded.error; ui.status.hidden = false; notify(loaded.error); } render(); ui.loader.remove(); ui.app.setAttribute('aria-busy','false');
} catch (error) { const app = document.getElementById('app'); if (app) { app.setAttribute('aria-busy','false'); app.innerHTML = '<section class="fatal" role="alert"><h1>The fridge could not open.</h1><p>Refresh and try again.</p><button onclick="location.reload()">Try again</button></section>'; } console.error(error); }
