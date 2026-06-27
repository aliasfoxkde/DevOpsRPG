import { useEffect, useState } from 'react'

interface LevelUpEffectProps {
  level: number
  onComplete: () => void
}

export function LevelUpEffect({ level, onComplete }: LevelUpEffectProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; angle: number }>>([])
  const [showText, setShowText] = useState(false)
  const [showLevel, setShowLevel] = useState(false)

  useEffect(() => {
    // Create particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 30,
      y: 50 + (Math.random() - 0.5) * 30,
      angle: (Math.random() * 360),
    }))
    queueMicrotask(() => setParticles(newParticles))

    // Stagger animations
    setTimeout(() => setShowText(true), 200)
    setTimeout(() => setShowLevel(true), 600)
    setTimeout(() => onComplete(), 2500)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80">
      {/* Glow background */}
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)',
        }}
      />

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-3 h-3 bg-amber-400 rounded-full animate-bounce"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDelay: `${p.id * 0.05}s`,
              animationDuration: '1s',
              transform: `rotate(${p.angle}deg)`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative text-center">
        {/* LEVEL UP! text */}
        <div
          className={`text-6xl font-bold text-amber-400 mb-4 transition-all duration-500 ${
            showText ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          style={{
            textShadow: '0 0 40px rgba(251, 191, 36, 0.8), 0 0 80px rgba(251, 191, 36, 0.4)',
          }}
        >
          LEVEL UP!
        </div>

        {/* Level number */}
        <div
          className={`text-9xl font-bold text-white transition-all duration-500 ${
            showLevel ? 'opacity-100 scale-100' : 'opacity-0 scale-150'
          }`}
        >
          {level}
        </div>

        {/* Subtitle */}
        <div
          className={`text-2xl text-slate-300 mt-4 transition-all duration-500 ${
            showLevel ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Keep going, hero!
        </div>
      </div>
    </div>
  )
}

// XP Bar animation component
export function AnimatedXPBar({ xp, maxXp, showAnimation = false }: {
  xp: number
  maxXp: number
  showAnimation?: boolean
}) {
  const [displayXp, setDisplayXp] = useState(xp)
  const percentage = Math.min(100, (displayXp / maxXp) * 100)

  useEffect(() => {
    if (showAnimation && xp > displayXp) {
      // Animate XP counting up
      const steps = 20
      const increment = (xp - displayXp) / steps
      let current = displayXp
      let step = 0

      const interval = setInterval(() => {
        step++
        current += increment
        if (step >= steps) {
          queueMicrotask(() => setDisplayXp(xp))
          clearInterval(interval)
        } else {
          queueMicrotask(() => setDisplayXp(Math.round(current)))
        }
      }, 30)

      return () => clearInterval(interval)
    } else {
      queueMicrotask(() => setDisplayXp(xp))
    }
  }, [xp, showAnimation, displayXp])

  return (
    <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300 ${
          showAnimation ? 'animate-pulse' : ''
        }`}
        style={{ width: `${percentage}%` }}
      />
      {showAnimation && (
        <div
          className="absolute top-0 h-full bg-white/50 animate-ping"
          style={{ width: '20%' }}
        />
      )}
    </div>
  )
}

// Character level up badge
export function LevelUpBadge({ level }: { level: number }) {
  const getLevelColor = () => {
    if (level >= 50) return 'from-purple-600 to-pink-600'
    if (level >= 30) return 'from-amber-600 to-orange-600'
    if (level >= 20) return 'from-green-600 to-emerald-600'
    if (level >= 10) return 'from-blue-600 to-cyan-600'
    return 'from-slate-600 to-slate-500'
  }

  return (
    <div
      className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${getLevelColor()} border-4 border-white/20 shadow-xl`}
    >
      <span className="text-2xl font-bold text-white">{level}</span>
    </div>
  )
}
