import { useRef, useState } from 'react'
import { useEstimate } from '../estimate/EstimateContext'

const MAX_LOGO_DIMENSION = 600 // px — downscale huge uploads for localStorage

export default function BrandSettings() {
  const { brand, setBrand, resetBrand } = useEstimate()
  const [open, setOpen] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function onLogoChange(file: File) {
    setUploadError(null)
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload a PNG, JPEG, or SVG image.')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('File too large — keep logos under 4 MB.')
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(file)
      const shrunk = await shrinkImage(dataUrl, MAX_LOGO_DIMENSION)
      setBrand({ logoDataUrl: shrunk })
    } catch (err) {
      setUploadError('Could not read that image — try another file.')
    }
  }

  function onClearLogo() {
    setBrand({ logoDataUrl: null })
    if (fileRef.current) fileRef.current.value = ''
  }

  const displayName = brand.companyName || '—'
  return (
    <section className="bg-igc-surface border border-igc-line rounded-lg">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-igc-accent-light transition-colors rounded-lg"
      >
        <div className="flex items-center gap-3 min-w-0">
          {brand.logoDataUrl ? (
            <img src={brand.logoDataUrl} alt="" className="w-8 h-8 object-contain rounded bg-igc-surface border border-igc-line" />
          ) : (
            <div className="w-8 h-8 rounded bg-igc-accent flex items-center justify-center text-white text-[10px] font-semibold">
              LOGO
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-semibold text-igc-ink truncate">{displayName}</div>
            <div className="text-xs text-igc-muted truncate">{brand.tagline || 'Add tagline'}</div>
          </div>
        </div>
        <span className="text-xs text-igc-muted flex items-center gap-1.5 flex-shrink-0">
          {open ? 'Collapse' : 'Brand settings'}
          <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
        </span>
      </button>

      {open && (
        <div className="px-6 pb-6 pt-2 border-t border-igc-line space-y-5">
          <div>
            <label className="block text-xs font-medium text-igc-ink mb-2">Logo</label>

            <div className="flex items-start gap-4">
              <div className="w-28 h-20 bg-igc-accent-light border border-igc-line rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                {brand.logoDataUrl ? (
                  <img src={brand.logoDataUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-xs text-igc-muted">No logo</span>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="px-3 py-1.5 bg-igc-accent hover:bg-igc-accent-dark text-white rounded-md text-xs font-medium"
                  >
                    {brand.logoDataUrl ? 'Replace logo' : 'Upload logo'}
                  </button>
                  {brand.logoDataUrl && (
                    <button
                      onClick={onClearLogo}
                      className="px-3 py-1.5 border border-igc-line text-igc-muted hover:text-igc-accent hover:border-igc-accent rounded-md text-xs"
                      title="Clear uploaded logo and restore default"
                    >
                      Use IGC default
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={(e) => e.target.files?.[0] && onLogoChange(e.target.files[0])}
                  className="hidden"
                />

                {brand.logoDataUrl && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-igc-muted mb-1">
                      <span>Size on PDF</span>
                      <span className="font-mono">{brand.logoWidthPt}pt</span>
                    </div>
                    <input
                      type="range"
                      min={32}
                      max={160}
                      step={4}
                      value={brand.logoWidthPt}
                      onChange={(e) => setBrand({ logoWidthPt: +e.target.value })}
                      className="w-full accent-igc-accent"
                    />
                  </div>
                )}

                <p className="text-[11px] text-igc-muted">
                  PNG, JPEG, or SVG. Max 4 MB. Large images auto-shrink to {MAX_LOGO_DIMENSION}px.
                </p>
                {uploadError && <p className="text-[11px] text-red-600">{uploadError}</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Company name">
              <input
                type="text"
                value={brand.companyName}
                onChange={(e) => setBrand({ companyName: e.target.value })}
                className="w-full px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-accent"
              />
            </Field>
            <Field label="Website">
              <input
                type="text"
                value={brand.website}
                onChange={(e) => setBrand({ website: e.target.value })}
                className="w-full px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-accent"
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Tagline / services">
                <input
                  type="text"
                  value={brand.tagline}
                  onChange={(e) => setBrand({ tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-igc-line rounded-md text-sm focus:outline-none focus:border-igc-accent"
                />
              </Field>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                if (confirm('Reset brand to IGC Studio defaults? Logo will be removed.')) resetBrand()
              }}
              className="text-xs text-igc-muted hover:text-red-500"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-igc-ink mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function shrinkImage(dataUrl: string, maxDim: number): Promise<string> {
  // SVGs: store as-is, they're already vector
  if (dataUrl.startsWith('data:image/svg+xml')) return dataUrl

  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('image load failed'))
    img.src = dataUrl
  })

  if (img.width <= maxDim && img.height <= maxDim) return dataUrl

  const scale = maxDim / Math.max(img.width, img.height)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  // Keep PNG for transparency support
  return canvas.toDataURL('image/png')
}
