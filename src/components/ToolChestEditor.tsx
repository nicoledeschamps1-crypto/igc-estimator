import { Wrench, X } from 'lucide-react'
import { useToolChest } from '../toolchest/ToolChestContext'
import { useCatalog } from '../catalog/CatalogContext'
import type { TradeKind } from '../estimate/EstimateContext'
import type { ToolMapping } from '../toolchest/ToolChestContext'

const TRADE_LABEL: Record<TradeKind, string> = {
  film: 'Window Film',
  wallcovering: 'Wallcovering',
  mural: 'Mural',
}

const STARTER_MAPPINGS: Array<Partial<ToolMapping>> = [
  { pattern: 'Window Film', matchType: 'contains', trade: 'film', wastePct: 10, laborPerSqFt: 4 },
  { pattern: 'Solar Film', matchType: 'contains', trade: 'film', wastePct: 10, laborPerSqFt: 4 },
  { pattern: 'Privacy Film', matchType: 'contains', trade: 'film', wastePct: 12, laborPerSqFt: 5 },
  { pattern: 'Vinyl Wallcovering', matchType: 'contains', trade: 'wallcovering', wastePct: 15, laborPerSqFt: 3 },
  { pattern: 'Wallpaper', matchType: 'contains', trade: 'wallcovering', wastePct: 15, laborPerSqFt: 3 },
  { pattern: 'Mural', matchType: 'contains', trade: 'mural' },
  { pattern: 'Hand-Painted', matchType: 'contains', trade: 'mural' },
]

