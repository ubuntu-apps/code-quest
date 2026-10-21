import { CERTIFICATE_HEIGHT, CERTIFICATE_WIDTH } from './CertificateArt'
import type { CertificateSubject } from './certificateSubject'
import { imagePdf } from './certificatePdf'
import { saveFile, type SaveResult } from '../../lib/saveFile'

/** Draws the certificate SVG onto a canvas, `scale` times its size for sharp printing. */
async function certificateCanvas(svg: SVGSVGElement, scale: number): Promise<HTMLCanvasElement> {
  const xml = new XMLSerializer().serializeToString(svg)
  const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Could not draw the certificate.'))
      img.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = CERTIFICATE_WIDTH * scale
    canvas.height = CERTIFICATE_HEIGHT * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not draw the certificate.')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas
  } finally {
    URL.revokeObjectURL(url)
  }
}

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not save the certificate.'))), type, quality)
  })
}

/** The certificate as a PNG image. */
export async function certificatePng(svg: SVGSVGElement, scale = 2): Promise<Blob> {
  return canvasBlob(await certificateCanvas(svg, scale), 'image/png')
}

/** The certificate as a one-page PDF (a sharp picture of it, sized for printing). */
export async function certificatePdf(svg: SVGSVGElement, title: string): Promise<Blob> {
  const canvas = await certificateCanvas(svg, 3)
  const jpeg = new Uint8Array(await (await canvasBlob(canvas, 'image/jpeg', 0.92)).arrayBuffer())
  return imagePdf({ jpeg, width: canvas.width, height: canvas.height }, { title })
}

/**
 * Saves the certificate: as a PDF, or a PNG image if picked in the save dialog (see
 * saveFile for where it goes).
 */
export function saveCertificate(svg: SVGSVGElement, name: string): Promise<SaveResult> {
  return saveFile(
    name,
    [
      { description: 'PDF document', mimeType: 'application/pdf', extension: '.pdf' },
      { description: 'PNG image', mimeType: 'image/png', extension: '.png' },
    ],
    (type) => (type.extension === '.png' ? certificatePng(svg) : certificatePdf(svg, name)),
  )
}

/** Prints only the certificate: print styles hide the rest of the page while this class is on. */
export function printCertificate(): void {
  document.body.classList.add('cq-printing-certificate')
  const done = () => {
    document.body.classList.remove('cq-printing-certificate')
    window.removeEventListener('afterprint', done)
  }
  window.addEventListener('afterprint', done)
  window.print()
}

/** "ubuntu-apps.github.io/code-quest" for the certificate, from the app's own address. */
export function siteLabel(baseUrl: string): string {
  const path = baseUrl.replace(/\/$/, '')
  return `${window.location.host}${path}`
}

/**
 * The file name to suggest, without its extension: "Certificate for Section 1 -
 * Fundamentals of the Python Course", or "Certificate for the Python Course".
 * Characters that file names can't hold (such as ":" on Windows) are left out.
 */
export function certificateFilename(subject: CertificateSubject): string {
  const name = subject.section
    ? `Certificate for Section ${subject.section.number} - ${subject.section.title} of the ${subject.courseTitle} Course`
    : `Certificate for the ${subject.courseTitle} Course`
  // eslint-disable-next-line no-control-regex
  return name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').replace(/\s+/g, ' ').trim()
}
