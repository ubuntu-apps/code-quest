/**
 * Saving a file the learner made (a certificate, a progress backup). Where the browser
 * can (Chrome and Edge on computers), it asks where to save and under what name.
 * Elsewhere, and in app windows that don't show that dialog, the file is downloaded
 * with the suggested name, usually into the Downloads folder.
 */

/** The parts of the File System Access API used here. */
interface SaveFilePickerOptions {
  suggestedName?: string
  startIn?: 'downloads' | 'documents' | 'desktop'
  types?: { description: string; accept: Record<string, string[]> }[]
}
type ShowSaveFilePicker = (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>

export type SaveResult = { kind: 'saved' | 'downloaded'; filename: string } | { kind: 'cancelled' }

/** A file type the learner can pick in the save dialog, e.g. PDF or PNG. */
export interface SaveFileType {
  description: string
  mimeType: string
  /** With the dot: ".pdf". */
  extension: string
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

/**
 * Saves a file named `name` plus the first type's extension. `make` builds the file for
 * the type chosen (the first type unless the learner picked another in the dialog).
 */
export async function saveFile(
  name: string,
  types: SaveFileType[],
  make: (type: SaveFileType) => Blob | Promise<Blob>,
): Promise<SaveResult> {
  const first = types[0]
  const suggestedName = `${name}${first.extension}`
  const picker = (window as unknown as { showSaveFilePicker?: ShowSaveFilePicker }).showSaveFilePicker
  // The dialog is opened first, while the click still counts as the learner's own action.
  if (typeof picker === 'function' && window.self === window.top) {
    let handle: FileSystemFileHandle | null = null
    const openedAt = Date.now()
    try {
      handle = await picker({
        suggestedName,
        startIn: 'downloads',
        types: types.map((t) => ({ description: t.description, accept: { [t.mimeType]: [t.extension] } })),
      })
    } catch (e: unknown) {
      // Some app windows close the dialog at once without showing it; only a later
      // close is the learner pressing Cancel.
      const shown = Date.now() - openedAt > 600
      if (e instanceof DOMException && e.name === 'AbortError' && shown) return { kind: 'cancelled' }
      // Not allowed or not shown here: fall back to a download.
    }
    if (handle) {
      const chosen = types.find((t) => handle.name.toLowerCase().endsWith(t.extension)) ?? first
      const blob = await make(chosen)
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return { kind: 'saved', filename: handle.name }
    }
  }
  downloadBlob(await make(first), suggestedName)
  return { kind: 'downloaded', filename: suggestedName }
}

/** The line to show after saving: where the file went. */
export function savedMessage(result: SaveResult): string | null {
  if (result.kind === 'saved') return `Saved as "${result.filename}".`
  if (result.kind === 'downloaded') return `Downloaded "${result.filename}" to your Downloads folder.`
  return null
}
