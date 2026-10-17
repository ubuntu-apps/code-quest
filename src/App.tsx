import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CodeQuestScreen } from './features/curriculum/CodeQuestScreen'
import { InstallAppBanner } from './components/InstallAppBanner'
import { UpdateBanner } from './components/UpdateBanner'
import { EditorProvider } from './features/editor'
import { learnHomePath } from './features/curriculum/learnPaths'

/** GitHub sign-in landing page for editors; learners never load it. */
const GitHubAuthCallback = lazy(() =>
  import('./features/editor/GitHubAuthCallback').then((m) => ({ default: m.GitHubAuthCallback })),
)

function AppRoutes() {
  return (
    <EditorProvider>
      <InstallAppBanner />
      <UpdateBanner />
      <Routes>
        <Route
          path="/auth/callback"
          element={
            <Suspense fallback={null}>
              <GitHubAuthCallback />
            </Suspense>
          }
        />
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
