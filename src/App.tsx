import { useState } from 'react'
import FilmCalculator from './components/FilmCalculator'
import WallcoveringCalculator from './components/WallcoveringCalculator'
import MuralCalculator from './components/MuralCalculator'
import EstimatePanel from './components/EstimatePanel'
import { EstimateProvider, useEstimate } from './estimate/EstimateContext'

type Tab = 'film' | 'wallcovering' | 'mural' | 'estimate'

const TABS: Array<{ id: Tab; label: string; sublabel: string }> = [
  { id: 'film', label: 'Window Film', sublabel: 'Privacy · solar · security · decorative' },
  { id: 'wallcovering', label: 'Wallcovering', sublabel: 'Commercial vinyl · patterned · custom' },
  { id: 'mural', label: 'Mural', sublabel: 'Hand-painted · branded · signature' },
  { id: 'estimate', label: 'Estimate', sublabel: 'Combined proposal · PDF export' },
]

export default function App() {
  return (
    <EstimateProvider>
      <AppShell />
    </EstimateProvider>
  )
}

function AppShell() {
  const [tab, setTab] = useState<Tab>('film')
  const active = TABS.find((t) => t.id === tab)!

  return (
    <div className="min-h-screen">
      <header className="border-b border-igc-line bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-igc-purple flex items-center justify-center text-white font-bold text-sm">
              IGC
            </div>
            <div>
              <div className="text-sm font-semibold text-igc-ink">IGC Estimator</div>
              <div className="text-xs text-igc-muted">{active.sublabel}</div>
            </div>
          </div>
          <div className="text-xs text-igc-muted">v0.3 · prototype</div>
        </div>

        <nav className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 -mb-px">
            {TABS.map((t) => {
              const isActive = t.id === tab
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    isActive
                      ? 'border-igc-purple text-igc-purple'
                      : 'border-transparent text-igc-muted hover:text-igc-ink'
                  }`}
                >
                  {t.label}
                  {t.id === 'estimate' && <EstimateBadge />}
                </button>
              )
            })}
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div hidden={tab !== 'film'}>
          <FilmCalculator />
        </div>
        <div hidden={tab !== 'wallcovering'}>
          <WallcoveringCalculator />
        </div>
        <div hidden={tab !== 'mural'}>
          <MuralCalculator />
        </div>
        <div hidden={tab !== 'estimate'}>
          <EstimatePanel />
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-8 text-xs text-igc-muted">
        <p>
          Prototype — rates and waste factors are editable defaults, not final pricing. Replace with your catalog once
          dad reviews.
        </p>
      </footer>
    </div>
  )
}

function EstimateBadge() {
  const { quotes } = useEstimate()
  if (quotes.length === 0) return null
  return (
    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-igc-purple text-white text-[10px] font-semibold">
      {quotes.length}
    </span>
  )
}
