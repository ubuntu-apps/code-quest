/**
 * A one-page PDF holding a single JPEG image, written by hand so the app needs no PDF
 * library. The page is US Letter or A4 (landscape, by the browser's region) with the
 * image centred inside a small margin.
 */

const LETTER_REGIONS = new Set(['US', 'CA', 'MX', 'PH', 'CL', 'CO', 'VE', 'GT', 'CR', 'PR'])

/** Landscape page size in points (1/72 inch). */
export function pageSize(locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US'): {
  width: number
  height: number
} {
  let region = ''
  try {
    region = new Intl.Locale(locale).maximize().region ?? ''
  } catch {
    // An odd locale string: fall back to A4.
  }
  return LETTER_REGIONS.has(region) ? { width: 792, height: 612 } : { width: 842, height: 595 }
}

/** PDF text string for the document title, as UTF-16 so any name or title works. */
function pdfText(text: string): string {
  let hex = 'FEFF'
  for (let i = 0; i < text.length; i += 1) hex += text.charCodeAt(i).toString(16).padStart(4, '0').toUpperCase()
  return `<${hex}>`
}

export interface PdfImage {
  /** JPEG file bytes. */
  jpeg: Uint8Array
  /** Pixel size of the JPEG. */
  width: number
  height: number
}

export function imagePdf(image: PdfImage, options: { title: string; page?: { width: number; height: number } }): Blob {
  const page = options.page ?? pageSize()
  const margin = 18
  const scale = Math.min((page.width - 2 * margin) / image.width, (page.height - 2 * margin) / image.height)
  const w = image.width * scale
  const h = image.height * scale
  const x = (page.width - w) / 2
  const y = (page.height - h) / 2
  const content = `q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /Im0 Do Q`

  const encoder = new TextEncoder()
  const parts: Uint8Array[] = []
  const offsets: number[] = []
  let length = 0
  const push = (part: string | Uint8Array) => {
    const bytes = typeof part === 'string' ? encoder.encode(part) : part
    parts.push(bytes)
    length += bytes.length
  }
  const object = (body: string) => {
    offsets.push(length)
    push(`${offsets.length} 0 obj\n${body}\nendobj\n`)
  }

  push('%PDF-1.4\n')
  // A comment of high bytes marks the file as binary for tools that check.
  push(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]))
  object('<< /Type /Catalog /Pages 2 0 R >>')
  object('<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
  object(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.width} ${page.height}] ` +
      '/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>',
  )
  offsets.push(length)
  push(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.jpeg.length} >>\nstream\n`,
  )
  push(image.jpeg)
  push('\nendstream\nendobj\n')
  object(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`)
  object(`<< /Title ${pdfText(options.title)} /Creator (CodeQuest) >>`)

  const xref = length
  push(`xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`)
  for (const offset of offsets) push(`${String(offset).padStart(10, '0')} 00000 n \n`)
  push(`trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF\n`)

  return new Blob(parts as BlobPart[], { type: 'application/pdf' })
}
