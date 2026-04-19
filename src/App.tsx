import FilmCalculator from './components/FilmCalculator'

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-igc-line bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-igc-purple flex items-center justify-center text-white font-bold text-sm">
              IGC
            </div>
            <div>
              <div className="text-sm font-semibold text-igc-ink">IGC Estimator</div>
              <div className="text-xs text-igc-muted">Window Film Calculator</div>
            </div>
          </div>
          <div className="text-xs text-igc-muted">v0.1 · prototype</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <FilmCalculator />
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-8 text-xs text-igc-muted">
        <p>
          Prototype — rates and waste factors are editable defaults, not your final pricing. Add your real catalog once
          dad reviews.
        </p>
      </footer>
    </div>
  )
}
