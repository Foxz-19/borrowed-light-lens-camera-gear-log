import assert from 'node:assert/strict';
import test from 'node:test';
import { filterQuotes, isQuote, isValidDateTime, validateDraft } from '../src/core.ts';
import type { Quote } from '../src/types.ts';

const draft = { text: '  I see you.  ', movie: ' Avatar ', year: '2009', character: ' Neytiri ', mood: 'iconic' };

test('validates and normalizes a complete quote', () => {
  assert.deepEqual(validateDraft(draft, 2026), { ok: true, value: { text: 'I see you.', movie: 'Avatar', year: 2009, character: 'Neytiri', mood: 'iconic' } });
});

test('rejects missing fields, impossible years, and unknown moods', () => {
  assert.equal(validateDraft({ ...draft, text: '' }).ok, false);
  assert.equal(validateDraft({ ...draft, year: '1887' }, 2026).ok, false);
  assert.equal(validateDraft({ ...draft, mood: 'sleepy' }).ok, false);
});

test('schema guard and mood filter preserve the quote contract', () => {
  const quote: Quote = { id: '1', text: 'Hello', movie: 'Film', year: 2000, mood: 'hilarious', dateAdded: '2026-01-01T00:00:00.000Z' };
  assert.equal(isQuote(quote), true);
  assert.equal(isQuote({ ...quote, dateAdded: 'nope' }), false);
  assert.deepEqual(filterQuotes([quote], 'iconic'), []);
  assert.deepEqual(filterQuotes([quote], 'all'), [quote]);
});

test('rejects duplicate entries and impossible persisted datetimes', () => {
  const existing: Quote = { id: '1', text: 'Hello', movie: 'Film', year: 2000, mood: 'iconic', dateAdded: '2026-01-01T00:00:00.000Z' };
  assert.equal(validateDraft({ text: ' hello ', movie: ' FILM ', year: '2000', character: '', mood: 'hilarious' }, 2026, [existing]).ok, false);
  assert.equal(isValidDateTime('2026-02-31T00:00:00.000Z'), false);
  assert.equal(isValidDateTime('2026-02-28T00:00:00.000Z'), true);
});
