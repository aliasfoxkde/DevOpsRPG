import { describe, it, expect, beforeEach } from 'vitest'
import { screen, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GameLibraryPage from './GameLibraryPage'
import { MINI_GAMES, MINI_GAME_UNLOCK_LEVEL } from '../components/minigames/gameCatalog'
import { closestContainer, renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { STORAGE_KEYS, XP_PER_LEVEL } from '../utils/gameUtils'
import type { GameState } from '../contexts/GameContext'

/**
 * Seeds a save with `apply` layered over the real defaults. Every branch the
 * mutator touches is copied first — mutating the cached defaults object would
 * poison every later seed in the suite.
 */
function seedWith(apply: (draft: GameState) => void): GameState {
  const base = seedDefaultGame()
  const merged: GameState = {
    ...base,
    character: { ...base.character },
    stats: { ...base.stats },
  }
  apply(merged)
  localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(merged))
  return merged
}

/** Seeds the hero past the mini-game unlock gate. */
function seedUnlockedHero(): void {
  seedWith((draft) => {
    draft.character.level = MINI_GAME_UNLOCK_LEVEL
    draft.character.xp = MINI_GAME_UNLOCK_LEVEL * XP_PER_LEVEL
    draft.character.xpToNextLevel = (MINI_GAME_UNLOCK_LEVEL + 1) * XP_PER_LEVEL
  })
}

/** The game cards currently on the grid, in display order (campaign card excluded). */
function cards(): HTMLElement[] {
  return screen
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.closest('div.rounded-xl'))
    .filter((card): card is HTMLElement => card !== null)
    .filter((card) => !card.textContent.includes('DevOpsQuest Campaign'))
}

/** The card name heading. */
const nameOf = (card: HTMLElement) => {
  const heading = card.querySelector('h3')
  if (!heading) throw new Error(`Card "${card.textContent}" has no name heading`)
  return heading.textContent
}

describe('GameLibraryPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the page heading and an honest tagline', () => {
    renderSeededPage(<GameLibraryPage />)
    expect(screen.getByRole('heading', { level: 1, name: /Game Library/ })).toBeInTheDocument()
    expect(screen.getByText(/every one playable today/)).toBeInTheDocument()
  })

  it('lists exactly the real mini-games, with their real reward teasers', () => {
    renderSeededPage(<GameLibraryPage />)

    expect(
      screen.getByText(`${MINI_GAMES.length} of ${MINI_GAMES.length} games`),
    ).toBeInTheDocument()
    for (const miniGame of MINI_GAMES) {
      const card = closestContainer(screen.getByText(miniGame.name), 'div.rounded-xl')
      expect(within(card).getByText(miniGame.description)).toBeInTheDocument()
      expect(within(card).getByText(`+${miniGame.xpPotential} XP potential`)).toBeInTheDocument()
    }
    // The fictional roster is gone for good
    expect(screen.queryByText('K8s Kingdom')).not.toBeInTheDocument()
    expect(screen.queryByText('Word Wizard')).not.toBeInTheDocument()
    expect(screen.queryByText('Coming Soon')).not.toBeInTheDocument()
  })

  it('keeps locked games visible but unplayable below the unlock level', () => {
    // A fresh hero is level 1, under the gate
    renderSeededPage(<GameLibraryPage />)

    expect(screen.queryByRole('button', { name: /Play / })).not.toBeInTheDocument()
    for (const miniGame of MINI_GAMES) {
      const card = closestContainer(screen.getByText(miniGame.name), 'div.rounded-xl')
      expect(within(card).getByText(`🔒 Level ${MINI_GAME_UNLOCK_LEVEL}`)).toBeInTheDocument()
    }
  })

  it('opens the hub straight onto the chosen game for an unlocked hero', async () => {
    const user = userEvent.setup()
    seedUnlockedHero()
    renderPage(<GameLibraryPage />)

    await user.click(screen.getByRole('button', { name: 'Play Quiz Dash' }))

    // The hub opened on the picked game, not the menu
    expect(screen.getAllByText('⚡ Quiz Dash').length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'Back to Game' })).not.toBeInTheDocument()

    // Closing the hub returns to the library
    fireEventClose()
    expect(screen.queryByText('⚡ Quiz Dash')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: /Game Library/ })).toBeInTheDocument()
  })

  it('narrows the catalogue when searching', async () => {
    const user = userEvent.setup()
    renderSeededPage(<GameLibraryPage />)

    await user.type(screen.getByPlaceholderText('Search games...'), 'terminal')

    expect(screen.getByText(`1 of ${MINI_GAMES.length} games`)).toBeInTheDocument()
    expect(screen.getByText('Terminal Simulator')).toBeInTheDocument()
    expect(screen.queryByText('Memory Match')).not.toBeInTheDocument()
  })

  it('matches game descriptions as well as names', async () => {
    const user = userEvent.setup()
    renderSeededPage(<GameLibraryPage />)

    // "production emergencies" only appears in a description, never in a title
    await user.type(screen.getByPlaceholderText('Search games...'), 'production emergencies')

    expect(screen.getByText(`1 of ${MINI_GAMES.length} games`)).toBeInTheDocument()
    expect(screen.getByText('Incident Response')).toBeInTheDocument()
    expect(screen.queryByText('Quiz Dash')).not.toBeInTheDocument()
  })

  it('orders the grid by name and then by top reward', async () => {
    const user = userEvent.setup()
    seedUnlockedHero()
    renderPage(<GameLibraryPage />)

    const expectedNameOrder = [...MINI_GAMES]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((entry) => entry.name)
    expect(cards().map(nameOf)).toEqual(expectedNameOrder)

    await user.click(screen.getByRole('button', { name: 'Top Reward' }))
    const rewardOrder = cards().map(nameOf)
    const potentials = rewardOrder.map(
      (name) => MINI_GAMES.find((entry) => entry.name === name)?.xpPotential ?? 0,
    )
    for (let i = 1; i < potentials.length; i++) {
      expect(potentials[i - 1]).toBeGreaterThanOrEqual(potentials[i])
    }
    expect(rewardOrder[0]).toBe('Incident Response') // the 350 XP flagship
    expect(screen.getByRole('button', { name: 'Top Reward' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await user.click(screen.getByRole('button', { name: 'Name' }))
    expect(cards().map(nameOf)).toEqual(expectedNameOrder)
  })

  it('offers an empty state when nothing matches', async () => {
    const user = userEvent.setup()
    renderSeededPage(<GameLibraryPage />)

    await user.type(screen.getByPlaceholderText('Search games...'), 'quantum quest')

    expect(screen.getByText(`0 of ${MINI_GAMES.length} games`)).toBeInTheDocument()
    expect(screen.getByText('No games found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your search')).toBeInTheDocument()
    expect(cards()).toHaveLength(0)
  })

  it('links the campaign card back to the main game', () => {
    renderSeededPage(<GameLibraryPage />)

    const campaign = closestContainer(screen.getByText('DevOpsQuest Campaign'), 'div.rounded-xl')
    expect(within(campaign).getByRole('link', { name: /Continue Campaign/ })).toHaveAttribute(
      'href',
      '/',
    )
  })
})

/** Dismisses the hub through its header close button. */
function fireEventClose(): void {
  const close = screen.getAllByRole('button', { name: '×' })[0]
  act(() => {
    close.click()
  })
}
