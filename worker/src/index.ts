export interface Env {
  ANTHROPIC_API_KEY: string
  ALLOWED_ORIGINS: string
  MODEL: string
}

type CatalogFilm = { name: string; rollWidthIn: number; costPerSqFt: number }
type CatalogWall = {
  name: string
  rollType: 'single' | 'double'
  usableSqFtPerRoll: number
  costPerRoll: number
  patternWastePct: number
}
type CatalogMural = { name: string; description?: string; materialPerSqFt: number; laborPerSqFt: number }

type DraftRequest = {
  scope: string
  catalog: {
    film: CatalogFilm[]
    wallcovering: CatalogWall[]
    mural: CatalogMural[]
  }
}

type DraftItem = {
  trade: 'film' | 'wallcovering' | 'mural'
  title: string
  summary: string
  estimatedTotal: number
  sourceQuote: string
  confidence: 'high' | 'medium' | 'low'
  assumptions: string[]
  catalogChoice?: string
}

const DRAFT_TOOL = {
  name: 'draft_estimate',
  description:
    'Return a list of proposed estimate line items derived from the scope text. Each item must quote its source from the scope verbatim and flag its confidence.',
  input_schema: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        description: 'Line items proposed for the estimate.',
        items: {
          type: 'object',
          properties: {
            trade: {
              type: 'string',
              enum: ['film', 'wallcovering', 'mural'],
              description: 'Which IGC trade this item belongs to.',
            },
            title: {
              type: 'string',
              description: 'Short label (e.g. "Lobby privacy film — 6 windows").',
            },
            summary: {
              type: 'string',
              description: 'One-sentence summary of scope + assumed size/quantity.',
            },
            estimatedTotal: {
              type: 'number',
              description: 'Rough total in USD (material + labor + reasonable markup).',
            },
            sourceQuote: {
              type: 'string',
              description: 'Verbatim quote from the scope text that justifies this item. If none exists, write "assumed — not in scope".',
            },
            confidence: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'high = scope clearly specifies; medium = scope implies; low = assumption.',
            },
            assumptions: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of assumptions made (e.g. "assumed 48×60 glass" or "assumed 10 ft ceiling").',
            },
            catalogChoice: {
              type: 'string',
              description: 'Name of the catalog product chosen (must match one of the provided catalog names), if applicable.',
            },
          },
          required: ['trade', 'title', 'summary', 'estimatedTotal', 'sourceQuote', 'confidence', 'assumptions'],
        },
      },
    },
    required: ['items'],
  },
}

function corsHeaders(origin: string | null, allowed: string[]): HeadersInit {
  const match = origin && allowed.includes(origin) ? origin : allowed[0]
  return {
    'Access-Control-Allow-Origin': match,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function buildSystemPrompt(catalog: DraftRequest['catalog']): string {
  const filmLines = catalog.film
    .map((f) => `- ${f.name} — ${f.rollWidthIn}" roll · $${f.costPerSqFt}/sf`)
    .join('\n')
  const wallLines = catalog.wallcovering
    .map(
      (w) =>
        `- ${w.name} — ${w.rollType} roll · ${w.usableSqFtPerRoll} sf/roll · $${w.costPerRoll}/roll · ${w.patternWastePct}% waste`,
    )
    .join('\n')
  const muralLines = catalog.mural
    .map((m) => `- ${m.name} — material $${m.materialPerSqFt}/sf + labor $${m.laborPerSqFt}/sf`)
    .join('\n')

  return `You draft rough construction estimates for IGC Studio (Florida-based interior design firm).
Three trades: Window Film · Wallcovering · Mural.

IGC's current catalog (use these rates — do not invent new products):

WINDOW FILM
${filmLines}

WALLCOVERING
${wallLines}

MURAL
${muralLines}

Rules:
- Read the scope carefully. Propose one line item per distinct piece of work.
- Ground every item in a verbatim quote from the scope (sourceQuote field). If you must assume, set confidence = "low" and put "assumed — not in scope" as the quote.
- Apply IGC's standard assumptions when scope is silent: 35% markup, 7% FL tax, 10% film waste, 15% wallcovering waste, access multiplier 1.0× unless scope mentions ladder/lift.
- For estimatedTotal: material $/sf × sqft × (1 + waste) + labor $/sf × sqft, then +35% markup +7% tax. Round to nearest dollar.
- If scope mentions square footage, use it. Otherwise assume reasonable defaults (e.g. 8ft ceiling, 48×60 windows) and list that in assumptions.
- Mark confidence "low" on anything you're guessing at — you're a starting point, not a final quote.
- Do not output narrative text outside the tool call.`
}

async function handleDraft(req: Request, env: Env, origin: string | null): Promise<Response> {
  const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  const cors = corsHeaders(origin, allowed)

  let body: DraftRequest
  try {
    body = (await req.json()) as DraftRequest
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }

  if (!body.scope || typeof body.scope !== 'string' || body.scope.trim().length < 10) {
    return new Response(JSON.stringify({ error: 'scope too short — paste at least a sentence' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }
  if (body.scope.length > 20000) {
    return new Response(JSON.stringify({ error: 'scope too long (20k char max)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }

  const catalog: DraftRequest['catalog'] = {
    film: Array.isArray(body.catalog?.film) ? body.catalog.film : [],
    wallcovering: Array.isArray(body.catalog?.wallcovering) ? body.catalog.wallcovering : [],
    mural: Array.isArray(body.catalog?.mural) ? body.catalog.mural : [],
  }

  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: env.MODEL || 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: buildSystemPrompt(catalog),
      tools: [DRAFT_TOOL],
      tool_choice: { type: 'tool', name: 'draft_estimate' },
      messages: [
        {
          role: 'user',
          content: `Client scope:\n\n---\n${body.scope}\n---\n\nDraft line items now.`,
        },
      ],
    }),
  })

  if (!claudeRes.ok) {
    const errText = await claudeRes.text()
    return new Response(
      JSON.stringify({ error: 'anthropic call failed', status: claudeRes.status, detail: errText }),
      { status: 502, headers: { 'Content-Type': 'application/json', ...cors } },
    )
  }

  const claudeJson = (await claudeRes.json()) as {
    content: Array<{ type: string; name?: string; input?: { items: DraftItem[] } }>
    usage?: { input_tokens: number; output_tokens: number }
  }

  const toolBlock = claudeJson.content.find((c) => c.type === 'tool_use' && c.name === 'draft_estimate')
  const items = toolBlock?.input?.items ?? []

  return new Response(
    JSON.stringify({
      items,
      usage: claudeJson.usage,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json', ...cors } },
  )
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get('Origin')
    const url = new URL(req.url)
    const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    const cors = corsHeaders(origin, allowed)

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true, model: env.MODEL }), {
        headers: { 'Content-Type': 'application/json', ...cors },
      })
    }

    if (url.pathname === '/draft' && req.method === 'POST') {
      return handleDraft(req, env, origin)
    }

    return new Response('not found', { status: 404, headers: cors })
  },
}
