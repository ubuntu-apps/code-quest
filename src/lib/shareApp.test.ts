import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatInstallGuidesText } from '../platform'
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

  it('includes intro, link, and install guides in share order', () => {
    vi.stubGlobal('window', { location: { origin: 'https://example.github.io' } })
    const url = expectedShareUrl('https://example.github.io')
    const text = buildShareText()

    expect(text).toBe(formatInstallGuidesText(url))
    expect(text).toContain('Open or install: ' + url)
    expect(text.indexOf('Install on iPhone / iPad')).toBeLessThan(text.indexOf('Install on Android'))
    expect(text.indexOf('Install on Android')).toBeLessThan(text.indexOf('Install on desktop'))
    expect(text).toContain('1. Open CodeQuest in Safari')
    expect(text).toContain('1. Open CodeQuest in Chrome.')
  })

  it('uses native share when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { share })
    vi.stubGlobal('window', { location: { origin: 'https://example.github.io' } })

    await expect(shareApp()).resolves.toBe('shared')
    expect(share).toHaveBeenCalledWith({
      title: 'CodeQuest',
      text: buildShareText(),
    })
  })

  it('copies link when share api is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    vi.stubGlobal('window', { location: { origin: 'https://example.github.io' } })

    await expect(shareApp()).resolves.toBe('copied')
    expect(writeText).toHaveBeenCalledWith(buildShareText())
  })
})
