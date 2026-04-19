import { useEstimate, TradeKind } from '../estimate/EstimateContext'
import { generatePdf } from '../estimate/generatePdf'

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
  const { quotes, client, setClient, removeQuote, clearQuotes, grandTotal } = useEstimate()

  function onSavePdf() {
    generatePdf(quotes, client, grandTotal)
  }

  return (
    <div className="space-y-6 estimate-print-root">
      {/* client info — editable */}
      <section className="bg-white border border-igc-line rounded-lg p-6 print:hidden">
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
              placeholder="Tribeca loft — feature wall"
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
                placeholder="123 Hudson St, New York NY"
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

      {/* PRINTABLE — this is what becomes the PDF */}
      <section className="bg-white border border-igc-line rounded-lg p-8 print:border-0 print:p-0 print:shadow-none">
        {/* Print-only letterhead */}
        <div className="hidden print:block mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl font-bold text-igc-ink">IGC Studio</div>
              <div className="text-sm text-igc-muted mt-0.5">Interior Design · Film · Wallcovering · Murals</div>
              <div className="text-xs text-igc-muted mt-1">igcstudio.com</div>
            </div>
            <div className="text-right text-xs text-igc-muted">
              <div className="font-semibold text-igc-ink text-sm">Estimate</div>
              {client.estimateNumber && <div>{client.estimateNumber}</div>}
              <div>{client.dateIso}</div>
            </div>
          </div>
          <div className="border-b-2 border-igc-purple mt-4"></div>
        </div>

        {/* Header with client info — shown on screen AND print */}
        <header className="flex items-start justify-between mb-6 pb-6 border-b border-igc-line">
          <div>
            <div className="text-xs uppercase tracking-wider text-igc-muted">Prepared for</div>
            <div className="text-lg font-semibold text-igc-ink mt-1">
              {client.clientName || <span className="text-igc-muted italic font-normal">No client yet</span>}
            </div>
            {client.projectName && (
              <div className="text-sm text-igc-muted mt-0.5">{client.projectName}</div>
            )}
            {client.address && (
              <div className="text-sm text-igc-muted mt-0.5">{client.address}</div>
            )}
          </div>
          <div className="text-right text-xs text-igc-muted print:hidden">
            <div>Estimate {client.estimateNumber || '—'}</div>
            <div>{client.dateIso}</div>
          </div>
        </header>

        {/* Line items */}
        {quotes.length === 0 ? (
          <div className="text-center py-12 text-sm text-igc-muted">
            No quotes added yet. Build a quote in Film / Wallcovering / Mural, then click{' '}
            <span className="font-medium text-igc-purple">+ Add to estimate</span>.
          </div>
        ) : (
          <div className="space-y-6">
            {quotes.map((q, i) => (
              <div key={q.id} className="border border-igc-line rounded-lg p-5 print:border-igc-line">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${TRADE_COLORS[q.trade]}`}>
                        {TRADE_LABELS[q.trade]}
                      </span>
                      <span className="text-xs text-igc-muted">Item {i + 1}</span>
                    </div>
                    <div className="font-medium text-igc-ink mt-1">{q.title}</div>
                    <div className="text-xs text-igc-muted">{q.summary}</div>
                  </div>
                  <button
                    onClick={() => removeQuote(q.id)}
                    className="text-igc-muted hover:text-red-500 text-sm print:hidden"
                    title="Remove from estimate"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-sm pl-0">
                  {q.lineItems.map((li, idx) => (
                    <div key={idx} className="flex items-baseline justify-between">
                      <span className={li.muted ? 'text-igc-muted' : 'text-igc-ink'}>{li.label}</span>
                      <span
                        className={`font-mono text-xs ${li.muted ? 'text-igc-muted' : 'text-igc-ink'}`}
                      >
                        {li.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-igc-line mt-3 pt-3 flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-igc-ink">Item total</span>
                  <span className="text-base font-semibold text-igc-ink font-mono">
                    {fmtCurrency(q.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grand total */}
        {quotes.length > 0 && (
          <div className="border-t-2 border-igc-purple mt-8 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm uppercase tracking-wider text-igc-muted">Grand total</span>
              <span className="text-3xl font-semibold text-igc-ink">{fmtCurrency(grandTotal)}</span>
            </div>
          </div>
        )}

        {/* Notes */}
        {client.notes && (
          <div className="mt-6 pt-6 border-t border-igc-line">
            <div className="text-xs uppercase tracking-wider text-igc-muted mb-2">Notes</div>
            <p className="text-sm text-igc-ink whitespace-pre-line">{client.notes}</p>
          </div>
        )}

        {/* Print-only footer */}
        <div className="hidden print:block mt-12 pt-6 border-t border-igc-line text-xs text-igc-muted">
          <p>
            This estimate is valid for 30 days from the date above. A 50% deposit is required for residential
            projects; commercial projects follow a 33/33/33 schedule. Surface prep, permits, and materials
            supplied by the client are excluded unless itemized.
          </p>
        </div>
      </section>

      {/* Actions */}
      <section className="flex items-center justify-between print:hidden">
        <div className="text-xs text-igc-muted">
          {quotes.length} {quotes.length === 1 ? 'line' : 'lines'} · {fmtCurrency(grandTotal)} total
        </div>
        <div className="flex items-center gap-2">
          {quotes.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all saved quotes? This cannot be undone.')) clearQuotes()
              }}
              className="px-4 py-2 text-sm text-igc-muted hover:text-red-500 border border-igc-line hover:border-red-300 rounded-md transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onSavePdf}
            disabled={quotes.length === 0}
            className="px-5 py-2 bg-igc-purple hover:bg-igc-purple-dark text-white rounded-md text-sm font-medium transition-colors disabled:bg-igc-line disabled:text-igc-muted disabled:cursor-not-allowed"
          >
            Download PDF
          </button>
        </div>
      </section>
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
