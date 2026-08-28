// @ts-check
import { MAX_CHORES, pickIndex, targetRotation, validateChore, wheelGradient } from './core.js';
import { loadChores, saveChores } from './storage.js';
/** @typedef {import('./types').AppState} AppState */
/** @typedef {import('./types').Chore} Chore */

const get = (/** @type {string} */ id) => {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing required UI: ${id}`);
  return node;
};
function createId() {
  return typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `chore-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

try {
  const ui = {
    main: get('main'), loader: get('loader'), wheelWrap: get('wheel-wrap'), wheel: get('wheel'), spin: /** @type {HTMLButtonElement} */ (get('spin')),
    form: /** @type {HTMLFormElement} */ (get('chore-form')), input: /** @type {HTMLInputElement} */ (get('chore-input')), error: get('form-error'),
    list: get('chore-list'), empty: get('empty'), count: get('chore-count'), winner: get('winner'), result: get('result'), status: get('persistent-status'),
    toast: get('toast'), spinLabel: get('spin-label'), dialog: /** @type {HTMLDialogElement} */ (get('delete-dialog')), dialogCopy: get('dialog-copy')
  };
  const loaded = loadChores(localStorage);
  /** @type {AppState} */
  const state = { chores: loaded.chores, rotation: 0, spinning: false, winnerId: null };
  /** @type {string | null} */ let pendingDelete = null;
  let toastTimer = 0;
  let spinVersion = 0;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** @param {string} message */
  function notify(message) {
    clearTimeout(toastTimer); ui.toast.textContent = message; ui.toast.hidden = false;
    toastTimer = window.setTimeout(() => { ui.toast.hidden = true; }, 4200);
  }
  function persist() {
    const error = saveChores(localStorage, state.chores);
    if (error) { ui.status.textContent = error; ui.status.hidden = false; notify(error); }
  }
  function render() {
    ui.count.textContent = String(state.chores.length);
    ui.wheel.style.background = wheelGradient(state.chores);
    ui.wheel.setAttribute('aria-label', state.chores.length ? `Wheel with ${state.chores.length} chores: ${state.chores.map(c => c.name).join(', ')}` : 'Empty chore wheel');
    ui.wheel.replaceChildren(...state.chores.map((chore, index) => {
      const label = document.createElement('span'); const angle = (index + .5) * 360 / state.chores.length; const radians = angle * Math.PI / 180;
      label.className = 'wheel-label'; label.textContent = chore.name; label.title = chore.name;
      label.style.left = `${50 + 34 * Math.sin(radians)}%`; label.style.top = `${50 - 34 * Math.cos(radians)}%`;
      const tilt = state.chores.length > 5 ? (angle > 90 && angle < 270 ? angle + 180 : angle) : 0;
      label.style.transform = `translate(-50%,-50%) rotate(${tilt}deg)`; return label;
    }));
    ui.list.replaceChildren(...state.chores.map((chore, index) => {
      const li = document.createElement('li'); li.dataset.id = chore.id;
      const dot = document.createElement('span'); dot.className = 'color-dot'; dot.style.background = `var(--wedge-${index + 1})`;
      const name = document.createElement('span'); name.textContent = chore.name;
      const button = document.createElement('button'); button.type = 'button'; button.dataset.remove = chore.id; button.setAttribute('aria-label', `Remove ${chore.name}`); button.textContent = '×';
      li.append(dot, name, button); return li;
    }));
    ui.empty.hidden = state.chores.length > 0;
    ui.spin.disabled = state.chores.length < 2 || state.spinning;
    ui.input.disabled = state.spinning || state.chores.length >= MAX_CHORES;
  }
  /** @param {Chore} chore */
  function finishSpin(chore) {
    state.spinning = false; state.winnerId = chore.id; ui.spin.classList.remove('is-spinning');
    ui.spinLabel.textContent = 'Spin again'; ui.winner.textContent = `${chore.name}!`; ui.result.classList.add('has-result'); render();
  }
  function spin() {
    if (state.spinning || state.chores.length < 2) { if (state.chores.length < 2) notify('Add at least two chores before spinning.'); return; }
    const index = pickIndex(state.chores.length); const chore = state.chores[index];
    const version = ++spinVersion;
    state.rotation = targetRotation(state.rotation, state.chores.length, index);
    if (reduceMotion) { ui.wheel.classList.add('instant'); ui.wheel.style.transform = `rotate(${state.rotation}deg)`; finishSpin(chore); requestAnimationFrame(() => ui.wheel.classList.remove('instant')); return; }
    state.spinning = true; ui.spin.classList.add('is-spinning'); ui.spinLabel.textContent = 'Wheel in motion…'; render();
    ui.wheel.style.transform = `rotate(${state.rotation}deg)`;
    ui.wheel.addEventListener('transitionend', () => { if (version === spinVersion && state.chores.some(c => c.id === chore.id)) finishSpin(chore); }, { once: true });
  }

  ui.form.addEventListener('submit', (event) => {
    event.preventDefault(); const checked = validateChore(ui.input.value, state.chores); ui.error.textContent = checked.error || '';
    if (!checked.name) { ui.input.focus(); return; }
    state.chores.push({ id: createId(), name: checked.name }); ui.input.value = ''; state.winnerId = null; ui.winner.textContent = 'Waiting for a spin'; ui.result.classList.remove('has-result'); persist(); render(); ui.input.focus(); notify(`${checked.name} added to the wheel.`);
  });
  ui.list.addEventListener('click', (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest('button[data-remove]') : null;
    if (!target) return; const id = target.getAttribute('data-remove'); const chore = state.chores.find(c => c.id === id);
    if (!id || !chore) { ui.status.textContent = 'That chore could not be found. Refresh and try again.'; ui.status.hidden = false; return; }
    pendingDelete = id; ui.dialogCopy.textContent = `“${chore.name}” will be removed from this wheel.`; ui.dialog.showModal();
  });
  ui.dialog.addEventListener('close', () => {
    if (ui.dialog.returnValue === 'confirm' && pendingDelete) {
      const index = state.chores.findIndex(c => c.id === pendingDelete);
      if (index >= 0) { const [removed] = state.chores.splice(index, 1); if (state.spinning) { spinVersion++; state.spinning = false; ui.spin.classList.remove('is-spinning'); ui.spinLabel.textContent = 'Spin the wheel'; } if (state.winnerId === removed.id) { state.winnerId = null; ui.winner.textContent = 'Waiting for a spin'; ui.result.classList.remove('has-result'); } persist(); render(); notify(`${removed.name} removed.`); }
    }
    pendingDelete = null;
  });
  ui.spin.addEventListener('click', spin);
  if (loaded.error) { ui.status.textContent = loaded.error; ui.status.hidden = false; notify(loaded.error); }
  render(); ui.loader.remove(); ui.wheelWrap.hidden = false; ui.main.setAttribute('aria-busy', 'false');
} catch (error) {
  const main = document.getElementById('main');
  if (main) { main.setAttribute('aria-busy', 'false'); main.innerHTML = '<section class="fatal" role="alert"><h1>The wheel could not start.</h1><p>Refresh and try again.</p><button onclick="location.reload()">Try again</button></section>'; }
  console.error(error);
}
