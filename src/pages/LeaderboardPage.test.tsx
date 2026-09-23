import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LeaderboardPage from './LeaderboardPage'
import { renderSeededPage, seedDefaultGame } from './test-utils'

// The board always lists 20 generated rivals plus the player
const MOCK_ROW_COUNT = 20

describe('LeaderboardPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the leaderboard with the player ranked among the rivals', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<LeaderboardPage />, { route: '/leaderboard', url: '/leaderboard' })

    expect(
      screen.getByRole('heading', { level: 1, name: /Leaderboard/ }),
    ).toBeInTheDocument()
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
    expect(screen.getByText('Your XP').nextElementSibling).toHaveTextContent(
      String(character.xp),
    )
  })
})
