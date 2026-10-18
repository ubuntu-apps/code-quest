import { createContext } from 'react'
import type { EditorContextValue } from './editorContextValue'

export const EditorContext = createContext<EditorContextValue | null>(null)
