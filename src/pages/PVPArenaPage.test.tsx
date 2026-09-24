import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, act, fireEvent } from '@testing-library/react'
import PVPArenaPage from './PVPArenaPage'
import {
  PVP_RANKS,
  PVP_QUESTIONS,
  calculatePVPRewards,
  getRankByPoints,
  type PVPQuestion,
} from '@/data/pvpArena'
import { renderSeededPage } from './test-utils'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import type { GameState } from '@/contexts/GameContext'

/** The five answer buttons of the question currently on screen. */
function answerOptions(): HTMLElement[] {
  const options = screen
    .getAllByRole('button')
    .filter((button) => /^[ABCD]/.test(button.textContent))
  if (options.length === 0) throw new Error('No answer options rendered')
  return options
}

/** The question currently rendered in the battle view, from the real pool. */
function currentQuestion(): PVPQuestion {
  const text = screen.getByRole('heading', { level: 3 }).textContent
  const question = Object.values(PVP_QUESTIONS)
    .flat()
    .find((entry) => entry.question === text)
  if (!question) throw new Error(`Unknown question rendered: ${text}`)
  return question
}

/** Difficulty of the match shown on the "ready" screen. */
function matchedDifficulty(): 'easy' | 'medium' | 'hard' {
  const text = screen.getByText(/Match$/).textContent
  if (text.includes('Easy')) return 'easy'
  if (text.includes('Medium')) return 'medium'
  if (text.includes('Hard')) return 'hard'
  throw new Error(`Unknown difficulty text: ${text}`)
}

/** Reads the persisted save straight out of localStorage. */
function storedGame(): GameState {
  const raw = localStorage.getItem(STORAGE_KEYS.GAME)
  if (!raw) throw new Error('No game state persisted to localStorage')
  return JSON.parse(raw) as GameState
}

/** Starts a match and reports its difficulty (read before the battle begins). */
async function startBattle(): Promise<'easy' | 'medium' | 'hard'> {
  fireEvent.click(screen.getByRole('button', { name: /Find Match/ }))
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000)
  })
  const difficulty = matchedDifficulty()
  fireEvent.click(screen.getByRole('button', { name: /Start Battle/ }))
  return difficulty
}

/** Answers the on-screen question with `pick`, then waits out the reveal. */
async function answer(pick: (question: PVPQuestion) => number) {
  const question = currentQuestion()
  fireEvent.click(answerOptions()[pick(question)])
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000)
  })
}

