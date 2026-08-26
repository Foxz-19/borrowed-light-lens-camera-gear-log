import {CATEGORIES, MOODS, moodNames, getSummary} from './data.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateText = date => new Intl.DateTimeFormat('en', {month:'short', year:'numeric'}).format(new Date(`${date}T12:00:00`));

/** @param {import('./data.js').Souvenir[]} entries */
export function renderSummary(entries, visibleCount = entries.length) { const s = getSummary(entries); document.querySelector('#total-count').textContent = s.total; document.querySelector('#country-count').textContent = s.countries; document.querySelector('#result-count').textContent = `(${visibleCount})`; const counts = CATEGORIES.map(category => `${category}: ${entries.filter(x => x.category === category).length}`).filter(x => !x.endsWith(': 0')); document.querySelector('#category-breakdown').textContent = counts.join('  ·  '); }

/** @param {import('./data.js').Souvenir[]} entries */
export function renderGrid(entries) {
  const grid = document.querySelector('#grid');
  grid.innerHTML = entries.map(x => `<article class="souvenir-card"><div class="card-top"><span class="mood" title="${esc(moodNames[x.mood] || 'Mood')}">${MOODS[x.mood] || '✦'}</span><div class="card-actions"><button class="icon-button" data-edit="${esc(x.id)}" aria-label="Edit ${esc(x.name)}">✎</button><button class="icon-button" data-delete="${esc(x.id)}" aria-label="Remove ${esc(x.name)}">×</button></div></div><div class="card-body"><span class="destination">${esc(x.city)}, ${esc(x.country)}</span><h3>${esc(x.name)}</h3><p class="description">${esc(x.description || 'A little piece of somewhere special.')}</p><div class="card-footer"><span class="category-chip">${esc(x.category)}</span><time datetime="${esc(x.date)}">${dateText(x.date)}</time></div><p class="memory">“${esc(x.memory)}”</p></div></article>`).join('');
}

export function showState(showEmpty) { document.querySelector('#empty').hidden = !showEmpty; document.querySelector('#grid').hidden = showEmpty; }
