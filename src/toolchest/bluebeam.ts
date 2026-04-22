import type { TradeKind } from '../estimate/EstimateContext'
import type { Catalog } from '../catalog/CatalogContext'
import type { ToolMapping } from './ToolChestContext'

export type BluebeamRow = {
  subject: string
  page: string
  type: string
  layer: string
  comments: string
  areaSqFt: number | null
  lengthFt: number | null
  widthFt: number | null
  heightFt: number | null
  raw: Record<string, string>
}

export type DraftedItem = {
  rowIndex: number
  bluebeamSubject: string
  page: string
  trade: TradeKind
  title: string
  summary: string
  total: number
  lineItems: Array<{ label: string; value: string; muted?: boolean }>
  catalogChoice?: string
  bluebeamMarkupId: string
}

export type ImportRow = {
  rowIndex: number
  bluebeam: BluebeamRow
  mapping: ToolMapping | null
  drafted: DraftedItem | null
  warning?: string
}

const UNIT_TO_FT: Record<string, number> = {
  ft: 1,
  feet: 1,
  "'": 1,
  in: 1 / 12,
  inches: 1 / 12,
  '"': 1 / 12,
  yd: 3,
  yards: 3,
  m: 3.28084,
  meters: 3.28084,
  cm: 0.0328084,
}

const AREA_UNIT_TO_SQFT: Record<string, number> = {
  sf: 1,
  'sq ft': 1,
  sqft: 1,
  ft2: 1,
  'ft²': 1,
  si: 1 / 144,
  'sq in': 1 / 144,
  sqin: 1 / 144,
  in2: 1 / 144,
  'in²': 1 / 144,
  sy: 9,
  'sq yd': 9,
  m2: 10.7639,
  'm²': 10.7639,
  'sq m': 10.7639,
}

export function parseLengthToFt(raw: string | undefined | null): number | null {
  if (!raw) return null
  const s = String(raw).trim().toLowerCase()
  if (!s) return null
  const m = s.match(/^([\d,.\-]+)\s*([a-z"'²]*)/)
  if (!m) return null
  const num = Number(m[1].replace(/,/g, ''))
  if (!Number.isFinite(num)) return null
  const unit = (m[2] || 'ft').trim()
  const factor = UNIT_TO_FT[unit] ?? UNIT_TO_FT[unit.replace(/\s+/g, '')] ?? 1
  return num * factor
}

export function parseAreaToSqFt(raw: string | undefined | null): number | null {
  if (!raw) return null
  const s = String(raw).trim().toLowerCase()
  if (!s) return null
  const m = s.match(/^([\d,.\-]+)\s*(.*)$/)
  if (!m) return null
  const num = Number(m[1].replace(/,/g, ''))
  if (!Number.isFinite(num)) return null
  const unit = (m[2] || 'sf').trim()
  const factor =
    AREA_UNIT_TO_SQFT[unit] ??
    AREA_UNIT_TO_SQFT[unit.replace(/\s+/g, '')] ??
    AREA_UNIT_TO_SQFT[unit.replace('square ', 'sq ')] ??
    1
  return num * factor
}

export function parseCsv(text: string): { headers: string[]; rows: Array<Record<string, string>> } {
  const lines = splitCsvLines(text)
  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = parseCsvRow(lines[0]).map((h) => h.trim())
  const rows: Array<Record<string, string>> = []
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const cells = parseCsvRow(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = (cells[idx] ?? '').trim()
    })
    rows.push(row)
  }
  return { headers, rows }
}

function splitCsvLines(text: string): string[] {
  const out: string[] = []
  let buf = ''
  let inQuote = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
      inQuote = !inQuote
      buf += ch
      continue
    }
    if ((ch === '\n' || ch === '\r') && !inQuote) {
      if (ch === '\r' && text[i + 1] === '\n') i++
      out.push(buf)
      buf = ''
      continue
    }
    buf += ch
  }
  if (buf.length) out.push(buf)
  return out
}