describe('PVPArenaPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the arena header, starting rank and every rank tier', () => {
    renderSeededPage(<PVPArenaPage />, { route: '/pvp-arena', url: '/pvp-arena' })

    expect(screen.getByRole('heading', { level: 1, name: /PvP Arena/ })).toBeInTheDocument()
    expect(screen.getByText('0 Points')).toBeInTheDocument()
    expect(screen.getByText('Wins')).toBeInTheDocument()
    expect(screen.getByText('Losses')).toBeInTheDocument()
    expect(screen.getByText('Streak')).toBeInTheDocument()
    // A fresh player starts at the bottom tier with 0 points
    expect(screen.getAllByText(PVP_RANKS[0].name).length).toBeGreaterThan(0)
    for (const rank of PVP_RANKS) {
      expect(screen.getAllByText(rank.name).length).toBeGreaterThan(0)
    }
  })

  it('shows the idle call to action before a match is requested', () => {
    renderSeededPage(<PVPArenaPage />, { route: '/pvp-arena', url: '/pvp-arena' })

    expect(screen.getByText('Ready for Battle?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Find Match/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Start Battle/ })).not.toBeInTheDocument()
  })

  it('matches the player with an opponent after a short search', async () => {
    vi.useFakeTimers()
    renderSeededPage(<PVPArenaPage />, { route: '/pvp-arena', url: '/pvp-arena' })

    fireEvent.click(screen.getByRole('button', { name: /Find Match/ }))
    expect(screen.getByText('Finding Opponent...')).toBeInTheDocument()

    // The matchmaking animation resolves after two seconds
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    expect(screen.getByRole('button', { name: /Start Battle/ })).toBeInTheDocument()
    expect(screen.queryByText('Finding Opponent...')).not.toBeInTheDocument()
  })

  it('runs a battle and locks the options once an answer is picked', async () => {
    vi.useFakeTimers()
    renderSeededPage(<PVPArenaPage />, { route: '/pvp-arena', url: '/pvp-arena' })

    fireEvent.click(screen.getByRole('button', { name: /Find Match/ }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })
    fireEvent.click(screen.getByRole('button', { name: /Start Battle/ }))

    // The first question of the five-question match is on screen
    expect(screen.getByText('Q 1/5')).toBeInTheDocument()
    expect(screen.getByText(/⏱️/)).toBeInTheDocument()
    const options = answerOptions()

    // The question is drawn from the exported pool, so the right answer can be
    // looked up and picked on purpose instead of guessing a fixed index
    const question = currentQuestion()
    expect(options).toHaveLength(question.options.length)

    fireEvent.click(options[question.correctIndex])

    // The answer is locked in: every option is disabled and the correct one
    // bumps the running score
    for (const option of options) {
      expect(option).toBeDisabled()
    }
    expect(screen.getByText('Your Score: 1/1')).toBeInTheDocument()
    // No time has passed, so the match has not advanced yet
    expect(screen.getByText('Q 1/5')).toBeInTheDocument()
  })

  it('pays out the exact victory rewards after a perfect match', async () => {
    vi.useFakeTimers()
    const { game } = renderSeededPage(<PVPArenaPage />, { route: '/pvp-arena', url: '/pvp-arena' })

    const difficulty = await startBattle()

    // Five correct answers, one second apart, win the match
    for (let step = 0; step < 5; step += 1) {
      expect(screen.getByText(`Q ${step + 1}/5`)).toBeInTheDocument()
      await answer((question) => question.correctIndex)
    }

    const expected = calculatePVPRewards(true, difficulty, 5, 5, getRankByPoints(0))
    expect(screen.getByText('Victory!')).toBeInTheDocument()
    expect(screen.getByText('+5/5')).toBeInTheDocument()
    expect(screen.getByText(`+${expected.pointsEarned} pts`)).toBeInTheDocument()
    expect(screen.getByText(`+${expected.xpEarned} XP`)).toBeInTheDocument()
    expect(screen.getByText(`+${expected.goldEarned} Gold`)).toBeInTheDocument()

    // Victory rewards land in the persisted character, nothing else moves
    const stored = storedGame()
    expect(stored.character.xp).toBe(game.character.xp + expected.xpEarned)
    expect(stored.character.gold).toBe(game.character.gold + expected.goldEarned)
    expect(stored.completedQuests).toHaveLength(0)
  })

  it('awards nothing and reports the loss after five wrong answers', async () => {
    vi.useFakeTimers()
    const { game } = renderSeededPage(<PVPArenaPage />, { route: '/pvp-arena', url: '/pvp-arena' })

    const difficulty = await startBattle()

    for (let step = 0; step < 5; step += 1) {
      // Always pick the first option that is not the correct one
      await answer((question) => (question.correctIndex === 0 ? 1 : 0))
    }

    const expected = calculatePVPRewards(false, difficulty, 0, 5, getRankByPoints(0))
    expect(screen.getByText('Defeat')).toBeInTheDocument()
    expect(screen.getByText('0/5')).toBeInTheDocument()
    expect(screen.getByText(`-${expected.pointsLost} pts`)).toBeInTheDocument()
    // Losing still shows the (zero) experience and gold lines
    expect(screen.getByText('+0 XP')).toBeInTheDocument()

    // Losses pay nothing: the saved character is byte-for-byte unchanged
    const stored = storedGame()
    expect(stored.character.xp).toBe(game.character.xp)
    expect(stored.character.gold).toBe(game.character.gold)
  })

  it('ends the match when the countdown runs out', async () => {
    vi.useFakeTimers()
    renderSeededPage(<PVPArenaPage />, { route: '/pvp-arena', url: '/pvp-arena' })

    await startBattle()
    expect(screen.getByText('⏱️ 60s')).toBeInTheDocument()

    // Let the whole minute elapse without answering anything
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60000)
    })

    expect(screen.getByText('Defeat')).toBeInTheDocument()
    expect(screen.getByText('0/5')).toBeInTheDocument()
    expect(screen.queryByText(/⏱️/)).not.toBeInTheDocument()
  })

  it('resets to the idle arena after the result screen', async () => {
    vi.useFakeTimers()
    renderSeededPage(<PVPArenaPage />, { route: '/pvp-arena', url: '/pvp-arena' })

    await startBattle()
    for (let step = 0; step < 5; step += 1) {
      await answer((question) => question.correctIndex)
    }
    fireEvent.click(screen.getByRole('button', { name: /Battle Again/ }))

    expect(screen.getByText('Ready for Battle?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Find Match/ })).toBeInTheDocument()
    expect(screen.queryByText('Victory!')).not.toBeInTheDocument()
  })
})
