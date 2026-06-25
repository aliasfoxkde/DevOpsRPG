import { useState } from 'react'
import { mathChallenges, type MathChallenge } from '../../data/minigames'

interface MathChallengeGameProps {
  onComplete: (score: number, bonusXP: number) => void
  onSkip: () => void
}

export default function MathChallengeGame({ onComplete, onSkip }: MathChallengeGameProps) {
  const [challenges] = useState<MathChallenge[]>(() => {
    const shuffled = [...mathChallenges].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 8)
  })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [inputError, setInputError] = useState(false)

  const current = challenges[currentIndex]

  const handleStart = () => {
    setStarted(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const numAnswer = parseInt(answer, 10)
    if (isNaN(numAnswer)) {
      setInputError(true)
      return
    }

    if (numAnswer === current.answer) {
      const newCorrect = correct + 1
      setCorrect(newCorrect)
      setShowHint(false)
      setAnswer('')

      if (currentIndex < challenges.length - 1) {
        setCurrentIndex(i => i + 1)
      } else {
        const baseXP = newCorrect * 15 + challenges.length * 5
        const accuracyBonus = correct / (correct + wrong + 1) > 0.7 ? 25 : 0
        setFinished(true)
        setTimeout(() => onComplete(baseXP, baseXP + accuracyBonus), 1000)
      }
    } else {
      setWrong(w => w + 1)
      setInputError(true)
      setTimeout(() => setInputError(false), 500)
    }
  }

  if (!started) {
    return (
      <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            🧮 DevOps Math Challenge
          </h2>
        </div>
        <div className="p-8 text-center">
          <div className="text-6xl mb-6">🧮</div>
          <h3 className="text-2xl font-bold text-white mb-4">Test Your DevOps Math!</h3>
          <p className="text-slate-300 mb-6 max-w-md mx-auto">
            Solve DevOps-related math and logic puzzles. Perfect for sysadmins and developers!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105 text-lg"
            >
              🚀 Start Challenge
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
            🧮 DevOps Math
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-400">✓ {correct}</span>
            <span className="text-red-400">✗ {wrong}</span>
            <span className="text-slate-400">{currentIndex + 1}/{challenges.length}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Progress */}
        <div className="w-full h-2 bg-slate-700 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / challenges.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="text-center mb-6">
          <p className="text-slate-400 text-sm mb-2">Solve:</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">{current.question}</p>
        </div>

        {/* Hint */}
        {showHint && (
          <div className="mb-4 p-3 bg-amber-900/30 border border-amber-700 rounded-lg text-center">
            <p className="text-amber-400 text-sm">💡 {current.hint}</p>
          </div>
        )}

        {/* Answer input */}
        <form onSubmit={handleSubmit} className="mb-4">
          <input
            type="text"
            value={answer}
            onChange={e => { setAnswer(e.target.value); setInputError(false) }}
            placeholder="Enter your answer..."
            className={`w-full px-4 py-3 bg-slate-900 border-2 rounded-lg text-xl font-mono text-white text-center focus:outline-none transition-colors ${
              inputError ? 'border-red-500' : 'border-slate-600 focus:border-amber-500'
            }`}
            autoFocus
          />
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => setShowHint(h => !h)}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
            >
              {showHint ? 'Hide Hint' : '💡 Hint'}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg shadow transition-all"
            >
              Submit
            </button>
          </div>
        </form>

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
