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
          <div className="grid grid-cols-[minmax(0,1fr)_140px_160px_32px] gap-4 text-[10px] font-medium text-igc-muted uppercase tracking-wider px-3 pb-2">
            <div>Name</div>
            <div>Roll width</div>
            <div>Cost / sq ft</div>
            <div></div>
          </div>

          <div className="space-y-2">
            {catalog.films.map((f) => (
              <div key={f.id} className="grid grid-cols-[minmax(0,1fr)_140px_160px_32px] gap-4 items-center">
                <input
                  type="text"
                  value={f.name}
                  onChange={(e) => updateFilm(f.id, { name: e.target.value })}
                  className="min-w-0 px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
                />
                <UnitInput
                  unit="in"
                  min={1}
                  value={f.rollWidthIn}
                  onChange={(v) => updateFilm(f.id, { rollWidthIn: v })}
                />
                <MoneyInput
                  step={0.25}
                  value={f.costPerSqFt}
                  onChange={(v) => updateFilm(f.id, { costPerSqFt: v })}
                />
                <button
                  onClick={() => removeFilm(f.id)}
                  disabled={catalog.films.length <= 1}
                  className="text-igc-muted hover:text-red-500 text-lg leading-none disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-igc-muted"
                  title={catalog.films.length <= 1 ? 'At least one film type is required' : 'Remove'}
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
          <div className="grid grid-cols-[minmax(0,1.4fr)_100px_110px_140px_120px_32px] gap-4 text-[10px] font-medium text-igc-muted uppercase tracking-wider px-3 pb-2">
            <div>Name</div>
            <div>Roll type</div>
            <div>Sf / roll</div>
            <div>Cost / roll</div>
            <div>Pattern waste</div>
            <div></div>
          </div>

          <div className="space-y-2">
            {catalog.wallcoverings.map((w) => (
              <div
                key={w.id}
                className="grid grid-cols-[minmax(0,1.4fr)_100px_110px_140px_120px_32px] gap-4 items-center"
              >
                <input
                  type="text"
                  value={w.name}
                  onChange={(e) => updateWallcovering(w.id, { name: e.target.value })}
                  className="min-w-0 px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
                />
                <select
                  value={w.rollType}
                  onChange={(e) => updateWallcovering(w.id, { rollType: e.target.value as 'single' | 'double' })}
                  className="min-w-0 px-2 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
                >
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                </select>
                <NumberInput
                  min={1}
                  value={w.usableSqFtPerRoll}
                  onChange={(v) => updateWallcovering(w.id, { usableSqFtPerRoll: v })}
                />
                <MoneyInput
                  step={5}
                  value={w.costPerRoll}
                  onChange={(v) => updateWallcovering(w.id, { costPerRoll: v })}
                />
                <UnitInput
                  unit="%"
                  min={0}
                  max={50}
                  value={w.patternWastePct}
                  onChange={(v) => updateWallcovering(w.id, { patternWastePct: v })}
                />
                <button
                  onClick={() => removeWallcovering(w.id)}
                  disabled={catalog.wallcoverings.length <= 1}
                  className="text-igc-muted hover:text-red-500 text-lg leading-none disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-igc-muted"
                  title={catalog.wallcoverings.length <= 1 ? 'At least one wallcovering is required' : 'Remove'}
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
          <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_140px_140px_32px] gap-4 text-[10px] font-medium text-igc-muted uppercase tracking-wider px-3 pb-2">
            <div>Name</div>
            <div>Description</div>
            <div>Material / sf</div>
            <div>Labor / sf</div>
            <div></div>
          </div>

          <div className="space-y-2">
            {catalog.muralStyles.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_140px_140px_32px] gap-4 items-center"
              >
                <input
                  type="text"
                  value={s.name}
                  onChange={(e) => updateMuralStyle(s.id, { name: e.target.value })}
                  className="min-w-0 px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
                />
                <input
                  type="text"
                  value={s.description}
                  onChange={(e) => updateMuralStyle(s.id, { description: e.target.value })}
                  placeholder="Short description"
                  className="min-w-0 px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
                />
                <MoneyInput
                  step={0.5}
                  value={s.materialPerSqFt}
                  onChange={(v) => updateMuralStyle(s.id, { materialPerSqFt: v })}
                />
                <MoneyInput
                  step={0.5}
                  value={s.laborPerSqFt}
                  onChange={(v) => updateMuralStyle(s.id, { laborPerSqFt: v })}
                />
                <button
                  onClick={() => removeMuralStyle(s.id)}
                  disabled={catalog.muralStyles.length <= 1}
                  className="text-igc-muted hover:text-red-500 text-lg leading-none disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-igc-muted"
                  title={catalog.muralStyles.length <= 1 ? 'At least one mural style is required' : 'Remove'}
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

type NumberFieldProps = {
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  max?: number
}

function NumberInput({ value, onChange, step = 1, min = 0, max }: NumberFieldProps) {
  return (
    <input
      type="number"
      step={step}
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(+e.target.value || 0)}
      className="w-full min-w-0 px-3 py-2 border border-igc-line rounded-md text-sm text-right tabular-nums focus:outline-none focus:border-igc-purple"
    />
  )
}

function MoneyInput({ value, onChange, step = 0.25 }: NumberFieldProps) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-igc-muted text-sm pointer-events-none">$</span>
      <input
        type="number"
        step={step}
        min={0}
        value={value}
        onChange={(e) => onChange(+e.target.value || 0)}
        className="w-full min-w-0 pl-7 pr-3 py-2 border border-igc-line rounded-md text-sm text-right tabular-nums focus:outline-none focus:border-igc-purple"
      />
    </div>
  )
}

function UnitInput({
  value,
  onChange,
  unit,
  step = 1,
  min = 0,
  max,
}: NumberFieldProps & { unit: string }) {
  return (
    <div className="relative">
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value || 0)}
        className="w-full min-w-0 pl-3 pr-9 py-2 border border-igc-line rounded-md text-sm text-right tabular-nums focus:outline-none focus:border-igc-purple"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-igc-muted pointer-events-none">
        {unit}
      </span>
    </div>
  )
}
