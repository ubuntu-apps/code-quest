import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { CodeQuestScreen } from './features/curriculum/CodeQuestScreen'
import { InstallAppBanner } from './components/InstallAppBanner'
import { UpdateBanner } from './components/UpdateBanner'
import { EditorProvider } from './features/editor'
import { learnHomePath, learnLanguagePath } from './features/curriculum/learnPaths'
import { SupporterLanding } from './features/support/SupporterLanding'

/** GitHub sign-in landing page for editors; learners never load it. */
const GitHubAuthCallback = lazy(() =>
  import('./features/editor/GitHubAuthCallback').then((m) => ({ default: m.GitHubAuthCallback })),
)

/** The Progress tab was removed; its old links (bookmarks, installed shortcuts) open Learn. */
function OldProgressRedirect() {
  const { langId } = useParams()
  return <Navigate to={langId ? learnLanguagePath(langId) : learnHomePath()} replace />
}

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
        {/* The thank-you link supporters get after paying (see supportConfig.ts). */}
        <Route path="/supporter" element={<SupporterLanding />} />
        <Route path="/" element={<Navigate to={learnHomePath()} replace />} />
        <Route path="/progress" element={<OldProgressRedirect />} />
        <Route path="/progress/:langId" element={<OldProgressRedirect />} />
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
