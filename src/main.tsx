import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './polyfills'
import './index.css'
import App from './App.tsx'
import { APP_VERSION } from './version'
import { initPwa } from './pwaUpdate'
import { initTheme } from './theme'
import { initInstallPrompt } from './lib/installPrompt'

initTheme()
initPwa()
initInstallPrompt()

if ('serviceWorker' in navigator) {
  // On a first visit the new service worker also takes control (clientsClaim);
  // that isn't an update, so only log when a previous version was in charge.
  const hadController = navigator.serviceWorker.controller !== null
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) console.log(`CodeQuest updated to v${APP_VERSION}`)
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
