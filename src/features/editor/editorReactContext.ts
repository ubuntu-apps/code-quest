import { createContext } from 'react'
import type { EditorContextValue } from './EditorContext'

export const EditorContext = createContext<EditorContextValue | null>(null)
