import { useMemo, useState } from 'react'
import { useEstimate } from '../estimate/EstimateContext'

type Room = {
  id: string
  label: string
  perimeterFt: number
  heightFt: number
  openingsSqFt: number
}

type PrepItem = {
  id: string
  label: string
  sqFt: number
  ratePerSqFt: number
}

type WallcoveringOption = {
  id: string
  name: string
  rollType: 'single' | 'double'
  usableSqFtPerRoll: number
  costPerRoll: number
  patternWastePct: number
}

const DEFAULT_WALLCOVERINGS: WallcoveringOption[] = [
  { id: 'single-standard', name: 'Single roll · standard', rollType: 'single', usableSqFtPerRoll: 27, costPerRoll: 85, patternWastePct: 15 },
  { id: 'single-patterned', name: 'Single roll · large pattern', rollType: 'single', usableSqFtPerRoll: 25, costPerRoll: 140, patternWastePct: 25 },
  { id: 'double-commercial', name: 'Double roll · commercial 54"', rollType: 'double', usableSqFtPerRoll: 60, costPerRoll: 260, patternWastePct: 12 },
  { id: 'double-vinyl', name: 'Double roll · Type II vinyl', rollType: 'double', usableSqFtPerRoll: 56, costPerRoll: 195, patternWastePct: 10 },
]

const DEFAULT_PREP_ITEMS: Array<Omit<PrepItem, 'id'>> = [
  { label: 'Skim coat', sqFt: 0, ratePerSqFt: 2.5 },
  { label: 'Prime walls', sqFt: 0, ratePerSqFt: 0.85 },
  { label: 'Old wallpaper removal', sqFt: 0, ratePerSqFt: 2.25 },
]

