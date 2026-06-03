import { useState, useEffect } from 'react'

/**
 * useInstallPWA — handles PWA install prompt (A2HS)
 * Returns { canInstall, install }
 */
export const useInstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [canInstall, setCanInstall]         = useState(false)
  const [installed, setInstalled]           = useState(false)

  useEffect(() => {
    // Detect if already running as standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    if (isStandalone) { setInstalled(true); return }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => {
      setCanInstall(false)
      setInstalled(true)
      setDeferredPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!deferredPrompt) return false
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setCanInstall(false)
    return outcome === 'accepted'
  }

  return { canInstall, install, installed }
}
