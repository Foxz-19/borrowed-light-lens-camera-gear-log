# Rewatch Reel

A cinematic, browser-only archive for favorite movie quotes. Quotes can be added, filtered by mood, and deleted with confirmation; the collection persists in `localStorage`.

## Run locally

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

## Quality checks

```sh
npm test
npm run typecheck
npm run build
```

The source is deliberately dependency-light and split into typed domain, storage, view, and controller modules. Storage payloads are runtime-validated before crossing into application state. Generated dependencies, builds, and QA captures are excluded from the submission; the raw application and test source remains below the 40KB brief limit.
