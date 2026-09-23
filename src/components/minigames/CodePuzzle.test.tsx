import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CodePuzzleGame } from './CodePuzzle'
import { codePuzzles, type CodePuzzle } from '../../data/minigames'

/**
 * shuffleArray draws Math.random() once per element; a value just below 1 makes
 * `Math.floor(r * (i + 1))` return `i`, so the deck keeps its authored order and
 * a round of `rounds` puzzles is exactly codePuzzles.slice(0, rounds).
 */
const IDENTITY_SHUFFLE_RANDOM = 0.999999

/** A puzzle can only be solved when its answer is actually offered as an option. */
function isAnswerable(puzzle: CodePuzzle): boolean {
  return Boolean(puzzle.options?.includes(puzzle.answer))
}

function setup(rounds = 3) {
  const onComplete = vi.fn()
  const onSkip = vi.fn()
  const view = render(<CodePuzzleGame rounds={rounds} onComplete={onComplete} onSkip={onSkip} />)
  return { ...view, onComplete, onSkip }
}

function choose(option: string) {
  fireEvent.click(screen.getByRole('button', { name: option }))
}

function advance() {
  fireEvent.click(screen.getByRole('button', { name: /next puzzle/i }))
}

/** Answer the puzzle on screen, correctly when the data allows it. */
function solve(puzzle: CodePuzzle, correctly = true) {
  const options = puzzle.options ?? []
  const pick =
    correctly && options.includes(puzzle.answer)
      ? puzzle.answer
      : (options.find((option) => option !== puzzle.answer) ?? options[0])
  choose(pick)
}

describe('CodePuzzleGame', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(IDENTITY_SHUFFLE_RANDOM)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the first puzzle with its snippet, options and counters', () => {
    setup(3)
    const puzzle = codePuzzles[0]

    expect(screen.getByText('💻 Code Puzzle')).toBeInTheDocument()
    expect(screen.getByText(puzzle.title)).toBeInTheDocument()
    expect(screen.getByText(puzzle.description)).toBeInTheDocument()
    expect(screen.getByText('1/3')).toBeInTheDocument()
    expect(screen.getByText('✓ 0')).toBeInTheDocument()
    expect(screen.getByText('✗ 0')).toBeInTheDocument()
    puzzle.options!.forEach((option) => {
      expect(screen.getByRole('button', { name: option })).toBeInTheDocument()
    })
    // The blank is rendered as a highlighted placeholder inside the snippet.
    expect(screen.getByText('___')).toBeInTheDocument()
  })

  it('plays a perfect round and reports the full score', () => {
    const { onComplete } = setup(1)

    solve(codePuzzles[0])
    expect(screen.getByText('✓ Correct!')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /see results/i }))

    expect(screen.getByText('💻 Code Puzzle Complete!')).toBeInTheDocument()
    expect(screen.getByText('Code Master!')).toBeInTheDocument()
    expect(screen.getByText('You solved 1 out of 1 puzzles correctly (100%)')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument() // score
    expect(screen.getByText('+50 Bonus XP earned!')).toBeInTheDocument()

    expect(onComplete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /claim rewards/i }))
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(100, 100)
  })

  it('shows the correct answer when the player picks wrong', () => {
    const { onComplete, onSkip } = setup(3)
    const puzzle = codePuzzles[0]
    const wrong = puzzle.options!.find((option) => option !== puzzle.answer)!

    choose(wrong)
    expect(screen.getByText('✗ Incorrect')).toBeInTheDocument()
    expect(screen.getByText(/Correct answer:/)).toBeInTheDocument()
    // The revealed answer is rendered inside the feedback panel.
    expect(
      screen.getByText(puzzle.answer!, { selector: 'p span.text-green-400' }),
    ).toBeInTheDocument()
    expect(screen.getByText('✗ 1')).toBeInTheDocument()

    // Wrong picks still let the player continue the round.
    advance()
    expect(screen.getByText(codePuzzles[1].title)).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()
    expect(onSkip).not.toHaveBeenCalled()
  })

  it('routes a failed round to onSkip', () => {
    const { onComplete, onSkip } = setup(3)

    for (let i = 0; i < 3; i++) {
      solve(codePuzzles[i], false)
      if (i < 2) advance()
    }
    fireEvent.click(screen.getByRole('button', { name: /see results/i }))

    expect(screen.getByText('Keep Practicing!')).toBeInTheDocument()
    expect(screen.getByText('You solved 0 out of 3 puzzles correctly (0%)')).toBeInTheDocument()
    expect(screen.queryByText(/Bonus XP earned!/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onSkip).toHaveBeenCalledTimes(1)
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('passes a two-out-of-three round with 200 points', () => {
    const { onComplete } = setup(3)

    // Every puzzle in the deck is answerable (guarded by the data-integrity
    // suite); this round misses the second puzzle deliberately.
    expect(isAnswerable(codePuzzles[1])).toBe(true)

    solve(codePuzzles[0])
    advance()
    solve(codePuzzles[1], false)
    advance()
    solve(codePuzzles[2])
    fireEvent.click(screen.getByRole('button', { name: /see results/i }))

    // 2/3 = 67%, which clears the 60% pass mark.
    expect(screen.getByText('You solved 2 out of 3 puzzles correctly (67%)')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /claim rewards/i }))
    expect(onComplete).toHaveBeenCalledWith(200, 300)
  })

  it('ignores further picks once an answer has been chosen', () => {
    setup(3)
    const puzzle = codePuzzles[0]

    solve(puzzle)
    expect(screen.getByText('✓ Correct!')).toBeInTheDocument()
    const other = puzzle.options!.find((option) => option !== puzzle.answer)!
    expect(screen.getByRole('button', { name: other })).toBeDisabled()
    expect(screen.getByText('1/3')).toBeInTheDocument()
  })

  it('advances through every puzzle and resets the feedback each time', () => {
    setup(3)

    solve(codePuzzles[0])
    advance()
    expect(screen.getByText(codePuzzles[1].title)).toBeInTheDocument()
    expect(screen.queryByText('✓ Correct!')).not.toBeInTheDocument()
    expect(screen.getByText('2/3')).toBeInTheDocument()

    solve(codePuzzles[1], false)
    advance()
    expect(screen.getByText(codePuzzles[2].title)).toBeInTheDocument()
    expect(screen.getByText('3/3')).toBeInTheDocument()
    // The last step offers the results screen instead of another puzzle.
    expect(screen.queryByRole('button', { name: /next puzzle/i })).not.toBeInTheDocument()
  })

  it('completes a four-puzzle round end to end', () => {
    // Every deck puzzle ships answerable options — a puzzle without them used
    // to dead-end the round on its "No options available" fallback.
    const { onComplete } = setup(4)

    for (let i = 0; i < 4; i++) {
      expect(screen.getByText(codePuzzles[i].title)).toBeInTheDocument()
      solve(codePuzzles[i])
      if (i < 3) advance()
    }
    fireEvent.click(screen.getByRole('button', { name: /see results/i }))

    expect(screen.getByText('You solved 4 out of 4 puzzles correctly (100%)')).toBeInTheDocument()
    expect(screen.getByText('+200 Bonus XP earned!')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /claim rewards/i }))
    expect(onComplete).toHaveBeenCalledWith(400, 400)
  })

  it('shows the loading placeholder when the round has no puzzles', () => {
    render(<CodePuzzleGame rounds={0} onComplete={vi.fn()} onSkip={vi.fn()} />)
    expect(screen.getByText('Loading puzzles...')).toBeInTheDocument()
  })
})
