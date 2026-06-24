import { useState, useEffect, useCallback } from 'react'
import { memoryIcons } from '../../data/minigames'

interface MemoryMatchProps {
  onComplete: (score: number, bonusXP: number) => void
  onSkip: () => void
}

interface Card {
  id: string
  icon: string
  name: string
  flipped: boolean
  matched: boolean
}

export default function MemoryMatch({ onComplete, onSkip }: MemoryMatchProps) {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)

  const initializeGame = useCallback(() => {
    const selected = memoryIcons.slice(0, 6)
    const pairs = [...selected, ...selected]
      .sort(() => Math.random() - 0.5)
      .map((item, idx) => ({
        id: `${item.id}-${idx}`,
        icon: item.icon,
        name: item.name,
        flipped: false,
        matched: false,
      }))
    setCards(pairs)
    setFlippedIndices([])
    setMoves(0)
    setMatches(0)
  }, [])

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  const handleCardClick = (index: number) => {
    if (!started) setStarted(true)

    if (flippedIndices.length === 2) return
    if (cards[index].matched) return
    if (flippedIndices.includes(index)) return

    const newFlipped = [...flippedIndices, index]
    setFlippedIndices(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      const [first, second] = newFlipped

      if (cards[first].icon === cards[second].icon) {
        // Match!
        setTimeout(() => {
          setCards(prev => prev.map((c, idx) =>
            idx === first || idx === second ? { ...c, matched: true } : c
          ))
          const newMatches = matches + 1
          setMatches(newMatches)
          setFlippedIndices([])

          if (newMatches === 6) {
            const elapsed = startTime ? (Date.now() - startTime) / 1000 : 60
            const perfectMoves = 6 // minimum moves is 6 (pairs)
            const efficiency = perfectMoves / moves
            const baseXP = 50
            const speedBonus = Math.max(0, Math.floor((120 - elapsed) / 2))
            const efficiencyBonus = Math.floor(efficiency * 30)
            const totalXP = baseXP + speedBonus + efficiencyBonus

            setFinished(true)
            setTimeout(() => onComplete(100, totalXP), 1000)
          }
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          setFlippedIndices([])
        }, 1000)
      }
    }
  }

  useEffect(() => {
    if (started && !finished) {
      if (!startTime) setStartTime(Date.now())
    }
  }, [started, startTime, finished])

  if (!started) {
    return (
      <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            🧠 Memory Match
          </h2>
        </div>
        <div className="p-8 text-center">
          <div className="text-6xl mb-6">🧠</div>
          <h3 className="text-2xl font-bold text-white mb-4">Test Your Memory!</h3>
          <p className="text-slate-300 mb-6 max-w-md mx-auto">
            Match pairs of technology icons. The faster and fewer moves you make, the more bonus XP you earn!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => { setStarted(true); setStartTime(Date.now()) }}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105 text-lg"
            >
              🚀 Start Game
            </button>
            <button
              onClick={onSkip}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-lg transition-colors"
            >
              Skip Mini-Game
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="bg-slate-800/80 rounded-xl border border-green-600/50 overflow-hidden">
        <div className="bg-gradient-to-r from-green-900/30 via-slate-800 to-green-900/30 px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            🧠 Memory Match Complete!
          </h2>
        </div>
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-slate-300">Calculating your score...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            🧠 Memory Match
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-400">✓ {matches}/6</span>
            <span className="text-slate-400">Moves: {moves}</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto">
          {cards.map((card, index) => {
            const isFlipped = flippedIndices.includes(index) || card.matched

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(index)}
                className={`aspect-square rounded-lg border-2 transition-all duration-300 flex items-center justify-center text-2xl sm:text-3xl ${
                  isFlipped
                    ? card.matched
                      ? 'bg-green-900/50 border-green-500'
                      : 'bg-slate-700 border-amber-500'
                    : 'bg-slate-700/50 border-slate-600 hover:border-slate-500 hover:bg-slate-600/50'
                }`}
              >
                {isFlipped ? card.icon : '?'}
              </button>
            )
          })}
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          Match all pairs to win!
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={onSkip}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-400 text-sm rounded-lg transition-colors"
          >
            Skip Mini-Game
          </button>
        </div>
      </div>
    </div>
  )
}
