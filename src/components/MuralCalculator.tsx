import { useMemo, useState } from 'react'
import { useEstimate } from '../estimate/EstimateContext'

type Wall = {
  id: string
  label: string
  widthFt: number
  heightFt: number
}

type MuralStyle = {
  id: string
  name: string
  materialPerSqFt: number
  laborPerSqFt: number
  description: string
}

type ProjectType = 'residential' | 'commercial'

const DEFAULT_STYLES: MuralStyle[] = [
  { id: 'simple-flat', name: 'Simple · flat color / geometric', materialPerSqFt: 3, laborPerSqFt: 6, description: 'Blocked shapes, low detail' },
  { id: 'standard-hand', name: 'Standard · hand-painted scene', materialPerSqFt: 5, laborPerSqFt: 12, description: 'Mid-detail, realism' },
  { id: 'detailed-custom', name: 'Detailed · custom artwork', materialPerSqFt: 8, laborPerSqFt: 20, description: 'High detail, mixed media' },
  { id: 'premium-signature', name: 'Premium · signature / branded', materialPerSqFt: 15, laborPerSqFt: 25, description: 'Flagship piece, full signage' },
]

const ACCESS_MULTIPLIERS = {
  under10: { labor: 1.0, label: 'Under 10 ft — step stool' },
  ladder: { labor: 1.2, label: '10–14 ft — ladder (+20% labor)' },
  lift: { labor: 1.5, label: 'Above 14 ft — scaffold / lift (+50% labor)' },
} as const

type AccessKey = keyof typeof ACCESS_MULTIPLIERS

