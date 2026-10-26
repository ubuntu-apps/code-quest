import { createContext } from 'react'

/** The course's language, so lesson text can colour its code and the phone key bar offers the right symbols. */
export const CodeLanguageContext = createContext<string | null>(null)
