import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { LanguageBundle, RootIndex } from '../curriculum/types'
import { ConfirmDialog } from './ConfirmDialog'
import { loadContentSource, saveContentSource, saveDraftAbout, type ContentSource } from './curriculumDraftStorage'
import { captureEditorSnapshot, type EditorDraftSnapshot } from './editorSnapshot'
import { canEditContent, subscribeGitHubAuth } from './editorAuth'
import { DEFAULT_HOME_LEAD } from './editorConstants'
import { EditorContext } from './editorReactContext'
import type { EditorContextValue } from './editorContextValue'
import { useAboutDraft } from './useAboutDraft'
import { useConfirmDialog } from './useConfirmDialog'
import { useCurriculumDraft } from './useCurriculumDraft'

export type { EditorContextValue } from './editorContextValue'

function useCanEdit(): boolean {
  const [canEdit, setCanEdit] = useState(() => canEditContent())
  useEffect(() => subscribeGitHubAuth(() => setCanEdit(canEditContent())), [])
  return canEdit
}

/**
 * The in-app content editor: edit mode and its sessions (begin, save, discard), which
 * content is shown (published or local drafts), and the drafts themselves
 * (useCurriculumDraft, useAboutDraft). The app reads it through the hooks in editorHooks.ts.
 */
export function EditorProvider({ children }: { children: ReactNode }) {
  const canEdit = useCanEdit()
  const [isEditMode, setEditMode] = useState(false)
  const [contentSource, setContentSourceState] = useState<ContentSource>(() => loadContentSource())
  const [editSessionEpoch, setEditSessionEpoch] = useState(0)
  const editSnapshotRef = useRef<EditorDraftSnapshot | null>(null)
  const catalogReloadRef = useRef<(() => void | Promise<void>) | null>(null)

  const setContentSource = useCallback((source: ContentSource) => {
    setContentSourceState(source)
    saveContentSource(source)
  }, [])
  const showLocalContent = useCallback(() => setContentSource('local'), [setContentSource])

  const { confirmState, requestConfirm, closeConfirm } = useConfirmDialog()
  const {
    rootIndex,
    bundles,
    homeLead,
    syncRootIndex,
    syncBundle,
    getBundle,
    updateLanguage,
    updateHomeLead,
    updateLanguageTitle,
    updateSectionTitle,
    updateLevelTitle,
    updateLevelIntro,
    updateChallenge,
    updateTestPassingScore,
    updateTestQuestion,
    addLanguage,
    removeLanguage,
    moveLanguage,
    addSection,
    removeSection,
    moveSection,
    addLevel,
    removeLevel,
    moveLevel,
    addChallenge,
    removeChallenge,
    moveChallenge,
    addTestQuestion,
    removeTestQuestion,
    moveTestQuestion,
    exportRootIndex,
    exportLanguageIndex,
    exportSection,
    importFromGitHub,
    saveToGitHub,
    persistAllDrafts,
    restoreDrafts,
    replaceDrafts,
  } = useCurriculumDraft({ onImport: showLocalContent })
  const {
    aboutContent,
    initAboutContent,
    updateAboutLead,
    updateAboutInstallIntro,
    updateAboutInstallStep,
    addAboutInstallStep,
    removeAboutInstallStep,
    moveAboutInstallStep,
    restoreAbout,
  } = useAboutDraft()

  const restoreEditSnapshot = useCallback(
    (snapshot: EditorDraftSnapshot) => {
      restoreDrafts(snapshot)
      restoreAbout(snapshot.aboutContent)
      setEditSessionEpoch((n) => n + 1)
    },
    [restoreDrafts, restoreAbout],
  )

  const beginEditSession = useCallback(() => {
    editSnapshotRef.current = captureEditorSnapshot(rootIndex, bundles, homeLead, aboutContent)
    setContentSource('local')
    setEditMode(true)
  }, [rootIndex, bundles, homeLead, aboutContent, setContentSource])

  const registerCatalogReload = useCallback((handler: () => void | Promise<void>) => {
    catalogReloadRef.current = handler
    return () => {
      if (catalogReloadRef.current === handler) catalogReloadRef.current = null
    }
  }, [])

  const applyCatalogFromDisk = useCallback(
    (root: RootIndex, loadedBundles: Record<string, LanguageBundle>) => {
      replaceDrafts(root, loadedBundles)
      setEditSessionEpoch((n) => n + 1)
    },
    [replaceDrafts],
  )

  const commitEditSession = useCallback(async () => {
    if (!rootIndex) {
      editSnapshotRef.current = null
      setEditMode(false)
      return
    }
    persistAllDrafts()
    saveDraftAbout(aboutContent)
    const { canSaveCurriculumToDisk, saveCurriculumToDisk } = await import('./localCurriculumApi')
    if (canSaveCurriculumToDisk()) {
      await saveCurriculumToDisk(rootIndex, bundles)
    }
    editSnapshotRef.current = null
    setEditMode(false)
    await catalogReloadRef.current?.()
  }, [persistAllDrafts, aboutContent, rootIndex, bundles])

  const discardEditSession = useCallback(async () => {
    const snapshot = editSnapshotRef.current
    if (!snapshot) {
      setEditMode(false)
      return
    }
    const ok = await requestConfirm('Discard all edits made since you opened edit mode?', {
      title: 'Discard edits',
      confirmLabel: 'Yes, discard',
    })
    if (!ok) return
    restoreEditSnapshot(snapshot)
    editSnapshotRef.current = null
    setEditMode(false)
  }, [requestConfirm, restoreEditSnapshot])

  const toggleEditMode = useCallback(() => {
    if (isEditMode) {
      void discardEditSession()
    } else {
      beginEditSession()
    }
  }, [isEditMode, beginEditSession, discardEditSession])

  const value = useMemo<EditorContextValue>(
    () => ({
      canEdit,
      isEditMode,
      setEditMode,
      toggleEditMode,
      beginEditSession,
      commitEditSession,
      discardEditSession,
      editSessionEpoch,
      registerCatalogReload,
      applyCatalogFromDisk,
      contentSource,
      setContentSource,
      githubHomeLead: DEFAULT_HOME_LEAD,
      rootIndex,
      syncRootIndex,
      updateLanguage,
      updateHomeLead,
      homeLead,
      getBundle,
      syncBundle,
      updateLanguageTitle,
      updateSectionTitle,
      updateLevelTitle,
      updateLevelIntro,
      updateChallenge,
      updateTestPassingScore,
      updateTestQuestion,
      requestConfirm,
      addLanguage,
      removeLanguage,
      moveLanguage,
      addSection,
      removeSection,
      moveSection,
      addLevel,
      removeLevel,
      moveLevel,
      addChallenge,
      removeChallenge,
      moveChallenge,
      addTestQuestion,
      removeTestQuestion,
      moveTestQuestion,
      addAboutInstallStep,
      removeAboutInstallStep,
      moveAboutInstallStep,
      aboutContent,
      initAboutContent,
      updateAboutLead,
      updateAboutInstallIntro,
      updateAboutInstallStep,
      exportRootIndex,
      exportLanguageIndex,
      exportSection,
      importFromGitHub,
      saveToGitHub,
    }),
    [
      canEdit,
      isEditMode,
      toggleEditMode,
      beginEditSession,
      commitEditSession,
      discardEditSession,
      editSessionEpoch,
      registerCatalogReload,
      applyCatalogFromDisk,
      contentSource,
      setContentSource,
      rootIndex,
      syncRootIndex,
      updateLanguage,
      homeLead,
      updateHomeLead,
      getBundle,
      syncBundle,
      updateLanguageTitle,
      updateSectionTitle,
      updateLevelTitle,
      updateLevelIntro,
      updateChallenge,
      updateTestPassingScore,
      updateTestQuestion,
      requestConfirm,
      addLanguage,
      removeLanguage,
      moveLanguage,
      addSection,
      removeSection,
      moveSection,
      addLevel,
      removeLevel,
      moveLevel,
      addChallenge,
      removeChallenge,
      moveChallenge,
      addTestQuestion,
      removeTestQuestion,
      moveTestQuestion,
      addAboutInstallStep,
      removeAboutInstallStep,
      moveAboutInstallStep,
      aboutContent,
      initAboutContent,
      updateAboutLead,
      updateAboutInstallIntro,
      updateAboutInstallStep,
      exportRootIndex,
      exportLanguageIndex,
      exportSection,
      importFromGitHub,
      saveToGitHub,
    ],
  )

  return (
    <EditorContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={confirmState !== null}
        message={confirmState?.message ?? ''}
        title={confirmState?.options?.title}
        confirmLabel={confirmState?.options?.confirmLabel}
        onCancel={() => closeConfirm(false)}
        onConfirm={() => closeConfirm(true)}
      />
    </EditorContext.Provider>
  )
}
