import { formatDate, moodLabel } from './core.ts';
import type { Filter, Quote } from './types.ts';

const required = <T extends Element>(selector: string): T => {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Required interface element missing: ${selector}`);
  return node;
};

export class QuoteView {
  readonly form = required<HTMLFormElement>('#quote-form');
  readonly list = required<HTMLElement>('#quote-list');
  readonly empty = required<HTMLElement>('#empty-state');
  readonly dialog = required<HTMLDialogElement>('#delete-dialog');
  readonly filters = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  private readonly archive = required<HTMLElement>('#archive');
  private readonly loader = required<HTMLElement>('#loader');
  private readonly formError = required<HTMLElement>('#form-error');
  private readonly status = required<HTMLElement>('#persistent-status');
  private readonly toast = required<HTMLElement>('#toast');
  private toastTimer?: number;

  finishLoading(): void {
    this.loader.hidden = true;
    this.archive.setAttribute('aria-busy', 'false');
  }

  render(quotes: Quote[], filter: Filter): void {
    this.list.replaceChildren(...quotes.map((quote, index) => this.quoteCard(quote, index)));
    this.list.hidden = quotes.length === 0;
    this.empty.hidden = quotes.length > 0;
    const filteredEmpty = filter !== 'all';
    required('#empty-title').textContent = filteredEmpty ? `No ${moodLabel(filter)} lines yet.` : 'Your first great line belongs here.';
    required('#empty-copy').textContent = filteredEmpty ? 'Try another mood, or add a quote for this one.' : 'Add a quote and begin your private picture-house archive.';
  }

  updateChrome(total: number, visible: number, filter: Filter): void {
    required('#quote-count').textContent = String(total).padStart(2, '0');
    required('#count-all').textContent = String(total);
    required('#archive-summary').textContent = total === 0 ? 'Your reel is ready for its first line.' : filter === 'all' ? `${total} ${total === 1 ? 'line' : 'lines'}, ordered by latest.` : `${visible} of ${total} ${moodLabel(filter).toLowerCase()}.`;
    for (const button of this.filters) button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
  }

  readDraft() {
    const data = new FormData(this.form);
    return { text: String(data.get('quote') ?? ''), movie: String(data.get('movie') ?? ''), year: String(data.get('year') ?? ''), character: String(data.get('character') ?? ''), mood: String(data.get('mood') ?? '') };
  }

  clearForm(): void {
    this.form.reset();
    const firstMood = this.form.querySelector<HTMLInputElement>('input[name="mood"]');
    if (firstMood) firstMood.checked = true;
    this.formError.textContent = '';
  }

  showFormError(message: string): void { this.formError.textContent = message; }
  clearFormError(): void { this.formError.textContent = ''; }
  showPersistent(message: string): void { this.status.textContent = message; this.status.hidden = false; }
  clearPersistent(): void { this.status.hidden = true; this.status.textContent = ''; }
  showToast(message: string): void {
    window.clearTimeout(this.toastTimer);
    this.toast.textContent = message;
    this.toast.hidden = false;
    this.toastTimer = window.setTimeout(() => { this.toast.hidden = true; }, 3200);
  }

  confirmDelete(quote: Quote): Promise<boolean> {
    required('#dialog-copy').textContent = `“${quote.text}” from ${quote.movie} will be permanently removed.`;
    this.dialog.showModal();
    return new Promise((resolve) => this.dialog.addEventListener('close', () => resolve(this.dialog.returnValue === 'confirm'), { once: true }));
  }

  focusComposer(): void {
    required<HTMLTextAreaElement>('#quote').focus({ preventScroll: true });
    required('#composer-title').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }

  private quoteCard(quote: Quote, index: number): HTMLElement {
    const article = document.createElement('article');
    article.className = 'quote-card';
    article.dataset.mood = quote.mood;
    article.style.setProperty('--index', String(Math.min(index, 8)));
    const top = document.createElement('div'); top.className = 'card-top';
    const mood = document.createElement('span'); mood.className = 'mood'; mood.textContent = moodLabel(quote.mood);
    const date = document.createElement('time'); date.dateTime = quote.dateAdded; date.textContent = formatDate(quote.dateAdded);
    top.append(mood, date);
    const text = document.createElement('blockquote'); text.textContent = `“${quote.text}”`;
    const bottom = document.createElement('div'); bottom.className = 'card-bottom';
    const credit = document.createElement('p');
    const title = document.createElement('cite'); title.textContent = quote.movie;
    credit.append(title, document.createTextNode(` · ${quote.year}`));
    if (quote.character) { const person = document.createElement('span'); person.textContent = quote.character; credit.append(person); }
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'delete-button'; remove.dataset.delete = quote.id; remove.setAttribute('aria-label', `Delete quote from ${quote.movie}`); remove.textContent = 'Remove';
    bottom.append(credit, remove); article.append(top, text, bottom);
    return article;
  }
}