function parseCsvRow(line: string): string[] {
  const out: string[] = []
  let buf = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') {
        buf += '"'
        i++
      } else {
        inQuote = !inQuote
      }
      continue
    }
    if (ch === ',' && !inQuote) {
      out.push(buf)
      buf = ''
      continue
    }
    buf += ch
  }
  out.push(buf)
  return out
}

function pickHeader(headers: string[], candidates: string[]): string | null {
  const lc = headers.map((h) => h.toLowerCase())
  for (const c of candidates) {
    const idx = lc.indexOf(c.toLowerCase())
    if (idx >= 0) return headers[idx]
  }
  return null
}

export function rowToBluebeam(row: Record<string, string>, headers: string[]): BluebeamRow {
  const subjectKey = pickHeader(headers, ['Subject', 'Tool', 'Markup'])
  const pageKey = pickHeader(headers, ['Page Label', 'Page'])
  const typeKey = pickHeader(headers, ['Type', 'Markup Type'])
  const layerKey = pickHeader(headers, ['Layer'])
  const commentsKey = pickHeader(headers, ['Comments', 'Comment', 'Notes'])
  const areaKey = pickHeader(headers, ['Area'])
  const lengthKey = pickHeader(headers, ['Length'])
  const widthKey = pickHeader(headers, ['Width'])
  const heightKey = pickHeader(headers, ['Height'])

  return {
    subject: subjectKey ? row[subjectKey] : '',
    page: pageKey ? row[pageKey] : '',
    type: typeKey ? row[typeKey] : '',
    layer: layerKey ? row[layerKey] : '',
    comments: commentsKey ? row[commentsKey] : '',
    areaSqFt: areaKey ? parseAreaToSqFt(row[areaKey]) : null,
    lengthFt: lengthKey ? parseLengthToFt(row[lengthKey]) : null,
    widthFt: widthKey ? parseLengthToFt(row[widthKey]) : null,
    heightFt: heightKey ? parseLengthToFt(row[heightKey]) : null,
    raw: row,
  }
}

function fmtMoney(n: number): string {
  return `$${n.toFixed(2)}`
}

function fmtSqFt(n: number): string {
  return `${n.toFixed(1)} sf`
}

