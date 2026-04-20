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

export type EstimateStatus = 'draft' | 'sent' | 'accepted' | 'declined'

export type SavedEstimate = {
  id: string
  status: EstimateStatus
  quotes: SavedQuote[]
  client: ClientInfo
  total: number
  createdAt: number
  updatedAt: number
}

type Ctx = {
  quotes: SavedQuote[]
  client: ClientInfo
  brand: BrandInfo
  savedEstimates: SavedEstimate[]
  currentEstimateId: string | null
  addQuote: (q: Omit<SavedQuote, 'id' | 'createdAt'>) => void
  removeQuote: (id: string) => void
  clearQuotes: () => void
  setClient: (patch: Partial<ClientInfo>) => void
  setBrand: (patch: Partial<BrandInfo>) => void
  resetBrand: () => void
  saveEstimate: () => string
  loadEstimate: (id: string) => void
  duplicateEstimate: (id: string) => string
  deleteEstimate: (id: string) => void
  updateEstimateStatus: (id: string, status: EstimateStatus) => void
  startNewEstimate: () => void
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

const STORAGE_KEY = 'igc-estimator-v2'
const DEFAULT_LOGO_URL = `${import.meta.env.BASE_URL}igc-logo-black.png`

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

type StoredState = {
  quotes: SavedQuote[]
  client: ClientInfo
  brand: BrandInfo
  savedEstimates: SavedEstimate[]
  currentEstimateId: string | null
}

function loadState(): StoredState {
  const empty: StoredState = {
    quotes: [],
    client: DEFAULT_CLIENT,
    brand: DEFAULT_BRAND,
    savedEstimates: [],
    currentEstimateId: null,
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty
    const parsed = JSON.parse(raw)
    return {
      quotes: Array.isArray(parsed.quotes) ? parsed.quotes : [],
      client:
        parsed.client && typeof parsed.client === 'object'
          ? { ...DEFAULT_CLIENT, ...parsed.client }
          : DEFAULT_CLIENT,
      brand:
        parsed.brand && typeof parsed.brand === 'object'
          ? { ...DEFAULT_BRAND, ...parsed.brand }
          : DEFAULT_BRAND,
      savedEstimates: Array.isArray(parsed.savedEstimates) ? parsed.savedEstimates : [],
      currentEstimateId: typeof parsed.currentEstimateId === 'string' ? parsed.currentEstimateId : null,
    }
  } catch {
    return empty
  }
}

export function EstimateProvider({ children }: { children: ReactNode }) {
  const initial = loadState()
  const [quotes, setQuotes] = useState<SavedQuote[]>(initial.quotes)
  const [client, setClientState] = useState<ClientInfo>(initial.client)
  const [brand, setBrandState] = useState<BrandInfo>(initial.brand)
  const [savedEstimates, setSavedEstimates] = useState<SavedEstimate[]>(initial.savedEstimates)
  const [currentEstimateId, setCurrentEstimateId] = useState<string | null>(initial.currentEstimateId)

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ quotes, client, brand, savedEstimates, currentEstimateId }),
      )
    } catch {
      // quota exceeded (e.g. huge logo), private mode — fail silently
    }
  }, [quotes, client, brand, savedEstimates, currentEstimateId])

  // Load bundled IGC logo as default when user has no logo set
  useEffect(() => {
    if (brand.logoDataUrl) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(DEFAULT_LOGO_URL)
        const blob = await res.blob()
        const reader = new FileReader()
        reader.onload = () => {
          if (cancelled) return
          setBrandState((b) => (b.logoDataUrl ? b : { ...b, logoDataUrl: reader.result as string }))
        }
        reader.readAsDataURL(blob)
      } catch {
        // offline or bundled asset missing — PDF will render without logo
      }
    })()
    return () => {
      cancelled = true
    }
  }, [brand.logoDataUrl])

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

  function saveEstimate(): string {
    const now = Date.now()
    const workspaceTotal = roundCents(grandTotal)
    if (currentEstimateId) {
      setSavedEstimates((list) =>
        list.map((e) =>
          e.id === currentEstimateId
            ? { ...e, quotes, client, total: workspaceTotal, updatedAt: now }
            : e,
        ),
      )
      return currentEstimateId
    }
    const id = uid()
    const fresh: SavedEstimate = {
      id,
      status: 'draft',
      quotes,
      client,
      total: workspaceTotal,
      createdAt: now,
      updatedAt: now,
    }
    setSavedEstimates((list) => [fresh, ...list])
    setCurrentEstimateId(id)
    return id
  }

  function loadEstimate(id: string) {
    const target = savedEstimates.find((e) => e.id === id)
    if (!target) return
    setQuotes(target.quotes)
    setClientState(target.client)
    setCurrentEstimateId(id)
  }

  function duplicateEstimate(id: string): string {
    const target = savedEstimates.find((e) => e.id === id)
    if (!target) return ''
    const newId = uid()
    const now = Date.now()
    const copy: SavedEstimate = {
      id: newId,
      status: 'draft',
      quotes: target.quotes.map((q) => ({ ...q, id: uid(), createdAt: now })),
      client: {
        ...target.client,
        estimateNumber: '',
        dateIso: todayIso(),
      },
      total: target.total,
      createdAt: now,
      updatedAt: now,
    }
    setSavedEstimates((list) => [copy, ...list])
    return newId
  }

  function deleteEstimate(id: string) {
    setSavedEstimates((list) => list.filter((e) => e.id !== id))
    if (currentEstimateId === id) {
      setCurrentEstimateId(null)
      setQuotes([])
      setClientState({ ...DEFAULT_CLIENT, dateIso: todayIso() })
    }
  }

  function updateEstimateStatus(id: string, status: EstimateStatus) {
    setSavedEstimates((list) =>
      list.map((e) => (e.id === id ? { ...e, status, updatedAt: Date.now() } : e)),
    )
  }

  function startNewEstimate() {
    setCurrentEstimateId(null)
    setQuotes([])
    setClientState({ ...DEFAULT_CLIENT, dateIso: todayIso() })
  }

  return (
    <EstimateCtx.Provider
      value={{
        quotes,
        client,
        brand,
        savedEstimates,
        currentEstimateId,
        addQuote,
        removeQuote,
        clearQuotes,
        setClient,
        setBrand,
        resetBrand,
        saveEstimate,
        loadEstimate,
        duplicateEstimate,
        deleteEstimate,
        updateEstimateStatus,
        startNewEstimate,
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
