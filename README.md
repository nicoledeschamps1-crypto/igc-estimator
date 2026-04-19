# IGC Estimator

Custom estimating tool for IGC Studio — window film, wallcovering, wall murals.

**Status:** v0.1 prototype — Film calculator only.

## Stack
- Vite + React + TypeScript
- Tailwind CSS
- Node 18+

## Run
```bash
npm install
npm run dev
```

Open http://localhost:5173

## Roadmap
See `~/Desktop/igc-estimator-plan.pdf` for the full plan.

- **M1 (current):** Film calculator standalone
- M2: Wallcovering + Mural calculators, estimate builder, PDF export
- M3: Team login, pipeline view
- M4: AI draft from scope text
- M5: Bluebeam CSV import + IGC Tool Chest
- M6: AI + Bluebeam combined

## Defaults
Rates and waste factors in `src/components/FilmCalculator.tsx` are industry-average placeholders. Swap in IGC's real catalog after dad reviews.
