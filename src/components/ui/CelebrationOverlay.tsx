import { useState, useEffect } from 'react'

interface Confetti {
  id: number
  x: number
  delay: number
  color: string
  rotation: number
  size: number
}

const CONFETTI_COLORS = ['#f59e0b', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444']

export default function CelebrationOverlay() {
  const [confetti, setConfetti] = useState<Confetti[]>([])

  useEffect(() => {
    const pieces: Confetti[] = []
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        size: Math.random() * 10 + 5
      })
    }
    setConfetti(pieces)

    // Clear after animation
    const timer = setTimeout(() => setConfetti([]), 4000)
    return () => clearTimeout(timer)
  }, [])

  if (confetti.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-fall"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            animationDelay: `${piece.delay}s`,
            borderRadius: piece.id % 3 === 0 ? '50%' : '2px'
          }}
        />
      ))}
    </div>
  )
}

// XP Popup that floats up and fades
interface XPPopupProps {
  amount: number
  onComplete: () => void
  x?: number
  y?: number
}

export function XPPopup({ amount, onComplete, x, y }: XPPopupProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onComplete()
    }, 1500)
    return () => clearTimeout(timer)
  }, [onComplete])

  if (!visible) return null

  return (
    <div
      className="fixed z-50 animate-float-up pointer-events-none"
      style={x !== undefined && y !== undefined ? { left: x, top: y } : undefined}
    >
      <div className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 rounded-full shadow-lg border-2 border-amber-400">
        <span className="text-lg font-bold text-white">+{amount} XP</span>
      </div>
    </div>
  )
}

// Streak fire effect
interface StreakBonusProps {
  streak: number
}

export function StreakBonus({ streak }: StreakBonusProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm pointer-events-none">
      <div className="text-center animate-bounce-in">
        <div className="text-8xl">🔥</div>
        <div className="text-4xl font-bold text-orange-400 mt-4">
          {streak} Day Streak!
        </div>
        <div className="text-xl text-amber-400 mt-2">
          +{streak * 5} Bonus XP!
        </div>
      </div>
    </div>
  )
}

// Milestone unlock celebration
interface MilestonePopupProps {
  icon: string
  title: string
  message: string
  xpBonus: number
  onComplete: () => void
}

export function MilestonePopup({ icon, title, message, xpBonus, onComplete }: MilestonePopupProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onComplete, 300)
    }, 3500)
    return () => clearTimeout(timer)
  }, [onComplete])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="text-center animate-bounce-in">
        <div className="text-7xl mb-4">{icon}</div>
        <div className="inline-block px-4 py-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full text-amber-200 text-sm font-bold mb-3">
          ⭐ MILESTONE UNLOCKED!
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-300 text-lg mb-4 max-w-md">{message}</p>
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 rounded-full">
          <span className="text-xl">✨</span>
          <span className="text-xl font-bold text-white">+{xpBonus} XP BONUS!</span>
        </div>
        <p className="text-slate-500 text-sm mt-4">Auto-closing...</p>
      </div>
    </div>
  )
}

// Round completion bonus (big finale reward)
interface RoundBonusProps {
  completedQuests: number
  xpBonus: number
  goldBonus: number
  badge?: { id: string; name: string; icon: string }
  onComplete: () => void
}

export function RoundBonus({ completedQuests, xpBonus, goldBonus, badge, onComplete }: RoundBonusProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onComplete, 500)
    }, 5000)
    return () => clearTimeout(timer)
  }, [onComplete])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="text-center animate-bounce-in max-w-lg">
        <div className="text-8xl mb-4">🏆</div>
        <h2 className="text-4xl font-bold text-amber-400 mb-2">Round Complete!</h2>
        <p className="text-slate-300 text-lg mb-6">
          You completed {completedQuests} quests in this round!
        </p>

        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="px-6 py-3 bg-gradient-to-r from-purple-900/50 to-purple-800/50 rounded-xl border border-purple-500/50">
            <div className="text-2xl font-bold text-purple-300">+{xpBonus}</div>
            <div className="text-purple-400 text-sm">XP Bonus</div>
          </div>
          <div className="px-6 py-3 bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 rounded-xl border border-yellow-500/50">
            <div className="text-2xl font-bold text-yellow-300">+{goldBonus}</div>
            <div className="text-yellow-400 text-sm">Gold Bonus</div>
          </div>
        </div>

        {badge && (
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-900/50 to-orange-900/50 rounded-xl border border-amber-500/50 mb-6">
            <span className="text-4xl">{badge.icon}</span>
            <div className="text-left">
              <div className="text-amber-400 text-sm">Badge Earned!</div>
              <div className="text-white font-bold">{badge.name}</div>
            </div>
          </div>
        )}

        <div className="text-slate-500 text-sm mt-6">Get ready for the next round...</div>
      </div>
    </div>
  )
}
