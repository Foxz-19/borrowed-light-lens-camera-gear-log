import { isQuote } from './core.ts';
import type { Quote, StorageLike, StorageResult } from './types.ts';

export const STORAGE_KEY = 'rewatch-reel.quotes.v1';

export class QuoteStore {
  private readonly storage: StorageLike;

  constructor(storage: StorageLike) { this.storage = storage; }

  load(): StorageResult<Quote[]> {
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (raw === null) return { ok: true, value: [] };
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.every(isQuote)) throw new Error('Invalid quote archive');
      return { ok: true, value: parsed.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded)) };
    } catch (error) {
      const corrupt = error instanceof SyntaxError || error instanceof Error && error.message === 'Invalid quote archive';
      return { ok: false, value: [], corrupt, error: corrupt ? 'Your saved archive was damaged, so it could not be opened. New quotes can still be added.' : 'Browser storage is unavailable. Changes may not survive a refresh.' };
    }
  }

  save(quotes: Quote[]): StorageResult<Quote[]> {
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(quotes));
      return { ok: true, value: quotes };
    } catch {
      return { ok: false, value: quotes, error: 'This change is visible now, but could not be saved to this browser.' };
    }
  }
}
