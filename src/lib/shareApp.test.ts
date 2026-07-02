import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatInstallGuidesText, formatInstallGuidesTextShort } from '../platform'
import { buildShareText, getAppShareUrl, shareApp } from './shareApp'

function expectedShareUrl(origin: string): string {
  return new URL(import.meta.env.BASE_URL, origin).href
}

describe('shareApp', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('builds share url from base path', () => {
    vi.stubGlobal('window', { location: { origin: 'https://example.github.io' } })
    expect(getAppShareUrl()).toBe(expectedShareUrl('https://example.github.io'))
  })

  it('builds full share text with install guides', () => {
    vi.stubGlobal('window', { location: { origin: 'https://example.github.io' } })
    const url = expectedShareUrl('https://example.github.io')
    const text = buildShareText('full')

    expect(text).toBe(formatInstallGuidesText(url))
    expect(text).toContain('Install on iPhone / iPad')
    expect(text).toContain('Install on desktop')
  })

  it('builds short share text for text messages', () => {
    vi.stubGlobal('window', { location: { origin: 'https://example.github.io' } })
    const url = expectedShareUrl('https://example.github.io')
    const text = buildShareText('text')

    expect(text).toBe(formatInstallGuidesTextShort(url))
    expect(text).toContain(`Install: ${url}`)
    expect(text).toContain('iPhone/iPad: open in Safari')
    expect(text).not.toContain('Install on iPhone / iPad:')
  })

  it('uses native share when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { share })
    vi.stubGlobal('window', { location: { origin: 'https://example.github.io' } })

    await expect(shareApp('text')).resolves.toBe('shared')
    expect(share).toHaveBeenCalledWith({
      title: 'CodeQuest',
      text: buildShareText('text'),
    })
  })

  it('copies link when share api is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    vi.stubGlobal('window', { location: { origin: 'https://example.github.io' } })

    await expect(shareApp('full')).resolves.toBe('copied')
    expect(writeText).toHaveBeenCalledWith(buildShareText('full'))
  })
})
