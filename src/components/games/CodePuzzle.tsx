import { useState, useEffect } from 'react'
import { codePuzzles, type CodePuzzle } from '../../data/minigames'

interface CodePuzzleGameProps {
  onComplete: (score: number, bonusXP: number) => void
  onSkip: () => void
}

export default function CodePuzzleGame({ onComplete, onSkip }: CodePuzzleGameProps) {
  const [puzzles, setPuzzles] = useState<CodePuzzle[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    const shuffled = [...codePuzzles].sort(() => Math.random() - 0.5)
    setPuzzles(shuffled.slice(0, 8))
  }, [])

  const current = puzzles[currentIndex]

  const handleStart = () => {
    setStarted(true)
  }

  const handleSelectAnswer = (answer: string) => {
    if (showFeedback) return

    setSelectedAnswer(answer)
    setShowFeedback(true)

    if (answer === current.answer) {
      setCorrect(c => c + 1)
    } else {
      setWrong(w => w + 1)
    }

    setTimeout(() => {
      if (currentIndex < puzzles.length - 1) {
        setCurrentIndex(i => i + 1)
        setSelectedAnswer('')
        setShowFeedback(false)
      } else {
        const baseXP = correct * 20 + (selectedAnswer === current.answer ? 20 : 0) + puzzles.length * 5
        const accuracyBonus = (correct + (selectedAnswer === current.answer ? 1 : 0)) / (correct + wrong + 1) > 0.7 ? 30 : 0
        setFinished(true)
        setTimeout(() => onComplete(baseXP, baseXP + accuracyBonus), 1000)
      }
    }, 1500)
  }

  if (!started) {
    return (
      <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            💻 Code Puzzle Challenge
          </h2>
        </div>
        <div className="p-8 text-center">
          <div className="text-6xl mb-6">💻</div>
          <h3 className="text-2xl font-bold text-white mb-4">Test Your Code Knowledge!</h3>
          <p className="text-slate-300 mb-6 max-w-md mx-auto">
            Complete code snippets, identify syntax, and solve programming puzzles!
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
            💻 Code Puzzles
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-400">✓ {correct}</span>
            <span className="text-red-400">✗ {wrong}</span>
            <span className="text-slate-400">{currentIndex + 1}/{puzzles.length}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Progress */}
        <div className="w-full h-2 bg-slate-700 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / puzzles.length) * 100}%` }}
          />
        </div>

        {/* Puzzle */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-amber-400 mb-2 text-center">{current.title}</h3>
          <p className="text-slate-300 text-center mb-4">{current.description}</p>

          {/* Code snippet */}
          <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-700 mb-4">
            <code className="text-green-400 font-mono text-sm sm:text-base break-all">
              {current.code}
            </code>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {(current.options || [current.answer]).map((option) => {
            let bgClass = 'bg-slate-700 hover:bg-slate-600 border-slate-600'
            if (showFeedback) {
              if (option === current.answer) {
                bgClass = 'bg-green-900/50 border-green-500'
              } else if (option === selectedAnswer && option !== current.answer) {
                bgClass = 'bg-red-900/50 border-red-500'
              }
            } else if (selectedAnswer === option) {
              bgClass = 'bg-amber-900/50 border-amber-500'
            }

            return (
              <button
                key={option}
                onClick={() => handleSelectAnswer(option)}
                disabled={showFeedback}
                className={`p-4 rounded-lg border-2 transition-all font-mono text-white ${
                  showFeedback ? '' : 'hover:scale-102'
                } ${bgClass}`}
              >
                {option}
              </button>
            )
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`mt-4 p-3 rounded-lg text-center ${
            selectedAnswer === current.answer
              ? 'bg-green-900/30 border border-green-700'
              : 'bg-red-900/30 border border-red-700'
          }`}>
            <p className={selectedAnswer === current.answer ? 'text-green-400' : 'text-red-400'}>
              {selectedAnswer === current.answer ? '✓ Correct!' : `✗ The answer was: ${current.answer}`}
            </p>
          </div>
        )}

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
