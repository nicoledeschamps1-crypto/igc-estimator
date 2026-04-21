import { useEffect, useState } from 'react'
import {
  HandMetal,
  Blinds,
  Wallpaper,
  Palette,
  Sparkles,
  FileText,
  LayoutList,
  BookOpen,
  Map,
  Rocket,
  type LucideIcon,
} from 'lucide-react'

type TourStep = {
  targetTab?: string
  title: string
  body: string
  Icon: LucideIcon
}

const STEPS: TourStep[] = [
  {
    Icon: HandMetal,
    title: 'Welcome, Papi',
    body: 'Nicole built this just for IGC Studio. It replaces the guesswork when you quote window film, wallcovering, or mural work. Takes about 2 minutes to walk through.',
  },
  {
    targetTab: 'film',
    Icon: Blinds,
    title: 'Window Film',
    body: 'Add each window group (e.g. "Conference room · 12 windows · 48×60"). Pick the film type, tweak the waste factor and markup, check complexity boxes for arched glass, ladders, etc. Live price updates on the right.',
  },
  {
    targetTab: 'wallcovering',
    Icon: Wallpaper,
    title: 'Wallcovering',
    body: 'Enter perimeter × height, subtract openings. Pick single or double roll, add surface prep (skim coat, primer, old paper removal). Toggle whether client buys material — then you quote labor only.',
  },
  {
    targetTab: 'mural',
    Icon: Palette,
    title: 'Mural',
    body: 'Four complexity tiers from flat color to full signature pieces. Access multiplier for ladder or lift. Design fee option. Deposit schedule set for 50/50 residential or 33/33/33 commercial.',
  },
  {
    targetTab: 'ai',
    Icon: Sparkles,
    title: 'AI Draft',
    body: 'Paste the client\'s scope text (email, RFP, meeting notes). Claude drafts rough line items and cites the sentence it came from. Accept only the ones you trust, dismiss the rest.',
  },
  {
    targetTab: 'estimate',
    Icon: FileText,
    title: 'Estimate',
    body: 'All line items from the other tabs land here. Fill in client info, see a live PDF preview on the right, and hit "Save to pipeline" or "Download PDF" when ready to send.',
  },
  {
    targetTab: 'pipeline',
    Icon: LayoutList,
    title: 'Pipeline',
    body: 'Every saved estimate lives here. Track status (Draft / Sent / Accepted / Declined), see your revenue forecast and win rate, duplicate past estimates as templates.',
  },
  {
    targetTab: 'catalog',
    Icon: BookOpen,
    title: 'Catalog',
    body: 'Your default product list — film types, wallcovering rolls, mural tiers. Edit names and rates here and every calculator picks up the change. Share your real rate card with Nicole and she\'ll plug it in.',
  },
  {
    targetTab: 'guide',
    Icon: Map,
    title: 'Guide',
    body: 'The roadmap, how-it-works, and reference for every section. Come back here any time — and you can replay this tour from the header "Tour" button.',
  },
  {
    Icon: Rocket,
    title: 'Ready to go',
    body: 'Start on Window Film, click "+ Add window group", and fill in the first row. When the total looks right, hit "+ Add to estimate" then switch to Estimate to see it land. Ask Nicole anything.',
  },
]

const STORAGE_KEY = 'igc-onboarded'

type Props = {
  open: boolean
  onClose: () => void
  onNavigate: (tabId: string) => void
}

export default function OnboardingTour({ open, onClose, onNavigate }: Props) {
  const [stepIdx, setStepIdx] = useState(0)

  useEffect(() => {
    if (!open) setStepIdx(0)
  }, [open])

  useEffect(() => {
    if (!open) return
    const step = STEPS[stepIdx]
    if (step.targetTab) onNavigate(step.targetTab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx, open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stepIdx])

  if (!open) return null

  const step = STEPS[stepIdx]
  const isFirst = stepIdx === 0
  const isLast = stepIdx === STEPS.length - 1

  function next() {
    if (isLast) finish()
    else setStepIdx((i) => Math.min(STEPS.length - 1, i + 1))
  }
  function back() {
    if (!isFirst) setStepIdx((i) => Math.max(0, i - 1))
  }
  function finish() {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-8"
      style={{ background: 'rgba(15, 12, 25, 0.65)' }}
      onClick={finish}
    >
      <div
        className="w-full max-w-lg bg-igc-surface rounded-xl shadow-2xl overflow-hidden border border-igc-line"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress */}
        <div className="h-1 bg-igc-line">
          <div
            className="h-full bg-igc-accent transition-all duration-300"
            style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-igc-accent-light text-igc-accent dark:text-blue-300 flex items-center justify-center">
              <step.Icon size={26} strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-igc-muted font-semibold mb-1">
                Step {stepIdx + 1} of {STEPS.length}
              </div>
              <h2 className="text-xl font-bold text-igc-ink">{step.title}</h2>
            </div>
          </div>
          <p className="text-sm text-igc-ink/90 leading-relaxed mb-6">{step.body}</p>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={finish}
              className="text-xs text-igc-muted hover:text-igc-ink"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={back}
                  className="px-4 py-2 text-sm text-igc-ink border border-igc-line rounded-md hover:border-igc-accent"
                >
                  Back
                </button>
              )}
              <button
                onClick={next}
                className="px-5 py-2 bg-igc-accent hover:bg-igc-accent-dark text-white rounded-md text-sm font-medium"
              >
                {isLast ? "Let's go" : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function hasBeenOnboarded(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function resetOnboarding() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
