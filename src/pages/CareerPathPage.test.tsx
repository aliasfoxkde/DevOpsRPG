import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CareerPathPage from './CareerPathPage'
import { CAREER_PATHS } from '@/data/careerPaths'
import { renderSeededPage } from './test-utils'

function pathCard(name: string): HTMLElement {
  const card = screen.getAllByRole('button').find((btn) => btn.textContent.includes(name))
  if (!card) throw new Error(`No career path card found for "${name}"`)
  return card
}

describe('CareerPathPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the career paths header, intro and every path card', () => {
    renderSeededPage(<CareerPathPage />, { route: '/career-path', url: '/career-path' })

    expect(screen.getByRole('heading', { level: 1, name: /Career Paths/ })).toBeInTheDocument()
    expect(screen.getByText('Your DevOps Career Journey')).toBeInTheDocument()
    for (const label of ['All Paths', 'High Demand', 'Growing']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
    for (const path of CAREER_PATHS) {
      expect(screen.getByText(path.name)).toBeInTheDocument()
    }
    // Every card advertises salary, time and technology count
    expect(screen.getAllByText('Salary Range')).toHaveLength(CAREER_PATHS.length)
    expect(screen.getAllByText('Est. Time')).toHaveLength(CAREER_PATHS.length)
    expect(screen.getAllByText('Technologies')).toHaveLength(CAREER_PATHS.length)
  })

  it('filters the cards by demand level', async () => {
    const user = userEvent.setup()
    renderSeededPage(<CareerPathPage />, { route: '/career-path', url: '/career-path' })

    await user.click(screen.getByRole('button', { name: 'High Demand' }))

    const highDemand = CAREER_PATHS.filter((p) => p.demandLevel === 'high')
    const notHighDemand = CAREER_PATHS.filter((p) => p.demandLevel !== 'high')
    expect(screen.getAllByText('Salary Range')).toHaveLength(highDemand.length)
    for (const path of highDemand) {
      expect(screen.getByText(path.name)).toBeInTheDocument()
    }
    for (const path of notHighDemand) {
      expect(screen.queryByText(path.name)).not.toBeInTheDocument()
    }

    await user.click(screen.getByRole('button', { name: 'Growing' }))

    const growing = CAREER_PATHS.filter((p) => p.demandLevel === 'growing')
    expect(growing.length).toBeGreaterThan(0)
    expect(screen.getAllByText('Salary Range')).toHaveLength(growing.length)

    await user.click(screen.getByRole('button', { name: 'All Paths' }))
    expect(screen.getAllByText('Salary Range')).toHaveLength(CAREER_PATHS.length)
  })

  it('opens a path detail modal with prerequisites, skill tree and milestones', async () => {
    const user = userEvent.setup()
    const path = CAREER_PATHS[0]
    renderSeededPage(<CareerPathPage />, { route: '/career-path', url: '/career-path' })

    await user.click(pathCard(path.name))

    // The path name now appears on the card and in the modal heading
    expect(screen.getAllByText(path.name).length).toBeGreaterThan(1)
    expect(screen.getByText('📋 Prerequisites')).toBeInTheDocument()
    expect(screen.getByText('🛠️ Technology Skill Tree')).toBeInTheDocument()
    expect(screen.getByText('🏆 Milestones')).toBeInTheDocument()
    for (const tech of path.technologies) {
      expect(screen.getByText(tech.name)).toBeInTheDocument()
    }
    // A new player has made no progress on any technology yet
    expect(screen.getAllByText('0% complete')).toHaveLength(path.technologies.length)
    for (const milestone of path.milestones) {
      expect(screen.getByText(milestone.name)).toBeInTheDocument()
    }

    await user.click(screen.getByRole('button', { name: 'Close' }))
    // Only the card heading remains once the modal is dismissed
    expect(screen.getAllByText(path.name)).toHaveLength(1)
    expect(screen.queryByText('🛠️ Technology Skill Tree')).not.toBeInTheDocument()
  })

  it('starts every technology at zero progress for a new player', () => {
    renderSeededPage(<CareerPathPage />, { route: '/career-path', url: '/career-path' })

    // Each card shows "Your Progress" at 0%
    expect(screen.getAllByText('0%')).toHaveLength(CAREER_PATHS.length)
  })
})
