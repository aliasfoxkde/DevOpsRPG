import { describe, it, expect, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LeaderboardPage from './LeaderboardPage'
import { closestContainer, renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import type { GameState } from '@/contexts/GameContext'

// The board always lists 20 generated rivals plus the player
const MOCK_ROW_COUNT = 20

/**
 * Seeds a save with the default state overlaid by whatever the mutator
 * changes; only the branches the mutator touches are copied so the cached
 * defaults object is never modified.
 */
function seedWith(apply: (draft: GameState) => void): GameState {
  const base = seedDefaultGame()
  const merged: GameState = {
    ...base,
    character: { ...base.character },
    badges: [...base.badges],
    completedQuests: [...base.completedQuests],
  }
  apply(merged)
  localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(merged))
  return merged
}

/** The leaderboard rows in display order, found via their class subtitle. */
function rows(): HTMLElement[] {
  return screen
    .getAllByText(/^(Cloud Knight|Script Warrior|Data Mage|DevOps Sage)$/)
    .map((el) => closestContainer(el, 'div.grid'))
}

/** Reads a row cell by the class the page gives it. */
function cell(row: HTMLElement, selector: string): string {
  const value = row.querySelector(selector)
  if (!value) throw new Error(`No cell matching "${selector}" in row "${row.textContent}"`)
  return value.textContent
}

const levelOf = (row: HTMLElement) => Number(cell(row, 'span.text-white.font-bold'))
const xpOf = (row: HTMLElement) =>
  Number(cell(row, 'span.text-green-400.font-mono').replace(/,/g, ''))
const questsOf = (row: HTMLElement) => Number(cell(row, 'span.text-slate-300'))
const badgesOf = (row: HTMLElement) => Number(cell(row, 'span.text-purple-400'))

/** The trailing streak column, whose label shares the flame glyph. */
function streakOf(row: HTMLElement): number {
  const last = row.lastElementChild
  if (!last) throw new Error(`Row "${row.textContent}" has no streak cell`)
  return Number(last.textContent.replace('🔥', '').trim())
}

/** The player or rival name shown in a row. */
function nameOf(row: HTMLElement): string {
  const name = row.querySelector('p.font-bold')
  if (!name) throw new Error(`Row "${row.textContent}" has no name cell`)
  return name.textContent
}

describe('LeaderboardPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the leaderboard with the player ranked among the rivals', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<LeaderboardPage />, { route: '/leaderboard', url: '/leaderboard' })

    expect(screen.getByRole('heading', { level: 1, name: /Leaderboard/ })).toBeInTheDocument()
    expect(screen.getByText('Your Rank')).toBeInTheDocument()
    expect(screen.getByText(character.name)).toBeInTheDocument()
    // The player's own row is labelled and highlighted
    expect(screen.getByText(`${character.name} (You)`)).toBeInTheDocument()
    // 20 generated rivals plus the player, each showing one of the four classes
    expect(
      screen.getAllByText(/^(Cloud Knight|Script Warrior|Data Mage|DevOps Sage)$/),
    ).toHaveLength(MOCK_ROW_COUNT + 1)
    expect(screen.getByText(`Level ${character.level} ${character.class}`)).toBeInTheDocument()
  })

  it('offers the three timeframe tabs', () => {
    renderSeededPage(<LeaderboardPage />, { route: '/leaderboard', url: '/leaderboard' })

    for (const label of ['🏆 All Time', '📅 This Week', '⚡ Today']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('sorts the table when a column header is clicked twice', async () => {
    const user = userEvent.setup()
    renderSeededPage(<LeaderboardPage />, { route: '/leaderboard', url: '/leaderboard' })

    // No sort indicator before the first click
    expect(screen.getByText('Player')).toBeInTheDocument()

    await user.click(screen.getByText('Player'))
    expect(screen.getByText('Player ↓')).toBeInTheDocument()

    await user.click(screen.getByText('Player ↓'))
    expect(screen.getByText('Player ↑')).toBeInTheDocument()
    expect(screen.queryByText('Player ↓')).not.toBeInTheDocument()
  })

  it('opens a player detail modal and closes it again', async () => {
    const user = userEvent.setup()
    const { character } = seedDefaultGame()
    renderSeededPage(<LeaderboardPage />, { route: '/leaderboard', url: '/leaderboard' })

    await user.click(screen.getByText(`${character.name} (You)`))

    expect(screen.getByRole('heading', { name: `${character.name} (You)` })).toBeInTheDocument()
    expect(screen.getByText('Last Active')).toBeInTheDocument()
    // "Just now" now appears on the row and inside the modal
    expect(screen.getAllByText('Just now').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(
      screen.queryByRole('heading', { name: `${character.name} (You)` }),
    ).not.toBeInTheDocument()
  })

  it('summarises the player stats below the table', () => {
    const { character, completedQuests } = seedDefaultGame()
    renderSeededPage(<LeaderboardPage />, { route: '/leaderboard', url: '/leaderboard' })

    expect(completedQuests).toHaveLength(0)
    expect(screen.getByText('Quests Completed')).toBeInTheDocument()
    expect(screen.getByText('Badges Earned')).toBeInTheDocument()
    expect(screen.getByText('Current Realm')).toBeInTheDocument()
    // The XP figure next to its label matches the character save
    expect(screen.getByText('Your XP').nextElementSibling).toHaveTextContent(String(character.xp))
  })

  it('medals the top three rows and closes the board with a fresh player', () => {
    const game = seedDefaultGame()
    const { character } = game
    renderSeededPage(<LeaderboardPage />, { route: '/leaderboard', url: '/leaderboard' })

    const table = rows()
    expect(table).toHaveLength(MOCK_ROW_COUNT + 1)
    expect(within(table[0]).getByText('🥇')).toBeInTheDocument()
    expect(within(table[1]).getByText('🥈')).toBeInTheDocument()
    expect(within(table[2]).getByText('🥉')).toBeInTheDocument()
    expect(within(table[3]).getByText('#4')).toBeInTheDocument()

    // A level 1 hero has no XP, so they trail all 20 rivals
    const playerRow = closestContainer(screen.getByText(`${character.name} (You)`), 'div.grid')
    expect(playerRow).toBe(table[table.length - 1])
    expect(playerRow).toHaveClass('bg-amber-900/20', 'border-l-4', 'border-amber-500')
    expect(screen.getByText('Your Rank').nextElementSibling).toHaveTextContent(
      `#${MOCK_ROW_COUNT + 1}`,
    )
    // The player's own row reports their seeded numbers
    expect(levelOf(playerRow)).toBe(character.level)
    expect(badgesOf(playerRow)).toBe(game.badges.length)
  })

  it('ranks a player who leads on XP first rather than pinning them last', () => {
    // Rival XP tops out at 25 * 1000 + 499, so 25,500 clears the whole board
    seedWith((draft) => {
      draft.character.level = 25
      draft.character.xp = 25500
    })
    renderPage(<LeaderboardPage />, { route: '/leaderboard', url: '/leaderboard' })

    expect(screen.getByText('Your Rank').nextElementSibling).toHaveTextContent('🥇')
    const table = rows()
    expect(within(table[0]).getByText('Hero (You)')).toBeInTheDocument()
    expect(within(table[0]).getByText('🥇')).toBeInTheDocument()
    expect(xpOf(table[0])).toBe(25500)
    // Rivals keep their XP order behind the leader
    expect(xpOf(table[1])).toBeGreaterThan(xpOf(table[table.length - 1]))
    expect(within(table[table.length - 1]).getByText('#21')).toBeInTheDocument()
  })

  it('sorts by player name in both directions', async () => {
    const user = userEvent.setup()
    renderSeededPage(<LeaderboardPage />, { route: '/leaderboard', url: '/leaderboard' })

    await user.click(screen.getByText('Player'))
    expect(screen.getByText('Player ↓')).toBeInTheDocument()
    expect(within(rows()[0]).getByText('VaultVictor')).toBeInTheDocument()

    await user.click(screen.getByText('Player ↓'))
    expect(screen.getByText('Player ↑')).toBeInTheDocument()
    expect(screen.queryByText('Player ↓')).not.toBeInTheDocument()
    expect(within(rows()[0]).getByText('APIPhantom')).toBeInTheDocument()

    // A third click cycles back to descending
    await user.click(screen.getByText('Player ↑'))
    expect(screen.getByText('Player ↓')).toBeInTheDocument()
    expect(within(rows()[0]).getByText('VaultVictor')).toBeInTheDocument()

    // Sorting by another column drops the name indicator
    await user.click(screen.getByText('Level'))
    expect(screen.queryByText('Player ↓')).not.toBeInTheDocument()
  })

  it('sorts the numeric columns and flips each indicator', async () => {
    const user = userEvent.setup()
    const { character } = seedDefaultGame()
    renderSeededPage(<LeaderboardPage />, { route: '/leaderboard', url: '/leaderboard' })

    // Level: highest first, the level 1 hero closing the board
    await user.click(screen.getByText('Level'))
    expect(screen.getByText('Level ↓')).toBeInTheDocument()
    const table = rows()
    expect(levelOf(table[0])).toBe(25)
    expect(levelOf(table[0])).toBeGreaterThanOrEqual(levelOf(table[table.length - 1]))
    expect(within(table[table.length - 1]).getByText(`${character.name} (You)`)).toBeInTheDocument()

    // Clicking again reverses it and puts the hero on top
    await user.click(screen.getByText('Level ↓'))
    expect(screen.getByText('Level ↑')).toBeInTheDocument()
    expect(within(rows()[0]).getByText(`${character.name} (You)`)).toBeInTheDocument()
    expect(levelOf(rows()[0])).toBe(character.level)

    // XP: the empty-handed hero sinks to the bottom
    await user.click(screen.getByText('XP'))
    expect(screen.getByText('XP ↓')).toBeInTheDocument()
    const xpOrder = rows().map(xpOf)
    expect(xpOrder[xpOrder.length - 1]).toBe(character.xp)
    for (let i = 1; i < xpOrder.length; i++) {
      expect(xpOrder[i - 1]).toBeGreaterThanOrEqual(xpOrder[i])
    }

    // Quests: a new column starts descending, and reversing puts the hero on
    // top because the column is derived from level
    await user.click(screen.getByText('Quests'))
    expect(screen.getByText('Quests ↓')).toBeInTheDocument()
    await user.click(screen.getByText('Quests ↓'))
    expect(screen.getByText('Quests ↑')).toBeInTheDocument()
    expect(questsOf(rows()[0])).toBe(Math.floor(character.level * 3.5))
    expect(within(rows()[0]).getByText(`${character.name} (You)`)).toBeInTheDocument()

    // Badges: the hero owns the whole catalog, so ascending pushes them last
    await user.click(screen.getByText('Badges'))
    expect(screen.getByText('Badges ↓')).toBeInTheDocument()
    expect(within(rows()[0]).getByText(`${character.name} (You)`)).toBeInTheDocument()
    await user.click(screen.getByText('Badges ↓'))
    expect(screen.getByText('Badges ↑')).toBeInTheDocument()
    expect(
      within(rows()[rows().length - 1]).getByText(`${character.name} (You)`),
    ).toBeInTheDocument()

    // The streak column is sortable too, under its flame header
    await user.click(screen.getAllByText('🔥')[0])
    expect(screen.getByText('🔥 ↓')).toBeInTheDocument()

    // Every column can be driven back up to ascending
    await user.click(screen.getByText('XP'))
    expect(screen.getByText('XP ↓')).toBeInTheDocument()
    await user.click(screen.getByText('XP ↓'))
    expect(screen.getByText('XP ↑')).toBeInTheDocument()
    const ascending = rows().map(xpOf)
    expect(ascending[0]).toBe(character.xp)
    for (let i = 1; i < ascending.length; i++) {
      expect(ascending[i - 1]).toBeLessThanOrEqual(ascending[i])
    }
    await user.click(screen.getAllByText('🔥')[0])
    expect(screen.getByText('🔥 ↓')).toBeInTheDocument()
    await user.click(screen.getByText('🔥 ↓'))
    expect(screen.getByText('🔥 ↑')).toBeInTheDocument()
  })

  it('switches the highlighted timeframe tab', async () => {
    const user = userEvent.setup()
    renderSeededPage(<LeaderboardPage />, { route: '/leaderboard', url: '/leaderboard' })

    const allTime = screen.getByRole('button', { name: '🏆 All Time' })
    expect(allTime).toHaveClass('bg-amber-600')

    await user.click(screen.getByRole('button', { name: '📅 This Week' }))
    expect(screen.getByRole('button', { name: '📅 This Week' })).toHaveClass('bg-amber-600')
    expect(allTime).toHaveClass('bg-slate-800')

    await user.click(screen.getByRole('button', { name: '⚡ Today' }))
    expect(screen.getByRole('button', { name: '⚡ Today' })).toHaveClass('bg-amber-600')
    expect(screen.getByRole('button', { name: '📅 This Week' })).toHaveClass('bg-slate-800')
  })

  it('shows a rival profile in a modal and dismisses it with the × button', async () => {
    const user = userEvent.setup()
    renderSeededPage(<LeaderboardPage />, { route: '/leaderboard', url: '/leaderboard' })

    const top = rows()[0]
    await user.click(top)

    const panel = closestContainer(screen.getByText('Realm'), 'div.max-w-sm')
    expect(within(panel).getByRole('heading', { name: nameOf(top) })).toBeInTheDocument()
    expect(within(panel).getByText('Level').nextElementSibling).toHaveTextContent(
      String(levelOf(top)),
    )
    expect(within(panel).getByText('XP').nextElementSibling).toHaveTextContent(
      xpOf(top).toLocaleString(),
    )
    expect(within(panel).getByText('Quests').nextElementSibling).toHaveTextContent(
      String(questsOf(top)),
    )
    expect(within(panel).getByText('🔥 Streak').nextElementSibling).toHaveTextContent(
      `${streakOf(top)} days`,
    )
    expect(within(panel).getByText('Badges').nextElementSibling).toHaveTextContent(
      String(badgesOf(top)),
    )
    expect(within(panel).getByText('Last Active').nextElementSibling).toHaveTextContent(/h ago/)

    await user.click(within(panel).getByText('×'))
    expect(screen.queryByText('Last Active')).not.toBeInTheDocument()
    // The board itself is still there
    expect(rows()).toHaveLength(MOCK_ROW_COUNT + 1)
  })

  it('maps each level band to its realm emoji', () => {
    const bands: Array<[number, string]> = [
      [3, '🏘️'],
      [7, '🌲'],
      [12, '🏰'],
      [17, '⛰️'],
      [25, '🏛️'],
    ]

    for (const [level, icon] of bands) {
      seedWith((draft) => {
        draft.character.level = level
      })
      const view = renderPage(<LeaderboardPage />, { route: '/leaderboard', url: '/leaderboard' })

      expect(screen.getByText('Current Realm').nextElementSibling).toHaveTextContent(icon)
      view.unmount()
    }
  })
})
