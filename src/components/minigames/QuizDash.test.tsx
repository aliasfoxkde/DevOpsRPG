import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { QuizDashGame, generateQuizQuestions } from './QuizDash'
import { quizzes } from '@/data/quizzes'

/**
 * generateQuizQuestions shuffles the bank with Fisher-Yates over Math.random.
 * Pinning Math.random to a constant makes the order deterministic, so the test can
 * request the same five questions the component plays.
 */
const PINNED_RANDOM = 0.3
const QUESTION_COUNT = 5

function setup() {
  const onComplete = vi.fn()
  const onSkip = vi.fn()
  const questions = generateQuizQuestions(QUESTION_COUNT)
  const view = render(<QuizDashGame onComplete={onComplete} onSkip={onSkip} />)
  return { ...view, onComplete, onSkip, questions }
}

function optionButtons() {
  // Every answer option is a full-width button labelled A-D.
  return screen.getAllByRole('button').filter((el) => /^[ABCD]/.test(el.textContent))
}

function answer(index: number) {
  fireEvent.click(optionButtons()[index])
  act(() => {
    vi.advanceTimersByTime(1000) // the reveal delay before the next question
  })
}

describe('QuizDashGame', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(PINNED_RANDOM)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders the first question with four lettered options and the clock', () => {
    const { questions } = setup()

    expect(screen.getByText(`Question 1/${questions.length}`)).toBeInTheDocument()
    expect(screen.getByText(questions[0].question)).toBeInTheDocument()
    expect(optionButtons()).toHaveLength(questions[0].options.length)
    questions[0].options.forEach((option) => {
      expect(screen.getByText(option)).toBeInTheDocument()
    })
    expect(screen.getByText('10s')).toBeInTheDocument()
    expect(screen.getByText('10s')).toHaveClass('bg-slate-700')
  })

  it('plays a perfect round and reports the full score to onComplete', () => {
    const { onComplete, questions } = setup()

    questions.forEach((question, i) => {
      expect(screen.getByText(`Question ${i + 1}/${questions.length}`)).toBeInTheDocument()
      answer(question.correctAnswer)
    })

    expect(screen.getByText('Quiz Complete!')).toBeInTheDocument()
    expect(screen.getByText(`5 / ${questions.length}`)).toBeInTheDocument()
    expect(screen.getByText('🏆')).toBeInTheDocument()
    expect(screen.getByText('Excellent work!')).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(questions.length, questions.length)
  })

  it('shows the correct answer and locks the options during the reveal', () => {
    const { questions } = setup()
    const question = questions[0]

    fireEvent.click(optionButtons()[question.correctAnswer])

    const options = optionButtons()
    expect(options[question.correctAnswer]).toHaveTextContent('✓')
    options.forEach((option) => {
      expect(option).toBeDisabled()
    })

    // Nothing has advanced yet - the reveal delay is still running.
    expect(screen.getByText(`Question 1/${questions.length}`)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText(`Question 2/${questions.length}`)).toBeInTheDocument()
    expect(screen.getByText(questions[1].question)).toBeInTheDocument()
  })

  it('marks a wrong pick, reveals the right one, and resets the streak', () => {
    const { questions } = setup()

    // Two correct answers first so the streak badge is visible.
    answer(questions[0].correctAnswer)
    answer(questions[1].correctAnswer)
    expect(screen.getByText('🔥 2')).toBeInTheDocument()

    // Third question: pick a deliberately wrong option.
    const question = questions[2]
    const wrongIndex = (question.correctAnswer + 1) % question.options.length
    fireEvent.click(optionButtons()[wrongIndex])
    expect(screen.getByText('✗')).toBeInTheDocument()
    expect(optionButtons()[question.correctAnswer]).toHaveTextContent('✓')
    expect(screen.queryByText('🔥 2')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText(questions[3].question)).toBeInTheDocument()
  })

  it('finishes a 60% round as a pass and reports the partial score', () => {
    const { onComplete, questions } = setup()

    // First two questions wrong, remaining three correct.
    answer((questions[0].correctAnswer + 1) % questions[0].options.length)
    answer((questions[1].correctAnswer + 1) % questions[1].options.length)
    for (let i = 2; i < questions.length; i++) answer(questions[i].correctAnswer)

    expect(screen.getByText('Quiz Complete!')).toBeInTheDocument()
    expect(screen.getByText('3 / 5')).toBeInTheDocument()
    expect(screen.getByText('👍')).toBeInTheDocument()
    expect(screen.getByText('Good job!')).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(3, questions.length)
  })

  it('does not score a question that times out and still moves on', () => {
    const { questions, onComplete } = setup()

    // Ten ticks bring the clock to 1, where the game answers on the player's behalf.
    act(() => {
      vi.advanceTimersByTime(10_000)
    })
    // The reveal for the timed-out question: the right answer lights up, no ✗
    // because the "selection" was the out-of-range index -1.
    expect(optionButtons()[questions[0].correctAnswer]).toHaveTextContent('✓')
    expect(screen.queryByText('✗')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText(questions[1].question)).toBeInTheDocument()
    expect(screen.getByText('10s')).toBeInTheDocument() // clock reset for the next question
    expect(screen.getByText(`Question 2/${questions.length}`)).toBeInTheDocument()

    // Finish the rest correctly: only 4 of 5 questions were scored.
    for (let i = 1; i < questions.length; i++) answer(questions[i].correctAnswer)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(questions.length - 1, questions.length)
  })

  it('counts the clock down while a question is on screen', () => {
    setup()

    act(() => {
      vi.advanceTimersByTime(4000)
    })
    expect(screen.getByText('6s')).toBeInTheDocument()
  })

  it('returns to the menu from the quit button mid-game', () => {
    const { onSkip, onComplete } = setup()

    fireEvent.click(screen.getByRole('button', { name: '✕' }))
    expect(onSkip).toHaveBeenCalledTimes(1)
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('deals every question from the real quiz bank without repeats', () => {
    const deck = generateQuizQuestions(QUESTION_COUNT)
    const bankQuestions = new Set(
      Object.values(quizzes)
        .flat()
        .map((question) => question.question),
    )

    expect(deck).toHaveLength(QUESTION_COUNT)
    for (const question of deck) {
      // The id/question pair must exist in the shared bank — no local fakes
      expect(bankQuestions.has(question.question)).toBe(true)
    }
    expect(new Set(deck.map((question) => question.question)).size).toBe(QUESTION_COUNT)
  })

  it('offers a replay and a way back to the menu on the result screen', () => {
    const { onComplete, onSkip, questions } = setup()

    for (const question of questions) answer(question.correctAnswer)

    expect(screen.getByText('Quiz Complete!')).toBeInTheDocument()
    // "Play Again" re-deals in place (same pinned random, so the same deck)
    fireEvent.click(screen.getByRole('button', { name: /play again/i }))
    expect(screen.getByText(`Question 1/${questions.length}`)).toBeInTheDocument()
    expect(screen.getByText(questions[0].question)).toBeInTheDocument()

    // The second round scores independently
    for (const question of questions) answer(question.correctAnswer)
    expect(screen.getByText('Quiz Complete!')).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledTimes(2)

    fireEvent.click(screen.getByRole('button', { name: /back to menu/i }))
    expect(onSkip).toHaveBeenCalledTimes(1)
  })
})
