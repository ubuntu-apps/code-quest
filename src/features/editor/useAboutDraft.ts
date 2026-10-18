import { useCallback, useState } from 'react'
import { moveItem, removeAt } from './arrayHelpers'
import { mergeAboutContent, type AboutContent } from './aboutContent'
import { loadDraftAbout, saveDraftAbout } from './curriculumDraftStorage'

/** The About page's editable text, kept as a local draft while editing. */
export function useAboutDraft() {
  const [aboutContent, setAboutContent] = useState<AboutContent>(() => {
    const draft = loadDraftAbout()
    return draft ?? mergeAboutContent([], null)
  })
  const [aboutInitialized, setAboutInitialized] = useState(false)

  /** Applies a change and saves the draft. */
  const editAbout = useCallback((change: (prev: AboutContent) => AboutContent) => {
    setAboutContent((prev) => {
      const next = change(prev)
      saveDraftAbout(next)
      return next
    })
  }, [])

  const addAboutInstallStep = useCallback(() => {
    editAbout((prev) => ({ ...prev, installSteps: [...prev.installSteps, 'New step'] }))
  }, [editAbout])

  const removeAboutInstallStep = useCallback(
    (index: number) => {
      editAbout((prev) => ({ ...prev, installSteps: removeAt(prev.installSteps, index) }))
    },
    [editAbout],
  )

  const moveAboutInstallStep = useCallback(
    (index: number, direction: -1 | 1) => {
      editAbout((prev) => ({ ...prev, installSteps: moveItem(prev.installSteps, index, direction) }))
    },
    [editAbout],
  )

  const initAboutContent = useCallback(
    (platformSteps: string[]) => {
      if (aboutInitialized) return
      const draft = loadDraftAbout()
      setAboutContent(mergeAboutContent(platformSteps, draft))
      setAboutInitialized(true)
    },
    [aboutInitialized],
  )

  const updateAboutLead = useCallback(
    (text: string) => {
      editAbout((prev) => ({ ...prev, lead: text }))
    },
    [editAbout],
  )

  const updateAboutInstallIntro = useCallback(
    (text: string) => {
      editAbout((prev) => ({ ...prev, installIntro: text }))
    },
    [editAbout],
  )

  const updateAboutInstallStep = useCallback(
    (index: number, text: string) => {
      editAbout((prev) => {
        const steps = [...prev.installSteps]
        steps[index] = text
        return { ...prev, installSteps: steps }
      })
    },
    [editAbout],
  )

  /** Puts back an earlier version (discarding edits) and saves it as the draft. */
  const restoreAbout = useCallback((content: AboutContent) => {
    setAboutContent(content)
    saveDraftAbout(content)
  }, [])

  return {
    aboutContent,
    initAboutContent,
    updateAboutLead,
    updateAboutInstallIntro,
    updateAboutInstallStep,
    addAboutInstallStep,
    removeAboutInstallStep,
    moveAboutInstallStep,
    restoreAbout,
  }
}
