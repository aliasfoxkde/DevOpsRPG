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