export default function ToolChestEditor() {
  const { mappings, addMapping, updateMapping, removeMapping, resetAll } = useToolChest()
  const { catalog } = useCatalog()

  function loadStarters() {
    if (mappings.length > 0) {
      if (!confirm('This will add 7 starter mappings on top of your current ones. Continue?')) return
    }
    STARTER_MAPPINGS.forEach((s) => addMapping(s))
  }

  function confirmReset() {
    if (confirm('Clear all tool mappings? This cannot be undone.')) resetAll()
  }

  function catalogOptions(trade: TradeKind) {
    if (trade === 'film') return catalog.films.map((f) => ({ id: f.id, name: f.name }))
    if (trade === 'wallcovering') return catalog.wallcoverings.map((w) => ({ id: w.id, name: w.name }))
    return catalog.muralStyles.map((m) => ({ id: m.id, name: m.name }))
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <section className="bg-igc-accent-light border border-igc-accent/30 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <Wrench className="text-igc-accent dark:text-blue-300 mt-0.5 flex-shrink-0" size={20} strokeWidth={1.75} />
          <div>
            <h2 className="text-sm font-semibold text-igc-ink mb-1">Bluebeam Tool Chest mappings</h2>
            <p className="text-xs text-igc-muted leading-relaxed">
              Map the tools in Eric's Bluebeam Tool Chest to a trade calculator + catalog item. When a
              Bluebeam CSV markup gets imported, the row's "Subject" is matched against these patterns
              to auto-route the measurement into a draft line item.
            </p>
            <p className="text-xs text-igc-muted leading-relaxed mt-2">
              <strong className="text-igc-ink">Match type:</strong> "exact" matches the full Subject
              string, "contains" matches if the Subject includes the pattern (case-insensitive). Exact
              wins over contains when both apply.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-igc-surface border border-igc-line rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-igc-line flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-igc-ink">Tool mappings</h3>
            <p className="text-xs text-igc-muted mt-0.5">
              {mappings.length} {mappings.length === 1 ? 'mapping' : 'mappings'} ·{' '}
              {mappings.length === 0 ? 'empty — click below to add a starter set' : 'used by Bluebeam CSV import'}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => addMapping()}
              className="px-3 py-1.5 text-xs text-igc-accent hover:text-igc-accent-dark font-medium"
            >
              + Add mapping
            </button>
            <button
              onClick={loadStarters}
              className="px-3 py-1.5 text-xs text-igc-accent hover:text-igc-accent-dark font-medium"
            >
              Load starter mappings
            </button>
            {mappings.length > 0 && (
              <button
                onClick={confirmReset}
                className="px-3 py-1.5 text-xs text-igc-muted hover:text-igc-ink"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {mappings.length === 0 ? (
          <div className="p-8 text-center">
            <Wrench className="mx-auto text-igc-muted/50 mb-3" size={32} strokeWidth={1.5} />
            <p className="text-sm text-igc-muted">
              No tool mappings yet. Click <strong className="text-igc-ink">Load starter mappings</strong> to
              get a sample set going, or add them one-by-one as Eric shares his Tool Chest names.
            </p>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-[minmax(0,2fr)_110px_140px_minmax(0,1.5fr)_90px_110px_32px] gap-3 text-[10px] font-medium text-igc-muted uppercase tracking-wider px-3 pb-2">
              <div>Subject pattern</div>
              <div>Match</div>
              <div>Trade</div>
              <div>Catalog item</div>
              <div>Waste %</div>
              <div>Labor $/sf</div>
              <div></div>
            </div>

            <div className="space-y-2">
              {mappings.map((m) => {
                const opts = catalogOptions(m.trade)
                const selectedExists = m.catalogId && opts.some((o) => o.id === m.catalogId)
                return (
                  <div
                    key={m.id}
                    className="grid grid-cols-[minmax(0,2fr)_110px_140px_minmax(0,1.5fr)_90px_110px_32px] gap-3 items-center"
                  >
                    <input
                      type="text"
                      value={m.pattern}
                      placeholder='e.g. "Solar Film 3M"'
                      onChange={(e) => updateMapping(m.id, { pattern: e.target.value })}
                      className="min-w-0 px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-accent"
                    />

                    <select
                      value={m.matchType}
                      onChange={(e) => updateMapping(m.id, { matchType: e.target.value as 'exact' | 'contains' })}
                      className="min-w-0 px-2 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-accent"
                    >
                      <option value="contains">contains</option>
                      <option value="exact">exact</option>
                    </select>

                    <select
                      value={m.trade}
                      onChange={(e) => updateMapping(m.id, { trade: e.target.value as TradeKind, catalogId: undefined })}
                      className="min-w-0 px-2 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-accent"
                    >
                      {Object.entries(TRADE_LABEL).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedExists ? m.catalogId : ''}
                      onChange={(e) => updateMapping(m.id, { catalogId: e.target.value || undefined })}
                      className="min-w-0 px-2 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-accent"
                    >
                      <option value="">(catalog default)</option>
                      {opts.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>

                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={m.wastePct ?? ''}
                        placeholder="auto"
                        onChange={(e) =>
                          updateMapping(m.id, { wastePct: e.target.value === '' ? undefined : +e.target.value })
                        }
                        className="w-full min-w-0 pl-2 pr-7 py-2 border border-igc-line rounded-md text-sm text-right tabular-nums focus:outline-none focus:border-igc-accent"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-igc-muted pointer-events-none">
                        %
                      </span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-igc-muted text-sm pointer-events-none">
                        $
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={m.laborPerSqFt ?? ''}
                        placeholder="auto"
                        onChange={(e) =>
                          updateMapping(m.id, {
                            laborPerSqFt: e.target.value === '' ? undefined : +e.target.value,
                          })
                        }
                        className="w-full min-w-0 pl-6 pr-2 py-2 border border-igc-line rounded-md text-sm text-right tabular-nums focus:outline-none focus:border-igc-accent"
                      />
                    </div>

                    <button
                      onClick={() => removeMapping(m.id)}
                      className="text-igc-muted hover:text-red-500 transition-colors flex items-center justify-center"
                      title="Remove mapping"
                    >
                      <X size={16} strokeWidth={2} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
