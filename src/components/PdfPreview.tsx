import { useEffect, useRef, useState } from 'react'
import { useEstimate } from '../estimate/EstimateContext'
import { generatePdfBlobUrl } from '../estimate/generatePdf'

const DEBOUNCE_MS = 200

export default function PdfPreview() {
  const { quotes, client, grandTotal } = useEstimate()
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [stale, setStale] = useState(false)
  const prevUrlRef = useRef<string | null>(null)

  useEffect(() => {
    setStale(true)
    const timer = setTimeout(() => {
      const url = generatePdfBlobUrl(quotes, client, grandTotal)
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
      prevUrlRef.current = url
      setBlobUrl(url)
      setStale(false)
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [quotes, client, grandTotal])

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
    }
  }, [])

  return (
    <div className="sticky top-4 h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="text-xs uppercase tracking-wider text-igc-muted">Live preview</div>
        <div className="text-[10px] text-igc-muted">
          {stale ? (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-igc-purple animate-pulse" />
              updating…
            </span>
          ) : (
            <span className="text-emerald-600">● synced</span>
          )}
        </div>
      </div>

      <div className="flex-1 bg-neutral-200 rounded-lg overflow-hidden border border-igc-line shadow-sm">
        {blobUrl ? (
          <iframe
            src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
            title="Estimate PDF preview"
            className="w-full h-full bg-white"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-igc-muted">
            Preview rendering…
          </div>
        )}
      </div>
    </div>
  )
}
