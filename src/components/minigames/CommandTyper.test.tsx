import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { CommandTyper } from './CommandTyper'
import { getRandomCommands, type Command } from '../../data/minigames'
import { GAME_DURATION } from '../../utils/gameUtils'

const ROUNDS = 5

/**
 * getRandomCommands orders its pool with `[...pool].sort(() => Math.random() - 0.5)`.
 * Pinning Math.random to a constant makes that sort fully deterministic, so the
 * test can ask the same helper the component uses for the exact command sequence
 * the player is shown. (The spy is re-created per test because the hook below
 * restores it.)
 */
const PINNED_RANDOM = 0.7

/** Points for one correct command on a full clock: 100 + floor(30 / 3) * 10. */
const FULL_TIME_ROUND_SCORE = 100 + Math.floor(GAME_DURATION.COMMAND_TYPER / 3) * 10

function expectedSequence() {
  return getRandomCommands(ROUNDS)
}

function setup(rounds = ROUNDS) {
  const onComplete = vi.fn()
  const onSkip = vi.fn()
  const view = render(<CommandTyper rounds={rounds} onComplete={onComplete} onSkip={onSkip} />)
  const input = screen.getByPlaceholderText('Type the command...') as HTMLInputElement
  return { ...view, onComplete, onSkip, input }
}

function typeCommand(value: string) {
  fireEvent.change(screen.getByPlaceholderText('Type the command...'), {
    target: { value },
  })
}

function submitWithEnter() {
  fireEvent.keyDown(screen.getByPlaceholderText('Type the command...'), { key: 'Enter' })
}

/**
 * The component commits its per-character feedback inside requestAnimationFrame;
 * jsdom's frame loop is driven by the (faked) timer queue, so advancing 16ms
 * paints one frame.
 */
function flushFrame() {
  act(() => {
    vi.advanceTimersByTime(16)
  })
}

function playRound(command: Command) {
  typeCommand(command.command)
  flushFrame()
  submitWithEnter()
  flushFrame() // let the display repaint for the next command
}

/** The typed-command display is the element that owns the blinking caret. */
function commandDisplay(container: HTMLElement): HTMLElement {
  const caret = container.querySelector('.animate-blink')
  if (!caret?.parentElement) throw new Error('Command display (with caret) is not rendered')
  return caret.parentElement
}

function typedChars(container: HTMLElement, state: 'correct' | 'wrong'): number {
  const display = commandDisplay(container)
  return display.querySelectorAll(state === 'correct' ? '.text-green-400' : '.text-red-400').length
}

