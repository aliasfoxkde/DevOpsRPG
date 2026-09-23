import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { MathChallengeGame } from './MathChallenge'
import { mathChallenges } from '../../data/minigames'
import { GAME_DURATION } from '../../utils/gameUtils'

/**
 * shuffleArray (Fisher–Yates in utils/gameUtils) draws Math.random() once per
 * element. Returning a value just below 1 makes `Math.floor(r * (i + 1))`
 * resolve to `i` for every index, i.e. the deck keeps its authored order, so
 * each test knows exactly which problem the player is looking at.
 */
const IDENTITY_SHUFFLE_RANDOM = 0.999999

/** Points for one correct answer on a full clock: 100 + floor(45 / 5) * 15. */
const FULL_TIME_ROUND_SCORE = 100 + Math.floor(GAME_DURATION.MATH_CHALLENGE / 5) * 15

function setup(rounds = 5) {
  const onComplete = vi.fn()
  const onSkip = vi.fn()
  const view = render(
    <MathChallengeGame rounds={rounds} onComplete={onComplete} onSkip={onSkip} />,
  )
  const input = screen.getByPlaceholderText('Enter your answer...') as HTMLInputElement
  const submit = screen.getByRole('button', { name: /check answer/i })
  return { ...view, onComplete, onSkip, input, submit }
}

/** Type an answer into the live input and submit it. */
function answer(value: string) {
  const input = screen.getByPlaceholderText('Enter your answer...') as HTMLInputElement
  fireEvent.change(input, { target: { value } })
  fireEvent.click(screen.getByRole('button', { name: /check answer/i }))
}