function uid() {
  return Math.random().toString(36).slice(2, 9)
}
function fmtCurrency(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
function fmtNum(n: number, digits = 1) {
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

export default function WallcoveringCalculator() {
  const { addQuote } = useEstimate()
  const [rooms, setRooms] = useState<Room[]>([
    { id: uid(), label: 'Lobby', perimeterFt: 60, heightFt: 10, openingsSqFt: 40 },
  ])
  const [materialId, setMaterialId] = useState<string>(DEFAULT_WALLCOVERINGS[0].id)
  const [extraWastePct, setExtraWastePct] = useState<number>(5)
  const [laborPerSqFt, setLaborPerSqFt] = useState<number>(5.5)
  const [markupPct, setMarkupPct] = useState<number>(35)
  const [taxPct, setTaxPct] = useState<number>(8.875)
  const [prep, setPrep] = useState<PrepItem[]>(DEFAULT_PREP_ITEMS.map((p) => ({ ...p, id: uid() })))
  const [clientSuppliesMaterial, setClientSuppliesMaterial] = useState<boolean>(false)

  const material = DEFAULT_WALLCOVERINGS.find((m) => m.id === materialId)!

  const calc = useMemo(() => {
    const grossWallSqFt = rooms.reduce((s, r) => s + r.perimeterFt * r.heightFt, 0)
    const openingsSqFt = rooms.reduce((s, r) => s + r.openingsSqFt, 0)
    const netWallSqFt = Math.max(0, grossWallSqFt - openingsSqFt)
    const totalWastePct = material.patternWastePct + extraWastePct
    const wasteAdjustedSqFt = netWallSqFt * (1 + totalWastePct / 100)
    const rollsNeeded = Math.ceil(wasteAdjustedSqFt / material.usableSqFtPerRoll)

    const materialCost = clientSuppliesMaterial ? 0 : rollsNeeded * material.costPerRoll
    const laborCost = netWallSqFt * laborPerSqFt
    const prepCost = prep.reduce((s, p) => s + p.sqFt * p.ratePerSqFt, 0)

    const subtotal = materialCost + laborCost + prepCost
    const markup = subtotal * (markupPct / 100)
    const preTax = subtotal + markup
    const tax = preTax * (taxPct / 100)
    const total = preTax + tax

    return {
      grossWallSqFt,
      openingsSqFt,
      netWallSqFt,
      totalWastePct,
      wasteAdjustedSqFt,
      rollsNeeded,
      materialCost,
      laborCost,
      prepCost,
      subtotal,
      markup,
      preTax,
      tax,
      total,
    }
  }, [rooms, material, extraWastePct, laborPerSqFt, markupPct, taxPct, prep, clientSuppliesMaterial])

  function updateRoom(id: string, patch: Partial<Room>) {
    setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }
  function addRoom() {
    setRooms((rs) => [...rs, { id: uid(), label: '', perimeterFt: 40, heightFt: 9, openingsSqFt: 21 }])
  }
  function removeRoom(id: string) {
    setRooms((rs) => rs.filter((r) => r.id !== id))
  }

  function updatePrep(id: string, patch: Partial<PrepItem>) {
    setPrep((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }
  function addPrep() {
    setPrep((ps) => [...ps, { id: uid(), label: '', sqFt: 0, ratePerSqFt: 1.0 }])
  }
  function removePrep(id: string) {
    setPrep((ps) => ps.filter((p) => p.id !== id))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
      {/* LEFT — inputs */}
      <div className="space-y-6">
        <section className="bg-white border border-igc-line rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted">Rooms / walls</h2>
            <button onClick={addRoom} className="text-sm text-igc-purple hover:text-igc-purple-dark font-medium">
              + Add room
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_90px_90px_110px_40px] gap-2 text-xs font-medium text-igc-muted px-1">
              <div>Label</div>
              <div className="text-right">Perim (ft)</div>
              <div className="text-right">Height (ft)</div>
              <div className="text-right">Openings (sf)</div>
              <div></div>
            </div>

            {rooms.map((r) => (
              <div key={r.id} className="grid grid-cols-[1fr_90px_90px_110px_40px] gap-2 items-center">
                <input
                  type="text"
                  placeholder="e.g. Lobby"
                  value={r.label}
                  onChange={(e) => updateRoom(r.id, { label: e.target.value })}
                  className="px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
                />
                <input
                  type="number"
                  min={0}
                  value={r.perimeterFt}
                  onChange={(e) => updateRoom(r.id, { perimeterFt: +e.target.value || 0 })}
                  className="px-2 py-2 border border-igc-line rounded-md text-sm text-right focus:outline-none focus:border-igc-purple"
                />
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={r.heightFt}
                  onChange={(e) => updateRoom(r.id, { heightFt: +e.target.value || 0 })}
                  className="px-2 py-2 border border-igc-line rounded-md text-sm text-right focus:outline-none focus:border-igc-purple"
                />
                <input
                  type="number"
                  min={0}
                  value={r.openingsSqFt}
                  onChange={(e) => updateRoom(r.id, { openingsSqFt: +e.target.value || 0 })}
                  className="px-2 py-2 border border-igc-line rounded-md text-sm text-right focus:outline-none focus:border-igc-purple"
                />
                <button
                  onClick={() => removeRoom(r.id)}
                  className="text-igc-muted hover:text-red-500 text-lg"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <p className="text-xs text-igc-muted mt-3">
            Openings = total sq ft of doors + windows subtracted from wall area (a 3×7 door = 21, a 4×5 window = 20).
          </p>
        </section>

        <section className="bg-white border border-igc-line rounded-lg p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted mb-4">Material & rates</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-igc-ink mb-2">Wallcovering type</label>
              <select
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                className="w-full px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
              >
                {DEFAULT_WALLCOVERINGS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.usableSqFtPerRoll} sf/roll · ${m.costPerRoll} · {m.patternWastePct}% pattern waste
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={clientSuppliesMaterial}
                onChange={(e) => setClientSuppliesMaterial(e.target.checked)}
                className="accent-igc-purple"
              />
              <span>Client supplies material (labor + prep only)</span>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-igc-ink mb-2">Extra waste</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={extraWastePct}
                    onChange={(e) => setExtraWastePct(+e.target.value)}
                    className="flex-1 accent-igc-purple"
                  />
                  <span className="text-sm font-mono w-10 text-right">{extraWastePct}%</span>
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
                    className="flex-1 px-2 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
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
          </div>
        </section>

        <section className="bg-white border border-igc-line rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted">Surface prep</h2>
            <button onClick={addPrep} className="text-sm text-igc-purple hover:text-igc-purple-dark font-medium">
              + Add prep line
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_90px_110px_40px] gap-2 text-xs font-medium text-igc-muted px-1">
              <div>Line item</div>
              <div className="text-right">Sq ft</div>
              <div className="text-right">Rate / sf</div>
              <div></div>
            </div>

            {prep.map((p) => (
              <div key={p.id} className="grid grid-cols-[1fr_90px_110px_40px] gap-2 items-center">
                <input
                  type="text"
                  placeholder="e.g. Skim coat"
                  value={p.label}
                  onChange={(e) => updatePrep(p.id, { label: e.target.value })}
                  className="px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-purple"
                />
                <input
                  type="number"
                  min={0}
                  value={p.sqFt}
                  onChange={(e) => updatePrep(p.id, { sqFt: +e.target.value || 0 })}
                  className="px-2 py-2 border border-igc-line rounded-md text-sm text-right focus:outline-none focus:border-igc-purple"
                />
                <div className="flex items-center gap-1">
                  <span className="text-igc-muted text-sm">$</span>
                  <input
                    type="number"
                    step={0.25}
                    value={p.ratePerSqFt}
                    onChange={(e) => updatePrep(p.id, { ratePerSqFt: +e.target.value || 0 })}
                    className="flex-1 px-2 py-2 border border-igc-line rounded-md text-sm text-right focus:outline-none focus:border-igc-purple"
                  />
                </div>
                <button
                  onClick={() => removePrep(p.id)}
                  className="text-igc-muted hover:text-red-500 text-lg"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <p className="text-xs text-igc-muted mt-3">
            Prep should always be a separate line — never baked into hang rate. Leave sf at 0 to skip.
          </p>
        </section>
      </div>

      {/* RIGHT — summary */}
      <aside className="space-y-4">
        <div className="sticky top-6 space-y-4">
          <section className="bg-white border border-igc-line rounded-lg p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-igc-muted mb-4">Quote summary</h2>

            <div className="space-y-2 text-sm">
              <SummaryRow label="Gross wall area" value={`${fmtNum(calc.grossWallSqFt)} sq ft`} />
              <SummaryRow label="Openings deducted" value={`−${fmtNum(calc.openingsSqFt)} sq ft`} muted />
              <SummaryRow label="Net wall area" value={`${fmtNum(calc.netWallSqFt)} sq ft`} bold />
              <SummaryRow
                label={`Waste-adjusted (+${calc.totalWastePct}%)`}
                value={`${fmtNum(calc.wasteAdjustedSqFt)} sq ft`}
                muted
              />
              <SummaryRow
                label="Rolls needed"
                value={`${calc.rollsNeeded} × ${material.rollType === 'double' ? 'double' : 'single'}`}
              />
            </div>

            <div className="border-t border-igc-line mt-4 pt-4 space-y-2 text-sm">
              <SummaryRow
                label={clientSuppliesMaterial ? 'Material (client supplied)' : 'Material'}
                value={fmtCurrency(calc.materialCost)}
                muted={clientSuppliesMaterial}
              />
              <SummaryRow label="Labor (hang)" value={fmtCurrency(calc.laborCost)} />
              <SummaryRow label="Surface prep" value={fmtCurrency(calc.prepCost)} />
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
                const label = rooms.map((r) => r.label).filter(Boolean).join(', ') || 'Wallcovering'
                addQuote({
                  trade: 'wallcovering',
                  title: label,
                  summary: `${fmtNum(calc.netWallSqFt)} sq ft · ${material.name}`,
                  total: calc.total,
                  lineItems: [
                    { label: 'Net wall area', value: `${fmtNum(calc.netWallSqFt)} sq ft`, muted: true },
                    { label: 'Rolls needed', value: `${calc.rollsNeeded} × ${material.rollType}`, muted: true },
                    {
                      label: clientSuppliesMaterial ? 'Material (client supplied)' : 'Material',
                      value: fmtCurrency(calc.materialCost),
                    },
                    { label: 'Labor (hang)', value: fmtCurrency(calc.laborCost) },
                    { label: 'Surface prep', value: fmtCurrency(calc.prepCost) },
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
