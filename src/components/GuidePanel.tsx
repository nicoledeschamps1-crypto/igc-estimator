type Milestone = {
  id: string
  label: string
  status: 'done' | 'current' | 'planned'
  summary: string
  items: string[]
}

const MILESTONES: Milestone[] = [
  {
    id: 'M1',
    label: 'M1 · Film calculator',
    status: 'done',
    summary: 'Standalone film quote prototype',
    items: [
      'Glass area math (qty × width × height ÷ 144)',
      'Waste factor, labor rate, markup, tax editable per-project',
      'Complexity multipliers (arched, above 10ft, exterior, hard water, old film)',
      'Roll width warning when widest window exceeds roll',
    ],
  },
  {
    id: 'M2',
    label: 'M2 · Wallcovering + Mural + Estimate builder',
    status: 'done',
    summary: 'All 3 trade calculators + combined proposal + real PDF export',
    items: [
      'Wallcovering: perimeter × height − openings, single/double rolls, pattern waste, surface prep line items',
      'Mural: 4 style tiers, access multipliers (ladder 1.2×, lift 1.5×), design fee, deposit schedule',
      '+ Add to estimate on every calculator',
      'Real PDF download via jspdf — letterhead, color-coded line items, legal footer',
      'Live PDF preview pane (updates as you type)',
      'Brand settings: logo upload, editable company name / tagline / website',
      'Catalog editor for default product lists',
    ],
  },
  {
    id: 'M3',
    label: 'M3 · Team + pipeline',
    status: 'planned',
    summary: 'Saved estimates, login, project tracking',
    items: [
      'Save estimates to a list (Draft / Sent / Accepted / Declined)',
      'Simple email+password login for dad + sisters',
      'Pipeline dashboard: revenue forecast, win rate, last activity',
      'Duplicate + edit past estimates as templates',
    ],
  },
  {
    id: 'M4',
    label: 'M4 · AI draft from scope text',
    status: 'planned',
    summary: 'Paste a scope, AI fills the estimate',
    items: [
      'Paste client scope text → Claude drafts line items automatically',
      'Every AI suggestion cites its source (scope quote or assumption)',
      '⚠ flags on anything AI wasn\'t confident about',
      '"Accept & Edit" always the main button — AI is a starting point',
    ],
  },
  {
    id: 'M5',
    label: 'M5 · Bluebeam integration',
    status: 'planned',
    summary: 'Real measurements in, structured estimate out',
    items: [
      'Import Bluebeam Revu CSV markup export',
      'IGC Custom Tool Chest: pre-labeled measurement tools auto-route to trade calcs',
      'Each line item links back to the Bluebeam markup ID',
    ],
  },
  {
    id: 'M6',
    label: 'M6 · AI + Bluebeam combined',
    status: 'planned',
    summary: 'The magic: real measurements + AI reasoning',
    items: [
      'Scope + Bluebeam CSV → full estimate draft in seconds',
      'AI uses real scaled measurements instead of guessing from PDFs',
      'This is where Beam falls short and IGC wins',
    ],
  },
]

const HOW_IT_WORKS = [
  { step: '1', label: 'Pick a trade', detail: 'Window Film, Wallcovering, or Mural tab. Fill in the dimensions and options.' },
  { step: '2', label: 'Add to estimate', detail: 'Click the purple button. Switch trades and add more line items as needed.' },
  { step: '3', label: 'Fill project info', detail: 'In the Estimate tab, add the client name, address, estimate number, and any notes.' },
  { step: '4', label: 'Download PDF', detail: 'Live preview on the right shows exactly what your client will see. Hit Download PDF when you\'re ready to send.' },
]

export default function GuidePanel() {
  return (
    <div className="max-w-4xl space-y-8">
      {/* Hero */}
      <section className="bg-gradient-to-br from-igc-purple to-igc-purple-dark text-white rounded-lg p-8">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🗺️</div>
          <div>
            <h1 className="text-2xl font-bold mb-2">IGC Estimator — Guide</h1>
            <p className="text-sm text-white/90 leading-relaxed">
              A custom estimating tool built for IGC Studio — Beam-style UX, but with the trades you actually do
              (film · wallcovering · murals) and integration with your existing Bluebeam + AI workflow on the roadmap.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border border-igc-line rounded-lg p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted mb-4">How it works</h2>
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HOW_IT_WORKS.map((step) => (
            <li key={step.step} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-igc-purple-light border border-igc-purple/40 text-igc-purple font-semibold text-sm flex items-center justify-center">
                {step.step}
              </div>
              <div>
                <div className="font-medium text-sm text-igc-ink">{step.label}</div>
                <div className="text-xs text-igc-muted mt-0.5 leading-relaxed">{step.detail}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Roadmap */}
      <section className="bg-white border border-igc-line rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted">Roadmap</h2>
          <div className="flex items-center gap-3 text-[10px] text-igc-muted uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>Shipped
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-igc-purple animate-pulse"></span>In progress
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-igc-line border border-igc-muted/30"></span>Planned
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-[11px] top-4 bottom-4 w-px bg-igc-line"></div>
          <ul className="space-y-6">
            {MILESTONES.map((m) => (
              <li key={m.id} className="relative pl-10">
                <div
                  className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    m.status === 'done'
                      ? 'bg-emerald-500 text-white'
                      : m.status === 'current'
                        ? 'bg-igc-purple text-white animate-pulse'
                        : 'bg-white border-2 border-igc-line text-igc-muted'
                  }`}
                  title={m.status}
                >
                  {m.status === 'done' ? '✓' : m.id.replace('M', '')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-igc-ink">{m.label}</h3>
                    {m.status === 'done' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider font-medium">
                        Shipped
                      </span>
                    )}
                    {m.status === 'current' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-igc-purple text-white uppercase tracking-wider font-medium">
                        In progress
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-igc-muted mt-0.5">{m.summary}</p>
                  <ul className="mt-2 space-y-1">
                    {m.items.map((item, idx) => (
                      <li key={idx} className="text-xs text-igc-ink flex items-start gap-2">
                        <span className={m.status === 'done' ? 'text-emerald-500' : 'text-igc-muted'}>
                          {m.status === 'done' ? '✓' : '•'}
                        </span>
                        <span className={m.status === 'done' ? 'text-igc-ink' : 'text-igc-muted'}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Needed from dad */}
      <section className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-900 mb-3">Needed from dad</h2>
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <span>📄</span>
            <span>2–3 recent sample quotes (PDF or Word) — so the tool matches his format</span>
          </li>
          <li className="flex items-start gap-2">
            <span>💲</span>
            <span>Actual rate card — materials + labor by trade, so the catalog defaults are his real numbers</span>
          </li>
          <li className="flex items-start gap-2">
            <span>❓</span>
            <span>Residential vs commercial mix, standard markup %, deposit preferences</span>
          </li>
        </ul>
      </section>

      {/* Meta */}
      <section className="text-xs text-igc-muted space-y-1 pt-4 border-t border-igc-line">
        <div><strong className="text-igc-ink">Built for:</strong> IGC Studio (dad's interior design business)</div>
        <div><strong className="text-igc-ink">Built by:</strong> Nicole</div>
        <div><strong className="text-igc-ink">Repo:</strong> github.com/nicoledeschamps1-crypto/igc-estimator</div>
        <div><strong className="text-igc-ink">Reference:</strong> Beam (trybeam.com) — with IGC's actual trade calculators + Bluebeam integration</div>
      </section>
    </div>
  )
}
