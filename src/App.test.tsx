import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, within, act, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { seedDefaultGame, closestContainer } from './pages/test-utils'
import { allQuests } from './data/quests'
import { BADGES } from './data/badges'
import { MILESTONES } from './data/milestones'
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

/** Overlays `overrides` on the already-seeded default save. */
function seedSave(overrides: Partial<GameState>): void {
  const raw = localStorage.getItem(STORAGE_KEYS.GAME)
  if (!raw) throw new Error('No seeded game state in localStorage')
  localStorage.setItem(
    STORAGE_KEYS.GAME,
    JSON.stringify({ ...(JSON.parse(raw) as GameState), ...overrides }),
  )
}

/** Reads a top-level field of the currently persisted save. */
function readSave(): GameState {
  const raw = localStorage.getItem(STORAGE_KEYS.GAME)
  if (!raw) throw new Error('No seeded game state in localStorage')
  return JSON.parse(raw) as GameState
}

/** The toast payload shape App exposes to the rest of the app. */
interface AppToast {
  id: string
  message: string
  type: 'milestone' | 'encouragement' | 'achievement' | 'levelup'
  icon?: string
  xpGained?: number
}

/** `window.addToast` is App's documented integration point for other UI. */
function globalAddToast(): (toast: AppToast) => void {
  const hook = (window as { addToast?: (toast: AppToast) => void }).addToast
  if (!hook) throw new Error('App did not expose window.addToast')
  return hook
}

/** jsdom has no canvas implementation; Confetti guards the missing context. */
function stubCanvasContext(): void {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    writable: true,
    value: vi.fn(() => null),
  })
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

