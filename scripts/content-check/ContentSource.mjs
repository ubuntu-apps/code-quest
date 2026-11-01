/**
 * Where the content checker reads from: the published lessons (public/content) and each
 * language's language.json (src/features/languages). Node reads the files; the dev app's
 * console fetches them from the dev server.
 */
export class ContentSource {
  /** A published file, such as `index.json` or `r/vectors.json`. */
  async content(_path) {
    throw new Error('ContentSource.content() is not implemented')
  }

  /** A language's language.json. */
  async languageSpec(_id) {
    throw new Error('ContentSource.languageSpec() is not implemented')
  }
}

/** Reads from the repository's files (Node). */
export class FileContentSource extends ContentSource {
  /** @param {string} root The repository's folder. */
  constructor(root) {
    super()
    this.root = root
  }

  async read(...parts) {
    const { readFile } = await import('node:fs/promises')
    const { join } = await import('node:path')
    return JSON.parse(await readFile(join(this.root, ...parts), 'utf8'))
  }

  content(path) {
    return this.read('public', 'content', path)
  }

  languageSpec(id) {
    return this.read('src', 'features', 'languages', id, 'language.json')
  }
}

/** Fetches from the dev server (the dev app's console). */
export class FetchContentSource extends ContentSource {
  /** @param {string} base The app's base URL, such as `/code-quest/`. */
  constructor(base) {
    super()
    this.base = base
  }

  async fetchJson(path) {
    const response = await fetch(`${this.base}${path}`)
    if (!response.ok) throw new Error(`${path}: ${response.status}`)
    return response.json()
  }

  content(path) {
    return this.fetchJson(`content/${path}`)
  }

  languageSpec(id) {
    return this.fetchJson(`src/features/languages/${id}/language.json`)
  }
}
