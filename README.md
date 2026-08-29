# The Amber Cabinet

A single-page cocktail ingredient tracker for a home bar. Add spirits and ingredients, track three stock states, filter by category, and remove bottles with confirmation. Inventory persists in `localStorage`.

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm test
npm run build
```

The app uses strict TypeScript with separate domain, storage, and view modules. Storage data is validated at load time; read/write and corrupt-data failures are surfaced both persistently and through an accessible live notification. The project stays below the brief's 40KB raw-source limit (Markdown and generated output excluded).