function uid() {
  return Math.random().toString(36).slice(2, 9)
}
function fmtCurrency(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
function fmtNum(n: number, digits = 1) {
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

export default function MuralCalculator() {
  const { addQuote } = useEstimate()
  const [walls, setWalls] = useState<Wall[]>([
    { id: uid(), label: 'Feature wall', widthFt: 20, heightFt: 12 },
  ])
  const [styleId, setStyleId] = useState<string>(DEFAULT_STYLES[1].id)
  const [access, setAccess] = useState<AccessKey>('ladder')
  const [designFee, setDesignFee] = useState<number>(1500)
  const [markupPct, setMarkupPct] = useState<number>(35)
  const [taxPct, setTaxPct] = useState<number>(8.875)
  const [projectType, setProjectType] = useState<ProjectType>('residential')

  const style = DEFAULT_STYLES.find((s) => s.id === styleId)!
  const accessMult = ACCESS_MULTIPLIERS[access].labor

  const calc = useMemo(() => {
    const totalSqFt = walls.reduce((s, w) => s + w.widthFt * w.heightFt, 0)
    const materialCost = totalSqFt * style.materialPerSqFt
    const laborCost = totalSqFt * style.laborPerSqFt * accessMult
    const subtotal = materialCost + laborCost + designFee
    const markup = subtotal * (markupPct / 100)
    const preTax = subtotal + markup
    const tax = preTax * (taxPct / 100)
    const total = preTax + tax

    const roundCents = (n: number) => Math.round(n * 100) / 100
    const deposit = roundCents(projectType === 'residential' ? total * 0.5 : total * (1 / 3))
    const midpoint = projectType === 'commercial' ? roundCents(total * (1 / 3)) : 0
    const final = roundCents(total - deposit - midpoint)

    return {
      totalSqFt,
      materialCost,
      laborCost,
      subtotal,
      markup,
      preTax,
      tax,
      total,
      deposit,
      midpoint,
      final,
    }
  }, [walls, style, accessMult, designFee, markupPct, taxPct, projectType])

  function updateWall(id: string, patch: Partial<Wall>) {
    setWalls((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w)))
  }
  function addWall() {
    setWalls((ws) => [...ws, { id: uid(), label: '', widthFt: 10, heightFt: 8 }])
  }
  function removeWall(id: string) {
    setWalls((ws) => ws.filter((w) => w.id !== id))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
      {/* LEFT — inputs */}
      <div className="space-y-6">
        <section className="bg-white border border-igc-line rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted">Walls</h2>
            <button onClick={addWall} className="text-sm text-igc-purple hover:text-igc-purple-dark font-medium">
              + Add wall
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_100px_100px_40px] gap-2 text-xs font-medium text-igc-muted px-1">
              <div>Label</div>
              <div className="text-right">Width (ft)</div>
              <div className="text-right">Height (ft)</div>
              <div></div>
            </div>

            {walls.map((w) => (
              <div key={w.id} className="grid grid-cols-[1fr_100px_100px_40px] gap-2 items-center">
                <input
                  type="text"
                  placeholder="e.g. Feature wall"
                  value={w.label}
                  onChange={(e) => updateWall(w.id, { label: e.target.value })}
                  className="px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
                />
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={w.widthFt}
                  onChange={(e) => updateWall(w.id, { widthFt: +e.target.value || 0 })}
                  className="px-2 py-2 border border-igc-line rounded-md text-sm text-right focus:outline-none focus:border-igc-purple"
                />
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={w.heightFt}
                  onChange={(e) => updateWall(w.id, { heightFt: +e.target.value || 0 })}
                  className="px-2 py-2 border border-igc-line rounded-md text-sm text-right focus:outline-none focus:border-igc-purple"
                />
                <button
                  onClick={() => removeWall(w.id)}
                  className="text-igc-muted hover:text-red-500 text-lg"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-igc-line rounded-lg p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted mb-4">Style & complexity</h2>

          <div className="space-y-2">
            {DEFAULT_STYLES.map((s) => (
              <label
                key={s.id}
                className={`flex items-start gap-3 px-4 py-3 rounded-md border cursor-pointer text-sm ${
                  s.id === styleId
                    ? 'bg-igc-purple-light border-igc-purple'
                    : 'bg-white border-igc-line hover:border-igc-purple'
                }`}
              >
                <input
                  type="radio"
                  name="mural-style"
                  checked={s.id === styleId}
                  onChange={() => setStyleId(s.id)}
                  className="accent-igc-purple mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-medium text-igc-ink">{s.name}</div>
                  <div className="text-xs text-igc-muted mt-0.5">{s.description}</div>
                </div>
                <div className="text-right text-xs text-igc-muted font-mono">
                  ${s.materialPerSqFt}/sf mat
                  <br />
                  ${s.laborPerSqFt}/sf lbr
                </div>
              </label>
            ))}
          </div>
        </section>

        <section className="bg-white border border-igc-line rounded-lg p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted mb-4">Access / height</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {(Object.keys(ACCESS_MULTIPLIERS) as AccessKey[]).map((k) => (
              <label
                key={k}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer text-sm ${
                  access === k
                    ? 'bg-igc-purple-light border-igc-purple text-igc-ink'
                    : 'bg-white border-igc-line text-igc-ink hover:border-igc-purple'
                }`}
              >
                <input
                  type="radio"
                  name="access"
                  checked={access === k}
                  onChange={() => setAccess(k)}
                  className="accent-igc-purple"
                />
                <span>{ACCESS_MULTIPLIERS[k].label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="bg-white border border-igc-line rounded-lg p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted mb-4">Fees & finance</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-igc-ink mb-2">Design fee (flat)</label>
              <div className="flex items-center gap-1">
                <span className="text-igc-muted text-sm">$</span>
                <input
                  type="number"
                  step={100}
                  min={0}
                  value={designFee}
                  onChange={(e) => setDesignFee(+e.target.value || 0)}
                  className="flex-1 px-2 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-igc-ink mb-2">Project type</label>
              <div className="flex gap-2">
                {(['residential', 'commercial'] as ProjectType[]).map((t) => (
                  <label
                    key={t}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md border cursor-pointer text-sm capitalize ${
                      projectType === t
                        ? 'bg-igc-purple-light border-igc-purple'
                        : 'bg-white border-igc-line hover:border-igc-purple'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ptype"
                      checked={projectType === t}
                      onChange={() => setProjectType(t)}
                      className="accent-igc-purple"
                    />
                    <span>{t}</span>
                  </label>
                ))}
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
                  className="flex-1 accent-igc-purple"
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
                  className="flex-1 px-2 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
                />
                <span className="text-igc-muted text-sm">%</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* RIGHT — summary */}
      <aside className="space-y-4">
        <div className="sticky top-6 space-y-4">
          <section className="bg-white border border-igc-line rounded-lg p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted mb-4">Quote summary</h2>

            <div className="space-y-2 text-sm">
              <SummaryRow label="Mural area" value={`${fmtNum(calc.totalSqFt)} sq ft`} bold />
              {accessMult > 1 && (
                <SummaryRow label="Access multiplier" value={`×${accessMult.toFixed(2)}`} muted />
              )}
            </div>

            <div className="border-t border-igc-line mt-4 pt-4 space-y-2 text-sm">
              <SummaryRow label="Material" value={fmtCurrency(calc.materialCost)} />
              <SummaryRow label="Labor (paint)" value={fmtCurrency(calc.laborCost)} />
              <SummaryRow label="Design fee" value={fmtCurrency(designFee)} />
              <SummaryRow label="Subtotal" value={fmtCurrency(calc.subtotal)} bold />
              <SummaryRow label={`Markup (${markupPct}%)`} value={fmtCurrency(calc.markup)} muted />
              <SummaryRow label={`Tax (${taxPct}%)`} value={fmtCurrency(calc.tax)} muted />
            </div>

            <div className="border-t-2 border-igc-purple mt-4 pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-wider text-igc-muted">Total</span>
                <span className="text-2xl font-semibold text-igc-ink">{fmtCurrency(calc.total)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                const label = walls.map((w) => w.label).filter(Boolean).join(', ') || 'Mural'
                addQuote({
                  trade: 'mural',
                  title: label,
                  summary: `${fmtNum(calc.totalSqFt)} sq ft · ${style.name}`,
                  total: calc.total,
                  lineItems: [
                    { label: 'Mural area', value: `${fmtNum(calc.totalSqFt)} sq ft`, muted: true },
                    { label: 'Style', value: style.name, muted: true },
                    { label: 'Material', value: fmtCurrency(calc.materialCost) },
                    { label: 'Labor (paint)', value: fmtCurrency(calc.laborCost) },
                    { label: 'Design fee', value: fmtCurrency(designFee) },
                    { label: `Markup (${markupPct}%)`, value: fmtCurrency(calc.markup), muted: true },
                    { label: `Tax (${taxPct}%)`, value: fmtCurrency(calc.tax), muted: true },
                  ],
                })
              }}
              className="mt-4 w-full px-4 py-2.5 bg-igc-purple hover:bg-igc-purple-dark text-white rounded-md text-sm font-medium transition-colors"
            >
              + Add to estimate
            </button>
          </section>

          <section className="bg-white border border-igc-line rounded-lg p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted mb-4">Payment schedule</h2>
            <div className="space-y-2 text-sm">
              <SummaryRow
                label={projectType === 'residential' ? 'Deposit (50%)' : 'Deposit (33%)'}
                value={fmtCurrency(calc.deposit)}
              />
              {projectType === 'commercial' && (
                <SummaryRow label="Midpoint (33%)" value={fmtCurrency(calc.midpoint)} />
              )}
              <SummaryRow
                label={projectType === 'residential' ? 'Final (50%)' : 'Final (33%)'}
                value={fmtCurrency(calc.final)}
                bold
              />
            </div>
            <p className="text-xs text-igc-muted mt-3">
              Residential: 50% deposit, 50% on completion. Commercial: 33% deposit, 33% midpoint, 33% final.
            </p>
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
