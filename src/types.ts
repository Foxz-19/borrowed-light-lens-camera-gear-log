export const MOODS = ['motivating', 'hilarious', 'heartbreaking', 'iconic'] as const;
export type Mood = typeof MOODS[number];
export type Filter = Mood | 'all';

export interface Quote {
  id: string;
  text: string;
  movie: string;
  year: number;
  character?: string;
  mood: Mood;
  dateAdded: string;
}

export interface QuoteDraft {
  text: string;
  movie: string;
  year: string;
  character: string;
  mood: string;
}

export type ValidationResult = { ok: true; value: Omit<Quote, 'id' | 'dateAdded'> } | { ok: false; error: string };
export type StorageResult<T> = { ok: true; value: T } | { ok: false; value: T; error: string; corrupt?: boolean };

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
