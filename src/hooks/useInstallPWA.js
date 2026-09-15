import { useState, useEffect } from 'react'

// Module-level global store for the install prompt
let globalDeferredPrompt = null
const listeners = new Set()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    globalDeferredPrompt = e
    listeners.forEach((fn) => fn(globalDeferredPrompt))
  })

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null
    listeners.forEach((fn) => fn(null))
  })
}

/**
 * useInstallPWA - handles PWA install prompt (A2HS)
 * Returns { canInstall, install, installed }
 */
export const useInstallPWA = () => {
  const [prompt, setPrompt] = useState(globalDeferredPrompt)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Detect if already running as standalone PWA
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      window.navigator?.standalone === true
    if (isStandalone) {
      setInstalled(true)
      return
    }

    setPrompt(globalDeferredPrompt)

    const updatePrompt = (p) => {
      setPrompt(p)
      if (!p && isStandalone) {
        setInstalled(true)
      }
    }

    listeners.add(updatePrompt)
    return () => {
      listeners.delete(updatePrompt)
    }
  }, [])

  const install = async () => {
    if (!prompt && !globalDeferredPrompt) return false
    const activePrompt = prompt || globalDeferredPrompt
    activePrompt.prompt()
    const { outcome } = await activePrompt.userChoice
    globalDeferredPrompt = null
    setPrompt(null)
    listeners.forEach((fn) => fn(null))
    return outcome === 'accepted'
  }

  return {
    canInstall: Boolean(prompt || globalDeferredPrompt),
    install,
    installed,
  }
}
