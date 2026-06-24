import { useState, useEffect } from 'react'
import { getQuizForTopic } from '../../data/quizzes'

export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank'

export interface QuizQuestion {
  id: string
  topicId: string
  question: string
  type: QuestionType
  options?: string[]
  correctIndex?: number
  correctAnswer?: string
  explanation: string
}

interface QuizProps {
  topicId: string
  onPass: () => void
  onSkip: () => void
}

export default function Quiz({ topicId, onPass, onSkip }: QuizProps) {
  const allQuestions = getQuizForTopic(topicId)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [showExplanation, setShowExplanation] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  const [localCorrect, setLocalCorrect] = useState(false)

  // If no quiz available, use a simplified check
  if (allQuestions.length === 0) {
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

  const current = allQuestions[currentIndex]
  const questionType = current.type || 'multiple_choice'
  const isMultipleChoice = questionType === 'multiple_choice'
  const isTrueFalse = questionType === 'true_false'
  const isFillBlank = questionType === 'fill_blank'

  // Handle 'n' key to auto-select correct answer and advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'n' && !showExplanation && !quizComplete) {
        e.preventDefault()
        // Auto-select the correct answer
        if (current.correctIndex !== undefined) {
          handleSelect(current.correctIndex)
        } else if (current.correctAnswer) {
          // For fill blank, auto-fill the correct answer
          setTextAnswer(current.correctAnswer)
          setShowExplanation(true)
          setLocalCorrect(true)
          setCorrectCount(c => c + 1)
        }
      }
      // 'm' key to skip to next question
      if (e.key.toLowerCase() === 'm' && showExplanation) {
        e.preventDefault()
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [current, showExplanation, quizComplete])

  const handleSelect = (index: number) => {
    if (showExplanation) return
    setSelectedIndex(index)
    setShowExplanation(true)
    const isCorrect = index === current.correctIndex
    setLocalCorrect(isCorrect)
    if (isCorrect) {
      setCorrectCount(c => c + 1)
    } else {
      setWrongCount(c => c + 1)
    }
  }

  const handleTextSubmit = () => {
    if (showExplanation || !textAnswer.trim()) return
    setShowExplanation(true)
    const normalizedInput = textAnswer.trim().toLowerCase()
    const normalizedCorrect = (current.correctAnswer || '').toLowerCase()
    const isCorrect = normalizedInput === normalizedCorrect ||
      normalizedCorrect.includes(normalizedInput) ||
      normalizedInput.includes(normalizedCorrect)
    setLocalCorrect(isCorrect)
    if (isCorrect) {
      setCorrectCount(c => c + 1)
    } else {
      setWrongCount(c => c + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(i => i + 1)
      setSelectedIndex(null)
      setTextAnswer('')
      setShowExplanation(false)
      setLocalCorrect(false)
    } else {
      setQuizComplete(true)
    }
  }

  const handleFinish = () => {
    const passThreshold = Math.ceil(allQuestions.length * 0.6)
    if (correctCount >= passThreshold) {
      onPass()
    } else {
      onSkip()
    }
  }

  const getQuestionTypeLabel = () => {
    switch (questionType) {
      case 'true_false': return 'True or False'
      case 'fill_blank': return 'Fill in the Blank'
      default: return 'Multiple Choice'
    }
  }

  if (quizComplete) {
    const passThreshold = Math.ceil(allQuestions.length * 0.6)
    const passed = correctCount >= passThreshold
    const percentage = Math.round((correctCount / allQuestions.length) * 100)

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
          <p className="text-slate-300 mb-2">
            You got {correctCount} out of {allQuestions.length} questions correct ({percentage}%)
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
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              📝 Knowledge Check
            </h2>
            <span className="text-xs px-2 py-1 bg-amber-600/30 text-amber-400 rounded">
              {getQuestionTypeLabel()}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-400">✓ {correctCount}</span>
            <span className="text-red-400">✗ {wrongCount}</span>
            <span className="text-slate-400">{currentIndex + 1}/{allQuestions.length}</span>
            <span className="text-xs text-slate-500">Press N for correct, M for next</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Question */}
        <h3 className="text-xl font-bold text-white mb-6">
          {isFillBlank ? current.question.replace('___', '________') : current.question}
        </h3>

        {/* Multiple Choice */}
        {isMultipleChoice && current.options && (
          <div className="space-y-3">
            {current.options.map((option, index) => {
              let bgClass = 'bg-slate-700 hover:bg-slate-600 border-slate-600'
              if (showExplanation) {
                if (index === current.correctIndex) {
                  bgClass = 'bg-green-900/50 border-green-500'
                } else if (index === selectedIndex) {
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
        )}

        {/* True/False */}
        {isTrueFalse && current.options && (
          <div className="grid grid-cols-2 gap-4">
            {current.options.map((option, index) => {
              let bgClass = 'bg-slate-700 hover:bg-slate-600 border-slate-600'
              if (showExplanation) {
                if (index === current.correctIndex) {
                  bgClass = 'bg-green-900/50 border-green-500'
                } else if (index === selectedIndex) {
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
                  className={`p-6 rounded-lg border transition-all text-center text-lg font-bold ${bgClass}`}
                >
                  <span className="text-slate-300">{option}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Fill in the Blank */}
        {isFillBlank && (
          <div className="space-y-4">
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !showExplanation) handleTextSubmit()
              }}
              disabled={showExplanation}
              placeholder="Type your answer..."
              className={`w-full p-4 rounded-lg border text-lg text-white placeholder-slate-500 focus:outline-none transition-all ${
                showExplanation
                  ? localCorrect
                    ? 'bg-green-900/50 border-green-500'
                    : 'bg-red-900/50 border-red-500'
                  : 'bg-slate-700 border-slate-600 focus:border-amber-500'
              }`}
              autoFocus
            />
            {!showExplanation && (
              <button
                onClick={handleTextSubmit}
                disabled={!textAnswer.trim()}
                className={`w-full py-3 font-bold rounded-lg transition-all ${
                  textAnswer.trim()
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                Check Answer
              </button>
            )}
          </div>
        )}

        {/* Explanation */}
        {showExplanation && (
          <div className={`mt-6 p-4 rounded-lg ${localCorrect ? 'bg-green-900/30 border border-green-700' : 'bg-amber-900/30 border border-amber-700'}`}>
            <p className={`font-bold mb-2 ${localCorrect ? 'text-green-400' : 'text-amber-400'}`}>
              {localCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            {!localCorrect && current.correctAnswer && (
              <p className="text-slate-300 mb-2">
                Correct answer: <span className="text-green-400 font-bold">{current.correctAnswer}</span>
              </p>
            )}
            {!localCorrect && current.correctIndex !== undefined && current.options && (
              <p className="text-slate-300 mb-2">
                Correct answer: <span className="text-green-400 font-bold">{current.options[current.correctIndex]}</span>
              </p>
            )}
            <p className="text-slate-300">{current.explanation}</p>
          </div>
        )}

        {/* Next Button */}
        {showExplanation && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105"
            >
              {currentIndex < allQuestions.length - 1 ? 'Next Question →' : 'See Results'} (M)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
