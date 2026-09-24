import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilePage from './ProfilePage'
import { BADGES } from '@/data/badges'
import { MILESTONES } from '@/data/milestones'
import { renderSeededPage, seedDefaultGame } from './test-utils'

describe('ProfilePage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the profile heading and character summary', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<ProfilePage />, { route: '/profile', url: '/profile' })

    expect(screen.getByRole('heading', { level: 1, name: /Hero Profile/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: character.name })).toBeInTheDocument()
    expect(screen.getByText(`Level ${character.level} ${character.class}`)).toBeInTheDocument()
  })

  it('summarises quest, badge, milestone and collectible counts', () => {
    const { completedQuests, collectibles } = seedDefaultGame()
    renderSeededPage(<ProfilePage />, { route: '/profile', url: '/profile' })

    expect(completedQuests).toHaveLength(0)
    expect(collectibles).toHaveLength(0)
    expect(screen.getByText('Quests Completed')).toBeInTheDocument()
    expect(screen.getByText(`0/${BADGES.length}`)).toBeInTheDocument()
    expect(screen.getByText(`0/${MILESTONES.length}`)).toBeInTheDocument()
    expect(screen.getByText('Collectibles')).toBeInTheDocument()
  })

  it('lists every badge grouped by rarity with locked styling', () => {
    const { badges } = seedDefaultGame()
    renderSeededPage(<ProfilePage />, { route: '/profile', url: '/profile' })

    expect(badges).toHaveLength(BADGES.length)
    for (const rarity of ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common']) {
      // Headings include the unlock count, e.g. "Epic (0/12)"
      expect(screen.getAllByText(new RegExp(`^${rarity} \\(`)).length).toBeGreaterThan(0)
    }
    // Locked badges show a lock overlay
    expect(screen.getAllByText('🔒').length).toBe(BADGES.length)
  })

  it('lists every milestone with its XP bonus while locked', () => {
    const { milestones } = seedDefaultGame()
    renderSeededPage(<ProfilePage />, { route: '/profile', url: '/profile' })

    expect(milestones).toHaveLength(MILESTONES.length)
    for (const milestone of MILESTONES) {
      // A badge can share a milestone's title, so allow repeats
      expect(screen.getAllByText(milestone.title).length).toBeGreaterThan(0)
      expect(screen.getAllByText(`+${milestone.xpBonus} XP`).length).toBeGreaterThan(0)
    }
  })

  it('toggles the sound effects switch', async () => {
    const user = userEvent.setup()
    renderSeededPage(<ProfilePage />, { route: '/profile', url: '/profile' })

    expect(screen.getByRole('heading', { name: 'Sound Effects' })).toBeInTheDocument()
    const toggle = screen.getByRole('button')
    const knobBefore = toggle.firstChild as HTMLElement
    const classBefore = knobBefore.className

    await user.click(toggle)

    const knobAfter = screen.getByRole('button').firstChild as HTMLElement
    expect(knobAfter.className).not.toBe(classBefore)
    // The two knob positions are mutually exclusive
    expect(knobAfter.className).toMatch(/left-1|translate-x-8/)
  })
})
