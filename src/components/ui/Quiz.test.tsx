import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import Quiz from './Quiz'
import { GameProvider } from '../../contexts/GameContext'
import { COLLECTIBLES_POOL, type Collectible } from '../../data/collectibles'
import type { QuizQuestion } from '../../data/quizzes'
import { STORAGE_KEYS } from '../../utils/gameUtils'

// The component pulls its questions from the real quiz data module; fixtures
// are registered under reserved topic ids so every question type can be
// driven deterministically while unknown ids keep hitting the real data.
vi.mock('../../data/quizzes', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../data/quizzes')>()
  return {
    ...actual,
    getQuizForTopic: (topicId: string): QuizQuestion[] =>
      FIXTURE_QUIZZES[topicId] ?? actual.getQuizForTopic(topicId),
  }
})

function question(
  overrides: Partial<QuizQuestion> & { id: string; question: string },
): QuizQuestion {
  return {
    topicId: overrides.id,
    explanation: 'Because that is how it works.',
    ...overrides,
  }
}

const FIXTURE_QUIZZES: Record<string, QuizQuestion[]> = {
  __test_mc: [
    question({
      id: 'mc1',
      question: 'Which layer terminates TCP connections in a load balancer?',
      options: ['Layer 4', 'Layer 7', 'Layer 2', 'Layer 1'],
      correctIndex: 1,
      correctAnswer: 'Layer 7',
    }),
    question({
      id: 'mc2',
      question: 'What does CDN stand for?',
      options: ['Content Delivery Network', 'Cached Data Node'],
      correctIndex: 0,
      correctAnswer: 'Content Delivery Network',
    }),
  ],
  __test_mc_five: ['q1', 'q2', 'q3', 'q4', 'q5'].map((id, index) =>
    question({
      id,
      question: `Question ${index + 1}`,
      options: ['Right answer', 'Wrong answer'],
      correctIndex: 0,
      correctAnswer: 'Right answer',
    }),
  ),
  __test_tf: [
    question({
      id: 'tf1',
      question: 'A container shares the host kernel.',
      type: 'true_false',
      options: ['True', 'False'],
      correctIndex: 0,
      correctAnswer: 'True',
    }),
  ],
  __test_fill: [
    question({
      id: 'fill1',
      question: 'Docker packages an app and its dependencies into a ___.',
      type: 'fill_blank',
      correctAnswer: 'container image',
    }),
  ],
  __test_code: [
    question({
      id: 'code1',
      question: 'Code Challenge: print the value of pi',
      type: 'code_challenge',
      codeTemplate: '# print pi\n',
      expectedOutput: '3.14',
      hint: 'Use print(3.14)',
    }),
  ],
}

function hintScroll(): Collectible {
  const collectible = COLLECTIBLES_POOL.find((c) => c.id === 'hint_scroll')
  if (!collectible) throw new Error('hint_scroll missing from the collectibles pool')
  return { ...collectible, used: false }
}

function seedGame(state: Record<string, unknown> = {}): void {
  localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify({ character: {}, badges: [], ...state }))
}

function renderQuiz(topicId: string) {
  const onPass = vi.fn()
  const onSkip = vi.fn()
  render(
    <GameProvider>
      <Quiz topicId={topicId} onPass={onPass} onSkip={onSkip} />
    </GameProvider>,
  )
  return { onPass, onSkip }
}

/** Answers the visible question by clicking the option with the given text. */
function chooseOption(label: string): void {
  fireEvent.click(screen.getByRole('radio', { name: label }))
}

/** The 'n' shortcut auto-answers the visible question, then advances. */
function autoAnswer(): void {
  fireEvent.keyDown(window, { key: 'n' })
}

function pressNext(): void {
  // The Next button's accessible name comes from its aria-label, not its text.
  fireEvent.click(screen.getByRole('button', { name: /Go to next question|See quiz results/ }))
}

function pressN(): void {
  fireEvent.keyDown(window, { key: 'n' })
}

/** The code answer box, narrowed so the caret can be positioned. */
function codeEditor(): HTMLTextAreaElement {
  const editor = screen.getByRole('textbox', { name: 'Code challenge answer' })
  if (!(editor instanceof HTMLTextAreaElement)) {
    throw new Error('expected the code challenge answer to be a text area')
  }
  return editor
}

/** Answers every question of a quiz, wrong for the first `wrongCount`. */
function completeQuiz(total: number, wrongCount = 0): void {
  for (let index = 0; index < total; index += 1) {
    if (index < wrongCount) {
      chooseOption('Option 2: Wrong answer')
    } else {
      autoAnswer()
    }
    pressNext()
  }
}

