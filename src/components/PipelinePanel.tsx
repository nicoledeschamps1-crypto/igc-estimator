import { useMemo, useState } from 'react'
import { useEstimate, EstimateStatus, SavedEstimate } from '../estimate/EstimateContext'

type StatusFilter = 'all' | EstimateStatus

const STATUS_LABELS: Record<EstimateStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  declined: 'Declined',
}

const STATUS_COLORS: Record<EstimateStatus, string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  sent: 'bg-blue-100 text-blue-800 border-blue-200',
  accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  declined: 'bg-rose-100 text-rose-800 border-rose-200',
}

const STATUS_ORDER: EstimateStatus[] = ['draft', 'sent', 'accepted', 'declined']

function fmtCurrency(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function relTime(ts: number) {
  const diffMs = Date.now() - ts
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return fmtDate(ts)
}

type PipelinePanelProps = {
  onOpenEstimate: () => void
}

export default function PipelinePanel({ onOpenEstimate }: PipelinePanelProps) {
  const {
    savedEstimates,
    currentEstimateId,
    loadEstimate,
    duplicateEstimate,
    deleteEstimate,
    updateEstimateStatus,
    startNewEstimate,
  } = useEstimate()
  const [filter, setFilter] = useState<StatusFilter>('all')

  const stats = useMemo(() => {
    const counts: Record<EstimateStatus, number> = { draft: 0, sent: 0, accepted: 0, declined: 0 }
    const revenue: Record<EstimateStatus, number> = { draft: 0, sent: 0, accepted: 0, declined: 0 }
    savedEstimates.forEach((e) => {
      counts[e.status]++
      revenue[e.status] += e.total
    })
    const forecast = revenue.sent + revenue.accepted
    const decided = counts.accepted + counts.declined
    const winRate = decided === 0 ? null : counts.accepted / decided
    return { counts, revenue, forecast, winRate, total: savedEstimates.length }
  }, [savedEstimates])

  const filtered = useMemo(() => {
    const list =
      filter === 'all' ? savedEstimates : savedEstimates.filter((e) => e.status === filter)
    return [...list].sort((a, b) => b.updatedAt - a.updatedAt)
  }, [savedEstimates, filter])

  function handleOpen(id: string) {
    loadEstimate(id)
    onOpenEstimate()
  }

  function handleDuplicate(id: string) {
    const newId = duplicateEstimate(id)
    if (newId) {
      loadEstimate(newId)
      onOpenEstimate()
    }
  }

  function handleNew() {
    startNewEstimate()
    onOpenEstimate()
  }

  return (
    <div className="space-y-6">
      {/* Dashboard */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashCard
          label="Forecast"
          sub="Sent + Accepted"
          value={fmtCurrency(stats.forecast)}
          accent="text-igc-purple"
        />
        <DashCard
          label="Accepted"
          sub={`${stats.counts.accepted} ${stats.counts.accepted === 1 ? 'estimate' : 'estimates'}`}
          value={fmtCurrency(stats.revenue.accepted)}
          accent="text-emerald-600"
        />
        <DashCard
          label="Win rate"
          sub="Accepted ÷ (Accepted + Declined)"
          value={stats.winRate === null ? '—' : `${Math.round(stats.winRate * 100)}%`}
          accent="text-igc-ink"
        />
        <DashCard
          label="Pipeline"
          sub="Total estimates saved"
          value={String(stats.total)}
          accent="text-igc-ink"
        />
      </section>

      {/* Controls */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 flex-wrap">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            All <span className="opacity-60">({stats.total})</span>
          </FilterChip>
          {STATUS_ORDER.map((s) => (
            <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>
              {STATUS_LABELS[s]} <span className="opacity-60">({stats.counts[s]})</span>
            </FilterChip>
          ))}
        </div>
        <button
          onClick={handleNew}
          className="px-4 py-2 bg-igc-purple hover:bg-igc-purple-dark text-white rounded-md text-sm font-medium transition-colors"
        >
          + New estimate
        </button>
      </section>

      {/* List */}
      <section className="bg-white border border-igc-line rounded-lg">
        {filtered.length === 0 ? (
          <EmptyState
            hasAny={savedEstimates.length > 0}
            filter={filter}
            onNew={handleNew}
          />
        ) : (
          <ul className="divide-y divide-igc-line">
            {filtered.map((e) => (
              <EstimateRow
                key={e.id}
                estimate={e}
                isCurrent={e.id === currentEstimateId}
                onOpen={() => handleOpen(e.id)}
                onDuplicate={() => handleDuplicate(e.id)}
                onDelete={() => {
                  const label = e.client.projectName || e.client.clientName || 'this estimate'
                  if (confirm(`Delete ${label}? This cannot be undone.`)) deleteEstimate(e.id)
                }}
                onStatusChange={(s) => updateEstimateStatus(e.id, s)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function DashCard({
  label,
  sub,
  value,
  accent,
}: {
  label: string
  sub: string
  value: string
  accent: string
}) {
  return (
    <div className="bg-white border border-igc-line rounded-lg p-4">
      <div className="text-[11px] uppercase tracking-wider text-igc-muted font-semibold">{label}</div>
      <div className={`text-2xl font-semibold mt-1 font-mono ${accent}`}>{value}</div>
      <div className="text-[11px] text-igc-muted mt-1">{sub}</div>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? 'bg-igc-purple text-white border-igc-purple'
          : 'bg-white text-igc-muted border-igc-line hover:border-igc-purple hover:text-igc-ink'
      }`}
    >
      {children}
    </button>
  )
}

function EstimateRow({
  estimate,
  isCurrent,
  onOpen,
  onDuplicate,
  onDelete,
  onStatusChange,
}: {
  estimate: SavedEstimate
  isCurrent: boolean
  onOpen: () => void
  onDuplicate: () => void
  onDelete: () => void
  onStatusChange: (s: EstimateStatus) => void
}) {
  const title =
    estimate.client.projectName ||
    estimate.client.clientName ||
    `Untitled estimate · ${fmtDate(estimate.createdAt)}`
  const sub =
    estimate.client.clientName && estimate.client.projectName
      ? estimate.client.clientName
      : estimate.client.address || `${estimate.quotes.length} line items`

  return (
    <li className={`px-4 py-3 flex items-start gap-4 hover:bg-igc-purple-light/40 transition-colors ${isCurrent ? 'bg-igc-purple-light/50' : ''}`}>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onOpen}>
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="font-medium text-sm text-igc-ink truncate">{title}</span>
          {isCurrent && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-igc-purple text-white uppercase tracking-wider font-semibold">
              Open
            </span>
          )}
          {estimate.client.estimateNumber && (
            <span className="text-[10px] text-igc-muted font-mono">#{estimate.client.estimateNumber}</span>
          )}
        </div>
        <div className="text-xs text-igc-muted truncate">
          {sub} · {estimate.quotes.length} {estimate.quotes.length === 1 ? 'item' : 'items'} ·
          updated {relTime(estimate.updatedAt)}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="font-mono text-sm font-semibold text-igc-ink">{fmtCurrency(estimate.total)}</div>
      </div>

      <select
        value={estimate.status}
        onChange={(e) => onStatusChange(e.target.value as EstimateStatus)}
        onClick={(e) => e.stopPropagation()}
        className={`text-[11px] font-medium px-2 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-igc-purple/30 ${STATUS_COLORS[estimate.status]}`}
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <div className="flex flex-col gap-1 flex-shrink-0">
        <button
          onClick={onOpen}
          className="text-[11px] text-igc-purple hover:text-igc-purple-dark font-medium"
        >
          Open
        </button>
        <button
          onClick={onDuplicate}
          className="text-[11px] text-igc-muted hover:text-igc-ink"
        >
          Duplicate
        </button>
        <button
          onClick={onDelete}
          className="text-[11px] text-igc-muted hover:text-red-500"
        >
          Delete
        </button>
      </div>
    </li>
  )
}

function EmptyState({
  hasAny,
  filter,
  onNew,
}: {
  hasAny: boolean
  filter: StatusFilter
  onNew: () => void
}) {
  if (hasAny && filter !== 'all') {
    return (
      <div className="text-center py-12 px-6">
        <div className="text-4xl mb-3">🗂️</div>
        <div className="text-sm text-igc-ink font-medium">No {STATUS_LABELS[filter].toLowerCase()} estimates</div>
        <div className="text-xs text-igc-muted mt-1">Change the filter to see the rest.</div>
      </div>
    )
  }
  return (
    <div className="text-center py-14 px-6">
      <div className="text-4xl mb-3">📋</div>
      <div className="text-sm text-igc-ink font-medium mb-1">No saved estimates yet</div>
      <div className="text-xs text-igc-muted mb-4 max-w-md mx-auto">
        Build line items in Window Film, Wallcovering, or Mural, then save from the Estimate tab.
        Saved estimates live here forever (on this browser).
      </div>
      <button
        onClick={onNew}
        className="px-4 py-2 bg-igc-purple hover:bg-igc-purple-dark text-white rounded-md text-sm font-medium"
      >
        + Start a new estimate
      </button>
    </div>
  )
}
