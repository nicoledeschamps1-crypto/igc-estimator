import { useEffect, useMemo, useState } from 'react'
import { useCatalog } from '../catalog/CatalogContext'
import { useEstimate, TradeKind } from '../estimate/EstimateContext'

type Confidence = 'high' | 'medium' | 'low'

type DraftItem = {
  trade: TradeKind
  title: string
  summary: string
  estimatedTotal: number
  sourceQuote: string
  confidence: Confidence
  assumptions: string[]
  catalogChoice?: string
}

const TRADE_LABEL: Record<TradeKind, string> = {
  film: 'Window Film',
  wallcovering: 'Wallcovering',
  mural: 'Mural',
}

const TRADE_BADGE: Record<TradeKind, string> = {
  film: 'bg-blue-100 text-blue-800',
  wallcovering: 'bg-emerald-100 text-emerald-800',
  mural: 'bg-rose-100 text-rose-800',
}

const CONFIDENCE_META: Record<Confidence, { label: string; chip: string; icon: string }> = {
  high: { label: 'High confidence', chip: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: '✓' },
  medium: { label: 'Medium', chip: 'bg-amber-50 text-amber-800 border-amber-200', icon: '·' },
  low: { label: 'Low — please verify', chip: 'bg-rose-50 text-rose-800 border-rose-200', icon: '⚠' },
}

const WORKER_URL_KEY = 'igc-worker-url'
const EXAMPLE_SCOPE = `The conference room has 6 windows, roughly 48" × 60" each, facing west — client wants solar film to cut the afternoon glare. In the main lobby, there's one 12' × 8' accent wall that needs hand-painted mural work (mid-detail). The back hallway (40 ft perimeter × 9 ft tall) gets commercial vinyl wallcovering. Access is ground-level everywhere. Client prefers 50/50 deposit.`

