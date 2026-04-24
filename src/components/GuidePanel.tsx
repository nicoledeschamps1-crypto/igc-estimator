import {
  Blinds,
  Wallpaper,
  Palette,
  Sparkles,
  FileText,
  LayoutList,
  BookOpen,
  Map,
  Receipt,
  HelpCircle,
  Wrench,
  FileSpreadsheet,
  DollarSign,
  type LucideIcon,
} from 'lucide-react'

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
    label: 'M3 · Pipeline + saved estimates',
    status: 'done',
    summary: 'Save · reopen · duplicate · track status · forecast revenue',
    items: [
      'Save estimates with status (Draft / Sent / Accepted / Declined)',
      'Pipeline dashboard: revenue forecast, accepted total, win rate, counts',
      'Filter by status · click any row to reopen and edit',
      'Duplicate past estimates as starting templates',
      'Login + multi-user deferred — dad is the only user today',
    ],
  },
  {
    id: 'M4',
    label: 'M4 · AI draft from scope text',
    status: 'done',
    summary: 'Paste a scope · Claude drafts line items · source-cited · live on Cloudflare',
    items: [
      'AI Draft tab — paste scope, Claude drafts line items automatically',
      'Every AI suggestion cites its source quote from the scope',
      '⚠ Low / · Medium / ✓ High confidence chips on every item',
      '"Accept & add to estimate" button feeds the workspace',
      'Cloudflare Worker (worker/) holds the API key server-side',
      'Deployed to igc-estimator-worker.workers.dev',
    ],
  },
  {
    id: 'M5',
    label: 'M5 · Bluebeam integration',
    status: 'current',
    summary: 'Real measurements in, structured estimate out',
    items: [
      'Tool Chest editor — map Bluebeam tool names → trade calculator + catalog item',
      'Bluebeam CSV import — drag-and-drop, parses the standard Markups List export',
      'Auto-route each markup row into a draft line item using your Tool Chest mappings',
      'Preview screen — pick which rows to add, quick-map any unmatched tools inline',
      'Each line item carries its Bluebeam markup ID for traceback (M6 setup)',
      '⏳ Eric to share his real Tool Chest names + a sample CSV export to lock in defaults',
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
  { step: '2', label: 'Add to estimate', detail: 'Click the blue button. Switch trades and add more line items as needed.' },
  { step: '3', label: 'Fill project info', detail: 'In the Estimate tab, add the client name, address, estimate number, and any notes.' },
  { step: '4', label: 'Save to pipeline', detail: 'Hit Save to pipeline. Estimates stick around forever in the Pipeline tab — reopen, duplicate, or change status any time.' },
  { step: '5', label: 'Download PDF', detail: 'Live preview on the right shows exactly what your client will see. Hit Download PDF when you\'re ready to send, then mark the estimate as Sent.' },
]

type SectionRef = { Icon: LucideIcon; title: string; purpose: string; keyInputs: string[] }

const SECTION_REFERENCE: SectionRef[] = [
  {
    Icon: Blinds,
    title: 'Window Film',
    purpose: 'Calculates film cost per window group. Handles roll width warnings, waste, markup, tax, and complexity surcharges.',
    keyInputs: ['Quantity · width × height (inches)', 'Film type from catalog', 'Waste factor · labor rate · markup · tax', 'Complexity toggles (arched, above 10ft, exterior, hard water, old film removal)'],
  },
  {
    Icon: Wallpaper,
    title: 'Wallcovering',
    purpose: 'Calculates rolls + labor for vinyl wallcovering. Handles pattern waste, surface prep, and client-supplied material.',
    keyInputs: ['Room perimeter × height', 'Openings (doors + windows) to subtract', 'Single vs double roll + pattern waste %', 'Surface prep line items (skim coat, prime, removal)', 'Toggle: client buys material → quote labor only'],
  },
  {
    Icon: Palette,
    title: 'Mural',
    purpose: 'Calculates hand-painted mural pricing across 4 complexity tiers, with access multipliers and flexible deposit schedule.',
    keyInputs: ['Wall width × height', 'Style tier (flat → signature)', 'Access: ground / ladder / lift', 'Design fee (optional)', 'Deposit: 50/50 residential or 33/33/33 commercial'],
  },
  {
    Icon: Sparkles,
    title: 'AI Draft',
    purpose: 'Paste the client\'s scope text and Claude drafts rough line items. Every suggestion is source-cited and confidence-flagged.',
    keyInputs: ['Paste scope (email, meeting notes, RFP text)', 'Optional: load the example scope to test', 'Each drafted item shows source quote + assumptions + confidence', '"Accept & add to estimate" feeds the workspace'],
  },
  {
    Icon: FileText,
    title: 'Estimate',
    purpose: 'The central proposal builder. Combines line items from every trade, lets you add client info, saves to pipeline, exports real PDF.',
    keyInputs: ['Workspace chip shows which saved estimate is open', 'Project info (client, address, estimate #, notes)', 'Line items list with totals', 'Live PDF preview on the right · Download PDF when ready'],
  },
  {
    Icon: LayoutList,
    title: 'Pipeline',
    purpose: 'Every saved estimate with its status. Forecast revenue, track win rate, duplicate past estimates as templates.',
    keyInputs: ['Dashboard: Forecast · Accepted · Win rate · Total count', 'Status chips (Draft → Sent → Accepted / Declined)', 'Filter by status · click any row to reopen', 'Duplicate as starting template for similar jobs'],
  },
  {
    Icon: BookOpen,
    title: 'Catalog',
    purpose: 'Your default rate card. Every calculator pulls its product list from here — edit once, update everywhere.',
    keyInputs: ['Window Film: name, roll width, cost/sf', 'Wallcovering: roll type, usable sf/roll, cost/roll, pattern waste %', 'Mural: name, description, material + labor $/sf', 'Reset per-category or reset all to defaults'],
  },
]

export default function GuidePanel() {
  return (
    <div className="max-w-4xl space-y-8">
      {/* Hero */}
      <section className="bg-gradient-to-br from-igc-accent to-igc-accent-dark text-white rounded-lg p-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center">
            <Map size={26} strokeWidth={1.75} />
          </div>
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
      <section className="bg-igc-surface border border-igc-line rounded-lg p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted mb-4">How it works</h2>
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HOW_IT_WORKS.map((step) => (
            <li key={step.step} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-igc-accent-light border border-igc-accent/40 text-igc-accent dark:text-blue-300 font-semibold text-sm flex items-center justify-center">
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

      {/* Section reference — what each tab does */}
      <section className="bg-igc-surface border border-igc-line rounded-lg p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted mb-4">What each section does</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SECTION_REFERENCE.map((s) => (
            <div key={s.title} className="border border-igc-line rounded-md p-4 hover:border-igc-accent transition-colors">
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-shrink-0 w-10 h-10 rounded-md bg-igc-accent-light text-igc-accent dark:text-blue-300 flex items-center justify-center">
                  <s.Icon size={20} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-igc-ink">{s.title}</div>
                  <div className="text-xs text-igc-muted leading-relaxed mt-0.5">{s.purpose}</div>
                </div>
              </div>
              <ul className="mt-2 space-y-1 pl-1">
                {s.keyInputs.map((input, i) => (
                  <li key={i} className="text-xs text-igc-ink flex items-start gap-2">
                    <span className="text-igc-accent flex-shrink-0">·</span>
                    <span>{input}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="bg-igc-surface border border-igc-line rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted">Roadmap</h2>
          <div className="flex items-center gap-3 text-[10px] text-igc-muted uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>Shipped
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-igc-accent animate-pulse"></span>In progress
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
                        ? 'bg-igc-accent text-white animate-pulse'
                        : 'bg-igc-surface border-2 border-igc-line text-igc-muted'
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
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-igc-accent text-white uppercase tracking-wider font-medium">
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

      {/* Questions for Papi */}
      <section className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle size={16} className="text-amber-900 dark:text-amber-200" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-200">
            Questions for Papi
          </h2>
        </div>
        <p className="text-xs text-amber-900/80 dark:text-amber-200/80 mb-5">
          Answers to these let Nicole swap placeholder numbers for Eric's real values, so every quote
          comes out matching how he'd price it by hand.
        </p>

        <div className="space-y-5">
          <QuestionGroup
            Icon={FileText}
            title="Sample quotes"
            questions={[
              'Can you send 2–3 recent quotes you sent to clients (PDF or Word)? Any trade.',
              'What line items and sections do you always include? (e.g. materials, labor, access fee, deposit schedule)',
              'How do you format totals — itemized with subtotals, or one bottom-line number?',
            ]}
          />

          <QuestionGroup
            Icon={DollarSign}
            title="Rates & markup"
            questions={[
              'What are your actual per-square-foot material costs for each film / wallcovering / mural tier?',
              'What do you charge per square foot for labor — and does it change for residential vs commercial?',
              'What markup % do you apply on materials? Labor? (We currently use 35% on everything.)',
              'What sales tax % should we default to? (We have 7% FL placeholder.)',
              'When do you charge a design fee on murals — always, only on custom, or never?',
            ]}
          />

          <QuestionGroup
            Icon={Receipt}
            title="Deposits & terms"
            questions={[
              'Deposit schedule for residential? (We default 50/50.)',
              'Deposit schedule for commercial? (We default 33/33/33.)',
              'Do you add an access fee for ladders / lifts / scaffolding? If so, how much?',
              'How long are your estimates valid? (We say 30 days in the PDF footer.)',
            ]}
          />

          <QuestionGroup
            Icon={Wrench}
            title="Bluebeam Tool Chest"
            questions={[
              'What are the exact Subject names of the tools you use in Bluebeam? (e.g. "Solar Film 3M Crystalline", "Vinyl Wallcovering Type II")',
              'Which of your tools map to Window Film, Wallcovering, Mural, or something else?',
              'Do you have a preferred default waste % per tool? (10%, 15%, etc.)',
              'Do you already have a shared Tool Chest .btx file, or is each person using their own?',
            ]}
          />

          <QuestionGroup
            Icon={FileSpreadsheet}
            title="Sample Bluebeam export"
            questions={[
              'Can you send the Markups List CSV export from one recent project? (Markups List → Save → CSV)',
              'What page/sheet label convention do you use? (A-101, Level 1, Floor Plan, etc.)',
              'Do you measure in sq ft, sq in, sq meters — and is the Bluebeam scale always set before measuring?',
            ]}
          />

          <QuestionGroup
            Icon={HelpCircle}
            title="Project mix"
            questions={[
              'Roughly what split of your work is residential vs commercial?',
              'Which trade is the bulk of your revenue — film, wallcovering, or murals?',
              'Are there other trades we should add calculators for? (epoxy, decals, signage, etc.)',
            ]}
          />
        </div>
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

function QuestionGroup({ Icon, title, questions }: { Icon: LucideIcon; title: string; questions: string[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-amber-900 dark:text-amber-200" strokeWidth={1.75} />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-200">
          {title}
        </h3>
      </div>
      <ul className="space-y-1.5 pl-6 text-sm text-amber-900 dark:text-amber-200">
        {questions.map((q, idx) => (
          <li key={idx} className="list-disc marker:text-amber-900/50 dark:marker:text-amber-200/50">
            {q}
          </li>
        ))}
      </ul>
    </div>
  )
}
