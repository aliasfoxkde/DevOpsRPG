import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MilestonesPage from './MilestonesPage'
import { MILESTONES } from '@/data/milestones'
import { renderSeededPage, seedDefaultGame } from './test-utils'

describe('MilestonesPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the milestones header and progress summary', () => {
    renderSeededPage(<MilestonesPage />, { route: '/milestones', url: '/milestones' })

    expect(screen.getByRole('heading', { level: 1, name: /Milestones/ })).toBeInTheDocument()
    expect(screen.getByText('Milestone Progress')).toBeInTheDocument()
    expect(screen.getByText(`0 of ${MILESTONES.length} milestones achieved`)).toBeInTheDocument()
  })

  it('summarises the player stats used by milestone triggers', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<MilestonesPage />, { route: '/milestones', url: '/milestones' })

    expect(screen.getByText('Total XP Earned')).toBeInTheDocument()
    expect(screen.getByText('Current Level')).toBeInTheDocument()
    expect(screen.getByText(`🔥 ${character.streakDays}`)).toBeInTheDocument()
  })

  it('lists every milestone from the static data', () => {
    renderSeededPage(<MilestonesPage />, { route: '/milestones', url: '/milestones' })

    for (const milestone of MILESTONES) {
      expect(screen.getByText(milestone.title)).toBeInTheDocument()
    }
  })

  it('offers status and type filters', () => {
    renderSeededPage(<MilestonesPage />, { route: '/milestones', url: '/milestones' })

    for (const label of ['All', 'Quests', 'Streaks', 'Levels', 'Realms', 'Quizzes', 'Mini-games']) {
      expect(screen.getAllByRole('button', { name: label }).length).toBeGreaterThan(0)
    }
    expect(screen.getByRole('button', { name: /Achieved/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Pending/ })).toBeInTheDocument()
  })

  it('opens a milestone detail modal with its progress and closes it', async () => {
    const user = userEvent.setup()
    const [first] = MILESTONES
    renderSeededPage(<MilestonesPage />, { route: '/milestones', url: '/milestones' })

    // The milestone title appears on its card and in the modal heading
    await user.click(screen.getAllByText(first.title)[0])

    expect(screen.getAllByRole('heading', { name: first.title }).length).toBeGreaterThan(0)
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('XP Bonus')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    // Only the card heading remains once the modal is dismissed
    expect(screen.getAllByRole('heading', { name: first.title })).toHaveLength(1)
  })
})
