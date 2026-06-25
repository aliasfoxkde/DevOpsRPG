import { useState, useCallback } from 'react'
import { memoryIcons, type MemoryCard } from '../../data/minigames'

interface MemoryMatchProps {
  pairs?: number
  onComplete: (score: number, maxScore: number) => void
  onSkip?: () => void
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function MemoryMatch({ pairs = 6, onComplete }: MemoryMatchProps) {
  const [cards] = useState<MemoryCard[]>(() => {
    const selectedIcons = shuffle(memoryIcons).slice(0, pairs)
    const cardPairs = shuffle([...selectedIcons, ...selectedIcons].map((icon, idx) => ({
      ...icon,
      id: `${icon.id}-${idx}`,
      matched: false,
    })))
    return cardPairs
  })
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [matchedIndices, setMatchedIndices] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing')
  const [startTime] = useState<number>(() => Date.now())

  // Store elapsed time when game is won to avoid impure Date.now() in render
  const [wonStats, setWonStats] = useState<{ elapsed: number; score: number; stars: number } | null>(null)

  const handleCardClick = useCallback((index: number) => {
    if (gameState !== 'playing') return
    if (flippedIndices.includes(index)) return
    if (matchedIndices.includes(index)) return
    if (flippedIndices.length >= 2) return

    const newFlipped = [...flippedIndices, index]
    setFlippedIndices(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)

      const [first, second] = newFlipped
      if (cards[first].id.replace(/-[^-]+$/, '') === cards[second].id.replace(/-[^-]+$/, '')) {
        // Match!
        setMatchedIndices(prev => [...prev, first, second])
        setFlippedIndices([])

        if (matchedIndices.length + 2 === cards.length) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000)
          const timeBonus = Math.max(0, 300 - elapsed)
          const movesBonus = Math.max(0, (pairs * 3 - moves) * 10)
          const score = 500 + timeBonus + movesBonus
          const stars = moves <= pairs * 1.5 ? 3 : moves <= pairs * 2.5 ? 2 : 1
          setWonStats({ elapsed, score, stars })
          setGameState('won')
        }
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setFlippedIndices([])
        }, 1000)
      }
    }
  }, [flippedIndices, matchedIndices, cards, gameState, startTime, moves, pairs])

  const handleComplete = () => {
    if (!wonStats) return
    onComplete(wonStats.score, pairs * 200)
  }

  if (cards.length === 0) {
    return (
      <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 p-6 text-center">
        <p className="text-slate-400">Shuffling cards...</p>
      </div>
    )
  }

  if (gameState === 'won' && wonStats) {
    const { elapsed, score, stars } = wonStats

    return (
      <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            🧠 Memory Match Complete!
          </h2>
        </div>
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">{'⭐'.repeat(stars)}</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Memory Master!
          </h3>
          <p className="text-slate-300 mb-4">
            You matched all pairs in {moves} moves
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-amber-400">{moves}</div>
              <div className="text-xs text-slate-400">Moves</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">{elapsed}s</div>
              <div className="text-xs text-slate-400">Time</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-400">{score}</div>
              <div className="text-xs text-slate-400">Score</div>
            </div>
          </div>

          <div className="text-green-400 mb-4">
            +{Math.round(score / 2)} Bonus XP earned!
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleComplete}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105"
            >
              ✨ Claim Rewards
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            🧠 Memory Match
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400">Pairs: {matchedIndices.length / 2}/{pairs}</span>
            <span className="text-amber-400">Moves: {moves}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Stats bar */}
        <div className="mb-4 text-center text-sm text-slate-400">
          Match the DevOps icons! Click cards to flip them.
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {cards.map((card, index) => {
            const isFlipped = flippedIndices.includes(index)
            const isMatched = matchedIndices.includes(index)
            const isRevealed = isFlipped || isMatched

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(index)}
                disabled={isMatched || gameState !== 'playing'}
                className={`aspect-square rounded-lg transition-all duration-300 transform ${
                  isRevealed
                    ? 'bg-slate-700 scale-100'
                    : 'bg-gradient-to-br from-amber-700 to-amber-900 hover:scale-105'
                } ${isMatched ? 'ring-2 ring-green-500' : ''}`}
              >
                {isRevealed ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className={`text-2xl sm:text-3xl ${isMatched ? '' : 'animate-bounce'}`}>
                      {card.icon}
                    </span>
                    {isMatched && (
                      <span className="text-xs text-green-400 mt-1">✓</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-slate-500 text-xl">?</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300"
              style={{ width: `${(matchedIndices.length / cards.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
