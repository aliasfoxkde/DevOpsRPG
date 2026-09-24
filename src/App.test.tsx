import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { seedDefaultGame } from './pages/test-utils'
import { allQuests } from './data/quests'
import { STORAGE_KEYS } from './utils/gameUtils'
import type { GameState } from './contexts/GameContext'

/**
 * The route pages are `lazy()` chunks, so their first render in a worker waits
 * on a real dynamic import. The Testing Library default of 1s is not enough
 * for that cold load, hence this generous poll window.
 */
const LAZY_ROUTE = { timeout: 10_000 }

// Mock matchMedia for ThemeContext
function setupMatchMediaMock() {
  const matchMedia = vi.fn((query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }))
  Object.defineProperty(window, 'matchMedia', { writable: true, value: matchMedia })
}

/** Mounts the real component tree (providers + lazy routes) at `path`. */
function renderAppAt(path: string) {
  return render(<App />, {
    wrapper: ({ children }) => <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>,
  })
}

/**
 * Every route registered in src/App.tsx and the level-1 heading only that
 * page renders. A lazy chunk that fails to load, a typo'd path or a swapped
 * element makes the matching entry fail.
 */
const ROUTE_HEADINGS: ReadonlyArray<{ path: string; heading: string }> = [
  { path: '/', heading: 'Welcome, Hero' },
  { path: '/quests', heading: 'Quest Journal' },
  { path: '/character', heading: '👤 Character Sheet' },
  { path: '/profile', heading: '📜 Hero Profile' },
  { path: '/rewards', heading: '🎁 Rewards Hub' },
  { path: '/sidequests', heading: '📜 Side Quests' },
  { path: '/challenges', heading: '🎯 Challenges' },
  { path: '/skills', heading: 'Skill Tree' },
  { path: '/worldmap', heading: '🗺️ Realm of DevOps' },
  { path: '/leaderboard', heading: '🏆 Leaderboard' },
  { path: '/badges', heading: '🎖️ Badge Collection' },
  { path: '/milestones', heading: '🏆 Milestones' },
  { path: '/about', heading: 'DevOpsQuest' },
  { path: '/faq', heading: '❓ Frequently Asked Questions' },
  { path: '/privacy-policy', heading: '🔒 Privacy Policy' },
  { path: '/games', heading: '🎮 Game Library' },
  { path: '/store', heading: '🏪 Quest Shop' },
  { path: '/settings', heading: '⚙️ Settings' },
  { path: '/analytics', heading: '📊 Learning Analytics' },
  { path: '/titles-frames', heading: '🏅 Titles & Frames' },
  { path: '/seasonal-events', heading: '🎭 Seasonal Events' },
  { path: '/pvp-arena', heading: '⚔️ PvP Arena' },
  { path: '/social', heading: '👥 Social Hub' },
  { path: '/guild', heading: '🏰 Guild Hall' },
  { path: '/career-path', heading: '🗺️ Career Paths' },
  { path: '/storylines', heading: '📖 Story Quests' },
  { path: '/technology-collection', heading: '📚 Technology Collection' },
  { path: '/certifications', heading: '🏆 Certifications' },
  { path: '/marketplace', heading: '🏪 Marketplace' },
  { path: '/feedback', heading: '📝 Submit Feedback' },
]

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear()
    seedDefaultGame()
    setupMatchMediaMock()
  })

  it.each(ROUTE_HEADINGS)('mounts $path on the $heading page', async ({ path, heading }) => {
    renderAppAt(path)

    // Lazy routes resolve through Suspense, hence the async query
    expect(
      await screen.findByRole('heading', { level: 1, name: heading }, LAZY_ROUTE),
    ).toBeInTheDocument()
  })

  it('mounts the battle arena for a real quest slug', async () => {
    const quest = allQuests.find((entry) => entry.id === 'quest_html_intro')
    if (!quest) throw new Error('quest_html_intro missing from allQuests')
    renderAppAt(`/quest/${quest.id}`)

    expect(
      await screen.findByRole('heading', { level: 1, name: 'HTML Introduction' }, LAZY_ROUTE),
    ).toBeInTheDocument()
    expect(await screen.findByText('📋 Intel Briefing', {}, LAZY_ROUTE)).toBeInTheDocument()
  })

  it('keeps the app shell mounted on an unregistered path', () => {
    renderAppAt('/no-such-dungeon')

    // No route matches, so no page is projected into the Layout outlet
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    // ...but the global HUD and its home link still render
    expect(screen.getByRole('link', { name: /DevOpsQuest/ })).toHaveAttribute('href', '/')
  })

  it('hydrates the HUD from the persisted save instead of the defaults', async () => {
    const raw = localStorage.getItem(STORAGE_KEYS.GAME)
    if (!raw) throw new Error('No seeded game state in localStorage')
    const game = JSON.parse(raw) as GameState
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...game,
        character: { ...game.character, name: 'Ironbeard', xp: 320, gold: 777 },
      }),
    )
    renderAppAt('/no-such-dungeon')

    // The compact XP bar and the gold stat both read the seeded save
    expect(await screen.findByText('⚡320', {}, LAZY_ROUTE)).toBeInTheDocument()
    expect(screen.getByText('LV 1')).toBeInTheDocument()
    expect(screen.getByTitle('💰 777 gold - Spend it in the Shop!')).toBeInTheDocument()
  })
})
