import { useEffect, useState } from 'react'
import { Sun, Moon, Compass } from 'lucide-react'
import FilmCalculator from './components/FilmCalculator'
import WallcoveringCalculator from './components/WallcoveringCalculator'
import MuralCalculator from './components/MuralCalculator'
import EstimatePanel from './components/EstimatePanel'
import PipelinePanel from './components/PipelinePanel'
import AIDraftPanel from './components/AIDraftPanel'
import BluebeamImport from './components/BluebeamImport'
import CatalogEditor from './components/CatalogEditor'
import ToolChestEditor from './components/ToolChestEditor'
import GuidePanel from './components/GuidePanel'
import OnboardingTour, { hasBeenOnboarded } from './components/OnboardingTour'
import { EstimateProvider, useEstimate } from './estimate/EstimateContext'
import { CatalogProvider } from './catalog/CatalogContext'
import { ToolChestProvider } from './toolchest/ToolChestContext'
import { ThemeProvider, useTheme } from './theme/ThemeContext'

type Tab =
  | 'film'
  | 'wallcovering'
  | 'mural'
  | 'ai'
  | 'bluebeam'
  | 'estimate'
  | 'pipeline'
  | 'catalog'
  | 'toolchest'
  | 'guide'

const TABS: Array<{ id: Tab; label: string; sublabel: string; group: 'trades' | 'ai' | 'pipeline' | 'settings' }> = [
  { id: 'film', label: 'Window Film', sublabel: 'Privacy · solar · security · decorative', group: 'trades' },
  { id: 'wallcovering', label: 'Wallcovering', sublabel: 'Commercial vinyl · patterned · custom', group: 'trades' },
  { id: 'mural', label: 'Mural', sublabel: 'Hand-painted · branded · signature', group: 'trades' },
  { id: 'ai', label: 'AI Draft', sublabel: 'Paste a scope · Claude drafts line items', group: 'ai' },
  { id: 'bluebeam', label: 'Bluebeam', sublabel: 'Import CSV markups · auto-route to trades', group: 'ai' },
  { id: 'estimate', label: 'Estimate', sublabel: 'Combined proposal · PDF export', group: 'trades' },
  { id: 'pipeline', label: 'Pipeline', sublabel: 'Saved estimates · revenue forecast', group: 'pipeline' },
  { id: 'catalog', label: 'Catalog', sublabel: 'Edit default rates + products', group: 'settings' },
  { id: 'toolchest', label: 'Tool Chest', sublabel: 'Map Bluebeam tools → trade calculators', group: 'settings' },
  { id: 'guide', label: 'Guide', sublabel: 'How it works · roadmap', group: 'settings' },
]

export default function App() {
  return (
    <ThemeProvider>
      <CatalogProvider>
        <ToolChestProvider>
          <EstimateProvider>
            <AppShell />
          </EstimateProvider>
        </ToolChestProvider>
      </CatalogProvider>
    </ThemeProvider>
  )
}

function AppShell() {
  const [tab, setTab] = useState<Tab>('film')
  const active = TABS.find((t) => t.id === tab)!
  const [tourOpen, setTourOpen] = useState(false)

  useEffect(() => {
    if (!hasBeenOnboarded()) {
      const t = setTimeout(() => setTourOpen(true), 400)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <div className="min-h-screen">
      <header className="border-b border-igc-line bg-igc-surface">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <HeaderLogo />
            <div>
              <div className="text-sm font-semibold text-igc-ink">IGC Estimator</div>
              <div className="text-xs text-igc-muted">{active.sublabel}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTourOpen(true)}
              className="px-3 py-1.5 text-xs border border-igc-line rounded-md text-igc-muted hover:text-igc-ink hover:border-igc-accent inline-flex items-center gap-1.5"
              title="Replay the onboarding tour"
            >
              <Compass size={14} strokeWidth={1.75} />
              <span className="hidden sm:inline">Tour</span>
            </button>
            <ThemeToggle />
            <div className="text-xs text-igc-muted">v0.8 · prototype</div>
          </div>
        </div>

        <nav className="max-w-7xl mx-auto px-6">
          <div className="flex items-end gap-1 -mb-px overflow-x-auto">
            {TABS.map((t, i) => {
              const isActive = t.id === tab
              const prev = TABS[i - 1]
              const needsDivider = prev && prev.group !== t.group
              return (
                <div key={t.id} className="flex items-end flex-shrink-0">
                  {needsDivider && <span className="mx-2 mb-3 w-px h-4 bg-igc-line" aria-hidden />}
                  <button
                    onClick={() => setTab(t.id)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                      isActive
                        ? 'border-igc-accent text-igc-accent'
                        : 'border-transparent text-igc-muted hover:text-igc-ink'
                    }`}
                  >
                    {t.label}
                    {t.id === 'estimate' && <EstimateBadge />}
                    {t.id === 'pipeline' && <PipelineBadge />}
                  </button>
                </div>
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
        <div hidden={tab !== 'ai'}>
          <AIDraftPanel />
        </div>
        <div hidden={tab !== 'bluebeam'}>
          <BluebeamImport onOpenToolChest={() => setTab('toolchest')} />
        </div>
        <div hidden={tab !== 'estimate'}>
          <EstimatePanel />
        </div>
        <div hidden={tab !== 'pipeline'}>
          <PipelinePanel onOpenEstimate={() => setTab('estimate')} />
        </div>
        <div hidden={tab !== 'catalog'}>
          <CatalogEditor />
        </div>
        <div hidden={tab !== 'toolchest'}>
          <ToolChestEditor />
        </div>
        <div hidden={tab !== 'guide'}>
          <GuidePanel />
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-8 text-xs text-igc-muted">
        <p>
          Prototype — rates and waste factors are editable defaults, not final pricing. Replace with your catalog once
          dad reviews.
        </p>
      </footer>

      <OnboardingTour
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        onNavigate={(tabId) => setTab(tabId as Tab)}
      />
    </div>
  )
}

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      className="px-3 py-1.5 text-xs border border-igc-line rounded-md text-igc-muted hover:text-igc-ink hover:border-igc-accent flex items-center gap-1.5"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun size={14} strokeWidth={1.75} /> : <Moon size={14} strokeWidth={1.75} />}
      <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  )
}

function HeaderLogo() {
  const { brand } = useEstimate()
  if (brand.logoDataUrl) {
    return (
      <img
        src={brand.logoDataUrl}
        alt={brand.companyName}
        className="w-8 h-8 object-contain rounded-md bg-igc-surface dark:bg-white border border-igc-line"
      />
    )
  }
  return (
    <div className="w-8 h-8 rounded-md bg-igc-accent flex items-center justify-center text-white font-bold text-sm">
      IGC
    </div>
  )
}

function EstimateBadge() {
  const { quotes } = useEstimate()
  if (quotes.length === 0) return null
  return (
    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-igc-accent text-white text-[10px] font-semibold">
      {quotes.length}
    </span>
  )
}

function PipelineBadge() {
  const { savedEstimates } = useEstimate()
  if (savedEstimates.length === 0) return null
  return (
    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-igc-accent-light text-igc-accent dark:text-blue-300 text-[10px] font-semibold">
      {savedEstimates.length}
    </span>
  )
}
