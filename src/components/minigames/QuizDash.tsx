import { useState, useEffect, useCallback } from 'react'
import { quizzes, type QuizQuestion as BankQuestion } from '../../data/quizzes'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface QuizDashProps {
  onComplete: (score: number, maxScore: number) => void
  onSkip: () => void
}

// The dash draws from the same bank the quest knowledge checks use: every
// multiple-choice question across all technologies, flattened. Fill-blank and
// code-challenge entries (no options array, or a single distractor-free one)
// cannot be answered as a timed pick, so they stay out of the deck.
const QUESTION_POOL: QuizQuestion[] = Object.values(quizzes)
  .flat()
  .filter(
    (question): question is BankQuestion & { options: string[]; correctIndex: number } =>
      Array.isArray(question.options) &&
      question.options.length > 1 &&
      typeof question.correctIndex === 'number',
  )
  .map((question) => ({
    id: question.id,
    question: question.question,
    options: question.options,
    correctAnswer: question.correctIndex,
  }))

// Fisher-Yates — the sort-by-random trick it replaces clustered the deck.
function shuffle<T>(items: readonly T[]): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// eslint-disable-next-line react-refresh/only-export-components -- exported so tests can replay the exact dealt deck
export function generateQuizQuestions(count: number): QuizQuestion[] {
  return shuffle(QUESTION_POOL).slice(0, count)
}

export function QuizDashGame({ onComplete, onSkip }: QuizDashProps) {
  const [questions, setQuestions] = useState(() => generateQuizQuestions(5))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [streak, setStreak] = useState(0)

  const currentQuestion = questions[currentIndex]
  const maxScore = questions.length

  // Deals a fresh deck and resets every round counter in place — no page
  // reload, so the hub modal the game sits in stays open.
  const dealNewDeck = useCallback(() => {
    setQuestions(generateQuizQuestions(5))
    setCurrentIndex(0)
    setScore(0)
    setTimeLeft(10)
    setSelectedAnswer(null)
    setShowResult(false)
    setIsComplete(false)
    setStreak(0)
  }, [])

  const handleAnswer = useCallback(
    (answerIndex: number) => {
      if (showResult) return

      setSelectedAnswer(answerIndex)
      setShowResult(true)

      const isCorrect = answerIndex === currentQuestion.correctAnswer
      if (isCorrect) {
        setScore((prev) => prev + 1)
        setStreak((prev) => prev + 1)
      } else {
        setStreak(0)
      }

      // Move to next question after delay
      setTimeout(() => {
        setShowResult(false)
        setSelectedAnswer(null)
        setTimeLeft(10)

        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1)
        } else {
          setIsComplete(true)
          onComplete(score + (isCorrect ? 1 : 0), maxScore)
        }
      }, 1000)
    },
    [currentQuestion, currentIndex, questions.length, score, maxScore, showResult, onComplete],
  )

  // Timer effect
  useEffect(() => {
    if (isComplete || showResult) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto advance
          handleAnswer(-1)
          return 10
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [currentIndex, showResult, isComplete, handleAnswer])

  const getOptionClass = (index: number) => {
    if (!showResult) {
      return 'bg-slate-700 hover:bg-slate-600 cursor-pointer border-slate-600'
    }

    if (index === currentQuestion.correctAnswer) {
      return 'bg-green-600 border-green-500 cursor-not-allowed'
    }

    if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
      return 'bg-red-600 border-red-500 cursor-not-allowed'
    }

    return 'bg-slate-700 border-slate-600 cursor-not-allowed'
  }

  if (isComplete) {
    const percentage = (score / maxScore) * 100
    return (
      <div className="p-6 text-center">
        <div className="text-6xl mb-4">
          {percentage >= 80 ? '🏆' : percentage >= 60 ? '👍' : '💪'}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h3>
        <div className="text-4xl font-bold text-amber-400 mb-2">
          {score} / {maxScore}
        </div>
        <p className="text-slate-400 mb-6">
          {percentage >= 80
            ? 'Excellent work!'
            : percentage >= 60
              ? 'Good job!'
              : 'Keep practicing!'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onSkip}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
          >
            Back to Menu
          </button>
          <button
            onClick={dealNewDeck}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button onClick={onSkip} className="text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
          <span className="text-slate-400">
            Question {currentIndex + 1}/{questions.length}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {streak >= 2 && <span className="text-orange-400 animate-pulse">🔥 {streak}</span>}
          <div
            className={`px-3 py-1 rounded-full font-bold ${
              timeLeft <= 3 ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-700 text-white'
            }`}
          >
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-700 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-4">{currentQuestion.question}</h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                handleAnswer(index)
              }}
              disabled={showResult}
              className={`w-full p-4 rounded-lg border-2 text-left font-medium transition-all ${getOptionClass(index)}`}
            >
              <span className="inline-block w-8 h-8 rounded-full bg-slate-600 text-center leading-8 mr-3 text-sm">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
              {showResult && index === currentQuestion.correctAnswer && (
                <span className="float-right">✓</span>
              )}
              {showResult &&
                index === selectedAnswer &&
                index !== currentQuestion.correctAnswer && <span className="float-right">✗</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
