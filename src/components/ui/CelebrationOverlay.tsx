import { useState, useEffect, useRef } from 'react'

interface Confetti {
  id: number
  x: number
  delay: number
  color: string
  rotation: number
  size: number
}

const CONFETTI_COLORS = ['#f59e0b', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444']

// Seeded random for deterministic confetti
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

// Generate confetti pieces deterministically
function generateConfetti(): Confetti[] {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: seededRandom(i * 5 + 1) * 100,
    delay: seededRandom(i * 5 + 2) * 2,
    color: CONFETTI_COLORS[Math.floor(seededRandom(i * 5 + 3) * CONFETTI_COLORS.length)],
    rotation: seededRandom(i * 5 + 4) * 360,
    size: seededRandom(i * 5 + 5) * 10 + 5,
  }))
}

export default function CelebrationOverlay() {
  const [confetti, setConfetti] = useState<Confetti[]>(() => generateConfetti())
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear after animation
    timerRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        setConfetti([])
      })
    }, 4000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
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
            borderRadius: piece.id % 3 === 0 ? '50%' : '2px',
          }}
        />
      ))}
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
        <div className="text-4xl font-bold text-orange-400 mt-4">{streak} Day Streak!</div>
        <div className="text-xl text-amber-400 mt-2">+{streak * 5} Bonus XP!</div>
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
    return () => {
      clearTimeout(timer)
    }
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
