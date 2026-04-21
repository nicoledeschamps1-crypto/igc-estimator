import { useEstimate, TradeKind } from '../estimate/EstimateContext'
import { generatePdf } from '../estimate/generatePdf'
import PdfPreview from './PdfPreview'
import BrandSettings from './BrandSettings'

const TRADE_LABELS: Record<TradeKind, string> = {
  film: 'Window Film',
  wallcovering: 'Wallcovering',
  mural: 'Mural',
}

const TRADE_COLORS: Record<TradeKind, string> = {
  film: 'bg-blue-100 text-blue-800',
  wallcovering: 'bg-emerald-100 text-emerald-800',
  mural: 'bg-rose-100 text-rose-800',
}

function fmtCurrency(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export default function EstimatePanel() {
  const {
    quotes,
    client,
    brand,
    setClient,
    removeQuote,
    clearQuotes,
    grandTotal,
    currentEstimateId,
    savedEstimates,
    saveEstimate,
    startNewEstimate,
  } = useEstimate()

  const current = currentEstimateId ? savedEstimates.find((e) => e.id === currentEstimateId) : null

  function onSavePdf() {
    generatePdf(quotes, client, grandTotal, brand)
  }

  function onSave() {
    saveEstimate()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
      {/* LEFT — editable controls */}
      <div className="space-y-6 min-w-0">
        <section className="bg-igc-surface border border-igc-line rounded-lg p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-igc-muted font-semibold">Workspace</div>
            <div className="text-sm font-medium text-igc-ink truncate">
              {current ? (
                <>
                  Editing: {current.client.projectName || current.client.clientName || 'Untitled estimate'}
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-igc-purple-light text-igc-purple uppercase tracking-wider font-semibold align-middle">
                    {current.status}
                  </span>
                </>
              ) : (
                <span className="text-igc-muted">New estimate (not yet saved)</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {current && (
              <button
                onClick={() => {
                  if (confirm('Start a new estimate? Any unsaved changes in the workspace will be cleared.')) {
                    startNewEstimate()
                  }
                }}
                className="px-3 py-1.5 text-xs text-igc-muted hover:text-igc-ink border border-igc-line rounded-md"
              >
                Start new
              </button>
            )}
            <button
              onClick={onSave}
              disabled={quotes.length === 0}
              className="px-4 py-2 text-sm font-medium rounded-md border border-igc-purple text-igc-purple hover:bg-igc-purple hover:text-white transition-colors disabled:border-igc-line disabled:text-igc-muted disabled:hover:bg-transparent disabled:hover:text-igc-muted disabled:cursor-not-allowed"
            >
              {current ? 'Save changes' : 'Save to pipeline'}
            </button>
          </div>
        </section>

        <BrandSettings />

        <section className="bg-igc-surface border border-igc-line rounded-lg p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted mb-4">Project info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Estimate #">
              <input
                type="text"
                placeholder="IGC-2026-001"
                value={client.estimateNumber}
                onChange={(e) => setClient({ estimateNumber: e.target.value })}
                className="w-full px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={client.dateIso}
                onChange={(e) => setClient({ dateIso: e.target.value })}
                className="w-full px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
              />
            </Field>
            <Field label="Project name">
              <input
                type="text"
                placeholder="Bayfront residence — feature wall"
                value={client.projectName}
                onChange={(e) => setClient({ projectName: e.target.value })}
                className="w-full px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
              />
            </Field>
            <Field label="Client">
              <input
                type="text"
                placeholder="Jane Smith / ACME Hospitality"
                value={client.clientName}
                onChange={(e) => setClient({ clientName: e.target.value })}
                className="w-full px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Address">
                <input
                  type="text"
                  placeholder="123 Palm Ave, Tampa FL 33602"
                  value={client.address}
                  onChange={(e) => setClient({ address: e.target.value })}
                  className="w-full px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Notes">
                <textarea
                  rows={2}
                  placeholder="Scope notes, assumptions, exclusions…"
                  value={client.notes}
                  onChange={(e) => setClient({ notes: e.target.value })}
                  className="w-full px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="bg-igc-surface border border-igc-line rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted">Line items</h2>
            <div className="text-xs text-igc-muted">
              {quotes.length} {quotes.length === 1 ? 'item' : 'items'} · {fmtCurrency(grandTotal)}
            </div>
          </div>

          {quotes.length === 0 ? (
            <div className="text-center py-8 text-sm text-igc-muted">
              No quotes yet. Build a quote in <span className="font-medium text-igc-ink">Film</span>,{' '}
              <span className="font-medium text-igc-ink">Wallcovering</span>, or{' '}
              <span className="font-medium text-igc-ink">Mural</span>, then click{' '}
              <span className="font-medium text-igc-purple">+ Add to estimate</span>.
            </div>
          ) : (
            <ul className="space-y-2">
              {quotes.map((q, i) => (
                <li
                  key={q.id}
                  className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-md border border-igc-line hover:border-igc-purple transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${TRADE_COLORS[q.trade]}`}>
                        {TRADE_LABELS[q.trade]}
                      </span>
                      <span className="text-xs text-igc-muted">#{i + 1}</span>
                    </div>
                    <div className="font-medium text-sm text-igc-ink truncate">{q.title}</div>
                    <div className="text-xs text-igc-muted truncate">{q.summary}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-mono text-sm font-semibold text-igc-ink">{fmtCurrency(q.total)}</div>
                    <button
                      onClick={() => removeQuote(q.id)}
                      className="text-[11px] text-igc-muted hover:text-red-500 mt-0.5"
                      title="Remove"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {quotes.length > 0 && (
            <div className="border-t-2 border-igc-purple mt-4 pt-3 flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-wider text-igc-muted">Grand total</span>
              <span className="text-xl font-semibold text-igc-ink font-mono">{fmtCurrency(grandTotal)}</span>
            </div>
          )}
        </section>

        <section className="flex items-center justify-between">
          {quotes.length > 0 ? (
            <button
              onClick={() => {
                if (confirm('Clear all saved quotes? This cannot be undone.')) clearQuotes()
              }}
              className="px-4 py-2 text-sm text-igc-muted hover:text-red-500 border border-igc-line hover:border-red-300 rounded-md transition-colors"
            >
              Clear all
            </button>
          ) : (
            <span />
          )}
          <button
            onClick={onSavePdf}
            disabled={quotes.length === 0}
            className="px-5 py-2 bg-igc-purple hover:bg-igc-purple-dark text-white rounded-md text-sm font-medium transition-colors disabled:bg-igc-line disabled:text-igc-muted disabled:cursor-not-allowed"
          >
            Download PDF
          </button>
        </section>
      </div>

      {/* RIGHT — live PDF preview */}
      <div className="min-w-0">
        <PdfPreview />
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-igc-ink mb-1.5">{label}</label>
      {children}
    </div>
  )
}
