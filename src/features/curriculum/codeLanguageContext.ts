import { createContext } from 'react'

/** The course's language, so lesson text can colour its code (only Python is coloured for now). */
export const CodeLanguageContext = createContext<string | null>(null)
