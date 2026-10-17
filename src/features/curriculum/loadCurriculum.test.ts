import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadLanguageBundle } from './loadCurriculum'

const section = (id: string) => ({ sectionId: id, title: id, levels: [] })

function mockContent(files: Record<string, unknown>) {
  const fetchMock = vi.fn(async (url: string) => {
    const path = url.replace(/^.*?content\//, '').replace(/\?.*$/, '')
    return path in files
      ? new Response(JSON.stringify(files[path]), { status: 200 })
      : new Response('<!doctype html>', { status: 404 })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const LANG = {
  id: 'py',
  title: 'Python',
  sections: [
    { id: 'a', title: 'A', path: 'a.json' },
    { id: 'b', title: 'B', path: 'b.json' },
  ],
}

afterEach(() => vi.unstubAllGlobals())

describe('loadLanguageBundle', () => {
  it('loads every section in index order', async () => {
    mockContent({ 'py1/index.json': LANG, 'py1/a.json': section('a'), 'py1/b.json': section('b') })
    const bundle = await loadLanguageBundle('/base/', 'py1/index.json')
    expect(bundle.sections.map((s) => s.sectionRef.id)).toEqual(['a', 'b'])
  })

  it('shares one download between callers', async () => {
    const fetchMock = mockContent({ 'py2/index.json': LANG, 'py2/a.json': section('a'), 'py2/b.json': section('b') })
    const [first, second] = await Promise.all([
      loadLanguageBundle('/base/', 'py2/index.json'),
      loadLanguageBundle('/base/', 'py2/index.json'),
    ])
    expect(first).toBe(second)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('fetches again with fresh: true', async () => {
    const fetchMock = mockContent({ 'py3/index.json': LANG, 'py3/a.json': section('a'), 'py3/b.json': section('b') })
    await loadLanguageBundle('/base/', 'py3/index.json')
    await loadLanguageBundle('/base/', 'py3/index.json', { fresh: true })
    expect(fetchMock).toHaveBeenCalledTimes(6)
  })

  it('does not remember failures', async () => {
    mockContent({ 'py4/index.json': LANG, 'py4/a.json': section('a') })
    await expect(loadLanguageBundle('/base/', 'py4/index.json')).rejects.toThrow(/Missing section/)
    mockContent({ 'py4/index.json': LANG, 'py4/a.json': section('a'), 'py4/b.json': section('b') })
    const bundle = await loadLanguageBundle('/base/', 'py4/index.json')
    expect(bundle.sections).toHaveLength(2)
  })
})

describe('loadLanguageBundle refresh', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('a fresh download replaces the shared copy', async () => {
    mockContent({ 'py5/index.json': LANG, 'py5/a.json': section('a'), 'py5/b.json': section('b') })
    await loadLanguageBundle('/base/', 'py5/index.json')
    mockContent({ 'py5/index.json': LANG, 'py5/a.json': { ...section('a'), title: 'Edited' }, 'py5/b.json': section('b') })
    await loadLanguageBundle('/base/', 'py5/index.json', { fresh: true })
    const later = await loadLanguageBundle('/base/', 'py5/index.json')
    expect(later.sections[0].file.title).toBe('Edited')
  })

  it('never shares a bundle patched with editor drafts', async () => {
    const draft = { index: LANG, sections: [{ sectionRef: LANG.sections[1], file: { ...section('b'), title: 'Draft' } }] }
    mockContent({ 'py6/index.json': LANG, 'py6/a.json': section('a') })
    const patched = await loadLanguageBundle('/base/', 'py6/index.json', { fallbackBundle: draft })
    expect(patched.sections[1].file.title).toBe('Draft')
    mockContent({ 'py6/index.json': LANG, 'py6/a.json': section('a'), 'py6/b.json': section('b') })
    const plain = await loadLanguageBundle('/base/', 'py6/index.json')
    expect(plain.sections[1].file.title).toBe('b')
  })
})