describe('App global overlays', () => {
  beforeEach(() => {
    localStorage.clear()
    seedDefaultGame()
    setupMatchMediaMock()
    stubCanvasContext()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('announces freshly unlocked badges, fires confetti and drains the queue', async () => {
    const epic = BADGES.find((badge) => badge.rarity === 'epic')
    const common = BADGES.find((badge) => badge.rarity === 'common')
    if (!epic || !common) throw new Error('BADGES is missing an epic or a common entry')
    seedSave({ recentBadgeUnlocks: [epic, common] })
    // Frozen clock keeps the 5s auto-dismiss and the 3s confetti deterministic
    vi.useFakeTimers()
    // A route with no page keeps the chunk loader out of the setup
    renderAppAt('/no-such-dungeon')

    await act(async () => {
      await Promise.resolve()
    })

    // Both badges pop a toast carrying their icon
    const epicToast = closestContainer(
      screen.getByText(`🏅 Badge Unlocked: ${epic.name}!`),
      'div.top-20',
    )
    expect(within(epicToast).getByText(epic.icon)).toBeInTheDocument()
    const commonToast = closestContainer(
      screen.getByText(`🏅 Badge Unlocked: ${common.name}!`),
      'div.top-20',
    )
    expect(within(commonToast).getByText(common.icon)).toBeInTheDocument()

    // An epic unlock also raises the confetti canvas over the app
    const canvas = document.querySelector('canvas[aria-hidden="true"]')
    expect(canvas).not.toBeNull()

    // Dismissing one toast removes it after the 300ms exit transition
    fireEvent.click(within(epicToast).getByRole('button', { name: '×' }))
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(screen.queryByText(`🏅 Badge Unlocked: ${epic.name}!`)).not.toBeInTheDocument()
    expect(screen.getByText(`🏅 Badge Unlocked: ${common.name}!`)).toBeInTheDocument()

    // The confetti canvas is taken back down 3s after it was raised
    act(() => {
      vi.advanceTimersByTime(2_800)
    })
    expect(document.querySelector('canvas[aria-hidden="true"]')).toBeNull()
    expect(canvas).not.toBeNull()

    // The queue is cleared in the save so the toasts never replay
    expect(readSave().recentBadgeUnlocks).toHaveLength(0)
  })

  it('celebrates a reached milestone with the XP it awards', async () => {
    const milestone = MILESTONES[0]
    seedSave({ recentMilestoneUnlocks: [milestone] })
    renderAppAt('/no-such-dungeon')

    const toast = closestContainer(
      await screen.findByText(`🏆 Milestone Reached: ${milestone.title}!`),
      'div.top-20',
    )
    expect(within(toast).getByText('🏆')).toBeInTheDocument()
    expect(within(toast).getByText(`+${milestone.xpBonus} XP`)).toBeInTheDocument()
    await waitFor(
      () => {
        expect(readSave().recentMilestoneUnlocks).toHaveLength(0)
      },
      { timeout: 5_000 },
    )
  })

  it('renders toasts raised through the global window hook', async () => {
    renderAppAt('/no-such-dungeon')

    act(() => {
      globalAddToast()({
        id: 'hook-1',
        message: 'The pipeline is green again!',
        type: 'encouragement',
      })
    })

    // The encouragement type supplies its own default icon
    const toast = closestContainer(
      await screen.findByText('The pipeline is green again!'),
      'div.top-20',
    )
    expect(within(toast).getByText('💪')).toBeInTheDocument()
  })

  it('flashes the level-up celebration and retires it by itself', async () => {
    seedSave({ lastVictory: { xp: 60, levelUp: true, newLevel: 3 }, showVictory: false })
    vi.useFakeTimers()
    renderAppAt('/no-such-dungeon')

    // The victory payload promotes the level-up overlay
    await act(async () => {
      await Promise.resolve()
    })
    expect(screen.getByText('LEVEL UP!')).toBeInTheDocument()
    expect(screen.getByText('Keep going, hero!')).toBeInTheDocument()

    // The effect calls onComplete after 2.5s, which unmounts the overlay
    act(() => {
      vi.advanceTimersByTime(2_600)
    })
    expect(screen.queryByText('LEVEL UP!')).not.toBeInTheDocument()
  })

  it('celebrates a finished realm and dismisses it from the save', async () => {
    seedSave({ showRealmCompletion: 'foundations' })
    // Frozen clock: the modal's own 5s countdown cannot race the assertion
    vi.useFakeTimers()
    renderAppAt('/no-such-dungeon')

    await act(async () => {
      await Promise.resolve()
    })
    expect(screen.getByText('REALM COMPLETE!')).toBeInTheDocument()
    expect(screen.getByText('Village of Foundations')).toBeInTheDocument()
    expect(screen.getByText('Realm Completion Bonus XP!')).toBeInTheDocument()

    // The countdown button is the modal's manual way out
    fireEvent.click(screen.getByRole('button', { name: /Continue to Next Realm/ }))
    expect(screen.queryByText('REALM COMPLETE!')).not.toBeInTheDocument()

    await act(async () => {
      await Promise.resolve()
    })
    expect(readSave().showRealmCompletion).toBeNull()
  })

  it('walks a new hero through onboarding and saves their identity', async () => {
    const user = userEvent.setup()
    seedSave({ hasSeenOnboarding: false })
    renderAppAt('/')

    // Step 0: the name gate blocks an empty hero
    expect(
      await screen.findByRole('heading', { name: 'Welcome, Adventurer!' }, LAZY_ROUTE),
    ).toBeInTheDocument()
    const continueButton = screen.getByRole('button', { name: 'Continue →' })
    expect(continueButton).toBeDisabled()
    const nameInput = screen.getByPlaceholderText('Enter your name...')
    await user.type(nameInput, 'Rustblade')
    expect(nameInput).toHaveValue('Rustblade')
    await user.click(continueButton)

    // Step 1: pick a class from the four available paths
    expect(screen.getByRole('heading', { name: 'Choose Your Path' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Script Warrior/ }))
    await user.click(screen.getByRole('button', { name: 'Continue →' }))

    // Step 2: the summary echoes the choices before the run starts
    expect(screen.getByText(/Your journey begins/).textContent).toBe(
      'Your journey begins, Rustblade!',
    )
    expect(screen.getByText('Script Warrior')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '🚀 Begin Adventure!' }))

    // The wizard hands over to the real game with the chosen identity
    expect(screen.queryByText('Welcome, Adventurer!')).not.toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Welcome, Rustblade' }, LAZY_ROUTE),
    ).toBeInTheDocument()
    const save = readSave()
    expect(save.hasSeenOnboarding).toBe(true)
    expect(save.character.name).toBe('Rustblade')
    expect(save.character.class).toBe('Script Warrior')
  })

  it('catches a save that cannot be rendered and offers a retry', async () => {
    // A level stored as an object is not a valid React child
    const base = readSave()
    seedSave({ character: { ...base.character, level: { corrupted: true } as unknown as number } })
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      renderAppAt('/')

      expect(await screen.findByRole('alert', {}, LAZY_ROUTE)).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument()
      expect(screen.getByText(/Objects are not valid as a React child/)).toBeInTheDocument()

      // Retrying re-renders the same broken save, so the fallback stays up
      fireEvent.click(screen.getByRole('button', { name: 'Try Again' }))
      expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument()
    } finally {
      errorSpy.mockRestore()
    }
  })
})
