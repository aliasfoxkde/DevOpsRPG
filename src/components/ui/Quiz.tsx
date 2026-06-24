import { useState } from 'react'
import { getQuizForTopic } from '../../data/quizzes'

interface QuizProps {
  topicId: string
  onPass: () => void
  onSkip: () => void
}

export default function Quiz({ topicId, onPass, onSkip }: QuizProps) {
  const questions = getQuizForTopic(topicId)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)

  // If no quiz available, use a simplified check
  if (questions.length === 0) {
    return (
      <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            📝 Knowledge Check
          </h2>
        </div>
        <div className="p-6 text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-slate-300 mb-4">No quiz available for this topic yet.</p>
          <p className="text-slate-400 text-sm mb-6">Demonstrate your knowledge by completing this quest!</p>
          <button
            onClick={onPass}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105"
          >
            ✨ Complete Quest
          </button>
        </div>
      </div>
    )
  }

  const current = questions[currentIndex]
  const isCorrect = selectedIndex === current.correctIndex
  const passThreshold = Math.ceil(questions.length * 0.6) // 60% to pass

  const handleSelect = (index: number) => {
    if (showExplanation) return
    setSelectedIndex(index)
    setShowExplanation(true)
    if (index === current.correctIndex) {
      setCorrectCount(c => c + 1)
    } else {
      setWrongCount(c => c + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
      setSelectedIndex(null)
      setShowExplanation(false)
    } else {
      setQuizComplete(true)
    }
  }

  const handleFinish = () => {
    if (correctCount >= passThreshold) {
      onPass()
    } else {
      onSkip()
    }
  }

  if (quizComplete) {
    const passed = correctCount >= passThreshold
    return (
      <div className="bg-slate-800/80 rounded-xl border overflow-hidden">
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            📝 Quiz Complete!
          </h2>
        </div>
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">{passed ? '🎉' : '📚'}</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {passed ? 'Quest Passed!' : 'Keep Learning!'}
          </h3>
          <p className="text-slate-300 mb-4">
            You got {correctCount} out of {questions.length} questions correct.
          </p>
          {passed ? (
            <p className="text-green-400 mb-6">Great job! You've demonstrated your knowledge.</p>
          ) : (
            <p className="text-amber-400 mb-6">
              Review the material and try again. You need {passThreshold} correct to pass.
            </p>
          )}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleFinish}
              className={`px-8 py-3 font-bold rounded-lg shadow-lg transform transition-all hover:scale-105 ${
                passed
                  ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white'
                  : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white'
              }`}
            >
              {passed ? '✨ Complete Quest' : '🔄 Practice More'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            📝 Knowledge Check
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-400">✓ {correctCount}</span>
            <span className="text-red-400">✗ {wrongCount}</span>
            <span className="text-slate-400">{currentIndex + 1}/{questions.length}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-6">{current.question}</h3>

        <div className="space-y-3">
          {current.options.map((option, index) => {
            let bgClass = 'bg-slate-700 hover:bg-slate-600 border-slate-600'
            if (showExplanation) {
              if (index === current.correctIndex) {
                bgClass = 'bg-green-900/50 border-green-500'
              } else if (index === selectedIndex && !isCorrect) {
                bgClass = 'bg-red-900/50 border-red-500'
              }
            } else if (selectedIndex === index) {
              bgClass = 'bg-amber-900/50 border-amber-500'
            }

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-lg border transition-all ${bgClass}`}
              >
                <span className="text-slate-300">{option}</span>
              </button>
            )
          })}
        </div>

        {showExplanation && (
          <div className={`mt-6 p-4 rounded-lg ${isCorrect ? 'bg-green-900/30 border border-green-700' : 'bg-amber-900/30 border border-amber-700'}`}>
            <p className={`font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-amber-400'}`}>
              {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            <p className="text-slate-300">{current.explanation}</p>
          </div>
        )}

        {showExplanation && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105"
            >
              {currentIndex < questions.length - 1 ? 'Next Question →' : 'See Results'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
