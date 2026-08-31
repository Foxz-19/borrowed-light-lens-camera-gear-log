# Borrowed Light — Lens & Camera Gear Log

A warm, private field log for cataloging cameras, lenses, filters, lighting, and accessories. Track condition, loan status, personal notes, and dates added. Everything persists locally in the browser.

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

The app uses strict TypeScript with separate domain, storage, and view modules. Storage data is validated at load time; read/write and corrupt-data failures are surfaced persistently and through accessible live notifications. The project stays below the brief's 40KB raw-source limit (Markdown and generated output excluded).
