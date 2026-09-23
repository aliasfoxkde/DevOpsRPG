import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, act, fireEvent } from '@testing-library/react'
import PVPArenaPage from './PVPArenaPage'
import { PVP_RANKS, PVP_QUESTIONS } from '@/data/pvpArena'
import { renderSeededPage } from './test-utils'

describe('PVPArenaPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the arena header, starting rank and every rank tier', () => {
    renderSeededPage(<PVPArenaPage />, { route: '/pvp-arena', url: '/pvp-arena' })

    expect(
      screen.getByRole('heading', { level: 1, name: /PvP Arena/ }),
    ).toBeInTheDocument()
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
    expect(
      screen.getByRole('button', { name: /Find Match/ }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Start Battle/ }),
    ).not.toBeInTheDocument()
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
    const options = screen
      .getAllByRole('button')
      .filter(button => /^[ABCD]/.test(button.textContent ?? ''))

    // The question is drawn from the exported pool, so the right answer can be
    // looked up and picked on purpose instead of guessing a fixed index
    const questionText = screen.getByRole('heading', { level: 3 }).textContent
    const question = Object.values(PVP_QUESTIONS)
      .flat()
      .find(entry => entry.question === questionText)
    if (!question) throw new Error(`Unknown question rendered: ${questionText}`)
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
})
