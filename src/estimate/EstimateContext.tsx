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

export type BrandInfo = {
  companyName: string
  tagline: string
  website: string
  logoDataUrl: string | null
  logoWidthPt: number
}

type Ctx = {
  quotes: SavedQuote[]
  client: ClientInfo
  brand: BrandInfo
  addQuote: (q: Omit<SavedQuote, 'id' | 'createdAt'>) => void
  removeQuote: (id: string) => void
  clearQuotes: () => void
  setClient: (patch: Partial<ClientInfo>) => void
  setBrand: (patch: Partial<BrandInfo>) => void
  resetBrand: () => void
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

const DEFAULT_BRAND: BrandInfo = {
  companyName: 'IGC Studio',
  tagline: 'Interior Design · Window Film · Wallcovering · Murals',
  website: 'igcstudio.com',
  logoDataUrl: null,
  logoWidthPt: 72,
}

function loadState(): { quotes: SavedQuote[]; client: ClientInfo; brand: BrandInfo } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { quotes: [], client: DEFAULT_CLIENT, brand: DEFAULT_BRAND }
    const parsed = JSON.parse(raw)
    return {
      quotes: Array.isArray(parsed.quotes) ? parsed.quotes : [],
      client: parsed.client && typeof parsed.client === 'object' ? { ...DEFAULT_CLIENT, ...parsed.client } : DEFAULT_CLIENT,
      brand: parsed.brand && typeof parsed.brand === 'object' ? { ...DEFAULT_BRAND, ...parsed.brand } : DEFAULT_BRAND,
    }
  } catch {
    return { quotes: [], client: DEFAULT_CLIENT, brand: DEFAULT_BRAND }
  }
}

export function EstimateProvider({ children }: { children: ReactNode }) {
  const initial = loadState()
  const [quotes, setQuotes] = useState<SavedQuote[]>(initial.quotes)
  const [client, setClientState] = useState<ClientInfo>(initial.client)
  const [brand, setBrandState] = useState<BrandInfo>(initial.brand)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ quotes, client, brand }))
    } catch {
      // quota exceeded (e.g. huge logo), private mode — fail silently
    }
  }, [quotes, client, brand])

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
  function setBrand(patch: Partial<BrandInfo>) {
    setBrandState((b) => ({ ...b, ...patch }))
  }
  function resetBrand() {
    setBrandState(DEFAULT_BRAND)
  }

  const grandTotal = quotes.reduce((s, q) => s + q.total, 0)

  return (
    <EstimateCtx.Provider
      value={{
        quotes,
        client,
        brand,
        addQuote,
        removeQuote,
        clearQuotes,
        setClient,
        setBrand,
        resetBrand,
        grandTotal,
      }}
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
