import { useState, useEffect } from 'react'

export function OfflineIndicator() {
  const [, setIsOnline] = useState(navigator.onLine)
  const [showOffline, setShowOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOffline(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showOffline) return null

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-amber-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
      <span className="text-xl">📡</span>
      <span className="font-bold">You're offline</span>
      <span className="text-amber-200">- Your progress is saved locally</span>
    </div>
  )
}

export function InstallPrompt() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled] = useState(() => window.matchMedia('(display-mode: standalone)').matches)

  useEffect(() => {
    if (isInstalled) return

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [isInstalled])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setShowPrompt(false)
    setDeferredPrompt(null)
  }

  if (isInstalled || !showPrompt) return null

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-4 rounded-xl shadow-2xl flex flex-col items-center gap-3 max-w-sm">
      <div className="text-3xl">📱</div>
      <div className="text-center">
        <div className="font-bold text-lg">Install DevOpsQuest</div>
        <div className="text-amber-100 text-sm">Add to home screen for the best experience!</div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleInstall}
          className="px-4 py-2 bg-white text-amber-600 font-bold rounded-lg hover:bg-amber-100 transition-colors"
        >
          Install
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="px-4 py-2 bg-amber-700/50 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors"
        >
          Later
        </button>
      </div>
    </div>
  )
}
