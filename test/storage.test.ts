import assert from 'node:assert/strict';
import test from 'node:test';
import { QuoteStore, STORAGE_KEY } from '../src/storage.ts';
import type { StorageLike } from '../src/types.ts';

class MemoryStorage implements StorageLike {
  data = new Map<string, string>();
  failRead = false; failWrite = false;
  getItem(key: string) { if (this.failRead) throw new Error('blocked'); return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { if (this.failWrite) throw new Error('full'); this.data.set(key, value); }
}

test('round-trips a valid archive', () => {
  const memory = new MemoryStorage(); const store = new QuoteStore(memory);
  const quotes = [{ id: '1', text: 'Hello', movie: 'Film', year: 2000, mood: 'iconic' as const, dateAdded: '2026-01-01T00:00:00.000Z' }];
  assert.equal(store.save(quotes).ok, true);
  assert.deepEqual(store.load(), { ok: true, value: quotes });
});

test('reports corrupt, blocked, and failed writes distinctly', () => {
  const memory = new MemoryStorage(); const store = new QuoteStore(memory);
  memory.data.set(STORAGE_KEY, '{bad');
  const corrupt = store.load(); assert.equal(corrupt.ok, false); if (!corrupt.ok) assert.equal(corrupt.corrupt, true);
  memory.failRead = true; const blocked = store.load(); assert.equal(blocked.ok, false); if (!blocked.ok) assert.equal(blocked.corrupt, false);
  memory.failRead = false; memory.failWrite = true; assert.equal(store.save([]).ok, false);
});
