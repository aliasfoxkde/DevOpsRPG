import { useState, useEffect, useCallback, useRef } from 'react'
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
  const hasQuestions = allQuestions.length > 0

  // ALL hooks must be called unconditionally - React rules
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [showExplanation, setShowExplanation] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  const [localCorrect, setLocalCorrect] = useState(false)

  // Use ref to avoid stale closure in handleFinish
  const correctCountRef = useRef(correctCount)
  const allQuestionsLengthRef = useRef(allQuestions.length)
  correctCountRef.current = correctCount
  allQuestionsLengthRef.current = allQuestions.length

  // currentQuestion is guaranteed non-null when hasQuestions is true
  // because we return early in the render when !hasQuestions
  const currentQuestion = allQuestions[currentIndex]
  const questionType = currentQuestion?.type || 'multiple_choice'
  const isMultipleChoice = questionType === 'multiple_choice'
  const isTrueFalse = questionType === 'true_false'
  const isFillBlank = questionType === 'fill_blank'

  const handleSelect = useCallback((index: number) => {
    if (showExplanation || !currentQuestion) return
    setSelectedIndex(index)
    setShowExplanation(true)
    const isCorrect = index === currentQuestion.correctIndex
    setLocalCorrect(isCorrect)
    if (isCorrect) {
      setCorrectCount(c => c + 1)
    } else {
      setWrongCount(c => c + 1)
    }
  }, [showExplanation, currentQuestion])

  const handleTextSubmit = useCallback(() => {
    if (showExplanation || !textAnswer.trim() || !currentQuestion) return
    setShowExplanation(true)
    const normalizedInput = textAnswer.trim().toLowerCase()
    const normalizedCorrect = (currentQuestion.correctAnswer || '').toLowerCase()
    const isCorrect = normalizedInput === normalizedCorrect ||
      normalizedCorrect.includes(normalizedInput) ||
      normalizedInput.includes(normalizedCorrect)
    setLocalCorrect(isCorrect)
    if (isCorrect) {
      setCorrectCount(c => c + 1)
    } else {
      setWrongCount(c => c + 1)
    }
  }, [showExplanation, textAnswer, currentQuestion])

  const handleNext = useCallback(() => {
    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(i => i + 1)
      setSelectedIndex(null)
      setTextAnswer('')
      setShowExplanation(false)
      setLocalCorrect(false)
    } else {
      setQuizComplete(true)
    }
  }, [currentIndex, allQuestions.length])

  const handleFinish = useCallback(() => {
    if (!hasQuestions) {
      onPass()
      return
    }
    const passThreshold = Math.ceil(allQuestionsLengthRef.current * 0.6)
    if (correctCountRef.current >= passThreshold) {
      onPass()
    } else {
      onSkip()
    }
  }, [hasQuestions, onPass, onSkip])

  // Handle 'n' key for unified navigation: auto-answer → next → complete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'n') return
      e.preventDefault()

      if (quizComplete) {
        handleFinish()
      } else if (showExplanation) {
        handleNext()
      } else if (currentQuestion) {
        if (currentQuestion.correctIndex !== undefined) {
          handleSelect(currentQuestion.correctIndex)
        } else if (currentQuestion.correctAnswer) {
          setTextAnswer(currentQuestion.correctAnswer)
          setShowExplanation(true)
          setLocalCorrect(true)
          setCorrectCount(c => c + 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentQuestion, showExplanation, quizComplete, handleFinish, handleNext, handleSelect])

  // Handle empty quiz case - AFTER all hooks
  if (!hasQuestions) {
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

  // At this point, currentQuestion is guaranteed to exist
  const q = currentQuestion!

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
            <span className="text-xs text-slate-500">Press N for all (answer/next/complete)</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Question */}
        <h3 className="text-xl font-bold text-white mb-6">
          {isFillBlank ? q.question.replace('___', '________') : q.question}
        </h3>

        {/* Multiple Choice */}
        {isMultipleChoice && q.options && (
          <div className="space-y-3">
            {q.options.map((option: string, index: number) => {
              let bgClass = 'bg-slate-700 hover:bg-slate-600 border-slate-600'
              if (showExplanation) {
                if (index === q.correctIndex) {
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
        {isTrueFalse && q.options && (
          <div className="grid grid-cols-2 gap-4">
            {q.options.map((option: string, index: number) => {
              let bgClass = 'bg-slate-700 hover:bg-slate-600 border-slate-600'
              if (showExplanation) {
                if (index === q.correctIndex) {
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
            {!localCorrect && q.correctAnswer && (
              <p className="text-slate-300 mb-2">
                Correct answer: <span className="text-green-400 font-bold">{q.correctAnswer}</span>
              </p>
            )}
            {!localCorrect && q.correctIndex !== undefined && q.options && (
              <p className="text-slate-300 mb-2">
                Correct answer: <span className="text-green-400 font-bold">{q.options[q.correctIndex]}</span>
              </p>
            )}
            <p className="text-slate-300">{q.explanation}</p>
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
