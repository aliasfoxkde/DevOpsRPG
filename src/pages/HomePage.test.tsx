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

    expect(screen.queryByText('🎮 Mini-Games')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Mini-Games/ }))

    // A level 1 hero has not unlocked the games yet
    // The hub header and its menu both carry the title
    expect(screen.getAllByRole('heading', { name: '🎮 Mini-Games' })).toHaveLength(2)
    expect(screen.getByText('🔒 Unlocks at Level 3 (Current: Level 1)')).toBeInTheDocument()
    expect(screen.getByText('Complete more quests to unlock mini-games!')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Back to Game' }))
    expect(screen.queryByText('🎮 Mini-Games')).not.toBeInTheDocument()
  })

  it('gates the realm preview behind the hero level and reports overall progress', () => {
    renderSeededPage(<HomePage />)

    // Foundations is open at level 1, the remaining four realms stay locked
    const openRealm = closestContainer(screen.getByText('Foundations'), 'div.relative')
    expect(within(openRealm).getByText('⭐')).toBeInTheDocument()
    const lockedRealm = closestContainer(screen.getByText('Scripts'), 'div.relative')
    expect(within(lockedRealm).getByText('🔒')).toBeInTheDocument()
    expect(within(lockedRealm).getByText('Lvl 5')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View World Map/ })).toHaveAttribute(
      'href',
      '/worldmap',
    )
  })

  it('shows the game showcase, community proof and quick links', () => {
    renderSeededPage(<HomePage />)

    expect(screen.getByText('🎮 More Learning Games')).toBeInTheDocument()
    expect(screen.getAllByText('Coming Soon').length).toBeGreaterThan(10)
    expect(screen.getByRole('link', { name: /Browse All Games/ })).toHaveAttribute('href', '/games')

    // A testimonial and a community stat prove the marketing sections render
    expect(screen.getByText('Sarah K.')).toBeInTheDocument()
    expect(screen.getByText('Frontend Dev')).toBeInTheDocument()
    expect(screen.getByText('10K+')).toBeInTheDocument()
    expect(screen.getByText('Active Learners')).toBeInTheDocument()

    // Tips and the built-with strip close out the page
    expect(screen.getByText('💡 Pro Tips')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    for (const link of screen.getAllByRole('link', { name: 'GitHub' })) {
      expect(link).toHaveAttribute('href', 'https://github.com/aliasfoxkde/DevOpsRPG')
    }
  })
})
