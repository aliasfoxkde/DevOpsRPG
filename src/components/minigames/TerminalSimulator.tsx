import { useState, useEffect, useCallback, useRef } from 'react'
import { useGame } from '../../contexts/GameContext'
import {
  getRandomChallenges,
  CATEGORY_COLORS,
  type TerminalChallenge,
} from '../../data/terminalChallenges'

interface TerminalSimulatorProps {
  onComplete?: (score: number, xpEarned: number) => void
  category?: TerminalChallenge['category']
}

type GameState = 'menu' | 'playing' | 'result'

export function TerminalSimulator({ onComplete, category }: TerminalSimulatorProps) {
  const { addXP } = useGame()

  // Game state
  const [gameState, setGameState] = useState<GameState>('menu')
  const [challenges, setChallenges] = useState<TerminalChallenge[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [input, setInput] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)

  const currentChallenge = challenges[currentIndex]
  const progress = challenges.length > 0 ? ((currentIndex) / challenges.length) * 100 : 0

  // Start a new game
  const startGame = useCallback(() => {
    const selectedChallenges = getRandomChallenges(10, category)
    setChallenges(selectedChallenges)
    setCurrentIndex(0)
    setInput('')
    setStartTime(Date.now())
    setEndTime(null)
    setCorrectCount(0)
    setTotalTime(0)
    setShowHint(false)
    setWrongAttempts(0)
    setStreak(0)
    setMaxStreak(0)
    setGameState('playing')
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [category])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentChallenge || !input.trim()) return

    const isCorrect = input.trim() === currentChallenge.command

    if (isCorrect) {
      setCorrectCount(prev => prev + 1)
      setStreak(prev => {
        const newStreak = prev + 1
        setMaxStreak(max => Math.max(max, newStreak))
        return newStreak
      })
      setWrongAttempts(0)
      setShowHint(false)

      // Move to next challenge or end game
      if (currentIndex < challenges.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setInput('')
      } else {
        finishGame()
      }
    } else {
      setWrongAttempts(prev => prev + 1)
      setStreak(0)

      // Shake animation feedback
      inputRef.current?.classList.add('animate-shake')
      setTimeout(() => inputRef.current?.classList.remove('animate-shake'), 500)
    }
  }

  // Finish the game
  const finishGame = useCallback(() => {
    const end = Date.now()
    setEndTime(end)
    setTotalTime(end - (startTime || end))
    setGameState('result')
  }, [startTime])

  // Calculate score
  const calculateScore = useCallback(() => {
    if (!startTime || !endTime) return 0
    const timeBonus = Math.max(0, 1000 - totalTime) / 100
    const accuracyBonus = (correctCount / challenges.length) * 100
    const streakBonus = maxStreak * 10
    return Math.round(accuracyBonus + timeBonus + streakBonus)
  }, [startTime, endTime, totalTime, correctCount, challenges.length, maxStreak])

  // Calculate XP
  const xpEarned = Math.round((correctCount / challenges.length) * 100)

  // Handle exit
  const handleExit = () => {
    if (gameState === 'result' && xpEarned > 0) {
      addXP(xpEarned)
      onComplete?.(calculateScore(), xpEarned)
    }
    setGameState('menu')
  }

  // Auto-advance on correct (after brief delay)
  useEffect(() => {
    if (gameState === 'playing' && input === currentChallenge?.command && input !== '') {
      // Don't auto-advance - let user press enter for confirmation
    }
  }, [input, currentChallenge, gameState])

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-slate-400 text-sm font-mono">terminal@devopsquest ~</span>
        </div>
        {gameState === 'playing' && (
          <div className="flex items-center gap-4">
            <span className="text-green-400 text-sm">✓ {correctCount}/{challenges.length}</span>
            {streak > 0 && (
              <span className="text-amber-400 text-sm">🔥 {streak}</span>
            )}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {gameState === 'playing' && (
        <div className="h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Menu State */}
        {gameState === 'menu' && (
          <div className="text-center">
            <div className="text-6xl mb-4">💻</div>
            <h2 className="text-2xl font-bold text-white mb-2">Terminal Simulator</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Test your DevOps command-line skills! Type the correct commands as fast as you can.
            </p>

            {category && (
              <div className="inline-block px-4 py-2 rounded-lg mb-6" style={{ backgroundColor: `${CATEGORY_COLORS[category]}20` }}>
                <span style={{ color: CATEGORY_COLORS[category] }}>
                  📁 {category.toUpperCase()} Mode
                </span>
              </div>
            )}

            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-bold rounded-xl text-lg transition-all transform hover:scale-105"
            >
              ⚡ Start Challenge
            </button>

            <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">🌱</div>
                <div className="text-xs text-slate-400">Beginner</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-amber-400">⚡</div>
                <div className="text-xs text-slate-400">Intermediate</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-400">🔥</div>
                <div className="text-xs text-slate-400">Advanced</div>
              </div>
            </div>
          </div>
        )}

        {/* Playing State */}
        {gameState === 'playing' && currentChallenge && (
          <div>
            {/* Challenge info */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: `${CATEGORY_COLORS[currentChallenge.category]}30`, color: CATEGORY_COLORS[currentChallenge.category] }}
                >
                  {currentChallenge.category.toUpperCase()}
                </span>
                <span className="text-slate-500 text-sm">
                  Challenge {currentIndex + 1} of {challenges.length}
                </span>
              </div>
              <p className="text-white text-lg">{currentChallenge.description}</p>
            </div>

            {/* Terminal output area */}
            <div className="bg-slate-950 rounded-lg p-4 mb-4 font-mono text-sm min-h-[120px]">
              <div className="text-slate-500 mb-2">$ {currentChallenge.command.split(' ')[0]} <span className="animate-pulse">_</span></div>
              {wrongAttempts > 0 && (
                <div className="text-red-400 text-sm mb-2">
                  ✗ Incorrect! {wrongAttempts} attempt{wrongAttempts > 1 ? 's' : ''}
                </div>
              )}
              {showHint && currentChallenge.hint && (
                <div className="text-amber-400 text-sm">
                  💡 Hint: {currentChallenge.hint}
                </div>
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-800 border-2 ${wrongAttempts > 0 ? 'border-red-500' : 'border-slate-700 focus:border-green-500'} rounded-lg pl-8 pr-4 py-3 text-white font-mono focus:outline-none`}
                  placeholder="Type the command..."
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors"
              >
                Run
              </button>
            </form>

            {/* Hint button */}
            {!showHint && (
              <button
                onClick={() => setShowHint(true)}
                className="mt-3 text-sm text-slate-500 hover:text-amber-400 transition-colors"
              >
                💡 Show Hint
              </button>
            )}

            {/* Explanation (shown after correct answer) */}
            {input === currentChallenge.command && (
              <div className="mt-4 p-4 bg-green-900/30 border border-green-600/30 rounded-lg">
                <p className="text-green-400 text-sm">{currentChallenge.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Result State */}
        {gameState === 'result' && (
          <div className="text-center">
            <div className={`text-6xl mb-4 ${correctCount === challenges.length ? 'animate-bounce' : ''}`}>
              {correctCount === challenges.length ? '🏆' : correctCount >= challenges.length * 0.7 ? '⭐' : '💪'}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {correctCount === challenges.length
                ? 'Perfect Score!'
                : correctCount >= challenges.length * 0.7
                ? 'Great Job!'
                : 'Keep Practicing!'}
            </h2>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">{correctCount}/{challenges.length}</div>
                <div className="text-xs text-slate-400">Correct</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-amber-400">{Math.round(totalTime / 1000)}s</div>
                <div className="text-xs text-slate-400">Time</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">🔥 {maxStreak}</div>
                <div className="text-xs text-slate-400">Max Streak</div>
              </div>
            </div>

            {/* XP Earned */}
            <div className="mb-6 p-4 bg-amber-900/30 rounded-lg border border-amber-600/30">
              <div className="text-3xl font-bold text-amber-400">+{xpEarned} XP</div>
              <div className="text-sm text-slate-400">Experience earned</div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors"
              >
                🔄 Try Again
              </button>
              <button
                onClick={handleExit}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TerminalSimulator
