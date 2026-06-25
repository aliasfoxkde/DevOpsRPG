import { useState, useEffect, useCallback, useRef } from 'react'
import { getRandomEncouragement } from '../../data/milestones'

interface CelebrationToastProps {
  message: string
  type: 'milestone' | 'encouragement' | 'achievement' | 'levelup'
  icon?: string
  xpGained?: number
  onDismiss: () => void
}

export function CelebrationToast({ message, type, icon, xpGained, onDismiss }: CelebrationToastProps) {
  const [exiting, setExiting] = useState(false)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true)
      dismissTimerRef.current = setTimeout(onDismiss, 300)
    }, 5000)

    return () => {
      clearTimeout(timer)
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    }
  }, [onDismiss])

  const handleDismiss = () => {
    setExiting(true)
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    dismissTimerRef.current = setTimeout(onDismiss, 300)
  }

  const bgClass = {
    milestone: 'bg-gradient-to-r from-amber-900/95 to-amber-800/95 border-amber-500',
    encouragement: 'bg-gradient-to-r from-purple-900/95 to-purple-800/95 border-purple-500',
    achievement: 'bg-gradient-to-r from-green-900/95 to-green-800/95 border-green-500',
    levelup: 'bg-gradient-to-r from-blue-900/95 to-blue-800/95 border-blue-500',
  }[type]

  const defaultIcon = {
    milestone: '🏆',
    encouragement: '💪',
    achievement: '🎉',
    levelup: '⬆️',
  }[type]

  return (
    <div
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        exiting ? 'opacity-0 translate-y-[-20px]' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className={`${bgClass} border-2 rounded-xl shadow-2xl p-4 max-w-sm mx-auto backdrop-blur-sm`}>
        <div className="flex items-start gap-3">
          <div className="text-3xl">{icon || defaultIcon}</div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm sm:text-base leading-tight">{message}</p>
            {xpGained && xpGained > 0 && (
              <p className="text-amber-300 text-sm mt-1 font-bold">+{xpGained} XP</p>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/60 hover:text-white transition-colors text-lg"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

// Encouragement toast manager
interface ToastItem {
  id: string
  message: string
  type: 'milestone' | 'encouragement' | 'achievement' | 'levelup'
  icon?: string
  xpGained?: number
}

interface ToastManagerProps {
  toasts: ToastItem[]
  onRemove: (id: string) => void
}

export function ToastManager({ toasts, onRemove }: ToastManagerProps) {
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ marginTop: index * 10 }}
        >
          <CelebrationToast
            message={toast.message}
            type={toast.type}
            icon={toast.icon}
            xpGained={toast.xpGained}
            onDismiss={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}

/* eslint-disable react-refresh/only-export-components */
// Hook for managing encouragement messages
export function useEncouragement() {
  const [lastEncouragement, setLastEncouragement] = useState<string | null>(null)
  const [nextEncouragementIn] = useState<number>(0)

  // Show encouragement every 3 quests or so
  const checkShowEncouragement = useCallback((questCount: number) => {
    if (questCount > 0 && questCount % 3 === 0) {
      const msg = getRandomEncouragement()
      setLastEncouragement(msg)
      return msg
    }
    return null
  }, [])

  return { lastEncouragement, nextEncouragementIn, checkShowEncouragement }
}
