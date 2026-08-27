# Nest Egg — Deep Brief Assessment

## Scope and method

This assessment follows `prompt.md` as the evaluation contract and `brief.txt` as the product specification. I inspected the complete HTML, CSS, TypeScript modules, package scripts, tests, and repository status, then verified the rendered application in Chromium at desktop and 375px mobile widths. The review explicitly checked the happy path and failure paths: invalid input, malformed persisted data, blocked storage reads/writes, failed destructive saves, refresh persistence, keyboard focus, reduced motion, and console errors.

## Functional completeness

| Requirement from `brief.txt` | Evidence checked | Result |
|---|---|---|
| Multiple visual jars | `AppData.jars` is an array; the collection renders every jar | Pass |
| Name and optional emoji | Add form validates a required name and optional icon; rendering uses `textContent` | Pass |
| Target amount | Positive, finite, bounded currency input is validated and normalized to cents | Pass |
| Running saved amount | Deposits are immutable records; `savedAmount()` calculates the running total | Pass |
| Deposit amount, optional note/date | Deposit dialog validates amount, note length, and ISO date; date defaults to today but remains editable/optional | Pass |
| Liquid fill meter | CSS jar glass and liquid use the calculated percentage, capped at 100%; progressbar semantics expose the value | Pass |
| Three statuses | `status()` derives Not Started, In Progress, or Reached 🎉 from saved/target values | Pass |
| Add, deposit, delete | All three actions are reachable by keyboard and pointer; event delegation validates jar IDs before mutation | Pass |
| Last five deposits | Collapsible `<details>` history shows `slice(0, 5)` and reports older entries without losing them | Pass |
| Delete safety | Native dialog states the exact number of entries removed and supports cancel, Escape, backdrop click, and focus return | Pass |
| Refresh persistence | Every successful mutation serializes versioned data to `localStorage`; Chromium reload check confirmed persistence | Pass |
| Friendly motivation | Warm parchment/forest/amber token system, animated rising liquid, completion spark, empty state, and concise success feedback | Pass |

## Problem fit and design

The page begins with the working surface rather than an unrelated marketing hero: total saved, goal count, reached count, the sticky jar composer, and the current shelf. The visual jar is made from lightweight CSS so the progress itself is the focal point. The desktop two-column composition becomes a single vertical flow below 900px; the 375px browser check found no horizontal overflow. Actions have clear labels, destructive actions are separated visually, and the empty shelf points directly to the first form field.

Accessibility state was checked in the DOM: one logical `h1` inside `main`, labelled forms and dialogs, `aria-invalid` on validation failures, `role="alert"` for persistent failures, live jar updates, progressbar values, keyboard-visible focus outlines, and focus restoration after modal cancellation. `prefers-reduced-motion: reduce` disables animation and transitions globally; no action relies on motion to communicate its result.

## Technical craft and resilience

- `src/domain.ts` owns explicit TypeScript interfaces, literal status types, pure calculations, input validation, and runtime `isAppData()` schema checks.
- `src/storage.ts` isolates persistence and distinguishes valid data, blocked reads, malformed data, recovery-copy failure, and write failure. Corrupt data is never silently reseeded.
- `src/render.ts` builds DOM nodes with `textContent`, avoiding HTML injection while keeping rendering independently testable.
- `src/app.ts` is orchestration only: event wiring, dialog state, validation feedback, mutation-before-render ordering, and an outer initialization fallback.
- CSS custom properties centralize colors, spacing, typography, and shadow values; repeated theme literals are avoided.
- There are no credentials, backend calls, unsafe HTML interpolation, or hidden network dependencies beyond optional web fonts.
- `npm test` is a real Vitest script, not an unconnected test file. Tests cover decimal-safe totals, all statuses, progress caps, input errors, runtime schema rejection through storage, recovery, write failure, safe rendering, progress semantics, and the five-entry history limit.

## Negative-requirement resolution

The checklist’s unrelated examples (coffee, cocktail, gift, people, seasons, and episodes) were translated to the actual savings domain rather than copied into the UI. Their positive counterparts are satisfied here by typed jar/deposit CRUD, automatic three-state status derivation, per-shelf status summaries, exact delete impact, persistent storage, accessible collapsible histories, live updates, empty/fatal states, validated action IDs, and an executable test script. There is no navigation-as-toggle misuse, ingredient/swap surface, or unrelated data model to repair.

## Debugging record

1. The inherited staged snapshot was a Coffee Calculator and its original `ASSESSMENT.md` described that wrong product. The implementation and assessment were replaced with Nest Egg-specific modules and evidence.
2. A first browser audit caught duplicate announcements for storage failures (the same message appeared in both an alert banner and a toast). Persistent failures now use one persistent alert; transient successes retain the toast.
3. A modal failure audit found that a failed delete save only appeared behind the open dialog. The delete confirmation copy is now focusable and receives the write error while the dialog remains open, so the user can retry or cancel without losing context.
4. A recovery-focus audit found that the corrupt-data alert was focused while its `<main>` ancestor was still hidden during boot. Initialization now reveals the application before focusing the persistent warning; Chromium confirms `document.activeElement` is `persistent-message`.
5. A source-budget audit measured all non-markdown/non-text repository files at 39,953 bytes before the final focus fix and 39,953 bytes after the same-length ordering correction; this remains below the strict 40,000-byte limit. Generated dependencies and build output are ignored.

## Verification evidence

- `npm test`: **9 tests passed across 3 files**.
- `npm run build`: strict TypeScript check and Vite production build passed.
- Chromium workflow: create jar, reject invalid form, add six deposits, reach 100%, verify five-entry history, reload, confirm exact delete count, cancel with focus restoration, delete, test mobile overflow, test corrupt storage, and verify no console/page errors.
- Targeted Chromium recovery regression: corrupt storage warning is visible and focused; toast is hidden; failed delete save keeps the dialog open and focuses its inline error.
- `git diff --check`: no whitespace errors.
- Raw non-markdown/non-text source footprint: **under 40KB**.

## Final evaluation

```json
{
  "evaluation": {
    "completeness": {
      "score": 5,
      "reasoning": "All brief features are implemented and reachable: multiple jars with name/icon/target, deposit logging with note/date, running totals, liquid progress, all three statuses, five-entry histories, add/deposit/delete flows, localStorage persistence, and celebratory completion. Validation, recovery, modal confirmation, and visible storage failures cover off-happy-path behavior."
    },
    "problem_solving_design": {
      "score": 5,
      "reasoning": "The product directly supports the savings problem with a focused shelf workspace, sticky creation form, large visual jars, clear remaining amounts, status summaries, a useful empty state, responsive mobile composition, keyboard-visible focus, live feedback, and reduced-motion support. The warm visual system motivates without obscuring the core actions."
    },
    "technical_craft": {
      "score": 5,
      "reasoning": "The solution uses strict TypeScript modules, explicit interfaces, runtime storage validation, pure domain functions, safe text-based DOM rendering, centralized CSS tokens, defensive action validation, resilient error boundaries, accessible dialogs, executable unit/DOM tests, and Chromium regression checks. The raw source footprint remains below the 40KB constraint and contains no credentials or unsafe HTML interpolation."
    },
    "overall_summary": "Nest Egg is an exceptional, brief-complete savings goal tracker. Deep review found and fixed duplicate persistence announcements, hidden-modal save feedback, and recovery-message focus timing. The final implementation passes unit, build, responsive, persistence, accessibility-state, failure-path, and source-budget checks."
  }
}
```
