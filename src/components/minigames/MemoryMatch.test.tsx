import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { MemoryMatch } from './MemoryMatch'
import { memoryIcons } from '../../data/minigames'

/**
 * shuffleArray draws Math.random() once per element; a value just below 1 makes
 * `Math.floor(r * (i + 1))` return `i`, i.e. the deck keeps its authored order.
 * MemoryMatch shuffles the icon pool and then the doubled deck, so the board is
 * deterministic: icon i sits at position i and its twin at position i + pairs.
 */
const IDENTITY_SHUFFLE_RANDOM = 0.999999

const PAIRS = 6

function setup(pairs = PAIRS) {
  const onComplete = vi.fn()
  const view = render(<MemoryMatch pairs={pairs} onComplete={onComplete} />)
  return { ...view, onComplete }
}

/** The board is the only place that renders buttons while the game is running. */
function cards() {
  return screen.getAllByRole('button')
}

function flip(index: number) {
  fireEvent.click(cards()[index])
}

function faceDown(index: number) {
  expect(cards()[index]).toHaveTextContent('?')
}

function revealedAs(index: number, icon: string) {
  expect(cards()[index]).toHaveTextContent(icon)
}

function flipBackAfterMismatch() {
  act(() => {
    vi.advanceTimersByTime(1000)
  })
}

describe('MemoryMatch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(IDENTITY_SHUFFLE_RANDOM)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('deals the expected board face-down with counters at zero', () => {
    setup()

    expect(screen.getByText('🧠 Memory Match')).toBeInTheDocument()
    expect(screen.getByText('Match the DevOps icons! Click cards to flip them.')).toBeInTheDocument()
    expect(screen.getByText('Pairs: 0/6')).toBeInTheDocument()
    expect(screen.getByText('Moves: 0')).toBeInTheDocument()
    expect(cards()).toHaveLength(PAIRS * 2)
    for (let i = 0; i < PAIRS * 2; i++) faceDown(i)
  })

  it('reveals the icon of a single flipped card without counting a move', () => {
    setup()

    flip(0)
    revealedAs(0, memoryIcons[0].icon)
    for (let i = 1; i < PAIRS * 2; i++) faceDown(i)
    expect(screen.getByText('Moves: 0')).toBeInTheDocument()
    expect(screen.getByText('Pairs: 0/6')).toBeInTheDocument()
  })

  it('flips a mismatched pair back after one second and counts the move', () => {
    setup()

    flip(0)
    flip(1)
    revealedAs(0, memoryIcons[0].icon)
    revealedAs(1, memoryIcons[1].icon)
    expect(screen.getByText('Moves: 1')).toBeInTheDocument()
    expect(screen.getByText('Pairs: 0/6')).toBeInTheDocument()

    flipBackAfterMismatch()
    faceDown(0)
    faceDown(1)
    // The move is remembered even though the cards went back.
    expect(screen.getByText('Moves: 1')).toBeInTheDocument()
  })

  it('keeps a matched pair face-up, marks it, and locks it', () => {
    setup()

    flip(0)
    flip(PAIRS)
    revealedAs(0, memoryIcons[0].icon)
    revealedAs(PAIRS, memoryIcons[0].icon)

    expect(screen.getByText('Pairs: 1/6')).toBeInTheDocument()
    expect(screen.getByText('Moves: 1')).toBeInTheDocument()
    expect(cards()[0]).toBeDisabled()
    expect(cards()[PAIRS]).toBeDisabled()

    flipBackAfterMismatch()
    // Matched cards are unaffected by the mismatch timer.
    revealedAs(0, memoryIcons[0].icon)
    revealedAs(PAIRS, memoryIcons[0].icon)

    // Clicking a matched card neither reveals anything new nor costs a move.
    flip(0)
    expect(screen.getByText('Moves: 1')).toBeInTheDocument()
    expect(screen.getByText('Pairs: 1/6')).toBeInTheDocument()
  })

  it('ignores a third card while two are already flipped', () => {
    setup()

    flip(0)
    flip(1)
    flip(2)
    expect(screen.getByText('Moves: 1')).toBeInTheDocument()
    faceDown(2)

    flipBackAfterMismatch()
    faceDown(0)
    faceDown(1)
    faceDown(2)
  })

  it('ignores a repeated click on an already flipped card', () => {
    setup()

    flip(0)
    flip(0)
    expect(screen.getByText('Moves: 0')).toBeInTheDocument()
    expect(screen.getByText('Pairs: 0/6')).toBeInTheDocument()
  })

  it('wins a perfect round in the minimum number of moves and pays out', () => {
    const { onComplete } = setup()

    for (let i = 0; i < PAIRS; i++) {
      flip(i)
      flip(i + PAIRS)
    }

    expect(screen.getByText('🧠 Memory Match Complete!')).toBeInTheDocument()
    expect(screen.getByText('Memory Master!')).toBeInTheDocument()
    expect(screen.getByText('You matched all pairs in 6 moves')).toBeInTheDocument()
    expect(screen.getByText('⭐⭐⭐')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument() // moves
    expect(screen.getByText('0s')).toBeInTheDocument() // elapsed

    // 500 base + 300 time bonus (fresh clock) + (6*3 - 6) * 10 move bonus.
    const expectedScore = 500 + 300 + (PAIRS * 3 - PAIRS) * 10
    expect(screen.getByText(String(expectedScore))).toBeInTheDocument()
    expect(
      screen.getByText(`+${Math.round(expectedScore / 2)} Bonus XP earned!`),
    ).toBeInTheDocument()

    expect(onComplete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /claim rewards/i }))
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(expectedScore, PAIRS * 200)
  })

  it('drops to two stars when the round takes extra moves', () => {
    const { onComplete } = setup()

    // Four wasted attempts before solving anything.
    for (let i = 0; i < 4; i++) {
      flip(0)
      flip(1)
      flipBackAfterMismatch()
    }
    for (let i = 0; i < PAIRS; i++) {
      flip(i)
      flip(i + PAIRS)
    }

    // 4 mismatches + 6 matches = 10 moves, which is 2-star territory.
    expect(screen.getByText('⭐⭐')).toBeInTheDocument()
    expect(screen.queryByText('⭐⭐⭐')).not.toBeInTheDocument()
    expect(screen.getByText('You matched all pairs in 10 moves')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument() // moves

    const claim = screen.getByRole('button', { name: /claim rewards/i })
    fireEvent.click(claim)
    expect(onComplete).toHaveBeenCalledTimes(1)
    const [score, maxScore] = onComplete.mock.calls[0]
    expect(maxScore).toBe(PAIRS * 200)
    // 500 base + move bonus; the time bonus shrinks as the clock advances.
    expect(score).toBeGreaterThanOrEqual(500 + (PAIRS * 3 - 10) * 10)
    expect(score).toBeLessThanOrEqual(500 + 300 + (PAIRS * 3 - 10) * 10)
  })

  it('shows the shuffling placeholder when no cards are dealt', () => {
    render(<MemoryMatch pairs={0} onComplete={vi.fn()} />)
    expect(screen.getByText('Shuffling cards...')).toBeInTheDocument()
  })
})
