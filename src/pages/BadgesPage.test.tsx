import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BadgesPage from './BadgesPage'
import { BADGES } from '@/data/badges'
import { renderSeededPage, seedDefaultGame } from './test-utils'

describe('BadgesPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the badge collection header', () => {
    renderSeededPage(<BadgesPage />, { route: '/badges', url: '/badges' })

    expect(
      screen.getByRole('heading', { level: 1, name: /Badge Collection/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('Collection Progress')).toBeInTheDocument()
    // The count reflects actual unlocks (zero for a fresh account), not the
    // length of the stored badges array, which pre-seeds the whole catalog.
    expect(screen.getByText(`0 of ${BADGES.length} badges earned`)).toBeInTheDocument()
  })

  it('shows every badge masked while locked for a fresh account', () => {
    const { badges } = seedDefaultGame()
    renderSeededPage(<BadgesPage />, { route: '/badges', url: '/badges' })

    expect(badges).toHaveLength(BADGES.length)
    expect(screen.getAllByText('???')).toHaveLength(BADGES.length)
  })

  it('offers category, status and rarity filters', () => {
    renderSeededPage(<BadgesPage />, { route: '/badges', url: '/badges' })

    for (const label of ['All', 'Quests', 'Streaks', 'Skills', 'Social', 'Secret', 'Seasonal']) {
      expect(screen.getAllByRole('button', { name: label }).length).toBeGreaterThan(0)
    }
    expect(screen.getByRole('button', { name: 'All Rarities' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Unlocked/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Locked/ })).toBeInTheDocument()
  })

  it('opens a badge detail modal showing locked status and rewards', async () => {
    const user = userEvent.setup()
    renderSeededPage(<BadgesPage />, { route: '/badges', url: '/badges' })

    await user.click(screen.getAllByRole('button', { name: /\?\?\?/ })[0])

    expect(screen.getByRole('heading', { name: '???' })).toBeInTheDocument()
    expect(screen.getByText('Locked')).toBeInTheDocument()
    // Locked badges expose their progress instead of their identity
    expect(screen.getByText('Progress')).toBeInTheDocument()
    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('heading', { name: '???' })).not.toBeInTheDocument()
  })

  it('filters the grid down to locked badges only', async () => {
    const user = userEvent.setup()
    renderSeededPage(<BadgesPage />, { route: '/badges', url: '/badges' })

    await user.click(screen.getByRole('button', { name: /🔒 Locked/ }))

    // Every badge is still listed because none are unlocked yet
    expect(screen.getAllByText('???')).toHaveLength(BADGES.length)
  })
})