describe('CommandTyper', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(PINNED_RANDOM)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders the first command with its category, counters and clock', () => {
    const sequence = expectedSequence()
    const { container } = setup()

    expect(screen.getByText('⌨️ Command Typer')).toBeInTheDocument()
    expect(screen.getByText(sequence[0].description)).toBeInTheDocument()
    expect(screen.getByText(sequence[0].category.toUpperCase())).toBeInTheDocument()
    expect(screen.getByText('1/5')).toBeInTheDocument()
    expect(screen.getByText('✓ 0')).toBeInTheDocument()
    expect(screen.getByText('✗ 0')).toBeInTheDocument()
    expect(screen.getByText(`⏱ ${GAME_DURATION.COMMAND_TYPER}s`)).toBeInTheDocument()
    expect(commandDisplay(container)).toHaveTextContent(`$ ${sequence[0].command}`)
    expect(typedChars(container, 'correct')).toBe(0)
  })

  it('marks typed characters correct and leaves the rest pending', () => {
    const sequence = expectedSequence()
    const { container } = setup()
    const command = sequence[0].command

    typeCommand(command.slice(0, 3))
    flushFrame()
    expect(typedChars(container, 'correct')).toBe(3)
    expect(typedChars(container, 'wrong')).toBe(0)

    typeCommand(command)
    flushFrame()
    expect(typedChars(container, 'correct')).toBe(command.length)
    expect(typedChars(container, 'wrong')).toBe(0)
  })

  it('marks a mistyped character red while the correct prefix stays green', () => {
    const sequence = expectedSequence()
    const { container } = setup()

    typeCommand(`${sequence[0].command.slice(0, 4)}X`)
    flushFrame()
    expect(typedChars(container, 'correct')).toBe(4)
    expect(typedChars(container, 'wrong')).toBe(1)
  })

  it('plays a perfect round and pays the exact score to onComplete', () => {
    const sequence = expectedSequence()
    const { onComplete, onSkip } = setup()

    for (let i = 0; i < ROUNDS; i++) {
      expect(screen.getByText(`${i + 1}/${ROUNDS}`)).toBeInTheDocument()
      playRound(sequence[i])
      if (i < ROUNDS - 1) expect(screen.getByText(`✓ ${i + 1}`)).toBeInTheDocument()
    }

    const expectedScore = FULL_TIME_ROUND_SCORE * ROUNDS
    expect(screen.getByText('⌨️ Command Typer Complete!')).toBeInTheDocument()
    expect(screen.getByText('Commands Mastered!')).toBeInTheDocument()
    expect(
      screen.getByText(`You typed ${ROUNDS} out of ${ROUNDS} commands correctly (100%)`),
    ).toBeInTheDocument()
    expect(screen.getByText(String(expectedScore))).toBeInTheDocument()
    expect(
      screen.getByText(`+${Math.round(expectedScore / 2)} Bonus XP earned!`),
    ).toBeInTheDocument()

    expect(onComplete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /claim rewards/i }))
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(expectedScore, ROUNDS * 100)
    expect(onSkip).not.toHaveBeenCalled()
  })

  it('counts mistyped commands and still passes at exactly 60%', () => {
    const sequence = expectedSequence()
    const { onComplete } = setup()

    playRound(sequence[0])
    playRound(sequence[1])
    // Two mistyped commands followed by three correct ones -> 60%.
    playRound({ ...sequence[2], command: `${sequence[2].command}-oops` })
    expect(screen.getByText('✗ 1')).toBeInTheDocument()
    playRound({ ...sequence[3], command: `${sequence[3].command}-oops` })
    expect(screen.getByText('✗ 2')).toBeInTheDocument()
    expect(screen.getByText('✓ 2')).toBeInTheDocument()
    playRound(sequence[4])

    expect(
      screen.getByText('You typed 3 out of 5 commands correctly (60%)'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /claim rewards/i }))
    expect(onComplete).toHaveBeenCalledWith(FULL_TIME_ROUND_SCORE * 3, ROUNDS * 100)
  })

  it('routes a failed round to onSkip', () => {
    const sequence = expectedSequence()
    const { onComplete, onSkip } = setup()

    for (let i = 0; i < ROUNDS; i++) {
      playRound({ ...sequence[i], command: `${sequence[i].command}-oops` })
    }

    expect(screen.getByText('Keep Practicing!')).toBeInTheDocument()
    expect(screen.getByText('You typed 0 out of 5 commands correctly (0%)')).toBeInTheDocument()
    expect(screen.getByText('💪')).toBeInTheDocument()
    expect(screen.queryByText(/Bonus XP earned!/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /practice more/i }))
    expect(onSkip).toHaveBeenCalledTimes(1)
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('advances to the next command and resets the typed display', () => {
    const sequence = expectedSequence()
    const { input, container } = setup()

    playRound(sequence[0])
    expect(input).toHaveValue('')
    expect(screen.getByText(sequence[1].description)).toBeInTheDocument()
    expect(commandDisplay(container)).toHaveTextContent(`$ ${sequence[1].command}`)
    expect(typedChars(container, 'correct')).toBe(0)
    expect(typedChars(container, 'wrong')).toBe(0)
  })

  it('ignores an empty submit', () => {
    const sequence = expectedSequence()
    setup()

    submitWithEnter()
    expect(screen.getByText(sequence[0].description)).toBeInTheDocument()
    expect(screen.getByText('1/5')).toBeInTheDocument()
    expect(screen.queryByText(/Complete!/)).not.toBeInTheDocument()
  })

  it('counts the clock down and flags the read-out under ten seconds', () => {
    setup()

    expect(screen.getByText(`⏱ ${GAME_DURATION.COMMAND_TYPER}s`)).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(21_000)
    })
    expect(screen.getByText('⏱ 9s')).toBeInTheDocument()
  })

  it('ends the round when the clock reaches zero', () => {
    const sequence = expectedSequence()
    const { onComplete, onSkip } = setup()

    act(() => {
      vi.advanceTimersByTime(GAME_DURATION.COMMAND_TYPER * 1000)
    })

    expect(screen.getByText('Keep Practicing!')).toBeInTheDocument()
    expect(screen.getByText('You typed 0 out of 5 commands correctly (0%)')).toBeInTheDocument()
    expect(screen.queryByText(sequence[0].description)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /practice more/i }))
    expect(onSkip).toHaveBeenCalledTimes(1)
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('stops accepting input once the round is finished', () => {
    const sequence = expectedSequence()
    const { container } = setup()

    for (let i = 0; i < ROUNDS; i++) playRound(sequence[i])

    expect(screen.queryByPlaceholderText('Type the command...')).not.toBeInTheDocument()
    expect(() => commandDisplay(container)).toThrow()
  })

  it('shows the loading placeholder when the round has no commands', () => {
    render(<CommandTyper rounds={0} onComplete={vi.fn()} onSkip={vi.fn()} />)
    expect(screen.getByText('Loading commands...')).toBeInTheDocument()
  })
})
