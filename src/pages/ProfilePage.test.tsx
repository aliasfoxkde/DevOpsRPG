import { describe, it, expect, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilePage from './ProfilePage'
import { BADGES } from '@/data/badges'
import { MILESTONES } from '@/data/milestones'
import { COLLECTIBLES_POOL } from '@/data/collectibles'
import { XP_PER_LEVEL } from '@/utils/gameUtils'
import { closestContainer, renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import type { GameState } from '@/contexts/GameContext'

/** Seeds the default save with `overrides` applied on top of it. */
function seedWith(overrides: Partial<GameState>): GameState {
  const base = seedDefaultGame()
  const merged = { ...base, ...overrides }
  localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(merged))
  return merged
}

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
    const toggle = screen.getByRole('switch', { name: 'Sound effects' })
    const checkedBefore = toggle.getAttribute('aria-checked')
    const knobBefore = toggle.firstChild as HTMLElement
    const classBefore = knobBefore.className

    await user.click(toggle)

    const knobAfter = screen.getByRole('switch', { name: 'Sound effects' })
    expect(knobAfter.getAttribute('aria-checked')).toBe(checkedBefore === 'true' ? 'false' : 'true')
    expect((knobAfter.firstChild as HTMLElement).className).not.toBe(classBefore)
    // The two knob positions are mutually exclusive
    expect((knobAfter.firstChild as HTMLElement).className).toMatch(/left-1|translate-x-8/)
  })

  it('remembers an unmuted player and mutes them on toggle', async () => {
    const user = userEvent.setup()
    // The hook reads its opt-in flag from localStorage on mount
    localStorage.setItem('soundEnabled', 'true')
    renderPage(<ProfilePage />, { route: '/profile', url: '/profile' })

    const knob = screen.getByRole('switch', { name: 'Sound effects' }).firstChild as HTMLElement
    expect(knob.className).toContain('translate-x-8')

    await user.click(screen.getByRole('switch', { name: 'Sound effects' }))

    expect(
      (screen.getByRole('switch', { name: 'Sound effects' }).firstChild as HTMLElement).className,
    ).toContain('left-1')
    expect(localStorage.getItem('soundEnabled')).toBe('false')
  })

  it('counts only unused collectibles as owned', () => {
    const [first, second] = COLLECTIBLES_POOL
    seedWith({
      collectibles: [
        { ...first, used: false },
        { ...second, used: true },
      ],
    })
    renderPage(<ProfilePage />, { route: '/profile', url: '/profile' })

    expect(screen.getByText('Collectibles').previousElementSibling).toHaveTextContent('1')
  })

  it('shows the level progress earned inside the current level', () => {
    // 320 XP at 100 XP per level puts the hero on level 4 with 20 XP banked
    seedWith({ character: { ...seedDefaultGame().character, xp: 320, level: 4 } })
    renderPage(<ProfilePage />, { route: '/profile', url: '/profile' })

    expect(screen.getByText('320')).toBeInTheDocument()
    expect(screen.getByText('Level 4')).toBeInTheDocument()
    expect(screen.getByText(`20 / ${XP_PER_LEVEL} XP`)).toBeInTheDocument()
  })

  it('marks an unlocked badge and an unlocked milestone as claimed', () => {
    // Badge and milestone titles overlap, so pick entries with unique names
    const badge = BADGES.find((entry) => !MILESTONES.some((m) => m.title === entry.name))
    if (!badge) throw new Error('no badge with a title unique to BADGES')
    const milestone = MILESTONES.find((entry) => !BADGES.some((b) => b.name === entry.title))
    if (!milestone) throw new Error('no milestone with a title unique to MILESTONES')

    seedWith({
      badges: BADGES.map((entry) =>
        entry.id === badge.id ? { ...entry, unlockedAt: new Date().toISOString() } : entry,
      ),
      milestones: MILESTONES.map((entry) =>
        entry.id === milestone.id ? { ...entry, unlocked: true } : entry,
      ),
    })
    renderPage(<ProfilePage />, { route: '/profile', url: '/profile' })

    // Summary tiles move off zero
    expect(screen.getByText('Badges Earned').previousElementSibling).toHaveTextContent(
      `1/${BADGES.length}`,
    )
    const milestoneCounter = screen
      .getAllByText('Milestones')
      .map((el) => el.previousElementSibling?.textContent)
      .find((text) => text === `1/${MILESTONES.length}`)
    expect(milestoneCounter).toBeDefined()

    // The earned badge drops its lock overlay for a completion check
    const badgeCard = closestContainer(screen.getByText(badge.name), 'div.relative')
    expect(within(badgeCard).getByText('✓')).toBeInTheDocument()
    expect(within(badgeCard).queryByText('🔒')).not.toBeInTheDocument()

    // The reached milestone no longer advertises its XP bonus
    const milestoneCard = closestContainer(screen.getAllByText(milestone.title)[0], 'div.p-4')
    expect(within(milestoneCard).getByText('✓')).toBeInTheDocument()
    expect(within(milestoneCard).queryByText(`+${milestone.xpBonus} XP`)).not.toBeInTheDocument()
  })
})
