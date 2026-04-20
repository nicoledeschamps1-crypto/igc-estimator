import { useCatalog } from '../catalog/CatalogContext'

export default function CatalogEditor() {
  const {
    catalog,
    updateFilm,
    addFilm,
    removeFilm,
    updateWallcovering,
    addWallcovering,
    removeWallcovering,
    updateMuralStyle,
    addMuralStyle,
    removeMuralStyle,
    resetCategory,
    resetAll,
  } = useCatalog()

  function confirmReset(scope: string, fn: () => void) {
    if (confirm(`Reset ${scope} to research defaults? Current edits will be lost.`)) fn()
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <section className="bg-igc-purple-light border border-igc-purple/30 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💰</div>
          <div>
            <h2 className="text-sm font-semibold text-igc-ink mb-1">Catalog editor</h2>
            <p className="text-xs text-igc-muted leading-relaxed">
              Edit default product types and rates used across the calculators. These are the lists that
              show up in each trade's dropdown. Change them once and every new quote picks up your values
              — labor rate, markup, and waste % are still set per-project inside each calculator.
            </p>
          </div>
        </div>
      </section>

      {/* FILMS */}
      <section className="bg-white border border-igc-line rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-igc-line">
          <div>
            <h3 className="text-sm font-semibold text-igc-ink">Window Film</h3>
            <p className="text-xs text-igc-muted mt-0.5">
              {catalog.films.length} types · shown in Window Film calculator
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addFilm}
              className="px-3 py-1.5 text-xs text-igc-purple hover:text-igc-purple-dark font-medium"
            >
              + Add film type
            </button>
            <button
              onClick={() => confirmReset('film types', () => resetCategory('films'))}
              className="px-3 py-1.5 text-xs text-igc-muted hover:text-igc-ink"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-[1fr_110px_110px_40px] gap-2 text-[10px] font-medium text-igc-muted uppercase tracking-wider px-2 pb-2">
            <div>Name</div>
            <div className="text-right">Roll width</div>
            <div className="text-right">Cost / sq ft</div>
            <div></div>
          </div>

          <div className="space-y-2">
            {catalog.films.map((f) => (
              <div key={f.id} className="grid grid-cols-[1fr_110px_110px_40px] gap-2 items-center">
                <input
                  type="text"
                  value={f.name}
                  onChange={(e) => updateFilm(f.id, { name: e.target.value })}
                  className="px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    value={f.rollWidthIn}
                    onChange={(e) => updateFilm(f.id, { rollWidthIn: +e.target.value || 0 })}
                    className="flex-1 px-2 py-2 border border-igc-line rounded-md text-sm text-right focus:outline-none focus:border-igc-purple"
                  />
                  <span className="text-xs text-igc-muted">in</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-igc-muted text-sm">$</span>
                  <input
                    type="number"
                    step={0.25}
                    min={0}
                    value={f.costPerSqFt}
                    onChange={(e) => updateFilm(f.id, { costPerSqFt: +e.target.value || 0 })}
                    className="flex-1 px-2 py-2 border border-igc-line rounded-md text-sm text-right focus:outline-none focus:border-igc-purple"
                  />
                </div>
                <button
                  onClick={() => removeFilm(f.id)}
                  className="text-igc-muted hover:text-red-500 text-lg"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WALLCOVERINGS */}
      <section className="bg-white border border-igc-line rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-igc-line">
          <div>
            <h3 className="text-sm font-semibold text-igc-ink">Wallcovering</h3>
            <p className="text-xs text-igc-muted mt-0.5">
              {catalog.wallcoverings.length} types · roll sizes, pattern waste, cost
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addWallcovering}
              className="px-3 py-1.5 text-xs text-igc-purple hover:text-igc-purple-dark font-medium"
            >
              + Add wallcovering
            </button>
            <button
              onClick={() => confirmReset('wallcoverings', () => resetCategory('wallcoverings'))}
              className="px-3 py-1.5 text-xs text-igc-muted hover:text-igc-ink"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-[1.4fr_90px_100px_110px_90px_40px] gap-2 text-[10px] font-medium text-igc-muted uppercase tracking-wider px-2 pb-2">
            <div>Name</div>
            <div>Roll type</div>
            <div className="text-right">Sf/roll</div>
            <div className="text-right">Cost/roll</div>
            <div className="text-right">Pattern %</div>
            <div></div>
          </div>

          <div className="space-y-2">
            {catalog.wallcoverings.map((w) => (
              <div key={w.id} className="grid grid-cols-[1.4fr_90px_100px_110px_90px_40px] gap-2 items-center">
                <input
                  type="text"
                  value={w.name}
                  onChange={(e) => updateWallcovering(w.id, { name: e.target.value })}
                  className="px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
                />
                <select
                  value={w.rollType}
                  onChange={(e) => updateWallcovering(w.id, { rollType: e.target.value as 'single' | 'double' })}
                  className="px-2 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
                >
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                </select>
                <input
                  type="number"
                  min={1}
                  value={w.usableSqFtPerRoll}
                  onChange={(e) => updateWallcovering(w.id, { usableSqFtPerRoll: +e.target.value || 0 })}
                  className="px-2 py-2 border border-igc-line rounded-md text-sm text-right focus:outline-none focus:border-igc-purple"
                />
                <div className="flex items-center gap-1">
                  <span className="text-igc-muted text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={w.costPerRoll}
                    onChange={(e) => updateWallcovering(w.id, { costPerRoll: +e.target.value || 0 })}
                    className="flex-1 px-2 py-2 border border-igc-line rounded-md text-sm text-right focus:outline-none focus:border-igc-purple"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={w.patternWastePct}
                    onChange={(e) => updateWallcovering(w.id, { patternWastePct: +e.target.value || 0 })}
                    className="flex-1 px-2 py-2 border border-igc-line rounded-md text-sm text-right focus:outline-none focus:border-igc-purple"
                  />
                  <span className="text-xs text-igc-muted">%</span>
                </div>
                <button
                  onClick={() => removeWallcovering(w.id)}
                  className="text-igc-muted hover:text-red-500 text-lg"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MURAL STYLES */}
      <section className="bg-white border border-igc-line rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-igc-line">
          <div>
            <h3 className="text-sm font-semibold text-igc-ink">Mural styles</h3>
            <p className="text-xs text-igc-muted mt-0.5">
              {catalog.muralStyles.length} styles · material + labor per sq ft
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addMuralStyle}
              className="px-3 py-1.5 text-xs text-igc-purple hover:text-igc-purple-dark font-medium"
            >
              + Add style
            </button>
            <button
              onClick={() => confirmReset('mural styles', () => resetCategory('muralStyles'))}
              className="px-3 py-1.5 text-xs text-igc-muted hover:text-igc-ink"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-[1.2fr_1.2fr_100px_100px_40px] gap-2 text-[10px] font-medium text-igc-muted uppercase tracking-wider px-2 pb-2">
            <div>Name</div>
            <div>Description</div>
            <div className="text-right">Material/sf</div>
            <div className="text-right">Labor/sf</div>
            <div></div>
          </div>

          <div className="space-y-2">
            {catalog.muralStyles.map((s) => (
              <div key={s.id} className="grid grid-cols-[1.2fr_1.2fr_100px_100px_40px] gap-2 items-center">
                <input
                  type="text"
                  value={s.name}
                  onChange={(e) => updateMuralStyle(s.id, { name: e.target.value })}
                  className="px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
                />
                <input
                  type="text"
                  value={s.description}
                  onChange={(e) => updateMuralStyle(s.id, { description: e.target.value })}
                  placeholder="Short description"
                  className="px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
                />
                <div className="flex items-center gap-1">
                  <span className="text-igc-muted text-sm">$</span>
                  <input
                    type="number"
                    step={0.5}
                    min={0}
                    value={s.materialPerSqFt}
                    onChange={(e) => updateMuralStyle(s.id, { materialPerSqFt: +e.target.value || 0 })}
                    className="flex-1 px-2 py-2 border border-igc-line rounded-md text-sm text-right focus:outline-none focus:border-igc-purple"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-igc-muted text-sm">$</span>
                  <input
                    type="number"
                    step={0.5}
                    min={0}
                    value={s.laborPerSqFt}
                    onChange={(e) => updateMuralStyle(s.id, { laborPerSqFt: +e.target.value || 0 })}
                    className="flex-1 px-2 py-2 border border-igc-line rounded-md text-sm text-right focus:outline-none focus:border-igc-purple"
                  />
                </div>
                <button
                  onClick={() => removeMuralStyle(s.id)}
                  className="text-igc-muted hover:text-red-500 text-lg"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-igc-muted">
          Changes save automatically. Calculators update live.
        </div>
        <button
          onClick={() => confirmReset('the entire catalog', resetAll)}
          className="text-xs text-igc-muted hover:text-red-500"
        >
          Reset everything to defaults
        </button>
      </div>
    </div>
  )
}
