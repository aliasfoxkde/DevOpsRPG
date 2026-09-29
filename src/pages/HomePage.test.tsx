import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GameProvider } from '../contexts/GameContext'
import HomePage from './HomePage'
import { allQuests } from '../data/quests'
import { STORAGE_KEYS } from '../utils/gameUtils'
import { closestContainer, renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import type { GameState } from '../contexts/GameContext'

function renderWithRouter(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter>
        <GameProvider>{children}</GameProvider>
      </MemoryRouter>
    ),
  })
}

/** Seeds the default save with `overrides` applied on top of it. */
function seedWith(overrides: Partial<GameState>): void {
  const base = seedDefaultGame()
  localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify({ ...base, ...overrides }))
}

describe('HomePage', () => {
  it('renders character avatar', () => {
    renderWithRouter(<HomePage />)
    expect(document.querySelector('.animate-bounce')).toBeInTheDocument()
  })

  it('renders quest journal link', () => {
    renderWithRouter(<HomePage />)
    // Use getAllByText since "Quest Journal" appears in multiple places
    expect(screen.getAllByText('Quest Journal').length).toBeGreaterThan(0)
  })

  it('renders character sheet link', () => {
    renderWithRouter(<HomePage />)
    expect(screen.getByText('Character Sheet')).toBeInTheDocument()
  })

  it('renders realm preview', () => {
    renderWithRouter(<HomePage />)
    // Text includes emoji prefix: "⚔️ Your Journey" - use getAllByText and check first match
    const matches = screen.getAllByText(/Your Journey/i)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('shows every real mini-game as a deep link into the library', () => {
    renderWithRouter(<HomePage />)
    for (const gameName of ['Command Typer', 'Memory Match', 'Quiz Dash', 'Incident Response']) {
      expect(screen.getByText(gameName)).toBeInTheDocument()
    }
    // Nothing in the showcase is a tease - every card links to the library
    expect(screen.queryByText('Coming Soon')).not.toBeInTheDocument()
    const quizDash = screen.getByText('Quiz Dash').closest('a')
    expect(quizDash).toHaveAttribute('href', '/games')
  })

  it('renders chronicle section', () => {
    renderWithRouter(<HomePage />)
    expect(screen.getByText(/Chronicle/i)).toBeInTheDocument()
  })
})

describe('HomePage player state', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('greets the hero with the stats from the persisted save', () => {
    seedWith({
      character: {
        ...seedDefaultGame().character,
        name: 'Ironbeard',
        title: 'Pipeline Whisperer',
        level: 6,
        xp: 540,
        gold: 421,
        streakDays: 12,
      },
    })
    renderPage(<HomePage />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Welcome, Ironbeard' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Pipeline Whisperer')).toBeInTheDocument()
    expect(screen.getByText('Level 6')).toBeInTheDocument()
    expect(screen.getByText('540 XP Total')).toBeInTheDocument()
    expect(screen.getByText('🔥 12 Day Streak')).toBeInTheDocument()
    expect(screen.getByText('421')).toBeInTheDocument()
  })

  it('links the current quest from the hero banner and the quick actions', () => {
    const quest = allQuests.find((entry) => entry.id === 'quest_html_intro')
    if (!quest) throw new Error('quest_html_intro missing from allQuests')
    renderSeededPage(<HomePage />)

    expect(screen.getByText('⚔️ Your current quest awaits:')).toBeInTheDocument()
    // The hero banner and the quick-action card both deep-link to the quest
    const questLinks = screen.getAllByRole('link', { name: new RegExp(quest.title) })
    expect(questLinks).toHaveLength(2)
    const banner = questLinks.find((link) => link.textContent.includes(`+${quest.xpReward} XP`))
    if (!banner) throw new Error('no banner link advertising the quest XP reward')
    expect(banner).toHaveAttribute('href', `/quest/${quest.id}`)
    expect(within(banner).getByText(`+${quest.xpReward} XP`)).toBeInTheDocument()

    const battle = questLinks.find((link) => link.textContent.includes('Begin Battle'))
    if (!battle) throw new Error('no quick-action link offering to begin the battle')
    expect(battle).toHaveAttribute('href', `/quest/${quest.id}`)
    // The five skulls encode the difficulty; only the first is lit for level 1
    expect(within(battle).getAllByText('💀')).toHaveLength(5)
    expect(
      within(battle)
        .getAllByText('💀')
        .filter((skull) => skull.className.includes('text-red-400')),
    ).toHaveLength(quest.difficulty)
    expect(battle.textContent).toContain(`~${quest.estimatedMinutes} min`)
  })

  it('announces the equipped companion under the greeting', () => {
    seedWith({
      activeCompanion: {
        id: 'owl',
        name: 'Wise Owl',
        icon: '🦉',
        xpBonus: 0.05,
        goldBonus: 0,
        bondLevel: 1,
        totalQuestsCompleted: 0,
        evolvedForm: 'owl_elder',
        maxBondLevel: 10,
      },
    })
    renderPage(<HomePage />)

    expect(screen.getByText('🦉')).toBeInTheDocument()
    expect(screen.getByText('Wise Owl is with you!')).toBeInTheDocument()
  })

  it('opens the mini-game hub from the quick actions and closes it again', () => {
    renderSeededPage(<HomePage />)

    // The hub is closed: no modal heading (the footer's Game Systems link
    // legitimately carries the same words)
    expect(screen.queryByRole('heading', { name: '🎮 Mini-Games' })).not.toBeInTheDocument()
    // The quick-action button (the footer's Game Systems link also matches)
    fireEvent.click(screen.getByRole('button', { name: /Mini-Games/ }))

    // A level 1 hero has not unlocked the games yet
    // The hub header and its menu both carry the title
    expect(screen.getAllByRole('heading', { name: '🎮 Mini-Games' })).toHaveLength(2)
    expect(screen.getByText('🔒 Unlocks at Level 3 (Current: Level 1)')).toBeInTheDocument()
    expect(screen.getByText('Complete more quests to unlock mini-games!')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Back to Game' }))
    expect(screen.queryByRole('heading', { name: '🎮 Mini-Games' })).not.toBeInTheDocument()
  })

  it('gates the realm preview behind the hero level and reports overall progress', () => {
    renderSeededPage(<HomePage />)

    // The preview mirrors the world map data: real realm names, all six of them
    for (const realmName of ['Village of Foundations', 'Forest of Scripts']) {
      expect(screen.getByText(realmName)).toBeInTheDocument()
    }
    // Foundations is open at level 1, the level-5 realm stays locked
    const openRealm = closestContainer(screen.getByText('Village of Foundations'), 'div.relative')
    expect(within(openRealm).getByText('⭐')).toBeInTheDocument()
    const lockedRealm = closestContainer(screen.getByText('Forest of Scripts'), 'div.relative')
    expect(within(lockedRealm).getByText('🔒')).toBeInTheDocument()
    expect(within(lockedRealm).getByText('Lvl 5')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View World Map/ })).toHaveAttribute(
      'href',
      '/worldmap',
    )
  })

  it('marks a realm completed once the save records it', () => {
    seedWith({
      character: { ...seedDefaultGame().character, level: 8 },
      completedRealms: ['foundations'],
    })
    renderPage(<HomePage />)

    const doneRealm = closestContainer(screen.getByText('Village of Foundations'), 'div.relative')
    expect(within(doneRealm).getByText('✅')).toBeInTheDocument()
    // Level 8 opens the next realm too, but it is not finished yet
    const openRealm = closestContainer(screen.getByText('Forest of Scripts'), 'div.relative')
    expect(within(openRealm).getByText('⭐')).toBeInTheDocument()
  })

  it('shows the game showcase, real catalog stats and quick links', () => {
    renderSeededPage(<HomePage />)

    expect(screen.getByText('🎮 More Learning Games')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Browse All Games/ })).toHaveAttribute('href', '/games')

    // The catalog numbers come from the real content data, not marketing copy
    expect(screen.getByText('📊 Inside DevOpsQuest')).toBeInTheDocument()
    const statsSection = closestContainer(
      screen.getByText('📊 Inside DevOpsQuest'),
      'section',
    )
    expect(within(statsSection).getByText('Technologies')).toBeInTheDocument()
    expect(within(statsSection).getByText('Quests')).toBeInTheDocument()
    expect(within(statsSection).getByText('Realms')).toBeInTheDocument()
    expect(within(statsSection).getByText('Mini-Games')).toBeInTheDocument()
    // No invented community numbers survive
    expect(screen.queryByText('10K+')).not.toBeInTheDocument()
    expect(screen.queryByText('Sarah K.')).not.toBeInTheDocument()
    expect(screen.queryByText(/Join thousands/)).not.toBeInTheDocument()

    // Tips and the built-with strip close out the page
    expect(screen.getByText('💡 Pro Tips')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    for (const link of screen.getAllByRole('link', { name: 'GitHub' })) {
      expect(link).toHaveAttribute('href', 'https://github.com/aliasfoxkde/DevOpsRPG')
    }
  })
})
