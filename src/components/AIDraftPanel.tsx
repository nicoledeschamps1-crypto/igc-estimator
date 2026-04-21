import { useEffect, useMemo, useState } from 'react'
import { Sparkles, CheckCircle2, CircleDot, AlertTriangle, type LucideIcon } from 'lucide-react'
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
  film: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300',
  wallcovering: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
  mural: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300',
}

const CONFIDENCE_META: Record<Confidence, { label: string; chip: string; Icon: LucideIcon }> = {
  high: { label: 'High confidence', chip: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60', Icon: CheckCircle2 },
  medium: { label: 'Medium', chip: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60', Icon: CircleDot },
  low: { label: 'Low — please verify', chip: 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/60', Icon: AlertTriangle },
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
  // Manual override wins so operators can replace a stale / rotated env URL
  // without a rebuild.
  const activeUrl = (override || envUrl).replace(/\/$/, '')
  return { activeUrl, envUrl, override, setOverride }
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).host
  } catch {
    return null
  }
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
  const [settingsOpen, setSettingsOpen] = useState(false)
  const activeHost = safeHost(activeUrl)
  const urlInvalid = activeUrl.length > 0 && activeHost === null
  const showSetup = !activeUrl || urlInvalid || settingsOpen

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
      <section className="bg-gradient-to-br from-igc-accent to-igc-accent-dark text-white rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center">
            <Sparkles size={26} strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl font-bold mb-1">AI Draft</h1>
            <p className="text-sm text-white/90 leading-relaxed">
              Paste the client's scope text. Claude drafts rough line items using your catalog rates. Every suggestion
              cites its source — accept the ones you trust, dismiss the rest. Always a starting point, never a final quote.
            </p>
          </div>
        </div>
      </section>

      {/* Setup card — shown when worker URL is missing, invalid, or user clicks "Change worker URL" */}
      {showSetup && (
        <SetupCard
          override={override}
          setOverride={(v) => {
            setOverride(v)
            setSettingsOpen(false)
          }}
          envUrl={envUrl}
          urlInvalid={urlInvalid}
          onClose={activeUrl && !urlInvalid ? () => setSettingsOpen(false) : undefined}
        />
      )}

      {/* Scope input */}
      <section className="bg-igc-surface border border-igc-line rounded-lg p-6 space-y-4">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-sm font-semibold text-igc-ink">Client scope text</label>
            <button
              onClick={() => setScope(EXAMPLE_SCOPE)}
              className="text-xs text-igc-accent hover:text-igc-accent-dark"
            >
              Load example
            </button>
          </div>
          <textarea
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            rows={8}
            placeholder="Paste the client's scope email, meeting notes, or RFP text here…"
            className="w-full px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-accent font-mono"
          />
          <div className="text-[11px] text-igc-muted mt-1">{scope.length.toLocaleString()} characters</div>
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-igc-muted flex items-center gap-2 flex-wrap">
            {activeHost ? (
              <>
                <span>Ready · worker at {activeHost}</span>
                <button
                  onClick={() => setSettingsOpen((s) => !s)}
                  className="text-igc-accent hover:text-igc-accent-dark underline"
                >
                  {settingsOpen ? 'Hide settings' : 'Change URL'}
                </button>
              </>
            ) : urlInvalid ? (
              <>⚠ Worker URL looks malformed — fix it in the setup card.</>
            ) : (
              <>⚠ Worker URL not set — see setup card above.</>
            )}
          </div>
          <button
            onClick={runDraft}
            disabled={loading || scope.trim().length < 10 || !activeHost}
            className="px-5 py-2 bg-igc-accent hover:bg-igc-accent-dark text-white rounded-md text-sm font-medium transition-colors disabled:bg-igc-line disabled:text-igc-muted disabled:cursor-not-allowed"
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
              <span className="text-igc-accent font-semibold">{accepted.size} accepted</span> ·{' '}
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
        accepted ? 'border-emerald-300 bg-emerald-50/40' : 'border-igc-line hover:border-igc-accent/40'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${TRADE_BADGE[item.trade]}`}>
            {TRADE_LABEL[item.trade]}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border inline-flex items-center gap-1 ${conf.chip}`}>
            <conf.Icon size={11} strokeWidth={2} />
            {conf.label}
          </span>
          {item.catalogChoice && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-igc-accent-light text-igc-accent dark:text-blue-300 font-medium">
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

      <div className="border-l-2 border-igc-accent/30 pl-3 py-1 my-3">
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
              className="px-4 py-1.5 text-xs bg-igc-accent hover:bg-igc-accent-dark text-white rounded-md font-medium"
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
  urlInvalid,
  onClose,
}: {
  override: string
  setOverride: (s: string) => void
  envUrl: string
  urlInvalid?: boolean
  onClose?: () => void
}) {
  const [draft, setDraft] = useState(override)
  function save() {
    const trimmed = draft.trim()
    if (!trimmed) return
    try {
      // Validate before persisting so a typo does not break the panel.
      new URL(trimmed)
    } catch {
      setOverride(trimmed) // keep user input so they can fix it
      return
    }
    setOverride(trimmed)
  }
  const heading = urlInvalid ? 'Fix the worker URL' : 'Setup required'
  return (
    <section className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-200 mb-1">
            {heading}
          </h2>
          <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
            M4 uses a Cloudflare Worker that holds the Anthropic API key server-side. Follow{' '}
            <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">worker/README.md</code> to deploy
            (~5 min, free tier), then paste the Worker URL below. Stored in localStorage on this browser.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-amber-900 dark:text-amber-200 hover:underline flex-shrink-0"
          >
            Close
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="url"
          placeholder="https://igc-estimator-worker.you.workers.dev"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="flex-1 min-w-[12rem] px-3 py-2 border border-amber-300 dark:border-amber-800/60 bg-igc-surface rounded-md text-sm focus:outline-none focus:border-amber-500"
        />
        <button
          onClick={save}
          disabled={!draft.trim()}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium disabled:bg-amber-200 dark:disabled:bg-amber-900/40 disabled:cursor-not-allowed"
        >
          Save URL
        </button>
        {override && (
          <button
            onClick={() => {
              setOverride('')
              setDraft('')
            }}
            className="px-3 py-2 text-xs text-amber-900 dark:text-amber-200 hover:text-amber-700 border border-amber-300 dark:border-amber-800/60 rounded-md"
          >
            Clear
          </button>
        )}
      </div>
      {envUrl && (
        <div className="text-[11px] text-amber-900/80 dark:text-amber-200/70">
          (Build-time <code>VITE_WORKER_URL</code> is set to <code>{envUrl}</code> — a value here overrides it.)
        </div>
      )}
    </section>
  )
}
