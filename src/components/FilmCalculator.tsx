import { useEffect, useMemo, useState } from 'react'
import { Blinds, Plus } from 'lucide-react'
import { useEstimate } from '../estimate/EstimateContext'
import { useCatalog } from '../catalog/CatalogContext'
import SectionGuide from './SectionGuide'

type Window = {
  id: string
  label: string
  qty: number
  widthIn: number
  heightIn: number
}

type ComplexityFlags = {
  archedGlass: boolean
  above10ft: boolean
  exterior: boolean
  hardWaterPrep: boolean
  oldFilmRemoval: boolean
}

const FALLBACK_FILM = { id: 'none', name: '—', rollWidthIn: 60, costPerSqFt: 0 }

const COMPLEXITY_MULTIPLIERS = {
  archedGlass: { labor: 1.4, label: 'Arched / curved glass (+40% labor)' },
  above10ft: { labor: 1.2, label: 'Above 10ft (ladder / +20% labor)' },
  exterior: { labor: 1.2, label: 'Exterior application (+20% labor)' },
  hardWaterPrep: { labor: 1.15, label: 'Hard water prep (+15% labor)' },
  oldFilmRemoval: { labor: 1.25, label: 'Old film removal (+25% labor)' },
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function fmtCurrency(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function fmtNum(n: number, digits = 1) {
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

export default function FilmCalculator() {
  const { addQuote } = useEstimate()
  const { catalog } = useCatalog()
  const films = catalog.films
  const [windows, setWindows] = useState<Window[]>([])
  const [filmId, setFilmId] = useState<string>(films[0]?.id ?? '')
  const [wastePct, setWastePct] = useState<number>(10)
  const [laborPerSqFt, setLaborPerSqFt] = useState<number>(5.0)
  const [markupPct, setMarkupPct] = useState<number>(35)
  const [taxPct, setTaxPct] = useState<number>(7)
  const [flags, setFlags] = useState<ComplexityFlags>({
    archedGlass: false,
    above10ft: false,
    exterior: false,
    hardWaterPrep: false,
    oldFilmRemoval: false,
  })

  useEffect(() => {
    if (films.length > 0 && !films.some((f) => f.id === filmId)) {
      setFilmId(films[0].id)
    }
  }, [films, filmId])

  const film = films.find((f) => f.id === filmId) ?? films[0] ?? FALLBACK_FILM

  const calc = useMemo(() => {
    const totalSqInches = windows.reduce((s, w) => s + w.qty * w.widthIn * w.heightIn, 0)
    const totalSqFt = totalSqInches / 144
    const wasteAdjustedSqFt = totalSqFt * (1 + wastePct / 100)

    const widestWindowIn = windows.reduce((m, w) => Math.max(m, w.widthIn), 0)
    const safeRollWidth = Math.max(1, film.rollWidthIn)
    const rollWidthAdequate = widestWindowIn <= safeRollWidth
    const recommendedRollFt = wasteAdjustedSqFt * (12 / safeRollWidth)

    const laborMultiplier = (Object.keys(flags) as Array<keyof ComplexityFlags>).reduce(
      (m, k) => (flags[k] ? m * COMPLEXITY_MULTIPLIERS[k].labor : m),
      1,
    )

    const materialCost = wasteAdjustedSqFt * film.costPerSqFt
    const laborCost = totalSqFt * laborPerSqFt * laborMultiplier
    const subtotal = materialCost + laborCost
    const markup = subtotal * (markupPct / 100)
    const preTax = subtotal + markup
    const tax = preTax * (taxPct / 100)
    const total = preTax + tax

    return {
      totalSqFt,
      wasteAdjustedSqFt,
      widestWindowIn,
      rollWidthAdequate,
      recommendedRollFt,
      laborMultiplier,
      materialCost,
      laborCost,
      subtotal,
      markup,
      preTax,
      tax,
      total,
    }
  }, [windows, film, wastePct, laborPerSqFt, markupPct, taxPct, flags])

  function updateWindow(id: string, patch: Partial<Window>) {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w)))
  }

  function addWindow() {
    setWindows((ws) => [...ws, { id: uid(), label: '', qty: 1, widthIn: 36, heightIn: 48 }])
  }

  function removeWindow(id: string) {
    setWindows((ws) => ws.filter((w) => w.id !== id))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
      {/* LEFT — inputs */}
      <div className="space-y-6">
        <SectionGuide
          id="film"
          Icon={Blinds}
          title="Window Film — how to quote"
          steps={[
            'Click + Add window group and enter a label (e.g. "Conference room"), quantity, and the width × height in inches.',
            'Pick a film type from your catalog. Adjust waste factor, labor rate, and markup if this job is different from the norm.',
            'Check any complexity boxes that apply (arched glass, above 10ft, exterior, etc.) — they bump labor automatically.',
            'Watch the Quote Summary total on the right. When it looks right, hit "+ Add to estimate".',
          ]}
        />

        <section className="bg-igc-surface border border-igc-line rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted">Windows</h2>
            <button
              onClick={addWindow}
              className="text-sm text-igc-accent hover:text-igc-accent-dark font-medium inline-flex items-center gap-1"
            >
              <Plus size={14} strokeWidth={2} /> Add window group
            </button>
          </div>

          {windows.length === 0 ? (
            <button
              onClick={addWindow}
              className="w-full border-2 border-dashed border-igc-line hover:border-igc-accent rounded-md py-8 text-sm text-igc-muted hover:text-igc-accent transition-colors flex flex-col items-center gap-2"
            >
              <Plus size={20} strokeWidth={1.75} />
              <span>Add your first window group</span>
              <span className="text-[11px] text-igc-muted/80">Quantity · width × height in inches</span>
            </button>
          ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_80px_90px_90px_40px] gap-2 text-xs font-medium text-igc-muted px-1">
              <div>Label</div>
              <div className="text-right">Qty</div>
              <div className="text-right">Width (in)</div>
              <div className="text-right">Height (in)</div>
              <div></div>
            </div>

            {windows.map((w) => (
              <div key={w.id} className="grid grid-cols-[1fr_80px_90px_90px_40px] gap-2 items-center">
                <input
                  type="text"
                  placeholder="e.g. Conference rm"
                  value={w.label}
                  onChange={(e) => updateWindow(w.id, { label: e.target.value })}
                  className="px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-accent"
                />
                <input
                  type="number"
                  min={1}
                  value={w.qty}
                  onChange={(e) => updateWindow(w.id, { qty: +e.target.value || 0 })}
                  className="px-2 py-2 border border-igc-line rounded-md text-sm text-right focus:outline-none focus:border-igc-accent"
                />
                <input
                  type="number"
                  min={1}
                  value={w.widthIn}
                  onChange={(e) => updateWindow(w.id, { widthIn: +e.target.value || 0 })}
                  className="px-2 py-2 border border-igc-line rounded-md text-sm text-right focus:outline-none focus:border-igc-accent"
                />
                <input
                  type="number"
                  min={1}
                  value={w.heightIn}
                  onChange={(e) => updateWindow(w.id, { heightIn: +e.target.value || 0 })}
                  className="px-2 py-2 border border-igc-line rounded-md text-sm text-right focus:outline-none focus:border-igc-accent"
                />
                <button
                  onClick={() => removeWindow(w.id)}
                  className="text-igc-muted hover:text-red-500 text-lg"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          )}
        </section>

        <section className="bg-igc-surface border border-igc-line rounded-lg p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted mb-4">Film & rates</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-igc-ink mb-2">Film type</label>
              <select
                value={filmId}
                onChange={(e) => setFilmId(e.target.value)}
                className="w-full px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-accent"
              >
                {films.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {f.rollWidthIn}" roll · ${f.costPerSqFt}/sf
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-igc-ink mb-2">Waste factor</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={30}
                    value={wastePct}
                    onChange={(e) => setWastePct(+e.target.value)}
                    className="flex-1 accent-igc-accent"
                  />
                  <span className="text-sm font-mono w-10 text-right">{wastePct}%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-igc-ink mb-2">Labor per sq ft</label>
                <div className="flex items-center gap-1">
                  <span className="text-igc-muted text-sm">$</span>
                  <input
                    type="number"
                    step={0.25}
                    value={laborPerSqFt}
                    onChange={(e) => setLaborPerSqFt(+e.target.value || 0)}
                    className="flex-1 px-2 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-igc-ink mb-2">Markup</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={markupPct}
                    onChange={(e) => setMarkupPct(+e.target.value)}
                    className="flex-1 accent-igc-accent"
                  />
                  <span className="text-sm font-mono w-10 text-right">{markupPct}%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-igc-ink mb-2">Tax</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step={0.125}
                    value={taxPct}
                    onChange={(e) => setTaxPct(+e.target.value || 0)}
                    className="flex-1 px-2 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-accent"
                  />
                  <span className="text-igc-muted text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-igc-surface border border-igc-line rounded-lg p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted mb-4">Complexity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(Object.keys(COMPLEXITY_MULTIPLIERS) as Array<keyof ComplexityFlags>).map((key) => (
              <label
                key={key}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer text-sm ${
                  flags[key]
                    ? 'bg-igc-accent-light border-igc-accent text-igc-ink'
                    : 'bg-igc-surface border-igc-line text-igc-ink hover:border-igc-accent'
                }`}
              >
                <input
                  type="checkbox"
                  checked={flags[key]}
                  onChange={(e) => setFlags((f) => ({ ...f, [key]: e.target.checked }))}
                  className="accent-igc-accent"
                />
                <span>{COMPLEXITY_MULTIPLIERS[key].label}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      {/* RIGHT — summary */}
      <aside className="space-y-4">
        <div className="sticky top-6 space-y-4">
          <section className="bg-igc-surface border border-igc-line rounded-lg p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted mb-4">Quote summary</h2>

            <div className="space-y-2 text-sm">
              <SummaryRow label="Glass area" value={`${fmtNum(calc.totalSqFt)} sq ft`} />
              <SummaryRow
                label={`Waste-adjusted (+${wastePct}%)`}
                value={`${fmtNum(calc.wasteAdjustedSqFt)} sq ft`}
              />
              <SummaryRow
                label="Film roll"
                value={`${film.rollWidthIn}" wide · ${fmtNum(calc.recommendedRollFt)} linear ft`}
              />
              {!calc.rollWidthAdequate && (
                <div className="flex items-start gap-2 text-xs text-igc-warn bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mt-2">
                  <span>⚠</span>
                  <span>
                    Widest window ({calc.widestWindowIn}") exceeds roll width ({film.rollWidthIn}"). Seams required —
                    consider wider roll or budget seam labor.
                  </span>
                </div>
              )}
              {calc.laborMultiplier > 1 && (
                <SummaryRow
                  label="Labor multiplier"
                  value={`×${calc.laborMultiplier.toFixed(2)}`}
                  muted
                />
              )}
            </div>

            <div className="border-t border-igc-line mt-4 pt-4 space-y-2 text-sm">
              <SummaryRow label="Material" value={fmtCurrency(calc.materialCost)} />
              <SummaryRow label="Labor" value={fmtCurrency(calc.laborCost)} />
              <SummaryRow label="Subtotal" value={fmtCurrency(calc.subtotal)} bold />
              <SummaryRow label={`Markup (${markupPct}%)`} value={fmtCurrency(calc.markup)} muted />
              <SummaryRow label={`Tax (${taxPct}%)`} value={fmtCurrency(calc.tax)} muted />
            </div>

            <div className="border-t-2 border-igc-accent mt-4 pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-wider text-igc-muted">Total</span>
                <span className="text-2xl font-semibold text-igc-ink">{fmtCurrency(calc.total)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                const label = windows.map((w) => w.label).filter(Boolean).join(', ') || 'Window film'
                addQuote({
                  trade: 'film',
                  title: label,
                  summary: `${fmtNum(calc.totalSqFt)} sq ft · ${film.name}`,
                  total: calc.total,
                  lineItems: [
                    { label: 'Glass area', value: `${fmtNum(calc.totalSqFt)} sq ft`, muted: true },
                    { label: 'Film', value: film.name, muted: true },
                    { label: 'Material', value: fmtCurrency(calc.materialCost) },
                    { label: 'Labor', value: fmtCurrency(calc.laborCost) },
                    { label: `Markup (${markupPct}%)`, value: fmtCurrency(calc.markup), muted: true },
                    { label: `Tax (${taxPct}%)`, value: fmtCurrency(calc.tax), muted: true },
                  ],
                })
              }}
              disabled={windows.length === 0 || calc.total <= 0}
              className="mt-4 w-full px-4 py-2.5 bg-igc-accent hover:bg-igc-accent-dark text-white rounded-md text-sm font-medium transition-colors disabled:bg-igc-line disabled:text-igc-muted disabled:cursor-not-allowed"
            >
              + Add to estimate
            </button>
          </section>
        </div>
      </aside>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  bold,
  muted,
}: {
  label: string
  value: string
  bold?: boolean
  muted?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={`${muted ? 'text-igc-muted' : 'text-igc-ink'} ${bold ? 'font-semibold' : ''}`}>{label}</span>
      <span className={`font-mono ${bold ? 'font-semibold' : ''} ${muted ? 'text-igc-muted' : 'text-igc-ink'}`}>
        {value}
      </span>
    </div>
  )
}
