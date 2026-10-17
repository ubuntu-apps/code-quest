import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './polyfills'
import './index.css'
import App from './App.tsx'
import { APP_VERSION } from './version'
import { initPwa } from './pwaUpdate'

initPwa()

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log(`CodeQuest updated to v${APP_VERSION}`)
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
