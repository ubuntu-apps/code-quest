import { CodeQuestScreen } from './features/curriculum/CodeQuestScreen'
import { InstallAppBanner } from './components/InstallAppBanner'
import { EditorProvider } from './features/editor'

function App() {
  return (
    <EditorProvider>
      <InstallAppBanner />
      <CodeQuestScreen />
    </EditorProvider>
  )
}

export default App
