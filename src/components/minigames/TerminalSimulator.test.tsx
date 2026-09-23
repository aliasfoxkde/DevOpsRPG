import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { GameProvider } from '../../contexts/GameContext'
import { TerminalSimulator } from './TerminalSimulator'
import { getRandomChallenges, type TerminalChallenge } from '../../data/terminalChallenges'
import { STORAGE_KEYS } from '../../utils/gameUtils'

const ROUNDS = 10

/**
 * getRandomChallenges shuffles with `[...pool].sort(() => Math.random() - 0.5)`;
 * pinning Math.random makes the picked ten deterministic, and the test asks the
 * same exported helper for the sequence the component is about to play.
 */
const PINNED_RANDOM = 0.6

function renderGame(category?: TerminalChallenge['category']) {
  const onComplete = vi.fn()
  const view = render(
    <GameProvider>
      <TerminalSimulator onComplete={onComplete} category={category} />
    </GameProvider>,
  )
  return { ...view, onComplete }
}

function storedCharacter() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME)!).character
}

function submitCommand(value: string) {
  fireEvent.change(screen.getByPlaceholderText('Type the command...'), { target: { value } })
  fireEvent.click(screen.getByRole('button', { name: 'Run' }))
}

describe('TerminalSimulator', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(PINNED_RANDOM)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('shows the briefing and difficulty ladder on the menu', () => {
    renderGame()

    expect(screen.getByText('💻')).toBeInTheDocument()
    expect(screen.getByText('Terminal Simulator')).toBeInTheDocument()
    expect(screen.getByText('🌱')).toBeInTheDocument()
    expect(screen.getByText('Beginner')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start challenge/i })).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Type the command...')).not.toBeInTheDocument()
  })

  it('labels the category when one is pinned', () => {
    renderGame('git')
    expect(screen.getByText('📁 GIT Mode')).toBeInTheDocument()
  })

  it('plays a full perfect round and reaches the result screen', () => {
    const sequence = getRandomChallenges(ROUNDS)
    const { onComplete } = renderGame()

    fireEvent.click(screen.getByRole('button', { name: /start challenge/i }))

    for (let i = 0; i < ROUNDS; i++) {
      expect(screen.getByText(`Challenge ${i + 1} of ${ROUNDS}`)).toBeInTheDocument()
      expect(screen.getByText(sequence[i].description)).toBeInTheDocument()
      expect(screen.getByText(sequence[i].category.toUpperCase())).toBeInTheDocument()
      submitCommand(sequence[i].command)
    }

    expect(screen.getByText('Perfect Score!')).toBeInTheDocument()
    expect(screen.getByText('10/10')).toBeInTheDocument()
    expect(screen.getByText('🔥 10')).toBeInTheDocument()
    expect(screen.getByText('+100 XP')).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('shows hints for the challenge on screen', () => {
    const sequence = getRandomChallenges(ROUNDS)
    renderGame()

    fireEvent.click(screen.getByRole('button', { name: /start challenge/i }))
    fireEvent.click(screen.getByRole('button', { name: /show hint/i }))

    expect(screen.getByText(`💡 Hint: ${sequence[0].hint}`)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /show hint/i })).not.toBeInTheDocument()
  })

  it('counts wrong attempts without advancing, then accepts the retry', () => {
    const sequence = getRandomChallenges(ROUNDS)
    renderGame()

    fireEvent.click(screen.getByRole('button', { name: /start challenge/i }))
    submitCommand('definitely-not-a-real-command')

    expect(screen.getByText('✗ Incorrect! 1 attempt')).toBeInTheDocument()
    expect(screen.getByText('Challenge 1 of 10')).toBeInTheDocument()
    expect(screen.getByText('✓ 0/10')).toBeInTheDocument()

    submitCommand(sequence[0].command)
    expect(screen.getByText('Challenge 2 of 10')).toBeInTheDocument()
    expect(screen.getByText('✓ 1/10')).toBeInTheDocument()
    expect(screen.queryByText(/Incorrect!/)).not.toBeInTheDocument()
  })

  it('previews the explanation once the typed command matches', () => {
    const sequence = getRandomChallenges(ROUNDS)
    renderGame()

    fireEvent.click(screen.getByRole('button', { name: /start challenge/i }))
    fireEvent.change(screen.getByPlaceholderText('Type the command...'), {
      target: { value: sequence[0].command },
    })

    expect(screen.getByText(sequence[0].explanation)).toBeInTheDocument()
    // Nothing has been submitted yet, so the round has not advanced.
    expect(screen.getByText('Challenge 1 of 10')).toBeInTheDocument()
  })

  it('pays out XP through the real game context on exit', () => {
    const sequence = getRandomChallenges(ROUNDS)
    const { onComplete } = renderGame()

    fireEvent.click(screen.getByRole('button', { name: /start challenge/i }))
    for (let i = 0; i < ROUNDS; i++) submitCommand(sequence[i].command)

    // Reward is only banked when the player leaves the result screen.
    expect(onComplete).not.toHaveBeenCalled()
    expect(storedCharacter().xp).toBe(0)

    fireEvent.click(screen.getByRole('button', { name: /exit/i }))

    expect(onComplete).toHaveBeenCalledTimes(1)
    const [score, xpEarned] = onComplete.mock.calls[0]
    expect(xpEarned).toBe(100)
    // 100 accuracy + 100 streak bonus + a perfect time bonus of 10 on a frozen clock.
    expect(score).toBe(210)

    const character = storedCharacter()
    expect(character.xp).toBe(100)
    expect(character.level).toBe(2)

    // Exiting returns the player to the briefing.
    expect(screen.getByText('Terminal Simulator')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start challenge/i })).toBeInTheDocument()
  })

  it('restarts from the result screen without banking twice', () => {
    const sequence = getRandomChallenges(ROUNDS)
    const { onComplete } = renderGame()

    fireEvent.click(screen.getByRole('button', { name: /start challenge/i }))
    for (let i = 0; i < ROUNDS; i++) submitCommand(sequence[i].command)

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onComplete).not.toHaveBeenCalled()
    expect(storedCharacter().xp).toBe(0)
    expect(screen.getByText('Challenge 1 of 10')).toBeInTheDocument()
    expect(screen.getByText('✓ 0/10')).toBeInTheDocument()
  })

  it('hides the category badge when no category is pinned', () => {
    renderGame()
    expect(screen.queryByText(/Mode/)).not.toBeInTheDocument()
  })

  it('keeps the timer-driven focus call harmless while playing', () => {
    getRandomChallenges(ROUNDS)
    renderGame()
    fireEvent.click(screen.getByRole('button', { name: /start challenge/i }))
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(screen.getByText('Challenge 1 of 10')).toBeInTheDocument()
  })
})
