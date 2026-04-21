import { useEffect, useState } from 'react'
import { Lightbulb, X, type LucideIcon } from 'lucide-react'

type Props = {
  id: string
  Icon?: LucideIcon
  title: string
  steps: string[]
}

/**
 * Dismissable how-to banner that appears at the top of a calculator.
 * Persists the dismissed state per-section in localStorage so papi only sees
 * it the first time (and can re-read via the Guide tab any time).
 */
export default function SectionGuide({ id, Icon = Lightbulb, title, steps }: Props) {
  const storageKey = `igc-guide-${id}`
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      if (dismissed) localStorage.setItem(storageKey, '1')
      else localStorage.removeItem(storageKey)
    } catch {
      // ignore
    }
  }, [dismissed, storageKey])

  if (dismissed) return null

  return (
    <section className="bg-igc-accent-light border border-igc-accent/30 rounded-lg p-5 flex items-start gap-4">
      <div className="flex-shrink-0 w-11 h-11 rounded-md bg-igc-accent text-white flex items-center justify-center">
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-base font-semibold text-igc-ink mb-2">{title}</div>
        <ol className="text-sm text-igc-ink/85 space-y-1.5 list-none leading-relaxed">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-igc-accent dark:text-blue-300 font-semibold flex-shrink-0 tabular-nums">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 text-igc-muted hover:text-igc-ink"
        title="Hide this guide"
        aria-label="Hide guide"
      >
        <X size={18} strokeWidth={1.75} />
      </button>
    </section>
  )
}
