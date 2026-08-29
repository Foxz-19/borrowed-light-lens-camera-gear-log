import { MOODS, type Filter, type Mood, type Quote, type QuoteDraft, type ValidationResult } from './types.ts';

const clean = (value: string) => value.trim().replace(/\s+/g, ' ');
export const isMood = (value: unknown): value is Mood => typeof value === 'string' && MOODS.includes(value as Mood);

export function validateDraft(draft: QuoteDraft, currentYear = new Date().getFullYear()): ValidationResult {
  const text = clean(draft.text);
  const movie = clean(draft.movie);
  const character = clean(draft.character);
  if (!text) return { ok: false, error: 'Write the quote you want to remember.' };
  if (text.length > 300) return { ok: false, error: 'Keep the quote to 300 characters or fewer.' };
  if (!movie) return { ok: false, error: 'Add the movie title.' };
  if (movie.length > 80) return { ok: false, error: 'Keep the movie title to 80 characters or fewer.' };
  if (!/^\d{4}$/.test(draft.year)) return { ok: false, error: 'Enter a four-digit release year.' };
  const year = Number(draft.year);
  if (year < 1888 || year > currentYear + 5) return { ok: false, error: `Enter a year between 1888 and ${currentYear + 5}.` };
  if (character.length > 60) return { ok: false, error: 'Keep the character name to 60 characters or fewer.' };
  if (!isMood(draft.mood)) return { ok: false, error: 'Choose a valid mood.' };
  return { ok: true, value: { text, movie, year, ...(character && { character }), mood: draft.mood } };
}

export function isQuote(value: unknown): value is Quote {
  if (!value || typeof value !== 'object') return false;
  const quote = value as Record<string, unknown>;
  return typeof quote.id === 'string' && quote.id.length > 0 && typeof quote.text === 'string' && quote.text.length > 0 && quote.text.length <= 300 &&
    typeof quote.movie === 'string' && quote.movie.length > 0 && quote.movie.length <= 80 && Number.isInteger(quote.year) && Number(quote.year) >= 1888 &&
    (quote.character === undefined || typeof quote.character === 'string') && isMood(quote.mood) && typeof quote.dateAdded === 'string' && !Number.isNaN(Date.parse(quote.dateAdded));
}

export const filterQuotes = (quotes: Quote[], filter: Filter) => filter === 'all' ? quotes : quotes.filter((quote) => quote.mood === filter);
export const formatDate = (iso: string) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
export const moodLabel = (mood: Mood) => mood[0]!.toUpperCase() + mood.slice(1);
