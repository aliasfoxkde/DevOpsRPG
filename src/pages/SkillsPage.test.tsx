import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SkillsPage from './SkillsPage'
import { SKILL_TREES } from '@/data/skills'
import { renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { STORAGE_KEYS } from '@/utils/gameUtils'

describe('SkillsPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the skill tree heading and points prompt', () => {
    renderSeededPage(<SkillsPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Skill Tree' })).toBeInTheDocument()
    expect(
      screen.getByText('Spend skill points to unlock abilities and enhance your powers'),
    ).toBeInTheDocument()
    expect(screen.getByText('Skill Points Available')).toBeInTheDocument()
  })

  it('renders every skill tree and its skills', () => {
    renderSeededPage(<SkillsPage />)
    for (const tree of SKILL_TREES) {
      expect(screen.getByRole('heading', { level: 2, name: tree.name })).toBeInTheDocument()
      for (const skill of tree.skills) {
        // A skill name can also appear in requirement hints, so allow repeats
        expect(screen.getAllByText(skill.name).length).toBeGreaterThan(0)
      }
    }
  })

  it('tells a new player they have no points and disables every upgrade', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<SkillsPage />)

    expect(character.skillPoints).toBe(0)
    expect(screen.getByText('Complete more quests to earn skill points!')).toBeInTheDocument()
    const upgradeButtons = screen.getAllByRole('button', { name: '+1' })
    expect(upgradeButtons.length).toBeGreaterThan(0)
    for (const button of upgradeButtons) {
      expect(button).toBeDisabled()
    }
  })

  it('spends an available skill point and surfaces the new active bonus', async () => {
    const user = userEvent.setup()
    const game = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({ ...game, character: { ...game.character, skillPoints: 1 } }),
    )
    renderPage(<SkillsPage />)

    expect(screen.getByText('Spend your point to unlock a new ability!')).toBeInTheDocument()
    // Nothing allocated yet, so the bonuses panel is hidden
    expect(screen.queryByText('Active Skill Bonuses')).not.toBeInTheDocument()

    const upgradeButton = screen
      .getAllByRole('button', { name: '+1' })
      .find((button) => !button.hasAttribute('disabled'))
    expect(upgradeButton).toBeDefined()
    await user.click(upgradeButton as HTMLButtonElement)

    // The allocation is reflected in the Active Skill Bonuses panel
    // (tech skills grant +2% XP per level) and the point pool is drained
    expect(screen.getByText('Active Skill Bonuses')).toBeInTheDocument()
    expect(screen.getByText('+2% XP on Containerization quests')).toBeInTheDocument()
    expect(screen.getByText('Complete more quests to earn skill points!')).toBeInTheDocument()
  })

  it('marks skills whose requirements are not met as locked', () => {
    renderSeededPage(<SkillsPage />)
    const lockedBadges = screen.getAllByText(/Locked/)
    expect(lockedBadges.length).toBeGreaterThan(0)
  })
})
