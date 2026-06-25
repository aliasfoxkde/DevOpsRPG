import { useState } from 'react'
import { codePuzzles, type CodePuzzle } from '../../data/minigames'

interface CodePuzzleGameProps {
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

export function CodePuzzleGame({ rounds = 5, onComplete, onSkip }: CodePuzzleGameProps) {
  const [gamePuzzles] = useState<CodePuzzle[]>(() => shuffle(codePuzzles).slice(0, rounds))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing')

  const currentPuzzle = gamePuzzles[currentIndex]
  const maxScore = rounds * 100

  const handleSelectAnswer = (answer: string) => {
    if (showResult || !currentPuzzle) return

    setSelectedAnswer(answer)
    setShowResult(true)

    const isCorrect = answer === currentPuzzle.answer

    if (isCorrect) {
      setCorrectCount(c => c + 1)
      setScore(s => s + 100)
    } else {
      setWrongCount(c => c + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < gamePuzzles.length - 1) {
      setCurrentIndex(i => i + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setGameState('finished')
    }
  }

  const handleComplete = () => {
    onComplete(score, maxScore)
  }

  if (gamePuzzles.length === 0) {
    return (
      <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 p-6 text-center">
        <p className="text-slate-400">Loading puzzles...</p>
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
            💻 Code Puzzle Complete!
          </h2>
        </div>
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">{passed ? '🏆' : '🔧'}</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {passed ? 'Code Master!' : 'Keep Practicing!'}
          </h3>
          <p className="text-slate-300 mb-4">
            You solved {correctCount} out of {rounds} puzzles correctly ({percentage}%)
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

  const getOptionClass = (option: string) => {
    if (!showResult) {
      return selectedAnswer === option
        ? 'bg-amber-900/50 border-amber-500'
        : 'bg-slate-700 hover:bg-slate-600 border-slate-600'
    }

    if (option === currentPuzzle?.answer) {
      return 'bg-green-900/50 border-green-500'
    }

    if (option === selectedAnswer && option !== currentPuzzle?.answer) {
      return 'bg-red-900/50 border-red-500'
    }

    return 'bg-slate-700 border-slate-600 opacity-50'
  }

  return (
    <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            💻 Code Puzzle
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-400">✓ {correctCount}</span>
            <span className="text-red-400">✗ {wrongCount}</span>
            <span className="text-slate-400">{currentIndex + 1}/{rounds}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Puzzle description */}
        <div className="mb-4">
          <p className="text-amber-400 text-sm font-medium mb-2">{currentPuzzle?.title}</p>
          <p className="text-slate-300 text-sm">{currentPuzzle?.description}</p>
        </div>

        {/* Code display */}
        <div className="mb-6">
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre className="text-green-400 whitespace-pre-wrap">
              {currentPuzzle?.code.split('___').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="bg-amber-600/30 text-amber-400 px-2 py-1 rounded animate-pulse">
                      ___
                    </span>
                  )}
                </span>
              ))}
            </pre>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentPuzzle?.options ? (
            currentPuzzle.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(option)}
                disabled={showResult}
                className={`w-full text-left p-4 rounded-lg border transition-all ${getOptionClass(option)}`}
              >
                <span className="text-slate-300">{option}</span>
              </button>
            ))
          ) : (
            // Free text input for puzzles without options
            <div className="text-center text-slate-400 py-4">
              No options available for this puzzle type
            </div>
          )}
        </div>

        {/* Result feedback */}
        {showResult && (
          <div className={`mb-4 p-4 rounded-lg ${
            selectedAnswer === currentPuzzle?.answer
              ? 'bg-green-900/30 border border-green-700'
              : 'bg-amber-900/30 border border-amber-700'
          }`}>
            <p className={`font-bold mb-1 ${
              selectedAnswer === currentPuzzle?.answer ? 'text-green-400' : 'text-amber-400'
            }`}>
              {selectedAnswer === currentPuzzle?.answer ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            {selectedAnswer !== currentPuzzle?.answer && (
              <p className="text-slate-300 text-sm">
                Correct answer: <span className="text-green-400 font-bold">{currentPuzzle?.answer}</span>
              </p>
            )}
          </div>
        )}

        {/* Next button */}
        {showResult && (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105"
          >
            {currentIndex < gamePuzzles.length - 1 ? 'Next Puzzle →' : 'See Results'}
          </button>
        )}

        {/* Progress bar */}
        {!showResult && (
          <div className="mt-4">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / rounds) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
