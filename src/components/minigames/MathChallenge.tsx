import { useState, useEffect, useRef, useCallback } from 'react'
import { mathChallenges, type MathChallenge } from '../../data/minigames'

interface MathChallengeGameProps {
  rounds?: number
  onComplete: (score: number, maxScore: number) => void
  onSkip: () => void
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function MathChallengeGame({ rounds = 5, onComplete, onSkip }: MathChallengeGameProps) {
  const [gameProblems, setGameProblems] = useState<MathChallenge[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [input, setInput] = useState('')
  const [timeLeft, setTimeLeft] = useState(45)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing')
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const currentProblem = gameProblems[currentIndex]
  const maxScore = rounds * 150

  // Declare callbacks before useEffect that depends on them
  const handleFinish = useCallback(() => {
    setGameState('finished')
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const handleComplete = useCallback(() => {
    onComplete(score, maxScore)
  }, [onComplete, score, maxScore])

  const checkAnswer = useCallback(() => {
    if (!currentProblem || input.trim() === '') return

    const userAnswer = parseInt(input.trim(), 10)
    const isCorrect = userAnswer === currentProblem.answer

    if (isCorrect) {
      setCorrectCount(c => c + 1)
      // Base score + time bonus
      const timeBonus = Math.floor(timeLeft / 5) * 15
      const roundScore = 100 + timeBonus
      setScore(s => s + roundScore)
    } else {
      setWrongCount(c => c + 1)
    }

    setShowHint(false)

    // Move to next or finish
    if (currentIndex < gameProblems.length - 1) {
      setCurrentIndex(i => i + 1)
      setInput('')
    } else {
      handleFinish()
    }
  }, [currentProblem, input, currentIndex, gameProblems.length, timeLeft, handleFinish])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'playing') return
    // Only allow numbers and basic math symbols
    const value = e.target.value.replace(/[^0-9+\-*/() ]/g, '')
    setInput(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkAnswer()
    }
  }

  // Initialize game
  useEffect(() => {
    const problems = shuffle(mathChallenges).slice(0, rounds)
    setGameProblems(problems)
    inputRef.current?.focus()
  }, [rounds])

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleFinish()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState, handleFinish])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [currentIndex])

  if (gameProblems.length === 0) {
    return (
      <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 p-6 text-center">
        <p className="text-slate-400">Loading problems...</p>
      </div>
    )
  }

  if (gameState === 'finished') {
    const percentage = Math.round((correctCount / rounds) * 100)
    const passed = percentage >= 60

    return (
      <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            🔢 Math Challenge Complete!
          </h2>
        </div>
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">{passed ? '🧮' : '📊'}</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {passed ? 'Math Wizard!' : 'Keep Practicing!'}
          </h3>
          <p className="text-slate-300 mb-4">
            You solved {correctCount} out of {rounds} problems correctly ({percentage}%)
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">{correctCount}</div>
              <div className="text-xs text-slate-400">Correct</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-400">{wrongCount}</div>
              <div className="text-xs text-slate-400">Wrong</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-amber-400">{score}</div>
              <div className="text-xs text-slate-400">Score</div>
            </div>
          </div>

          {passed && (
            <div className="text-green-400 mb-4">
              +{Math.round(score / 2)} Bonus XP earned!
            </div>
          )}

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={passed ? handleComplete : onSkip}
              className={`px-8 py-3 font-bold rounded-lg shadow-lg transform transition-all hover:scale-105 ${
                passed
                  ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white'
                  : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white'
              }`}
            >
              {passed ? '✨ Claim Rewards' : '🔄 Try Again'}
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
            🔢 Math Challenge
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-400">✓ {correctCount}</span>
            <span className="text-red-400">✗ {wrongCount}</span>
            <span className="text-slate-400">{currentIndex + 1}/{rounds}</span>
            <span className={`font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
              ⏱ {timeLeft}s
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Problem display */}
        <div className="mb-6">
          <p className="text-slate-400 text-sm mb-2">DevOps Calculation</p>
          <div className="bg-slate-900 rounded-lg p-6 text-center">
            <span className="text-2xl sm:text-3xl font-mono text-white">
              {currentProblem?.question}
            </span>
          </div>
        </div>

        {/* Hint section */}
        <div className="mb-4">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            💡 {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
          {showHint && (
            <p className="mt-2 text-slate-400 text-sm bg-slate-900/50 rounded-lg p-2">
              {currentProblem?.hint}
            </p>
          )}
        </div>

        {/* Input */}
        <div className="mb-6">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter your answer..."
            className="w-full p-4 rounded-lg bg-slate-900 border border-slate-700 text-white text-xl text-center font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            autoComplete="off"
          />
        </div>

        {/* Submit button */}
        <button
          onClick={checkAnswer}
          disabled={!input.trim()}
          className={`w-full py-3 font-bold rounded-lg transition-all ${
            input.trim()
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          Check Answer
        </button>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / rounds) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
