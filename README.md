# IGC Estimator

Custom estimating tool for IGC Studio — window film, wallcovering, wall murals.

**Status:** v0.6 · M4 AI Draft shipped (Worker deploy pending)

Live: https://nicoledeschamps1-crypto.github.io/igc-estimator/

## Stack
- Vite + React 18 + TypeScript + Tailwind
- jspdf + jspdf-autotable (real PDF, not print-to-PDF)
- Cloudflare Worker (`worker/`) proxies AI Draft requests to Claude Sonnet 4.6
- localStorage for quotes/client/brand, catalog, saved estimates, worker URL

## Run the frontend

```bash
npm install
npm run dev
```

Open http://localhost:5173 (or the next free port).

Optional for AI Draft:
```
echo 'VITE_WORKER_URL=https://igc-estimator-worker.you.workers.dev' > .env.local
```

## Deploy the Worker (required for M4 AI Draft)

See `worker/README.md`. One-time setup:

```bash
cd worker
npm install
wrangler login
wrangler secret put ANTHROPIC_API_KEY   # paste key from console.anthropic.com
wrangler deploy
```

Copy the deployed URL into `VITE_WORKER_URL` (for local dev) **or** paste it into the setup card on the AI Draft tab (for the live GitHub Pages site — stored in localStorage).

## Roadmap
- ✅ **M1** Film calculator standalone
- ✅ **M2** Wallcovering + Mural + Estimate builder + PDF export
- ✅ **v0.3** Live PDF preview, brand settings
- ✅ **v0.4** Catalog editor, Guide tab
- ✅ **M3 (v0.5)** Pipeline + saved estimates (status, forecast, win rate)
- 🚧 **M4 (v0.6)** AI draft from scope text — Worker deploy pending
- ⏭️ **M5** Bluebeam CSV import + IGC Tool Chest
- ⏭️ **M6** AI + Bluebeam combined

## Defaults
Rates in the Catalog tab are industry-average placeholders. Swap in IGC's real catalog after dad reviews.
