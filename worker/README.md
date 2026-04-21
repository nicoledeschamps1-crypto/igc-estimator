# igc-estimator-worker

Cloudflare Worker that proxies scope text → Claude Sonnet 4.6 → structured estimate line items for the IGC Estimator frontend.

## Deploy (one-time, ~5 min)

1. **Install wrangler** (if not already): `npm install -g wrangler`
2. **Login**: `wrangler login` (opens browser to Cloudflare)
3. **Install deps**: `cd worker && npm install`
4. **Set the API key as a secret**:
   ```
   wrangler secret put ANTHROPIC_API_KEY
   ```
   Paste the key when prompted (get one at console.anthropic.com).
5. **Deploy**:
   ```
   wrangler deploy
   ```
   Wrangler prints a URL like `https://igc-estimator-worker.<your-subdomain>.workers.dev`.
6. **Paste that URL** into the frontend — either as `VITE_WORKER_URL` in `.env.local` (for local dev) or through the AI Draft tab's setup card (persisted in localStorage for the live site).

## Endpoints

- `GET /health` → `{ ok: true, model }`
- `POST /draft` → body `{ scope: string, catalog: {film, wallcovering, mural} }` → `{ items: DraftItem[], usage }`

## Tail logs

```
wrangler tail
```

## Update allowed origins

Edit `wrangler.toml` → `[vars].ALLOWED_ORIGINS` (comma-separated), then `wrangler deploy` again.
