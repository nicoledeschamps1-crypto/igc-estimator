import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type FilmOption = {
  id: string
  name: string
  rollWidthIn: number
  costPerSqFt: number
}

export type WallcoveringOption = {
  id: string
  name: string
  rollType: 'single' | 'double'
  usableSqFtPerRoll: number
  costPerRoll: number
  patternWastePct: number
}

export type MuralStyle = {
  id: string
  name: string
  materialPerSqFt: number
  laborPerSqFt: number
  description: string
}

export type Catalog = {
  films: FilmOption[]
  wallcoverings: WallcoveringOption[]
  muralStyles: MuralStyle[]
}

type CatalogCategory = keyof Catalog

type Ctx = {
  catalog: Catalog
  updateFilm: (id: string, patch: Partial<FilmOption>) => void
  addFilm: () => void
  removeFilm: (id: string) => void

  updateWallcovering: (id: string, patch: Partial<WallcoveringOption>) => void
  addWallcovering: () => void
  removeWallcovering: (id: string) => void

  updateMuralStyle: (id: string, patch: Partial<MuralStyle>) => void
  addMuralStyle: () => void
  removeMuralStyle: (id: string) => void

  resetCategory: (cat: CatalogCategory) => void
  resetAll: () => void
}

const CatalogCtx = createContext<Ctx | null>(null)

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

const STORAGE_KEY = 'igc-catalog-v1'

const DEFAULT_CATALOG: Catalog = {
  films: [
    { id: 'privacy-frost', name: 'Privacy Frost', rollWidthIn: 60, costPerSqFt: 4.5 },
    { id: 'solar-ceramic', name: 'Solar Ceramic', rollWidthIn: 48, costPerSqFt: 7.25 },
    { id: 'security-8mil', name: 'Security 8mil', rollWidthIn: 60, costPerSqFt: 9.0 },
    { id: 'decorative-custom', name: 'Decorative / Custom Print', rollWidthIn: 54, costPerSqFt: 12.0 },
  ],
  wallcoverings: [
    { id: 'single-standard', name: 'Single roll · standard', rollType: 'single', usableSqFtPerRoll: 27, costPerRoll: 85, patternWastePct: 15 },
    { id: 'single-patterned', name: 'Single roll · large pattern', rollType: 'single', usableSqFtPerRoll: 25, costPerRoll: 140, patternWastePct: 25 },
    { id: 'double-commercial', name: 'Double roll · commercial 54"', rollType: 'double', usableSqFtPerRoll: 60, costPerRoll: 260, patternWastePct: 12 },
    { id: 'double-vinyl', name: 'Double roll · Type II vinyl', rollType: 'double', usableSqFtPerRoll: 56, costPerRoll: 195, patternWastePct: 10 },
  ],
  muralStyles: [
    { id: 'simple-flat', name: 'Simple · flat color / geometric', materialPerSqFt: 3, laborPerSqFt: 6, description: 'Blocked shapes, low detail' },
    { id: 'standard-hand', name: 'Standard · hand-painted scene', materialPerSqFt: 5, laborPerSqFt: 12, description: 'Mid-detail, realism' },
    { id: 'detailed-custom', name: 'Detailed · custom artwork', materialPerSqFt: 8, laborPerSqFt: 20, description: 'High detail, mixed media' },
    { id: 'premium-signature', name: 'Premium · signature / branded', materialPerSqFt: 15, laborPerSqFt: 25, description: 'Flagship piece, full signage' },
  ],
}

function loadCatalog(): Catalog {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CATALOG
    const parsed = JSON.parse(raw)
    return {
      films: Array.isArray(parsed.films) ? parsed.films : DEFAULT_CATALOG.films,
      wallcoverings: Array.isArray(parsed.wallcoverings) ? parsed.wallcoverings : DEFAULT_CATALOG.wallcoverings,
      muralStyles: Array.isArray(parsed.muralStyles) ? parsed.muralStyles : DEFAULT_CATALOG.muralStyles,
    }
  } catch {
    return DEFAULT_CATALOG
  }
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog>(loadCatalog)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog))
    } catch {
      // fail silently
    }
  }, [catalog])

  function updateFilm(id: string, patch: Partial<FilmOption>) {
    setCatalog((c) => ({ ...c, films: c.films.map((f) => (f.id === id ? { ...f, ...patch } : f)) }))
  }
  function addFilm() {
    setCatalog((c) => ({
      ...c,
      films: [...c.films, { id: uid(), name: 'New film type', rollWidthIn: 60, costPerSqFt: 5 }],
    }))
  }
  function removeFilm(id: string) {
    setCatalog((c) => ({ ...c, films: c.films.filter((f) => f.id !== id) }))
  }

  function updateWallcovering(id: string, patch: Partial<WallcoveringOption>) {
    setCatalog((c) => ({
      ...c,
      wallcoverings: c.wallcoverings.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    }))
  }
  function addWallcovering() {
    setCatalog((c) => ({
      ...c,
      wallcoverings: [
        ...c.wallcoverings,
        { id: uid(), name: 'New wallcovering', rollType: 'single', usableSqFtPerRoll: 27, costPerRoll: 100, patternWastePct: 15 },
      ],
    }))
  }
  function removeWallcovering(id: string) {
    setCatalog((c) => ({ ...c, wallcoverings: c.wallcoverings.filter((w) => w.id !== id) }))
  }

  function updateMuralStyle(id: string, patch: Partial<MuralStyle>) {
    setCatalog((c) => ({
      ...c,
      muralStyles: c.muralStyles.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }))
  }
  function addMuralStyle() {
    setCatalog((c) => ({
      ...c,
      muralStyles: [
        ...c.muralStyles,
        { id: uid(), name: 'New style', materialPerSqFt: 5, laborPerSqFt: 12, description: '' },
      ],
    }))
  }
  function removeMuralStyle(id: string) {
    setCatalog((c) => ({ ...c, muralStyles: c.muralStyles.filter((m) => m.id !== id) }))
  }

  function resetCategory(cat: CatalogCategory) {
    setCatalog((c) => ({ ...c, [cat]: DEFAULT_CATALOG[cat] }))
  }
  function resetAll() {
    setCatalog(DEFAULT_CATALOG)
  }

  return (
    <CatalogCtx.Provider
      value={{
        catalog,
        updateFilm,
        addFilm,
        removeFilm,
        updateWallcovering,
        addWallcovering,
        removeWallcovering,
        updateMuralStyle,
        addMuralStyle,
        removeMuralStyle,
        resetCategory,
        resetAll,
      }}
    >
      {children}
    </CatalogCtx.Provider>
  )
}

export function useCatalog() {
  const ctx = useContext(CatalogCtx)
  if (!ctx) throw new Error('useCatalog must be used inside CatalogProvider')
  return ctx
}
