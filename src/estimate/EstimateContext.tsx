import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type TradeKind = 'film' | 'wallcovering' | 'mural'

export type LineItem = {
  label: string
  value: string
  muted?: boolean
}

export type SavedQuote = {
  id: string
  trade: TradeKind
  title: string
  summary: string
  total: number
  lineItems: LineItem[]
  createdAt: number
}

export type ClientInfo = {
  projectName: string
  clientName: string
  address: string
  dateIso: string
  estimateNumber: string
  notes: string
}

type Ctx = {
  quotes: SavedQuote[]
  client: ClientInfo
  addQuote: (q: Omit<SavedQuote, 'id' | 'createdAt'>) => void
  removeQuote: (id: string) => void
  clearQuotes: () => void
  setClient: (patch: Partial<ClientInfo>) => void
  grandTotal: number
}

const EstimateCtx = createContext<Ctx | null>(null)

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function todayIso() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function roundCents(n: number) {
  return Math.round(n * 100) / 100
}

const STORAGE_KEY = 'igc-estimator-v1'

const DEFAULT_CLIENT: ClientInfo = {
  projectName: '',
  clientName: '',
  address: '',
  dateIso: todayIso(),
  estimateNumber: '',
  notes: '',
}

function loadState(): { quotes: SavedQuote[]; client: ClientInfo } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { quotes: [], client: DEFAULT_CLIENT }
    const parsed = JSON.parse(raw)
    return {
      quotes: Array.isArray(parsed.quotes) ? parsed.quotes : [],
      client: parsed.client && typeof parsed.client === 'object' ? { ...DEFAULT_CLIENT, ...parsed.client } : DEFAULT_CLIENT,
    }
  } catch {
    return { quotes: [], client: DEFAULT_CLIENT }
  }
}

export function EstimateProvider({ children }: { children: ReactNode }) {
  const initial = loadState()
  const [quotes, setQuotes] = useState<SavedQuote[]>(initial.quotes)
  const [client, setClientState] = useState<ClientInfo>(initial.client)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ quotes, client }))
    } catch {
      // quota exceeded, private mode, etc — fail silently
    }
  }, [quotes, client])

  function addQuote(q: Omit<SavedQuote, 'id' | 'createdAt'>) {
    setQuotes((qs) => [...qs, { ...q, total: roundCents(q.total), id: uid(), createdAt: Date.now() }])
  }
  function removeQuote(id: string) {
    setQuotes((qs) => qs.filter((q) => q.id !== id))
  }
  function clearQuotes() {
    setQuotes([])
  }
  function setClient(patch: Partial<ClientInfo>) {
    setClientState((c) => ({ ...c, ...patch }))
  }

  const grandTotal = quotes.reduce((s, q) => s + q.total, 0)

  return (
    <EstimateCtx.Provider
      value={{ quotes, client, addQuote, removeQuote, clearQuotes, setClient, grandTotal }}
    >
      {children}
    </EstimateCtx.Provider>
  )
}

export function useEstimate() {
  const ctx = useContext(EstimateCtx)
  if (!ctx) throw new Error('useEstimate must be used inside EstimateProvider')
  return ctx
}