beforeEach(() => {
  localStorage.clear()
  seedGame()
})

describe('Quiz', () => {
  describe('topics without questions', () => {
    it('asks for a written takeaway instead of a quiz', () => {
      renderQuiz('topic_with_no_quiz')

      expect(screen.getByText('Knowledge Check')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('The main thing I learned was...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Complete Quest' })).toBeInTheDocument()
    })

    it('rejects a takeaway that is too short', () => {
      const { onPass } = renderQuiz('topic_with_no_quiz')

      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'docker' } })
      fireEvent.click(screen.getByRole('button', { name: 'Complete Quest' }))

      expect(
        screen.getByText('Please write at least 10 characters about what you learned'),
      ).toBeInTheDocument()
      expect(onPass).not.toHaveBeenCalled()
    })

    it('clears the error once the takeaway grows', () => {
      renderQuiz('topic_with_no_quiz')
      const textarea = screen.getByRole('textbox')

      fireEvent.change(textarea, { target: { value: 'short' } })
      fireEvent.click(screen.getByRole('button', { name: 'Complete Quest' }))
      expect(screen.getByText(/at least 10 characters/)).toBeInTheDocument()

      fireEvent.change(textarea, { target: { value: 'I learned that images are layered' } })
      expect(screen.queryByText(/at least 10 characters/)).toBeNull()
    })

    it('completes the quest with a meaningful takeaway', () => {
      const { onPass } = renderQuiz('topic_with_no_quiz')

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'Images are built in layers and cached' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Complete Quest' }))

      expect(onPass).toHaveBeenCalledTimes(1)
      expect(onPass).toHaveBeenCalledWith(false, 0, false)
    })
  })

  describe('multiple choice', () => {
    it('renders the question header, type badge and progress', () => {
      renderQuiz('__test_mc')

      expect(screen.getByText('Knowledge Check')).toBeInTheDocument()
      expect(screen.getByText('Multiple Choice')).toBeInTheDocument()
      expect(
        screen.getByText('Which layer terminates TCP connections in a load balancer?'),
      ).toBeInTheDocument()
      expect(screen.getByText('0 correct')).toBeInTheDocument()
      expect(screen.getByText('1/2')).toBeInTheDocument()
      expect(screen.getByRole('radiogroup', { name: 'Answer options' })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: 'Option 1: Layer 4' })).toBeInTheDocument()
    })

    it('confirms a correct answer with sound and explanation', () => {
      renderQuiz('__test_mc')

      chooseOption('Option 2: Layer 7')

      expect(screen.getByText('✓ Correct!')).toBeInTheDocument()
      expect(screen.getByText('1 correct')).toBeInTheDocument()
      expect(screen.getByText('Because that is how it works.')).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: 'Option 2: Layer 7' })).toHaveAttribute(
        'aria-checked',
        'true',
      )
    })

    it('explains a wrong answer and reveals the correct option', () => {
      renderQuiz('__test_mc')

      chooseOption('Option 1: Layer 4')

      expect(screen.getByText('✗ Incorrect')).toBeInTheDocument()
      expect(screen.getByText('0 correct')).toBeInTheDocument()
      expect(screen.getAllByText(/Correct answer:/)).toHaveLength(2)
      expect(screen.getAllByText('Layer 7').length).toBeGreaterThan(0)
    })

    it('locks the options once a choice has been made', () => {
      renderQuiz('__test_mc')
      chooseOption('Option 1: Layer 4')

      chooseOption('Option 2: Layer 7')

      expect(screen.getByText('✗ Incorrect')).toBeInTheDocument()
      expect(screen.getByText('0 correct')).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: 'Option 2: Layer 7' })).toBeDisabled()
    })

    it('advances to the next question and resets the answer state', () => {
      renderQuiz('__test_mc')

      chooseOption('Option 2: Layer 7')
      pressNext()

      expect(screen.getByText('What does CDN stand for?')).toBeInTheDocument()
      expect(screen.getByText('2/2')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'See quiz results' })).toBeNull()
      expect(screen.queryByText('✓ Correct!')).toBeNull()
    })
  })

  describe('true or false', () => {
    it('labels the two options and accepts the right one', () => {
      renderQuiz('__test_tf')

      expect(screen.getByText('True or False')).toBeInTheDocument()
      expect(screen.getByRole('radiogroup', { name: 'True or False' })).toBeInTheDocument()

      chooseOption('False')
      expect(screen.getByText('✗ Incorrect')).toBeInTheDocument()
      expect(screen.getAllByText('Correct answer:')[0]?.parentElement?.textContent).toContain(
        'True',
      )
    })
  })

  describe('fill in the blank', () => {
    it('submits with the Enter key and accepts a case-insensitive answer', () => {
      renderQuiz('__test_fill')
      const input = screen.getByRole('textbox', { name: 'Fill in the blank answer' })

      fireEvent.change(input, { target: { value: 'Container Image' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(screen.getByText('✓ Correct!')).toBeInTheDocument()
      expect(screen.getByText('1 correct')).toBeInTheDocument()
    })

    it('rejects an unrelated answer and shows the expected one', () => {
      renderQuiz('__test_fill')
      const input = screen.getByRole('textbox', { name: 'Fill in the blank answer' })

      fireEvent.change(input, { target: { value: 'virtual machine' } })
      fireEvent.click(screen.getByRole('button', { name: 'Submit your answer' }))

      expect(screen.getByText('✗ Incorrect')).toBeInTheDocument()
      expect(screen.getByText('container image')).toBeInTheDocument()
    })

    it('keeps the submit button disabled until text is entered', () => {
      renderQuiz('__test_fill')

      const submit = screen.getByRole('button', { name: 'Submit your answer' })
      expect(submit).toBeDisabled()

      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'image' } })
      expect(submit).toBeEnabled()
    })

    it('hides the submit button once the answer has been checked', () => {
      renderQuiz('__test_fill')
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'container' } })
      fireEvent.click(screen.getByRole('button', { name: 'Submit your answer' }))

      expect(screen.queryByRole('button', { name: 'Submit your answer' })).toBeNull()
    })

    it('underscores the blank in the question copy', () => {
      renderQuiz('__test_fill')

      expect(
        screen.getByText('Docker packages an app and its dependencies into a ________.'),
      ).toBeInTheDocument()
    })
  })

  describe('code challenge', () => {
    it('shows the template and the expected output', () => {
      renderQuiz('__test_code')

      expect(screen.getByText('Code Challenge')).toBeInTheDocument()
      expect(screen.getByText(/# print pi/)).toBeInTheDocument()
      expect(screen.getByText('3.14')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Run Code (Ctrl+Enter)' })).toBeDisabled()
    })

    it('inserts two spaces for the Tab key and restores the caret', () => {
      vi.useFakeTimers()
      try {
        renderQuiz('__test_code')
        const editor = codeEditor()

        fireEvent.change(editor, { target: { value: 'print(' } })
        editor.setSelectionRange(6, 6)
        fireEvent.keyDown(editor, { key: 'Tab' })
        act(() => {
          vi.advanceTimersByTime(1)
        })

        expect(editor).toHaveValue('print(  ')
        expect(editor.selectionStart).toBe(8)
      } finally {
        vi.useRealTimers()
      }
    })

    it('accepts a solution that produces the expected output via Ctrl+Enter', () => {
      renderQuiz('__test_code')
      const editor = screen.getByRole('textbox', { name: 'Code challenge answer' })

      fireEvent.change(editor, { target: { value: 'print(3.14)' } })
      fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true })

      expect(screen.getByText('✓ Correct!')).toBeInTheDocument()
    })

    it('rejects a solution with the wrong output', () => {
      renderQuiz('__test_code')
      const editor = screen.getByRole('textbox', { name: 'Code challenge answer' })

      fireEvent.change(editor, { target: { value: 'print(42)' } })
      fireEvent.click(screen.getByRole('button', { name: 'Run Code (Ctrl+Enter)' }))

      expect(screen.getByText('✗ Incorrect')).toBeInTheDocument()
    })

    it('requires a hint scroll to reveal the hint', () => {
      vi.useFakeTimers()
      try {
        renderQuiz('__test_code')

        fireEvent.click(screen.getByRole('button', { name: '💡 Need a hint?' }))

        expect(
          screen.getByText('You need a Hint Scroll to reveal the hint! Visit the Shop to buy one.'),
        ).toBeInTheDocument()
        expect(screen.queryByText('Use print(3.14)')).toBeNull()

        act(() => {
          vi.advanceTimersByTime(3000)
        })
        expect(
          screen.queryByText(
            'You need a Hint Scroll to reveal the hint! Visit the Shop to buy one.',
          ),
        ).toBeNull()
      } finally {
        vi.useRealTimers()
      }
    })

    it('spends a hint scroll to reveal the hint', () => {
      seedGame({ collectibles: [hintScroll()] })
      renderQuiz('__test_code')

      fireEvent.click(screen.getByRole('button', { name: '💡 Use hint scroll' }))

      // The hint copy is prefixed with the same emoji inside the paragraph.
      expect(screen.getByText(/Use print\(3\.14\)/)).toBeInTheDocument()
      expect(screen.queryByText(/Visit the Shop/)).toBeNull()
    })

    it('hides the hint button once the question has been answered', () => {
      seedGame({ collectibles: [hintScroll()] })
      renderQuiz('__test_code')
      const editor = screen.getByRole('textbox', { name: 'Code challenge answer' })
      fireEvent.change(editor, { target: { value: 'print(3.14)' } })
      fireEvent.click(screen.getByRole('button', { name: 'Run Code (Ctrl+Enter)' }))

      expect(screen.queryByRole('button', { name: '💡 Use hint scroll' })).toBeNull()
    })
  })

  describe("the 'n' shortcut", () => {
    it('auto-answers the visible question correctly', () => {
      renderQuiz('__test_mc')

      pressN()

      expect(screen.getByText('✓ Correct!')).toBeInTheDocument()
      expect(screen.getByText('1 correct')).toBeInTheDocument()
    })

    it('advances after answering and finishes on the last question', () => {
      renderQuiz('__test_mc')

      pressN()
      pressN()
      expect(screen.getByText('What does CDN stand for?')).toBeInTheDocument()

      pressN()
      pressN()
      expect(screen.getByText('Quiz Complete')).toBeInTheDocument()

      pressN()
      expect(screen.getByRole('button', { name: /Finishing/ })).toBeDisabled()
    })

    it('auto-answers a fill in the blank question', () => {
      renderQuiz('__test_fill')

      pressN()

      expect(screen.getByText('✓ Correct!')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toHaveValue('container image')
    })

    it('does nothing when there is no question to answer', () => {
      const { onPass } = renderQuiz('topic_with_no_quiz')

      pressN()

      expect(onPass).not.toHaveBeenCalled()
      expect(screen.getByRole('button', { name: 'Complete Quest' })).toBeInTheDocument()
    })
  })

  describe('results and quest completion', () => {
    it('reports a perfect run and passes with 80%+', () => {
      const { onPass } = renderQuiz('__test_mc_five')

      completeQuiz(5)
      expect(screen.getByText('Quest Passed!')).toBeInTheDocument()
      expect(screen.getByText(/5 out of 5 questions correct \(100%\)/)).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /Complete Quest/ }))

      expect(onPass).toHaveBeenCalledWith(true, 0, true)
    })

    it('passes with one mistake and reports the wrong count', () => {
      const { onPass } = renderQuiz('__test_mc_five')

      completeQuiz(5, 1)
      fireEvent.click(screen.getByRole('button', { name: /Complete Quest/ }))

      expect(onPass).toHaveBeenCalledWith(false, 1, true)
    })

    it('passes at the 60% threshold without the 80% bonus', () => {
      const { onPass } = renderQuiz('__test_mc_five')

      completeQuiz(5, 2)
      fireEvent.click(screen.getByRole('button', { name: /Complete Quest/ }))

      expect(onPass).toHaveBeenCalledWith(false, 2, false)
    })

    it('sends the player back to practise below the pass threshold', () => {
      const { onPass, onSkip } = renderQuiz('__test_mc_five')

      completeQuiz(5, 3)
      expect(screen.getByText('Keep Learning!')).toBeInTheDocument()
      expect(screen.getByText(/You need 3 correct to pass/)).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /Practice More/ }))

      expect(onSkip).toHaveBeenCalledTimes(1)
      expect(onPass).not.toHaveBeenCalled()
    })

    it('keeps the finish button disabled while the quest is being recorded', () => {
      const { onPass } = renderQuiz('__test_mc_five')

      completeQuiz(5)
      fireEvent.click(screen.getByRole('button', { name: /Complete Quest/ }))

      expect(onPass).toHaveBeenCalledTimes(1)
      expect(screen.getByRole('button', { name: /Finishing/ })).toBeDisabled()
    })

    it('forces completion when the finish step hangs for more than two seconds', () => {
      vi.useFakeTimers()
      try {
        const { onPass, onSkip } = renderQuiz('__test_mc_five')

        completeQuiz(5)
        fireEvent.click(screen.getByRole('button', { name: /Complete Quest/ }))
        expect(onPass).toHaveBeenCalledTimes(1)
        expect(onSkip).not.toHaveBeenCalled()

        act(() => {
          vi.advanceTimersByTime(2000)
        })

        expect(onSkip).toHaveBeenCalledTimes(1)
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('question rendering edge cases', () => {
    it('renders one question per topic from the real data module', () => {
      renderQuiz('html_intro')

      expect(screen.getByText('What does HTML stand for?')).toBeInTheDocument()
      const group = screen.getByRole('radiogroup', { name: 'Answer options' })
      expect(within(group).getAllByRole('radio')).toHaveLength(4)
    })
  })
})
