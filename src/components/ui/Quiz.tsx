import { useState, useEffect, useCallback, useRef } from 'react'
import { getQuizForTopic } from '../../data/quizzes'
import { getRandomEncouragement } from '../../data/milestones'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import { useGame } from '../../contexts/GameContext'

export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'code_challenge'

export interface QuizQuestion {
  id: string
  topicId: string
  question: string
  type?: QuestionType
  options?: string[]
  correctIndex?: number
  correctAnswer?: string
  explanation: string
  codeTemplate?: string
  expectedOutput?: string
  hint?: string
}

interface QuizProps {
  topicId: string
  onPass: (isPerfect: boolean, wrongAnswers: number, passedWith80: boolean) => void
  onSkip: () => void
}

export default function Quiz({ topicId, onPass, onSkip }: QuizProps) {
  const allQuestions = getQuizForTopic(topicId)
  const hasQuestions = allQuestions.length > 0
  const { playSound } = useSoundEffects()
  const { game, consumeCollectible } = useGame()

  // Check if player has unused hint scroll
  const hasHintScroll = game.collectibles.some(c => c.id === 'hint_scroll' && !c.used)

  // ALL hooks must be called unconditionally - React rules
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [codeAnswer, setCodeAnswer] = useState('')
  const [showExplanation, setShowExplanation] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  const [localCorrect, setLocalCorrect] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [takeawayText, setTakeawayText] = useState('')
  const [takeawayError, setTakeawayError] = useState('')

  // Use ref to avoid stale closure in handleFinish
  const isMountedRef = useRef(true)
  const correctCountRef = useRef(correctCount)
  const wrongCountRef = useRef(wrongCount)
  const allQuestionsLengthRef = useRef(allQuestions.length)
  const finishHandledRef = useRef(false)

  // Keep refs in sync with state using useEffect
  useEffect(() => {
    correctCountRef.current = correctCount
  }, [correctCount])

  useEffect(() => {
    wrongCountRef.current = wrongCount
  }, [wrongCount])

  useEffect(() => {
    allQuestionsLengthRef.current = allQuestions.length
  }, [allQuestions.length])

  // Track component mount state to prevent state updates after unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => { isMountedRef.current = false }
  }, [])

  // Safety timeout: if isFinishing gets stuck for >2s, auto-complete anyway
  useEffect(() => {
    if (!isFinishing) return
    const safetyTimeout = setTimeout(() => {
      if (isFinishing) {
        console.warn('Quiz completion timed out, forcing completion')
        onSkip()
      }
    }, 2000)
    return () => clearTimeout(safetyTimeout)
  }, [isFinishing, onSkip])

  // currentQuestion is guaranteed non-null when hasQuestions is true
  // because we return early in the render when !hasQuestions
  const currentQuestion = allQuestions[currentIndex]
  const questionType = currentQuestion?.type || 'multiple_choice'
  const isMultipleChoice = questionType === 'multiple_choice'
  const isTrueFalse = questionType === 'true_false'
  const isFillBlank = questionType === 'fill_blank'
  const isCodeChallenge = questionType === 'code_challenge'

  const handleSelect = useCallback((index: number) => {
    if (showExplanation || !currentQuestion) return
    setSelectedIndex(index)
    setShowExplanation(true)
    const isCorrect = index === currentQuestion.correctIndex
    setLocalCorrect(isCorrect)
    if (isCorrect) {
      setCorrectCount(c => c + 1)
      playSound('correct')
    } else {
      setWrongCount(c => c + 1)
      playSound('incorrect')
    }
  }, [showExplanation, currentQuestion, playSound])

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
      playSound('correct')
    } else {
      setWrongCount(c => c + 1)
      playSound('incorrect')
    }
  }, [showExplanation, textAnswer, currentQuestion, playSound])

  const handleCodeSubmit = useCallback(() => {
    if (showExplanation || !currentQuestion) return
    setShowExplanation(true)
    // For code challenges, we check if the code produces expected output
    // Simple check: see if key parts of expected output are present
    const code = codeAnswer.toLowerCase()
    const expected = (currentQuestion.expectedOutput || '').toLowerCase()
    // Check if code contains the expected output or is close enough
    const isCorrect = code.includes(expected) || expected.includes(code.trim())
    setLocalCorrect(isCorrect)
    if (isCorrect) {
      setCorrectCount(c => c + 1)
      playSound('correct')
    } else {
      setWrongCount(c => c + 1)
      playSound('incorrect')
    }
  }, [showExplanation, codeAnswer, currentQuestion, playSound])

  const handleNext = useCallback(() => {
    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(i => i + 1)
      setSelectedIndex(null)
      setTextAnswer('')
      setCodeAnswer('')
      setShowExplanation(false)
      setLocalCorrect(false)
      setShowHint(false)
    } else {
      setQuizComplete(true)
    }
  }, [currentIndex, allQuestions.length])

  const handleFinish = useCallback(() => {
    if (finishHandledRef.current) {
      console.warn('handleFinish already called, ignoring duplicate')
      return
    }
    finishHandledRef.current = true
    setIsFinishing(true)

    // Guard against calling callbacks after unmount - but still call onPass/onSkip
    if (!hasQuestions) {
      onPass(false, 0, false)
      return
    }
    const passThreshold = Math.ceil(allQuestionsLengthRef.current * 0.6)
    const isPerfect = correctCountRef.current === allQuestionsLengthRef.current
    const passedWith80 = correctCountRef.current >= Math.ceil(allQuestionsLengthRef.current * 0.8)
    console.log(`handleFinish: correct=${correctCountRef.current}, threshold=${passThreshold}, passed=${correctCountRef.current >= passThreshold}`)
    if (correctCountRef.current >= passThreshold) {
      onPass(isPerfect, wrongCountRef.current, passedWith80)
    } else {
      console.log('handleFinish: not passed, calling onSkip')
      onSkip()
    }
  }, [hasQuestions, onPass, onSkip])

  // Handle 'n' key for unified navigation: auto-answer → next → complete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'n') return
      e.preventDefault()

      console.log(`n key: quizComplete=${quizComplete}, showExplanation=${showExplanation}, questionIndex=${currentIndex}`)

      if (quizComplete) {
        // Final press - complete the quest
        console.log('n key: calling handleFinish')
        handleFinish()
      } else if (showExplanation) {
        // Move to next question
        console.log('n key: calling handleNext')
        handleNext()
      } else if (currentQuestion) {
        // Auto-answer the question
        console.log('n key: auto-answering')
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
  // User must still prove they've engaged with the material
  if (!hasQuestions) {
    return (
      <div className="bg-slate-800/80 rounded-xl border border-amber-600/50 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            📝 Knowledge Check
          </h2>
        </div>
        <div className="p-6 text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-amber-400 mb-4">Knowledge Check</p>
          <p className="text-slate-400 text-sm mb-6">
            Demonstrate your learning! Type one key takeaway from this topic:
          </p>
          <textarea
            placeholder="The main thing I learned was..."
            className="w-full p-4 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none mb-2"
            rows={3}
            value={takeawayText}
            onChange={(e) => {
              setTakeawayText(e.target.value)
              if (takeawayError) setTakeawayError('')
            }}
          />
          {takeawayError && (
            <p className="text-red-400 text-sm mb-4">{takeawayError}</p>
          )}
          <p className="text-purple-400 text-sm mb-4">
            ✨ Complete this quest to earn XP!
          </p>
          <button
            onClick={() => {
              if (takeawayText.trim().length < 10) {
                setTakeawayError('Please write at least 10 characters about what you learned')
                return
              }
              onPass(false, 0, false)
            }}
            className="btn btn-success px-8 py-3"
          >
            Complete Quest
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
    const encouragement = getRandomEncouragement()

    return (
      <div className="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-100">
            Quiz Complete
          </h2>
        </div>
        <div className="p-6 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">
            {passed ? 'Quest Passed!' : 'Keep Learning!'}
          </h3>
          <p className="text-slate-300 mb-2">
            You got {correctCount} out of {allQuestions.length} questions correct ({percentage}%)
          </p>
          {passed ? (
            <p className="text-green-400 mb-4">Great job! You've demonstrated your knowledge.</p>
          ) : (
            <div className="mb-4">
              <p className="text-amber-400 mb-2">
                Review the material and try again. You need {passThreshold} correct to pass.
              </p>
              <p className="text-purple-300 text-sm italic">"{encouragement}"</p>
            </div>
          )}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleFinish}
              disabled={isFinishing}
              className={`btn ${passed ? 'btn-success' : 'btn-secondary'} px-8 py-3 ${
                isFinishing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isFinishing ? 'Finishing...' : passed ? 'Complete Quest' : 'Practice More'}
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
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-100">
              Knowledge Check
            </h2>
            <span className="text-xs px-2 py-1 bg-amber-600/30 text-amber-400 rounded">
              {getQuestionTypeLabel()}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-400 font-medium">{correctCount} correct</span>
            <span className="text-slate-400">{currentIndex + 1}/{allQuestions.length}</span>
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
          <div className="space-y-3" role="radiogroup" aria-label="Answer options">
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
                  role="radio"
                  aria-checked={selectedIndex === index}
                  aria-label={`Option ${index + 1}: ${option}`}
                >
                  <span className="text-slate-300">{option}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* True/False */}
        {isTrueFalse && q.options && (
          <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="True or False">
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
                  role="radio"
                  aria-checked={selectedIndex === index}
                  aria-label={option}
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
              aria-label="Fill in the blank answer"
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
                aria-label="Submit your answer"
              >
                Check Answer
              </button>
            )}
          </div>
        )}

        {/* Code Challenge */}
        {isCodeChallenge && q.codeTemplate && (
          <div className="space-y-4">
            {q.hint && !showExplanation && (
              <button
                onClick={() => {
                  if (hasHintScroll) {
                    consumeCollectible('hint_scroll')
                    setShowHint(true)
                  } else {
                    // Show message that hint scroll is needed
                    alert('You need a Hint Scroll to reveal the hint! Visit the Shop to buy one.')
                  }
                }}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                💡 {hasHintScroll ? 'Use hint scroll' : 'Need a hint?'}
              </button>
            )}
            {showHint && q.hint && (
              <div className="p-3 bg-purple-900/30 border border-purple-700 rounded-lg">
                <p className="text-purple-300 text-sm">💡 {q.hint}</p>
              </div>
            )}
            <pre className="bg-slate-900 rounded-lg p-4 border border-slate-700 text-sm overflow-x-auto">
              <code className="text-green-400 font-mono">{q.codeTemplate}</code>
            </pre>
            <textarea
              value={codeAnswer}
              onChange={(e) => setCodeAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  e.preventDefault()
                  const start = e.currentTarget.selectionStart
                  const end = e.currentTarget.selectionEnd
                  const newValue = codeAnswer.substring(0, start) + '  ' + codeAnswer.substring(end)
                  setCodeAnswer(newValue)
                  setTimeout(() => {
                    e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2
                  }, 0)
                }
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !showExplanation) handleCodeSubmit()
              }}
              disabled={showExplanation}
              placeholder="// Type your code here..."
              className={`w-full p-4 rounded-lg border text-sm font-mono text-green-400 placeholder-slate-600 focus:outline-none transition-all min-h-[120px] ${
                showExplanation
                  ? localCorrect
                    ? 'bg-green-900/50 border-green-500'
                    : 'bg-red-900/50 border-red-500'
                  : 'bg-slate-900 border-slate-700 focus:border-amber-500'
              }`}
              style={{ fontFamily: 'monospace' }}
              aria-label="Code challenge answer"
            />
            <p className="text-slate-500 text-xs">
              Expected output: <span className="text-green-400">{q.expectedOutput}</span>
            </p>
            {!showExplanation && (
              <button
                onClick={handleCodeSubmit}
                disabled={!codeAnswer.trim()}
                className={`btn w-full ${
                  codeAnswer.trim()
                    ? 'btn-success'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                Run Code (Ctrl+Enter)
              </button>
            )}
          </div>
        )}

        {/* Explanation with aria-live for screen readers */}
        {showExplanation && (
          <div
            className={`mt-6 p-4 rounded-lg ${localCorrect ? 'bg-green-900/30 border border-green-700' : 'bg-amber-900/30 border border-amber-700'}`}
            aria-live="polite"
          >
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
              className="btn btn-secondary"
              aria-label={currentIndex < allQuestions.length - 1 ? 'Go to next question' : 'See quiz results'}
            >
              {currentIndex < allQuestions.length - 1 ? 'Next Question' : 'See Results'} (N)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
