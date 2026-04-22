import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { TradeKind } from '../estimate/EstimateContext'

export type ToolMatchType = 'exact' | 'contains'

export type ToolMapping = {
  id: string
  pattern: string
  matchType: ToolMatchType
  trade: TradeKind
  catalogId?: string
  wastePct?: number
  laborPerSqFt?: number
  notes?: string
}

type Ctx = {
  mappings: ToolMapping[]
  addMapping: (seed?: Partial<ToolMapping>) => string
  updateMapping: (id: string, patch: Partial<ToolMapping>) => void
  removeMapping: (id: string) => void
  resetAll: () => void
  matchTool: (subject: string) => ToolMapping | null
}

const ToolChestCtx = createContext<Ctx | null>(null)

const STORAGE_KEY = 'igc-toolchest-v1'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

const DEFAULT_MAPPINGS: ToolMapping[] = []

function loadMappings(): ToolMapping[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_MAPPINGS
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return DEFAULT_MAPPINGS
    return parsed.filter((m) => m && typeof m.pattern === 'string' && typeof m.trade === 'string')
  } catch {
    return DEFAULT_MAPPINGS
  }
}

export function ToolChestProvider({ children }: { children: ReactNode }) {
  const [mappings, setMappings] = useState<ToolMapping[]>(loadMappings)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings))
    } catch {
      // fail silently
    }
  }, [mappings])

  function addMapping(seed?: Partial<ToolMapping>): string {
    const id = uid()
    setMappings((ms) => [
      ...ms,
      {
        id,
        pattern: seed?.pattern ?? '',
        matchType: seed?.matchType ?? 'contains',
        trade: seed?.trade ?? 'film',
        catalogId: seed?.catalogId,
        wastePct: seed?.wastePct,
        laborPerSqFt: seed?.laborPerSqFt,
        notes: seed?.notes,
      },
    ])
    return id
  }

  function updateMapping(id: string, patch: Partial<ToolMapping>) {
    setMappings((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }

  function removeMapping(id: string) {
    setMappings((ms) => ms.filter((m) => m.id !== id))
  }

  function resetAll() {
    setMappings(DEFAULT_MAPPINGS)
  }

  function matchTool(subject: string): ToolMapping | null {
    if (!subject) return null
    const subj = subject.trim().toLowerCase()
    const exact = mappings.find((m) => m.matchType === 'exact' && m.pattern.trim().toLowerCase() === subj)
    if (exact) return exact
    const contains = mappings.find(
      (m) => m.matchType === 'contains' && m.pattern.trim() && subj.includes(m.pattern.trim().toLowerCase()),
    )
    return contains ?? null
  }

  return (
    <ToolChestCtx.Provider
      value={{ mappings, addMapping, updateMapping, removeMapping, resetAll, matchTool }}
    >
      {children}
    </ToolChestCtx.Provider>
  )
}

export function useToolChest() {
  const ctx = useContext(ToolChestCtx)
  if (!ctx) throw new Error('useToolChest must be used inside ToolChestProvider')
  return ctx
}
