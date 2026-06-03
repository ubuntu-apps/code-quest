import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CodeQuestScreen } from './features/curriculum/CodeQuestScreen'
import { InstallAppBanner } from './components/InstallAppBanner'
import { EditorProvider } from './features/editor'
import { GitHubAuthCallback } from './features/editor/GitHubAuthCallback'
import { learnHomePath } from './features/curriculum/learnPaths'

function AppRoutes() {
  return (
    <EditorProvider>
      <InstallAppBanner />
      <Routes>
        <Route path="/auth/callback" element={<GitHubAuthCallback />} />
        <Route path="/" element={<Navigate to={learnHomePath()} replace />} />
        <Route path="/*" element={<CodeQuestScreen />} />
      </Routes>
    </EditorProvider>
  )
}

function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '')
  return (
    <BrowserRouter basename={basename}>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
