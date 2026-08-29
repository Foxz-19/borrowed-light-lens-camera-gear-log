# Ember

A warm, browser-only candle burn-time estimator. It calculates from weight, unit, wick count, and diameter, then saves named candles in `localStorage`.

## Run

Requires Node.js 22+.

```sh
npm install
npm run dev
```

## Verify

```sh
npm test
npm run typecheck
npm run build
```

The estimate uses an 8-hour-per-ounce midpoint, reduces time by 15% per additional wick, and applies a clamped melt-pool factor relative to a 3-inch candle. Real burn time also depends on wax, fragrance, wick care, and environment.
