import { useState, useEffect, useCallback } from 'react'

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

// Generate quiz questions from the quiz data
function generateQuizQuestions(count: number): QuizQuestion[] {
  // We'll generate placeholder questions since we don't have direct quiz access
  // In production, this would pull from the actual quiz data
  const sampleQuestions: Omit<QuizQuestion, 'id'>[] = [
    {
      question: 'What does CD stand for in DevOps?',
      options: ['Continuous Deployment', 'Container Docker', 'Code Development', 'Central Database'],
      correctAnswer: 0,
    },
    {
      question: 'Which tool is used for container orchestration?',
      options: ['Docker', 'Kubernetes', 'Jenkins', 'Git'],
      correctAnswer: 1,
    },
    {
      question: 'What is the purpose of a CI pipeline?',
      options: ['Build automation', 'Manual testing', 'Design UX', 'Manage servers'],
      correctAnswer: 0,
    },
    {
      question: 'What does IaC stand for?',
      options: ['Infrastructure as Code', 'Internet as Computer', 'Integrated Application Controller', 'Internal API Cache'],
      correctAnswer: 0,
    },
    {
      question: 'Which is a version control system?',
      options: ['Docker', 'Jenkins', 'Git', 'Kubernetes'],
      correctAnswer: 2,
    },
    {
      question: 'What does CPU stand for?',
      options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Utility'],
      correctAnswer: 0,
    },
    {
      question: 'What is Docker used for?',
      options: ['Version control', 'Containerization', 'Monitoring', 'Networking'],
      correctAnswer: 1,
    },
    {
      question: 'What does API stand for?',
      options: ['Application Programming Interface', 'Automated Program Integration', 'Application Process Integration', 'Advanced Programming Internet'],
      correctAnswer: 0,
    },
  ]

  // Shuffle and select questions
  const shuffled = [...sampleQuestions].sort(() => Math.random() - 0.5)
  const questionPool: QuizQuestion[] = []
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    questionPool.push({
      id: `quiz_${i}_${Date.now()}`,
      ...shuffled[i],
    })
  }

  return questionPool
}

export function QuizDashGame({ onComplete, onSkip }: QuizDashProps) {
  const [questions] = useState(() => generateQuizQuestions(5))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [streak, setStreak] = useState(0)

  const currentQuestion = questions[currentIndex]
  const maxScore = questions.length

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

    return () => clearInterval(timer)
  }, [currentIndex, showResult, isComplete])

  const handleAnswer = useCallback((answerIndex: number) => {
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
  }, [currentQuestion, currentIndex, questions.length, score, maxScore, showResult, onComplete])

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

    return 'bg-slate-700 border-slate-600 cursor-not-allowed opacity-50'
  }

  if (isComplete) {
    const percentage = (score / maxScore) * 100
    return (
      <div className="p-6 text-center">
        <div className="text-6xl mb-4">{percentage >= 80 ? '🏆' : percentage >= 60 ? '👍' : '💪'}</div>
        <h3 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h3>
        <div className="text-4xl font-bold text-amber-400 mb-2">
          {score} / {maxScore}
        </div>
        <p className="text-slate-400 mb-6">
          {percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good job!' : 'Keep practicing!'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onSkip}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
          >
            Back to Menu
          </button>
          <button
            onClick={() => window.location.reload()}
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
          <button
            onClick={onSkip}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
          <span className="text-slate-400">
            Question {currentIndex + 1}/{questions.length}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {streak >= 2 && (
            <span className="text-orange-400 animate-pulse">🔥 {streak}</span>
          )}
          <div className={`px-3 py-1 rounded-full font-bold ${
            timeLeft <= 3 ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-700 text-white'
          }`}>
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
              onClick={() => handleAnswer(index)}
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
              {showResult && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                <span className="float-right">✗</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
