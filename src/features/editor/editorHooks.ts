import type { EditorContextValue } from './EditorContext'
import { useEditor } from './EditorContext'

export type EditorModeValue = Pick<
  EditorContextValue,
  'canEdit' | 'isEditMode' | 'setEditMode' | 'toggleEditMode'
>

export type EditorConfirmValue = Pick<EditorContextValue, 'requestConfirm'>

export type EditorExportValue = Pick<
  EditorContextValue,
  'exportRootIndex' | 'exportLanguageIndex' | 'exportSection'
>

export type EditorDraftValue = Pick<
  EditorContextValue,
  | 'rootIndex'
  | 'homeLead'
  | 'getBundle'
  | 'syncRootIndex'
  | 'syncBundle'
  | 'updateLanguage'
  | 'updateHomeLead'
  | 'updateLanguageTitle'
  | 'updateSectionTitle'
  | 'updateLevelTitle'
  | 'updateLevelIntro'
  | 'updateChallenge'
  | 'updateTestPassingScore'
  | 'updateTestQuestion'
>

export type EditorCatalogValue = Pick<
  EditorContextValue,
  | 'addLanguage'
  | 'removeLanguage'
  | 'moveLanguage'
  | 'addSection'
  | 'removeSection'
  | 'moveSection'
  | 'addLevel'
  | 'removeLevel'
  | 'moveLevel'
  | 'addChallenge'
  | 'removeChallenge'
  | 'moveChallenge'
  | 'addTestQuestion'
  | 'removeTestQuestion'
  | 'moveTestQuestion'
>

export type EditorAboutValue = Pick<
  EditorContextValue,
  | 'aboutContent'
  | 'initAboutContent'
  | 'updateAboutLead'
  | 'updateAboutInstallIntro'
  | 'updateAboutInstallStep'
  | 'addAboutInstallStep'
  | 'removeAboutInstallStep'
  | 'moveAboutInstallStep'
>

export function useEditorMode(): EditorModeValue {
  const { canEdit, isEditMode, setEditMode, toggleEditMode } = useEditor()
  return { canEdit, isEditMode, setEditMode, toggleEditMode }
}

export function useEditorConfirm(): EditorConfirmValue {
  const { requestConfirm } = useEditor()
  return { requestConfirm }
}

export function useEditorExport(): EditorExportValue {
  const { exportRootIndex, exportLanguageIndex, exportSection } = useEditor()
  return { exportRootIndex, exportLanguageIndex, exportSection }
}

export function useEditorDraft(): EditorDraftValue {
  const ctx = useEditor()
  return {
    rootIndex: ctx.rootIndex,
    homeLead: ctx.homeLead,
    getBundle: ctx.getBundle,
    syncRootIndex: ctx.syncRootIndex,
    syncBundle: ctx.syncBundle,
    updateLanguage: ctx.updateLanguage,
    updateHomeLead: ctx.updateHomeLead,
    updateLanguageTitle: ctx.updateLanguageTitle,
    updateSectionTitle: ctx.updateSectionTitle,
    updateLevelTitle: ctx.updateLevelTitle,
    updateLevelIntro: ctx.updateLevelIntro,
    updateChallenge: ctx.updateChallenge,
    updateTestPassingScore: ctx.updateTestPassingScore,
    updateTestQuestion: ctx.updateTestQuestion,
  }
}

export function useEditorCatalog(): EditorCatalogValue {
  const ctx = useEditor()
  return {
    addLanguage: ctx.addLanguage,
    removeLanguage: ctx.removeLanguage,
    moveLanguage: ctx.moveLanguage,
    addSection: ctx.addSection,
    removeSection: ctx.removeSection,
    moveSection: ctx.moveSection,
    addLevel: ctx.addLevel,
    removeLevel: ctx.removeLevel,
    moveLevel: ctx.moveLevel,
    addChallenge: ctx.addChallenge,
    removeChallenge: ctx.removeChallenge,
    moveChallenge: ctx.moveChallenge,
    addTestQuestion: ctx.addTestQuestion,
    removeTestQuestion: ctx.removeTestQuestion,
    moveTestQuestion: ctx.moveTestQuestion,
  }
}

export function useEditorAbout(): EditorAboutValue {
  const ctx = useEditor()
  return {
    aboutContent: ctx.aboutContent,
    initAboutContent: ctx.initAboutContent,
    updateAboutLead: ctx.updateAboutLead,
    updateAboutInstallIntro: ctx.updateAboutInstallIntro,
    updateAboutInstallStep: ctx.updateAboutInstallStep,
    addAboutInstallStep: ctx.addAboutInstallStep,
    removeAboutInstallStep: ctx.removeAboutInstallStep,
    moveAboutInstallStep: ctx.moveAboutInstallStep,
  }
}
