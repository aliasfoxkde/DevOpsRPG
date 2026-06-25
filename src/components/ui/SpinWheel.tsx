import { useState, useEffect, useCallback, useRef } from 'react'

interface SpinWheelProps {
  onSpinComplete: (prize: { type: string; value: number; name: string }) => void
  isSpinning: boolean
}

const prizes = [
  { type: 'xp', value: 50, name: '50 XP', color: '#22c55e', weight: 30 },
  { type: 'xp', value: 100, name: '100 XP', color: '#16a34a', weight: 25 },
  { type: 'xp', value: 200, name: '200 XP', color: '#15803d', weight: 15 },
  { type: 'gold', value: 25, name: '25 Gold', color: '#f59e0b', weight: 20 },
  { type: 'gold', value: 50, name: '50 Gold', color: '#d97706', weight: 10 },
  { type: 'streak', value: 1, name: '+1 Streak', color: '#ef4444', weight: 5 },
  { type: 'badge', value: 1, name: 'Random Badge', color: '#8b5cf6', weight: 3 },
  { type: 'collectible', value: 1, name: 'Rare Loot!', color: '#ec4899', weight: 2 },
]

const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0)

function getRandomPrize() {
  let random = Math.random() * totalWeight
  for (const prize of prizes) {
    random -= prize.weight
    if (random <= 0) return prize
  }
  return prizes[0]
}

export default function SpinWheel({ onSpinComplete, isSpinning }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const isSpinningRef = useRef(false)
  const rotationRef = useRef(0)

  const spin = useCallback(() => {
    setSpinning(true)
    const prize = getRandomPrize()
    const segmentAngle = 360 / prizes.length
    // Calculate target rotation to land on prize
    const prizeIndex = prizes.indexOf(prize)
    const baseRotation = (prizeIndex * segmentAngle) + (segmentAngle / 2)
    // Add multiple full rotations plus randomness within segment
    const spins = 5 + Math.random() * 3
    const currentRotation = rotationRef.current
    const targetRotation = currentRotation + (spins * 360) + (360 - baseRotation) + (Math.random() * segmentAngle - segmentAngle / 2)
    rotationRef.current = targetRotation

    setRotation(targetRotation)

    setTimeout(() => {
      setSpinning(false)
      isSpinningRef.current = false
      onSpinComplete(prize)
    }, 4000)
  }, [onSpinComplete])

  useEffect(() => {
    if (isSpinning && !isSpinningRef.current) {
      isSpinningRef.current = true
      // Use requestAnimationFrame to defer the spin call
      requestAnimationFrame(() => {
        spin()
      })
    }
  }, [isSpinning, spin])

  const segmentAngle = 360 / prizes.length

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64">
        {/* Wheel */}
        <div
          className="absolute inset-0 rounded-full border-4 border-amber-600 shadow-2xl transition-transform ease-out"
          style={{
            background: `conic-gradient(${prizes.map((p, i) => `${p.color} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`).join(', ')})`,
            transform: `rotate(${rotation}deg)`,
            transitionDuration: spinning ? '4s' : '0s',
            transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
          }}
        >
          {/* Segment labels */}
          {prizes.map((prize, i) => (
            <div
              key={i}
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: `rotate(${i * segmentAngle + segmentAngle / 2}deg)` }}
            >
              <span
                className="text-xs font-bold text-white drop-shadow-lg"
                style={{
                  transform: `rotate(${-i * segmentAngle - segmentAngle / 2}deg)`,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                }}
              >
                {prize.name}
              </span>
            </div>
          ))}
        </div>

        {/* Center button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-4 border-white shadow-lg flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
        </div>

        {/* Pointer */}
        <div
          className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
        >
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-amber-500" />
        </div>
      </div>

      {/* Spin button */}
      {!spinning && (
        <button
          onClick={spin}
          className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-full shadow-lg transform transition-all hover:scale-105"
        >
          🎰 SPIN FOR PRIZES!
        </button>
      )}

      {spinning && (
        <p className="mt-6 text-amber-400 font-bold animate-pulse">Spinning...</p>
      )}
    </div>
  )
}