export function draftFromRow(
  row: BluebeamRow,
  rowIndex: number,
  mapping: ToolMapping,
  catalog: Catalog,
): DraftedItem | { error: string } {
  const markupId = `${row.page || 'p?'}#${rowIndex + 1}`

  if (mapping.trade === 'film') {
    const film = catalog.films.find((f) => f.id === mapping.catalogId) ?? catalog.films[0]
    if (!film) return { error: 'no film in catalog' }
    const sqft = row.areaSqFt ?? (row.widthFt && row.heightFt ? row.widthFt * row.heightFt : null)
    if (!sqft || sqft <= 0) return { error: 'no area found in CSV row' }
    const wastePct = mapping.wastePct ?? 10
    const labor = mapping.laborPerSqFt ?? 4
    const sqftWithWaste = sqft * (1 + wastePct / 100)
    const material = sqftWithWaste * film.costPerSqFt
    const laborCost = sqft * labor
    const total = round2(material + laborCost)
    return {
      rowIndex,
      bluebeamSubject: row.subject,
      page: row.page,
      trade: 'film',
      title: `${row.subject} — ${fmtSqFt(sqft)}${row.page ? ` · ${row.page}` : ''}`,
      summary: `${film.name} · ${wastePct}% waste · $${labor}/sf labor`,
      total,
      lineItems: [
        { label: 'Glass area', value: fmtSqFt(sqft) },
        { label: 'Film', value: film.name, muted: true },
        { label: `Material (+${wastePct}% waste)`, value: fmtMoney(material) },
        { label: 'Labor', value: fmtMoney(laborCost) },
        { label: 'Total', value: fmtMoney(total) },
      ],
      catalogChoice: film.name,
      bluebeamMarkupId: markupId,
    }
  }

  if (mapping.trade === 'wallcovering') {
    const wc = catalog.wallcoverings.find((w) => w.id === mapping.catalogId) ?? catalog.wallcoverings[0]
    if (!wc) return { error: 'no wallcovering in catalog' }
    const sqft = row.areaSqFt ?? (row.lengthFt && row.heightFt ? row.lengthFt * row.heightFt : null)
    if (!sqft || sqft <= 0) return { error: 'no area found in CSV row' }
    const wastePct = mapping.wastePct ?? wc.patternWastePct
    const labor = mapping.laborPerSqFt ?? 3
    const sqftWithWaste = sqft * (1 + wastePct / 100)
    const rolls = Math.ceil(sqftWithWaste / wc.usableSqFtPerRoll)
    const material = rolls * wc.costPerRoll
    const laborCost = sqft * labor
    const total = round2(material + laborCost)
    return {
      rowIndex,
      bluebeamSubject: row.subject,
      page: row.page,
      trade: 'wallcovering',
      title: `${row.subject} — ${fmtSqFt(sqft)}${row.page ? ` · ${row.page}` : ''}`,
      summary: `${wc.name} · ${rolls} rolls · ${wastePct}% waste`,
      total,
      lineItems: [
        { label: 'Wall area', value: fmtSqFt(sqft) },
        { label: 'Product', value: wc.name, muted: true },
        { label: `Rolls needed (+${wastePct}% waste)`, value: `${rolls} × ${fmtMoney(wc.costPerRoll)}` },
        { label: 'Material', value: fmtMoney(material) },
        { label: 'Labor', value: fmtMoney(laborCost) },
        { label: 'Total', value: fmtMoney(total) },
      ],
      catalogChoice: wc.name,
      bluebeamMarkupId: markupId,
    }
  }

  if (mapping.trade === 'mural') {
    const style = catalog.muralStyles.find((m) => m.id === mapping.catalogId) ?? catalog.muralStyles[0]
    if (!style) return { error: 'no mural style in catalog' }
    const sqft = row.areaSqFt ?? (row.widthFt && row.heightFt ? row.widthFt * row.heightFt : null)
    if (!sqft || sqft <= 0) return { error: 'no area found in CSV row' }
    const material = sqft * style.materialPerSqFt
    const labor = sqft * (mapping.laborPerSqFt ?? style.laborPerSqFt)
    const total = round2(material + labor)
    return {
      rowIndex,
      bluebeamSubject: row.subject,
      page: row.page,
      trade: 'mural',
      title: `${row.subject} — ${fmtSqFt(sqft)}${row.page ? ` · ${row.page}` : ''}`,
      summary: `${style.name} · $${style.materialPerSqFt}/sf material + $${mapping.laborPerSqFt ?? style.laborPerSqFt}/sf labor`,
      total,
      lineItems: [
        { label: 'Wall area', value: fmtSqFt(sqft) },
        { label: 'Style', value: style.name, muted: true },
        { label: 'Material', value: fmtMoney(material) },
        { label: 'Labor', value: fmtMoney(labor) },
        { label: 'Total', value: fmtMoney(total) },
      ],
      catalogChoice: style.name,
      bluebeamMarkupId: markupId,
    }
  }

  return { error: 'unknown trade' }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function buildImportRows(
  parsed: { headers: string[]; rows: Array<Record<string, string>> },
  matchTool: (subject: string) => ToolMapping | null,
  catalog: Catalog,
): ImportRow[] {
  return parsed.rows.map((raw, idx) => {
    const bb = rowToBluebeam(raw, parsed.headers)
    const mapping = matchTool(bb.subject)
    if (!mapping) {
      return { rowIndex: idx, bluebeam: bb, mapping: null, drafted: null, warning: 'no tool mapping' }
    }
    const drafted = draftFromRow(bb, idx, mapping, catalog)
    if ('error' in drafted) {
      return { rowIndex: idx, bluebeam: bb, mapping, drafted: null, warning: drafted.error }
    }
    return { rowIndex: idx, bluebeam: bb, mapping, drafted }
  })
}
