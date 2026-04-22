import { useRef, useState } from 'react'
import { Upload, FileSpreadsheet, AlertTriangle, Check, X, Plus, Wrench } from 'lucide-react'
import { useToolChest } from '../toolchest/ToolChestContext'
import { useCatalog } from '../catalog/CatalogContext'
import { useEstimate } from '../estimate/EstimateContext'
import { parseCsv, buildImportRows, type ImportRow } from '../toolchest/bluebeam'

type Props = {
  onOpenToolChest: () => void
}

export default function BluebeamImport({ onOpenToolChest }: Props) {
  const { matchTool, addMapping } = useToolChest()
  const { catalog } = useCatalog()
  const { addQuote } = useEstimate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [rows, setRows] = useState<ImportRow[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [accepted, setAccepted] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  function reparse() {
    if (!rows.length) return
    const headers = Object.keys(rows[0].bluebeam.raw)
    const parsed = { headers, rows: rows.map((r) => r.bluebeam.raw) }
    const next = buildImportRows(parsed, matchTool, catalog)
    setRows(next)
  }

  async function handleFile(file: File) {
    setError(null)
    setAccepted(new Set())
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please choose a .csv file (Bluebeam Markups List export).')
      return
    }
    try {
      const text = await file.text()
      const parsed = parseCsv(text)
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        setError('CSV looks empty or malformed.')
        return
      }
      const built = buildImportRows(parsed, matchTool, catalog)
      setFileName(file.name)
      setRows(built)
      const draftable = new Set<number>()
      built.forEach((r) => {
        if (r.drafted) draftable.add(r.rowIndex)
      })
      setSelected(draftable)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'failed to read CSV')
    }
  }

  function toggle(rowIndex: number) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(rowIndex)) next.delete(rowIndex)
      else next.add(rowIndex)
      return next
    })
  }

  function selectAllDraftable() {
    const next = new Set<number>()
    rows.forEach((r) => {
      if (r.drafted) next.add(r.rowIndex)
    })
    setSelected(next)
  }

  function clearAll() {
    setSelected(new Set())
  }

  function importSelected() {
    let added = 0
    rows.forEach((r) => {
      if (!selected.has(r.rowIndex) || !r.drafted || accepted.has(r.rowIndex)) return
      addQuote({
        trade: r.drafted.trade,
        title: r.drafted.title,
        summary: r.drafted.summary,
        total: r.drafted.total,
        lineItems: [
          {
            label: 'Bluebeam markup',
            value: `${r.bluebeam.subject}${r.bluebeam.page ? ` · ${r.bluebeam.page}` : ''} (${r.drafted.bluebeamMarkupId})`,
            muted: true,
          },
          ...r.drafted.lineItems,
        ],
      })
      added++
      setAccepted((s) => new Set(s).add(r.rowIndex))
    })
    if (added > 0) {
      const newSelected = new Set(selected)
      rows.forEach((r) => {
        if (accepted.has(r.rowIndex) || selected.has(r.rowIndex)) newSelected.delete(r.rowIndex)
      })
      setSelected(newSelected)
    }
  }

  function quickMap(rowIndex: number, trade: 'film' | 'wallcovering' | 'mural') {
    const row = rows.find((r) => r.rowIndex === rowIndex)
    if (!row) return
    addMapping({ pattern: row.bluebeam.subject, matchType: 'exact', trade })
    setTimeout(reparse, 0)
  }

  function reset() {
    setFileName(null)
    setRows([])
    setSelected(new Set())
    setAccepted(new Set())
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const draftableCount = rows.filter((r) => r.drafted).length
  const unmappedCount = rows.filter((r) => !r.mapping).length
  const errorCount = rows.filter((r) => r.mapping && !r.drafted).length
  const selectedCount = Array.from(selected).filter((i) => {
    const row = rows.find((r) => r.rowIndex === i)
    return row?.drafted && !accepted.has(i)
  }).length

  return (
    <div className="space-y-6 max-w-6xl">
      <section className="bg-igc-accent-light border border-igc-accent/30 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="text-igc-accent dark:text-blue-300 mt-0.5 flex-shrink-0" size={20} strokeWidth={1.75} />
          <div>
            <h2 className="text-sm font-semibold text-igc-ink mb-1">Bluebeam CSV import</h2>
            <p className="text-xs text-igc-muted leading-relaxed">
              Export the Markups List from Bluebeam Revu (Markups List → Save → CSV), drop it here, and
              every measurement gets routed into a draft line item using the Tool Chest mappings. Pick
              which rows to add — the rest stay in the import preview until you reset.
            </p>
            <div className="mt-2">
              <button
                onClick={onOpenToolChest}
                className="text-xs text-igc-accent hover:text-igc-accent-dark dark:text-blue-300 underline underline-offset-2 inline-flex items-center gap-1"
              >
                <Wrench size={12} strokeWidth={1.75} />
                Edit Tool Chest mappings →
              </button>
            </div>
          </div>
        </div>
      </section>

      {!fileName && (
        <section
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const f = e.dataTransfer.files?.[0]
            if (f) handleFile(f)
          }}
          className={`bg-igc-surface border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragOver ? 'border-igc-accent bg-igc-accent-light' : 'border-igc-line'
          }`}
        >
          <Upload className="mx-auto text-igc-muted mb-3" size={32} strokeWidth={1.5} />
          <p className="text-sm text-igc-ink font-medium mb-1">Drop your Bluebeam CSV here</p>
          <p className="text-xs text-igc-muted mb-4">or click to choose a file</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-igc-accent text-white text-sm rounded-md hover:bg-igc-accent-dark inline-flex items-center gap-2"
          >
            <Upload size={14} strokeWidth={2} />
            Choose CSV
          </button>
          <p className="text-xs text-igc-muted mt-6">
            Don't have one yet?{' '}
            <a
              href={`${import.meta.env.BASE_URL}sample-bluebeam.csv`}
              download
              className="text-igc-accent hover:text-igc-accent-dark dark:text-blue-300 underline underline-offset-2"
            >
              Download a sample CSV
            </a>{' '}
            to see how it works.
          </p>
        </section>
      )}

      {error && (
        <section className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 rounded-lg p-4 text-sm text-red-800 dark:text-red-200 flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" strokeWidth={1.75} />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X size={14} />
          </button>
        </section>
      )}

      {fileName && (
        <section className="bg-igc-surface border border-igc-line rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-igc-line flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-semibold text-igc-ink flex items-center gap-2">
                <FileSpreadsheet size={14} className="text-igc-accent dark:text-blue-300" strokeWidth={1.75} />
                {fileName}
              </h3>
              <p className="text-xs text-igc-muted mt-0.5">
                {rows.length} {rows.length === 1 ? 'row' : 'rows'} · {draftableCount} drafted ·{' '}
                {unmappedCount} unmapped · {errorCount} skipped
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {draftableCount > 0 && (
                <>
                  <button
                    onClick={selectAllDraftable}
                    className="px-3 py-1.5 text-xs text-igc-muted hover:text-igc-ink"
                  >
                    Select all drafted
                  </button>
                  <button onClick={clearAll} className="px-3 py-1.5 text-xs text-igc-muted hover:text-igc-ink">
                    Clear
                  </button>
                </>
              )}
              <button onClick={reset} className="px-3 py-1.5 text-xs text-igc-muted hover:text-igc-ink">
                Reset
              </button>
              <button
                onClick={importSelected}
                disabled={selectedCount === 0}
                className="px-4 py-1.5 text-xs bg-igc-accent text-white rounded-md hover:bg-igc-accent-dark disabled:bg-igc-muted/30 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
              >
                <Plus size={12} strokeWidth={2} />
                Add {selectedCount > 0 ? `${selectedCount} ` : ''}to estimate
              </button>
            </div>
          </div>

          <div className="divide-y divide-igc-line">
            {rows.map((r) => (
              <RowCard
                key={r.rowIndex}
                row={r}
                checked={selected.has(r.rowIndex)}
                accepted={accepted.has(r.rowIndex)}
                onToggle={() => toggle(r.rowIndex)}
                onQuickMap={(t) => quickMap(r.rowIndex, t)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function RowCard({
  row,
  checked,
  accepted,
  onToggle,
  onQuickMap,
}: {
  row: ImportRow
  checked: boolean
  accepted: boolean
  onToggle: () => void
  onQuickMap: (trade: 'film' | 'wallcovering' | 'mural') => void
}) {
  const { bluebeam, mapping, drafted, warning } = row
  const measureBits: string[] = []
  if (bluebeam.areaSqFt) measureBits.push(`${bluebeam.areaSqFt.toFixed(1)} sf`)
  if (bluebeam.lengthFt) measureBits.push(`${bluebeam.lengthFt.toFixed(1)} ft`)
  if (bluebeam.widthFt && bluebeam.heightFt)
    measureBits.push(`${bluebeam.widthFt.toFixed(1)}×${bluebeam.heightFt.toFixed(1)} ft`)

  return (
    <div className={`px-6 py-4 ${accepted ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="pt-1">
          <input
            type="checkbox"
            checked={checked && !accepted}
            disabled={!drafted || accepted}
            onChange={onToggle}
            className="w-4 h-4 accent-igc-accent disabled:opacity-30"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-igc-ink truncate">
              {bluebeam.subject || <em className="text-igc-muted">(no subject)</em>}
            </span>
            {bluebeam.page && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-igc-surface-2 text-igc-muted uppercase tracking-wider">
                {bluebeam.page}
              </span>
            )}
            {bluebeam.type && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-igc-surface-2 text-igc-muted">
                {bluebeam.type}
              </span>
            )}
            {drafted && <TradeChip trade={drafted.trade} />}
            {accepted && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 uppercase tracking-wider font-medium inline-flex items-center gap-0.5">
                <Check size={10} strokeWidth={2} /> added
              </span>
            )}
          </div>

          {measureBits.length > 0 && (
            <div className="text-xs text-igc-muted mt-1 tabular-nums">{measureBits.join(' · ')}</div>
          )}

          {drafted && (
            <div className="mt-2 text-xs text-igc-ink">
              <strong className="font-semibold">${drafted.total.toFixed(2)}</strong>
              <span className="text-igc-muted"> · {drafted.summary}</span>
            </div>
          )}

          {!mapping && (
            <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-amber-700 dark:text-amber-300 inline-flex items-center gap-1">
                <AlertTriangle size={12} strokeWidth={1.75} />
                No tool mapping for "{bluebeam.subject}"
              </span>
              <span className="text-igc-muted">·</span>
              <span className="text-igc-muted">Quick-map as:</span>
              <button
                onClick={() => onQuickMap('film')}
                className="px-2 py-0.5 text-[11px] border border-igc-line rounded text-igc-ink hover:border-igc-accent hover:text-igc-accent"
              >
                Film
              </button>
              <button
                onClick={() => onQuickMap('wallcovering')}
                className="px-2 py-0.5 text-[11px] border border-igc-line rounded text-igc-ink hover:border-igc-accent hover:text-igc-accent"
              >
                Wallcovering
              </button>
              <button
                onClick={() => onQuickMap('mural')}
                className="px-2 py-0.5 text-[11px] border border-igc-line rounded text-igc-ink hover:border-igc-accent hover:text-igc-accent"
              >
                Mural
              </button>
            </div>
          )}

          {mapping && !drafted && warning && (
            <div className="mt-2 text-xs text-amber-700 dark:text-amber-300 inline-flex items-center gap-1">
              <AlertTriangle size={12} strokeWidth={1.75} />
              Skipped: {warning}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const TRADE_CHIP: Record<'film' | 'wallcovering' | 'mural', { label: string; classes: string }> = {
  film: {
    label: 'Film',
    classes:
      'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  },
  wallcovering: {
    label: 'Wallcovering',
    classes:
      'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300',
  },
  mural: {
    label: 'Mural',
    classes:
      'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300',
  },
}

function TradeChip({ trade }: { trade: 'film' | 'wallcovering' | 'mural' }) {
  const m = TRADE_CHIP[trade]
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium ${m.classes}`}
    >
      {m.label}
    </span>
  )
}