function fmtCurrency(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function useWorkerUrl() {
  const envUrl = import.meta.env.VITE_WORKER_URL?.trim() || ''
  const [override, setOverride] = useState<string>(() => {
    try {
      return localStorage.getItem(WORKER_URL_KEY) || ''
    } catch {
      return ''
    }
  })
  useEffect(() => {
    try {
      if (override) localStorage.setItem(WORKER_URL_KEY, override)
      else localStorage.removeItem(WORKER_URL_KEY)
    } catch {
      // ignore
    }
  }, [override])
  const activeUrl = (envUrl || override).replace(/\/$/, '')
  return { activeUrl, envUrl, override, setOverride }
}

export default function AIDraftPanel() {
  const { catalog } = useCatalog()
  const { addQuote } = useEstimate()
  const { activeUrl, envUrl, override, setOverride } = useWorkerUrl()

  const [scope, setScope] = useState('')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<DraftItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())
  const [accepted, setAccepted] = useState<Set<number>>(new Set())

  const catalogPayload = useMemo(
    () => ({
      film: catalog.films.map((f) => ({
        name: f.name,
        rollWidthIn: f.rollWidthIn,
        costPerSqFt: f.costPerSqFt,
      })),
      wallcovering: catalog.wallcoverings.map((w) => ({
        name: w.name,
        rollType: w.rollType,
        usableSqFtPerRoll: w.usableSqFtPerRoll,
        costPerRoll: w.costPerRoll,
        patternWastePct: w.patternWastePct,
      })),
      mural: catalog.muralStyles.map((m) => ({
        name: m.name,
        description: m.description,
        materialPerSqFt: m.materialPerSqFt,
        laborPerSqFt: m.laborPerSqFt,
      })),
    }),
    [catalog],
  )

  async function runDraft() {
    if (!activeUrl) {
      setError('Worker URL not configured — see setup card below.')
      return
    }
    setLoading(true)
    setError(null)
    setItems(null)
    setDismissed(new Set())
    setAccepted(new Set())
    try {
      const res = await fetch(`${activeUrl}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope, catalog: catalogPayload }),
      })
      if (!res.ok) {
        const errBody = await res.text()
        throw new Error(`Worker returned ${res.status}: ${errBody.slice(0, 200)}`)
      }
      const data = (await res.json()) as { items: DraftItem[] }
      setItems(data.items)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function acceptItem(idx: number, item: DraftItem) {
    addQuote({
      trade: item.trade,
      title: item.title,
      summary: item.summary,
      total: item.estimatedTotal,
      lineItems: [
        { label: 'Source (scope quote)', value: item.sourceQuote, muted: true },
        ...(item.catalogChoice ? [{ label: 'Catalog choice', value: item.catalogChoice }] : []),
        ...item.assumptions.map((a) => ({ label: 'Assumption', value: a, muted: true })),
        { label: 'Estimated total', value: fmtCurrency(item.estimatedTotal) },
        { label: 'Confidence', value: CONFIDENCE_META[item.confidence].label },
      ],
    })
    setAccepted((s) => new Set(s).add(idx))
  }

  function dismissItem(idx: number) {
    setDismissed((s) => new Set(s).add(idx))
  }

  const visibleItems = (items ?? []).map((item, idx) => ({ item, idx })).filter(({ idx }) => !dismissed.has(idx))

  return (
    <div className="max-w-4xl space-y-6">
      {/* Hero */}
      <section className="bg-gradient-to-br from-igc-purple to-igc-purple-dark text-white rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">✨</div>
          <div>
            <h1 className="text-xl font-bold mb-1">AI Draft</h1>
            <p className="text-sm text-white/90 leading-relaxed">
              Paste the client's scope text. Claude drafts rough line items using your catalog rates. Every suggestion
              cites its source — accept the ones you trust, dismiss the rest. Always a starting point, never a final quote.
            </p>
          </div>
        </div>
      </section>

      {/* Setup card — shown when worker URL is missing */}
      {!activeUrl && <SetupCard override={override} setOverride={setOverride} envUrl={envUrl} />}

      {/* Scope input */}
      <section className="bg-igc-surface border border-igc-line rounded-lg p-6 space-y-4">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-sm font-semibold text-igc-ink">Client scope text</label>
            <button
              onClick={() => setScope(EXAMPLE_SCOPE)}
              className="text-xs text-igc-purple hover:text-igc-purple-dark"
            >
              Load example
            </button>
          </div>
          <textarea
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            rows={8}
            placeholder="Paste the client's scope email, meeting notes, or RFP text here…"
            className="w-full px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple font-mono"
          />
          <div className="text-[11px] text-igc-muted mt-1">{scope.length.toLocaleString()} characters</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-igc-muted">
            {activeUrl ? (
              <>Ready · worker at {new URL(activeUrl).host}</>
            ) : (
              <>⚠ Worker URL not set — see setup card above.</>
            )}
          </div>
          <button
            onClick={runDraft}
            disabled={loading || scope.trim().length < 10 || !activeUrl}
            className="px-5 py-2 bg-igc-purple hover:bg-igc-purple-dark text-white rounded-md text-sm font-medium transition-colors disabled:bg-igc-line disabled:text-igc-muted disabled:cursor-not-allowed"
          >
            {loading ? 'Drafting…' : 'Draft estimate'}
          </button>
        </div>

        {error && (
          <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md p-3">
            <strong>Error:</strong> {error}
          </div>
        )}
      </section>

      {/* Results */}
      {items !== null && (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted">
              Drafted line items
            </h2>
            <div className="text-xs text-igc-muted">
              {items.length} {items.length === 1 ? 'item' : 'items'} ·{' '}
              <span className="text-igc-purple font-semibold">{accepted.size} accepted</span> ·{' '}
              {dismissed.size} dismissed
            </div>
          </div>

          {visibleItems.length === 0 && items.length === 0 && (
            <div className="bg-igc-surface border border-igc-line rounded-lg p-10 text-center text-sm text-igc-muted">
              Claude didn't find any line items in that scope. Try adding more detail.
            </div>
          )}

          {visibleItems.map(({ item, idx }) => (
            <DraftCard
              key={idx}
              item={item}
              accepted={accepted.has(idx)}
              onAccept={() => acceptItem(idx, item)}
              onDismiss={() => dismissItem(idx)}
            />
          ))}

          {visibleItems.length === 0 && items.length > 0 && (
            <div className="bg-igc-surface border border-igc-line rounded-lg p-10 text-center text-sm text-igc-muted">
              All items processed. Head to the <strong className="text-igc-ink">Estimate</strong> tab to review and send.
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function DraftCard({
  item,
  accepted,
  onAccept,
  onDismiss,
}: {
  item: DraftItem
  accepted: boolean
  onAccept: () => void
  onDismiss: () => void
}) {
  const conf = CONFIDENCE_META[item.confidence]
  return (
    <div
      className={`bg-igc-surface border rounded-lg p-5 transition-colors ${
        accepted ? 'border-emerald-300 bg-emerald-50/40' : 'border-igc-line hover:border-igc-purple/40'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${TRADE_BADGE[item.trade]}`}>
            {TRADE_LABEL[item.trade]}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${conf.chip}`}>
            {conf.icon} {conf.label}
          </span>
          {item.catalogChoice && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-igc-purple-light text-igc-purple font-medium">
              {item.catalogChoice}
            </span>
          )}
        </div>
        <div className="font-mono text-lg font-semibold text-igc-ink flex-shrink-0">
          {fmtCurrency(item.estimatedTotal)}
        </div>
      </div>

      <div className="mb-2">
        <div className="font-medium text-sm text-igc-ink">{item.title}</div>
        <div className="text-xs text-igc-muted mt-0.5">{item.summary}</div>
      </div>

      <div className="border-l-2 border-igc-purple/30 pl-3 py-1 my-3">
        <div className="text-[10px] uppercase tracking-wider text-igc-muted font-semibold">From scope</div>
        <div className="text-xs text-igc-ink italic">"{item.sourceQuote}"</div>
      </div>

      {item.assumptions.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] uppercase tracking-wider text-igc-muted font-semibold mb-1">Assumptions</div>
          <ul className="text-xs text-igc-muted space-y-0.5">
            {item.assumptions.map((a, i) => (
              <li key={i}>· {a}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-igc-line">
        {accepted ? (
          <div className="text-xs text-emerald-700 font-medium">✓ Added to estimate</div>
        ) : (
          <>
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 text-xs text-igc-muted hover:text-igc-ink border border-igc-line rounded-md"
            >
              Dismiss
            </button>
            <button
              onClick={onAccept}
              className="px-4 py-1.5 text-xs bg-igc-purple hover:bg-igc-purple-dark text-white rounded-md font-medium"
            >
              Accept & add to estimate
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function SetupCard({
  override,
  setOverride,
  envUrl,
}: {
  override: string
  setOverride: (s: string) => void
  envUrl: string
}) {
  const [draft, setDraft] = useState(override)
  return (
    <section className="bg-amber-50 border border-amber-200 rounded-lg p-6 space-y-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-900 mb-1">Setup required</h2>
        <p className="text-xs text-amber-900 leading-relaxed">
          M4 uses a Cloudflare Worker that holds the Anthropic API key server-side. Follow{' '}
          <code className="bg-amber-100 px-1 py-0.5 rounded">worker/README.md</code> to deploy (~5 min, free tier), then
          paste the Worker URL below. Stored in localStorage on this browser.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="url"
          placeholder="https://igc-estimator-worker.you.workers.dev"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="flex-1 px-3 py-2 border border-amber-300 bg-igc-surface rounded-md text-sm focus:outline-none focus:border-amber-500"
        />
        <button
          onClick={() => setOverride(draft.trim())}
          disabled={!draft.trim()}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium disabled:bg-amber-200 disabled:cursor-not-allowed"
        >
          Save URL
        </button>
        {override && (
          <button
            onClick={() => {
              setOverride('')
              setDraft('')
            }}
            className="px-3 py-2 text-xs text-amber-900 hover:text-amber-700 border border-amber-300 rounded-md"
          >
            Clear
          </button>
        )}
      </div>
      {envUrl && (
        <div className="text-[11px] text-amber-900/80">
          (Build-time <code>VITE_WORKER_URL</code> is set to <code>{envUrl}</code> — any value above overrides it.)
        </div>
      )}
    </section>
  )
}
