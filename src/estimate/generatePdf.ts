import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { SavedQuote, ClientInfo, TradeKind } from './EstimateContext'

const TRADE_LABELS: Record<TradeKind, string> = {
  film: 'WINDOW FILM',
  wallcovering: 'WALLCOVERING',
  mural: 'MURAL',
}

const BRAND_PURPLE: [number, number, number] = [139, 69, 232]
const INK: [number, number, number] = [26, 26, 26]
const MUTED: [number, number, number] = [107, 107, 107]
const LINE: [number, number, number] = [230, 224, 240]

function fmtCurrency(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function fmtDateLong(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function safeFilename(s: string) {
  return s.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'estimate'
}

export function generatePdf(quotes: SavedQuote[], client: ClientInfo, grandTotal: number) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 48
  const contentWidth = pageWidth - margin * 2

  // ───────── LETTERHEAD ─────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...INK)
  doc.text('IGC Studio', margin, margin + 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('Interior Design · Window Film · Wallcovering · Murals', margin, margin + 24)
  doc.text('igcstudio.com', margin, margin + 36)

  // Right-aligned estimate meta
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...INK)
  doc.text('ESTIMATE', pageWidth - margin, margin + 8, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  if (client.estimateNumber) {
    doc.text(`No. ${client.estimateNumber}`, pageWidth - margin, margin + 24, { align: 'right' })
  }
  doc.text(fmtDateLong(client.dateIso), pageWidth - margin, margin + 36, { align: 'right' })

  // Purple accent line
  doc.setDrawColor(...BRAND_PURPLE)
  doc.setLineWidth(1.5)
  doc.line(margin, margin + 48, pageWidth - margin, margin + 48)

  // ───────── CLIENT BLOCK ─────────
  let y = margin + 72
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text('PREPARED FOR', margin, y)

  y += 14
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...INK)
  doc.text(client.clientName || '—', margin, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  if (client.projectName) {
    y += 14
    doc.text(client.projectName, margin, y)
  }
  if (client.address) {
    y += 12
    doc.text(client.address, margin, y)
  }

  y += 28

  // ───────── LINE ITEMS PER QUOTE ─────────
  if (quotes.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text('No line items added.', margin, y)
    y += 24
  } else {
    quotes.forEach((q, idx) => {
      // Section header per quote
      if (y > pageHeight - 180) {
        doc.addPage()
        y = margin
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...BRAND_PURPLE)
      doc.text(TRADE_LABELS[q.trade], margin, y)

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...MUTED)
      doc.text(`ITEM ${idx + 1}`, margin + 90, y)

      y += 14
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...INK)
      doc.text(q.title, margin, y)

      y += 12
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...MUTED)
      doc.text(q.summary, margin, y)

      y += 8

      // Line items as a two-column table
      const tableBody = q.lineItems.map((li) => [li.label, li.value])

      autoTable(doc, {
        startY: y,
        theme: 'plain',
        margin: { left: margin, right: margin },
        tableWidth: contentWidth,
        styles: {
          fontSize: 9,
          cellPadding: { top: 3, bottom: 3, left: 0, right: 0 },
          textColor: INK,
        },
        columnStyles: {
          0: { cellWidth: contentWidth - 120 },
          1: { cellWidth: 120, halign: 'right', font: 'courier' },
        },
        body: tableBody,
        didParseCell: (data) => {
          const li = q.lineItems[data.row.index]
          if (li?.muted) data.cell.styles.textColor = MUTED
        },
      })

      // @ts-expect-error — lastAutoTable is added by the plugin
      y = (doc.lastAutoTable?.finalY ?? y) + 8

      // Item total row
      doc.setDrawColor(...LINE)
      doc.setLineWidth(0.5)
      doc.line(margin, y, pageWidth - margin, y)

      y += 14
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...INK)
      doc.text('Item total', margin, y)
      doc.setFont('courier', 'bold')
      doc.text(fmtCurrency(q.total), pageWidth - margin, y, { align: 'right' })

      y += 24
    })
  }

  // ───────── GRAND TOTAL ─────────
  if (y > pageHeight - 120) {
    doc.addPage()
    y = margin
  }

  doc.setDrawColor(...BRAND_PURPLE)
  doc.setLineWidth(1.5)
  doc.line(margin, y, pageWidth - margin, y)

  y += 22
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('GRAND TOTAL', margin, y)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...INK)
  doc.text(fmtCurrency(grandTotal), pageWidth - margin, y + 4, { align: 'right' })

  y += 40

  // ───────── NOTES ─────────
  if (client.notes) {
    if (y > pageHeight - 120) {
      doc.addPage()
      y = margin
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text('NOTES', margin, y)

    y += 14
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...INK)
    const wrapped = doc.splitTextToSize(client.notes, contentWidth) as string[]
    doc.text(wrapped, margin, y)
    y += wrapped.length * 12 + 16
  }

  // ───────── FOOTER (every page) ─────────
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    const footerY = pageHeight - 32
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.5)
    doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...MUTED)
    doc.text(
      'Estimate valid for 30 days. Residential: 50% deposit, 50% on completion. Commercial: 33/33/33. Permits, after-hours surcharge, and client-supplied materials excluded unless itemized.',
      margin,
      footerY,
      { maxWidth: contentWidth - 60 },
    )
    doc.text(`Page ${i} / ${totalPages}`, pageWidth - margin, footerY, { align: 'right' })
  }

  const filename = [
    'IGC-Estimate',
    client.estimateNumber || client.dateIso,
    client.clientName ? safeFilename(client.clientName) : null,
  ]
    .filter(Boolean)
    .join('-') + '.pdf'

  doc.save(filename)
}