describe('MathChallengeGame', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(IDENTITY_SHUFFLE_RANDOM)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders the first problem with counters, timer and a disabled submit', () => {
    const { input } = setup(5)

    expect(screen.getByText('🔢 Math Challenge')).toBeInTheDocument()
    expect(screen.getByText('DevOps Calculation')).toBeInTheDocument()
    expect(screen.getByText(mathChallenges[0].question)).toBeInTheDocument()
    expect(screen.getByText('✓ 0')).toBeInTheDocument()
    expect(screen.getByText('✗ 0')).toBeInTheDocument()
    expect(screen.getByText('1/5')).toBeInTheDocument()
    expect(screen.getByText(`⏱ ${GAME_DURATION.MATH_CHALLENGE}s`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /check answer/i })).toBeDisabled()
    expect(input).toHaveValue('')
  })

  it('plays a perfect round and reports the exact score to onComplete', () => {
    const { onComplete, onSkip } = setup(5)

    // The clock is never advanced, so every answer lands with a full timer.
    for (let i = 0; i < 5; i++) {
      expect(screen.getByText(`${i + 1}/5`)).toBeInTheDocument()
      answer(String(mathChallenges[i].answer))
      if (i < 4) expect(screen.getByText(`✓ ${i + 1}`)).toBeInTheDocument()
    }

    const expectedScore = FULL_TIME_ROUND_SCORE * 5
    expect(screen.getByText('🔢 Math Challenge Complete!')).toBeInTheDocument()
    expect(screen.getByText('Math Wizard!')).toBeInTheDocument()
    expect(
      screen.getByText('You solved 5 out of 5 problems correctly (100%)'),
    ).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument() // correct
    expect(screen.getByText('0')).toBeInTheDocument() // wrong
    expect(screen.getByText(String(expectedScore))).toBeInTheDocument()
    expect(
      screen.getByText(`+${Math.round(expectedScore / 2)} Bonus XP earned!`),
    ).toBeInTheDocument()

    expect(onComplete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /claim rewards/i }))
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(expectedScore, 5 * 150)
    expect(onSkip).not.toHaveBeenCalled()
  })

  it('treats exactly 60% as a pass and reports the correct/wrong split', () => {
    const { onComplete, onSkip } = setup(5)

    // Two wrong answers followed by three correct ones -> exactly 60%.
    answer(String(mathChallenges[0].answer + 1))
    answer(String(mathChallenges[1].answer + 1))
    for (let i = 2; i < 5; i++) answer(String(mathChallenges[i].answer))

    expect(
      screen.getByText('You solved 3 out of 5 problems correctly (60%)'),
    ).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /claim rewards/i }))
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(FULL_TIME_ROUND_SCORE * 3, 750)
    expect(onSkip).not.toHaveBeenCalled()
  })

  it('routes a failed round to onSkip instead of onComplete', () => {
    const { onComplete, onSkip } = setup(5)

    for (let i = 0; i < 5; i++) answer(String(mathChallenges[i].answer + 999))

    expect(screen.getByText('Keep Practicing!')).toBeInTheDocument()
    expect(screen.getByText('You solved 0 out of 5 problems correctly (0%)')).toBeInTheDocument()
    expect(screen.queryByText(/Bonus XP earned!/)).not.toBeInTheDocument()
    expect(screen.getByText('📊')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onSkip).toHaveBeenCalledTimes(1)
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('advances to the next problem and tracks the running tally', () => {
    setup(5)

    answer(String(mathChallenges[0].answer))
    expect(screen.getByText(mathChallenges[1].question)).toBeInTheDocument()
    expect(screen.getByText('2/5')).toBeInTheDocument()
    expect(screen.getByText('✓ 1')).toBeInTheDocument()
    expect(screen.getByText('✗ 0')).toBeInTheDocument()

    answer(String(mathChallenges[1].answer + 1))
    expect(screen.getByText(mathChallenges[2].question)).toBeInTheDocument()
    expect(screen.getByText('3/5')).toBeInTheDocument()
    expect(screen.getByText('✓ 1')).toBeInTheDocument()
    expect(screen.getByText('✗ 1')).toBeInTheDocument()
  })

  it('submits on Enter and clears the field between problems', () => {
    const { input } = setup(5)

    fireEvent.change(input, { target: { value: String(mathChallenges[0].answer) } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(screen.getByText(mathChallenges[1].question)).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('ignores answers that are empty or whitespace', () => {
    const { submit } = setup(5)

    fireEvent.change(screen.getByPlaceholderText('Enter your answer...'), {
      target: { value: '   ' },
    })
    expect(submit).toBeDisabled()

    fireEvent.click(submit)
    expect(screen.getByText('1/5')).toBeInTheDocument()
    expect(screen.queryByText(/Complete!/)).not.toBeInTheDocument()
    expect(screen.queryByText(/⏱/)).toBeInTheDocument()
  })

  it('strips characters that are not digits or math symbols', () => {
    const { input } = setup()

    fireEvent.change(input, { target: { value: '10a2b4-/*() x' } })
    // Digits and math symbols (including spaces) survive; letters do not.
    expect(input).toHaveValue('1024-/*() ')
  })

  it('reveals the hint, hides it again, and drops it on the next problem', () => {
    setup(5)

    expect(screen.queryByText(mathChallenges[0].hint)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /show hint/i }))
    expect(screen.getByText(mathChallenges[0].hint)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hide hint/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /hide hint/i }))
    expect(screen.queryByText(mathChallenges[0].hint)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /show hint/i }))
    answer(String(mathChallenges[0].answer))
    expect(screen.queryByText(mathChallenges[0].hint)).not.toBeInTheDocument()
    expect(screen.getByText(mathChallenges[1].question)).toBeInTheDocument()
  })

  it('counts the clock down one second at a time', () => {
    setup(5)

    expect(screen.getByText(`⏱ ${GAME_DURATION.MATH_CHALLENGE}s`)).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByText(`⏱ ${GAME_DURATION.MATH_CHALLENGE - 3}s`)).toBeInTheDocument()
  })

  it('finishes the round with no credit when the clock runs out', () => {
    const { onComplete, onSkip } = setup(5)

    act(() => {
      vi.advanceTimersByTime(GAME_DURATION.MATH_CHALLENGE * 1000)
    })

    expect(screen.getByText('Keep Practicing!')).toBeInTheDocument()
    expect(screen.getByText('You solved 0 out of 5 problems correctly (0%)')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onSkip).toHaveBeenCalledTimes(1)
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('stops the clock once the round is finished', () => {
    setup(5)

    for (let i = 0; i < 5; i++) answer(String(mathChallenges[i].answer))

    // No timer read-out is rendered on the result screen and the final score
    // stays put even when the (already cleared) interval would have ticked.
    expect(screen.queryByText(/⏱ \d+s/)).not.toBeInTheDocument()
    const scoreNode = screen.getByText(String(FULL_TIME_ROUND_SCORE * 5))
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(screen.getByText(String(FULL_TIME_ROUND_SCORE * 5))).toBe(scoreNode)
  })

  it('renders the loading placeholder when the round has no problems', () => {
    render(<MathChallengeGame rounds={0} onComplete={vi.fn()} onSkip={vi.fn()} />)
    expect(screen.getByText('Loading problems...')).toBeInTheDocument()
  })
})
