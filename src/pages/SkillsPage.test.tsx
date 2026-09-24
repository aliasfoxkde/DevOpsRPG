import { describe, it, expect, beforeEach } from 'vitest'
import { screen, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SkillsPage from './SkillsPage'
import { SKILL_TREES } from '@/data/skills'
import { allQuests } from '@/data/quests'
import { closestContainer, renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { renderGame } from '@/contexts/test-utils'
import { MemoryRouter } from 'react-router-dom'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import type { GameState } from '@/contexts/GameContext'

/** Seeds the default save with `overrides` applied on top of it. */
function seedWith(overrides: (base: GameState) => Partial<GameState>): void {
  const base = seedDefaultGame()
  localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify({ ...base, ...overrides(base) }))
}

/** Locates the skill card whose `<h3>` heading is `name`. */
function skillCard(name: string): HTMLElement {
  const heading = screen
    .getAllByText(name)
    .find((el) => el.tagName === 'H3' && el.closest('div.p-4.rounded-lg'))
  const card = heading?.closest('div.p-4.rounded-lg')
  if (!(card instanceof HTMLElement)) {
    throw new Error(`no skill card found for "${name}"`)
  }
  return card
}

/** The "Requires: …" hint row that mentions `name`. */
function requirementRow(name: string): HTMLElement {
  const row = screen
    .getAllByText('Requires:')
    .map((el) => el.parentElement)
    .find((el) => el?.textContent.includes(name))
  if (!(row instanceof HTMLElement)) {
    throw new Error(`no requirement hint found mentioning "${name}"`)
  }
  return row
}

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

  it('recommends one skill per tree while the hero has points to spend', () => {
    seedWith((base) => ({ character: { ...base.character, skillPoints: 3 } }))
    renderPage(<SkillsPage />)

    // The plural prompt is the third branch of the points copy
    expect(screen.getByText('Spend your points to unlock new abilities!')).toBeInTheDocument()

    // Every tree points at the first skill of its recommended path
    const hints = screen.getAllByText(/Recommended: Level up/)
    expect(hints).toHaveLength(SKILL_TREES.length)
    for (const tree of SKILL_TREES) {
      const firstOnPath = tree.skills.find((skill) => skill.id === tree.recommendedPath?.[0])
      if (!firstOnPath) throw new Error(`${tree.name} has no leading recommended skill`)
      expect(
        hints.some((hint) => hint.textContent.includes(firstOnPath.name)),
        `${tree.name} should recommend ${firstOnPath.name}`,
      ).toBe(true)
    }
  })

  it('opens a dependant skill once its prerequisite has been allocated', async () => {
    const user = userEvent.setup()
    seedWith((base) => ({ character: { ...base.character, skillPoints: 2 } }))
    renderPage(<SkillsPage />)

    // CI/CD Pipeline is locked behind Containerization: no upgrade button yet
    const lockedHint = requirementRow('Containerization')
    expect(lockedHint.querySelector('.text-red-400')).not.toBeNull()
    expect(skillCard('CI/CD Pipeline').className).toContain('grayscale')
    expect(
      within(skillCard('CI/CD Pipeline')).queryByRole('button', { name: '+1' }),
    ).not.toBeInTheDocument()

    // Spending the first point on Containerization satisfies the requirement
    const containerCard = skillCard('Containerization')
    await user.click(within(containerCard).getByRole('button', { name: '+1' }))

    expect(containerCard.className).toContain('border-blue-600/50')
    expect(requirementRow('Containerization').querySelector('.text-green-400')).not.toBeNull()

    const ciCdUpgrade = within(skillCard('CI/CD Pipeline')).getByRole('button', { name: '+1' })
    expect(ciCdUpgrade).toBeEnabled()

    // A second point lands on the freshly unlocked skill
    await user.click(ciCdUpgrade)
    expect(screen.getByText('+2% XP on Containerization quests')).toBeInTheDocument()
    expect(screen.getByText('+2% XP on CI/CD Pipeline quests')).toBeInTheDocument()
    expect(screen.getByText('Complete more quests to earn skill points!')).toBeInTheDocument()
    expect(within(skillCard('Containerization')).getByRole('button', { name: '+1' })).toBeDisabled()
  })

  it('banks quest XP as technology mastery and persists it', () => {
    const quest = allQuests.find((entry) => entry.id === 'quest_html_intro')
    if (!quest) throw new Error('quest_html_intro missing from allQuests')
    const getGame = renderGame(
      <MemoryRouter initialEntries={['/skills']}>
        <SkillsPage />
      </MemoryRouter>,
    )

    // A fresh hero has no technology XP yet
    expect(screen.getByText('Complete quests to earn technology XP!')).toBeInTheDocument()
    expect(screen.queryByText('Html')).not.toBeInTheDocument()

    act(() => {
      getGame().completeQuest(quest.id)
    })

    // The mastery grid lists the technology with its XP and level
    expect(screen.queryByText('Complete quests to earn technology XP!')).not.toBeInTheDocument()
    const masteryTile = closestContainer(screen.getByText('Html'), 'div.rounded-lg')
    expect(within(masteryTile).getByText('Lv 0')).toBeInTheDocument()
    expect(within(masteryTile).getByText(`${quest.xpReward} XP`)).toBeInTheDocument()

    // The quest log, and the XP it granted, survived a save round-trip
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME) ?? '{}') as GameState
    expect(stored.skillXp[quest.technologyId]).toBe(quest.xpReward)
    expect(stored.completedQuests).toHaveLength(1)
  })
})
