import { afterEach, describe, expect, it, vi } from 'vitest'
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

  it('includes message and link in share text', () => {
    vi.stubGlobal('window', { location: { origin: 'https://example.github.io' } })
    expect(buildShareText()).toBe(
      `Learn coding with CodeQuest — a free app with lessons, challenges, and quizzes. Install it here:\n${expectedShareUrl('https://example.github.io')}`,
    )
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
