import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Register PWA service worker (graceful - dev mode uses virtual module)
try {
  const { registerSW } = await import('virtual:pwa-register')
  registerSW({
    immediate:     true,
    onNeedRefresh() { console.log('[Montra PWA] Update tersedia') },
    onOfflineReady() { console.log('[Montra PWA] Siap digunakan offline') },
  })
} catch {
  // virtual:pwa-register only available in Vite build, silently skip in tests
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
