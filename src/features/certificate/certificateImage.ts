import { CERTIFICATE_HEIGHT, CERTIFICATE_WIDTH } from './CertificateArt'
import type { CertificateSubject } from './certificateSubject'

/** Draws the certificate SVG onto a canvas and returns it as a PNG (2x for sharp printing). */
export async function certificatePng(svg: SVGSVGElement, scale = 2): Promise<Blob> {
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
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not save the image.'))), 'image/png')
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
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

/** "codequest-python-certificate.png", or "codequest-python-fundamentals-certificate.png" for a section. */
export function certificateFilename(subject: CertificateSubject): string {
  const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const parts = [slug(subject.courseTitle) || 'course', subject.section ? slug(subject.section.title) : '']
  return `codequest-${parts.filter(Boolean).join('-')}-certificate.png`
}
