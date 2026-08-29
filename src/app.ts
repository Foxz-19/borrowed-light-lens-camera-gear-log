import { filterQuotes, isMood, validateDraft } from './core.ts';
import { QuoteStore } from './storage.ts';
import type { Filter, Quote } from './types.ts';
import { QuoteView } from './view.ts';

class QuoteController {
  private quotes: Quote[] = [];
  private filter: Filter = 'all';

  constructor(private readonly store: QuoteStore, private readonly view: QuoteView) {}

  start(): void {
    const loaded = this.store.load();
    this.quotes = loaded.value;
    if (!loaded.ok) this.view.showPersistent(loaded.error);
    this.bindEvents();
    this.paint();
    requestAnimationFrame(() => this.view.finishLoading());
  }

  private bindEvents(): void {
    this.view.form.addEventListener('submit', (event) => this.addQuote(event));
    this.view.form.addEventListener('input', () => this.view.clearFormError());
    this.view.list.addEventListener('click', (event) => this.requestDelete(event));
    for (const button of this.view.filters) button.addEventListener('click', () => {
      const value = button.dataset.filter;
      if (value !== 'all' && !isMood(value)) { this.view.showPersistent('That mood filter is not available.'); return; }
      this.filter = value;
      this.paint();
    });
    document.querySelector('#empty-action')?.addEventListener('click', () => this.view.focusComposer());
  }

  private addQuote(event: SubmitEvent): void {
    event.preventDefault();
    const result = validateDraft(this.view.readDraft());
    if (!result.ok) { this.view.showFormError(result.error); return; }
    const quote: Quote = { ...result.value, id: crypto.randomUUID(), dateAdded: new Date().toISOString() };
    this.quotes = [quote, ...this.quotes];
    const saved = this.store.save(this.quotes);
    this.filter = 'all';
    this.view.clearForm();
    if (!saved.ok) { this.view.showFormError(saved.error); this.view.showPersistent(saved.error); }
    else { this.view.clearPersistent(); this.view.showToast('Quote saved to your reel.'); }
    this.paint();
  }

  private async requestDelete(event: Event): Promise<void> {
    const target = (event.target as Element).closest<HTMLButtonElement>('[data-delete]');
    if (!target) return;
    const quote = this.quotes.find((item) => item.id === target.dataset.delete);
    if (!quote) { this.view.showPersistent('That quote is no longer in the archive.'); return; }
    if (!await this.view.confirmDelete(quote)) { target.focus(); return; }
    const previous = this.quotes;
    this.quotes = this.quotes.filter((item) => item.id !== quote.id);
    const saved = this.store.save(this.quotes);
    if (!saved.ok) { this.quotes = previous; this.view.showPersistent(`Quote not deleted. ${saved.error}`); }
    else { this.view.clearPersistent(); this.view.showToast('Quote removed from the reel.'); }
    this.paint();
  }

  private paint(): void {
    const visible = filterQuotes(this.quotes, this.filter);
    this.view.render(visible, this.filter);
    this.view.updateChrome(this.quotes.length, visible.length, this.filter);
  }
}

try {
  new QuoteController(new QuoteStore(window.localStorage), new QuoteView()).start();
} catch (error) {
  document.body.innerHTML = '<main class="fatal"><p class="kicker">Projection interrupted</p><h1>The archive could not open.</h1><p>Reload the page to try again. Your saved quotes have not been changed.</p></main>';
  console.error(error);
}
