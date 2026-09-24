import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { act, fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SettingsPage from './SettingsPage'
import { closestContainer, renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { STORAGE_KEYS, calculateLevel } from '@/utils/gameUtils'
import type { GameState } from '@/contexts/GameContext'
import { allQuests } from '@/data/quests'

// jsdom does not implement the Web Speech API. SettingsPage always mounts the
// <VoiceSettings /> panel, whose `useVoiceNarration` hook touches
// `window.speechSynthesis` inside an effect. Without a stub the page cannot
// render at all in tests, so provide the smallest possible fake: enough
// surface for the hook (getVoices / onvoiceschanged / speak / cancel) and no
// real audio behaviour. Defining it also flips the hook's `isSupported` check
// (`'speechSynthesis' in window`), which is exactly the code path browsers take.
beforeAll(() => {
  // jsdom has no matchMedia either. Selecting the "System" appearance makes
  // ThemeContext resolve the OS preference, so give it a stable answer
  // (light) rather than letting the page crash on a missing API.
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
    })),
  })

  if (!('speechSynthesis' in window)) {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => [],
        speak: () => {},
        cancel: () => {},
        onvoiceschanged: null,
      },
    })
  }

  // jsdom has no object-URL (download) implementation either, so capture the
  // blob the export handler hands to the browser instead of a real file. The
  // URL is a same-document hash so jsdom does not attempt a real navigation.
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: (blob: Blob) => {
      exportedBlob = blob
      return '#devopsquest-export'
    },
  })
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: () => {} })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

/** The blob produced by the last export click, captured by the jsdom stub. */
let exportedBlob: Blob | null = null

/**
 * Seeds a save with distinctive, internally consistent progress: 320 XP puts
 * the hero on level 3 of the real XP curve, with gold, streak, quests and a
 * single unlocked badge to read back off the statistics grid.
 */
function seedProgressGame(): GameState {
  const defaults = seedDefaultGame()
  const seeded: GameState = {
    ...defaults,
    character: {
      ...defaults.character,
      xp: 320,
      level: calculateLevel(320),
      gold: 1234,
      streakDays: 5,
    },
    completedQuests: allQuests.slice(0, 2).map((quest) => ({
      topicId: quest.topicId,
      technologyId: quest.technologyId,
      questId: quest.id,
      completed: true,
      xpEarned: quest.xpReward,
      completedAt: new Date().toISOString(),
    })),
    badges: defaults.badges.map((badge, index) =>
      index === 0 ? { ...badge, unlockedAt: new Date().toISOString() } : badge,
    ),
  }
  localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(seeded))
  return seeded
}

/**
 * Renders the settings page against an explicitly seeded save. `renderSeededPage`
 * cannot be used here: it re-seeds the default state and would wipe the custom
 * progress this suite asserts on.
 */
function renderProgressPage(): GameState {
  const seeded = seedProgressGame()
  renderPage(<SettingsPage />, { route: '/settings', url: '/settings' })
  return seeded
}

/** Reads the number of the statistics cell labelled `label` (label excluded). */
function statValue(label: string): string {
  const cell = closestContainer(screen.getByText(label), '.rounded-lg')
  const value = cell.firstElementChild
  if (!(value instanceof HTMLElement)) {
    throw new Error(`Statistic cell for "${label}" has no value element`)
  }
  return value.textContent
}

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the settings heading and every section', () => {
    renderSeededPage(<SettingsPage />, { route: '/settings', url: '/settings' })

    expect(screen.getByRole('heading', { level: 1, name: /Settings/ })).toBeInTheDocument()
    for (const section of [
      '🎨 Appearance',
      '🔊 Sound',
      '📊 Game Statistics',
      '💾 Data Management',
      '⚠️ Danger Zone',
    ]) {
      expect(screen.getByText(section)).toBeInTheDocument()
    }
    expect(screen.getByRole('heading', { name: /Voice Narration/ })).toBeInTheDocument()
  })

  it('has dark selected as the default appearance', () => {
    renderSeededPage(<SettingsPage />, { route: '/settings', url: '/settings' })

    // The radio inputs sit inside labels that carry the visible mode name
    expect(screen.getByRole('radio', { name: /Dark Mode/ })).toBeChecked()
    expect(screen.getByRole('radio', { name: /Light Mode/ })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: /System/ })).not.toBeChecked()
    expect(screen.getByText('Current:')).toHaveTextContent('dark')
  })

  it('switches the theme when another appearance option is picked', async () => {
    const user = userEvent.setup()
    renderSeededPage(<SettingsPage />, { route: '/settings', url: '/settings' })

    await user.click(screen.getByRole('radio', { name: /Light Mode/ }))

    expect(screen.getByRole('radio', { name: /Light Mode/ })).toBeChecked()
    expect(screen.getByRole('radio', { name: /Dark Mode/ })).not.toBeChecked()
    // The resolved theme line follows the new selection
    expect(screen.getByText('Current:')).toHaveTextContent('light')
    // ThemeContext persists the choice for the next visit
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('toggles the sound effects switch and stores the preference', async () => {
    const user = userEvent.setup()
    renderSeededPage(<SettingsPage />, { route: '/settings', url: '/settings' })

    const soundSwitch = screen.getByRole('switch', { name: 'Sound effects' })
    const before = soundSwitch.getAttribute('aria-checked')

    await user.click(soundSwitch)

    const after = before === 'true' ? 'false' : 'true'
    expect(screen.getByRole('switch', { name: 'Sound effects' })).toHaveAttribute(
      'aria-checked',
      after,
    )
    // The mute preference is persisted for the next session
    expect(localStorage.getItem('soundEnabled')).toBe(after)
  })

  it('enables voice narration from the voice settings panel', async () => {
    const user = userEvent.setup()
    renderSeededPage(<SettingsPage />, { route: '/settings', url: '/settings' })

    // Narration starts off for a fresh account
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Disabled' }))

    expect(screen.getByRole('button', { name: 'Enabled' })).toBeInTheDocument()
    // Turning narration on reveals the test-voice controls
    expect(screen.getByText('Test Voice')).toBeInTheDocument()
    const storedVoiceSettings: unknown = JSON.parse(
      localStorage.getItem('devopsquest_voice_settings') ?? '{}',
    )
    expect(storedVoiceSettings).toMatchObject({
      enabled: true,
    })
  })

  it('reveals the import textarea from the data management section', async () => {
    const user = userEvent.setup()
    renderSeededPage(<SettingsPage />, { route: '/settings', url: '/settings' })

    expect(screen.queryByPlaceholderText('Paste your backup JSON here...')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Import/ }))

    expect(screen.getByPlaceholderText('Paste your backup JSON here...')).toBeInTheDocument()
    // Empty input means there is nothing valid to restore yet
    expect(screen.getByRole('button', { name: 'Restore Backup' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('shows the current character stats', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<SettingsPage />, { route: '/settings', url: '/settings' })

    expect(screen.getByText('Total XP')).toBeInTheDocument()
    expect(screen.getByText('Quests')).toBeInTheDocument()
    expect(screen.getByText('Day Streak 🔥')).toBeInTheDocument()
    expect(screen.getByText(String(character.level))).toBeInTheDocument()
    expect(character.level).toBe(1)
  })

  it('reads every statistic straight out of the stored save', () => {
    const seeded = renderProgressPage()

    expect(statValue('Level')).toBe(String(seeded.character.level))
    expect(statValue('Total XP')).toBe('320')
    expect(statValue('Gold')).toBe('1234')
    expect(statValue('Quests')).toBe('2')
    // Exactly one badge entry carries an unlock timestamp
    expect(statValue('Badges')).toBe('1')
    expect(statValue('Day Streak 🔥')).toBe('5')
  })

  it('exports the stored progress as a JSON download', async () => {
    const user = userEvent.setup()
    // jsdom cannot follow the generated download link, so silence its warning
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const seeded = renderProgressPage()

    await user.click(screen.getByRole('button', { name: /Export/ }))

    if (!exportedBlob) throw new Error('Export did not produce a download blob')
    const payload: unknown = JSON.parse(await exportedBlob.text())
    expect(payload).toMatchObject({
      version: '1.0.0',
      character: {
        name: seeded.character.name,
        level: seeded.character.level,
        xp: 320,
        gold: 1234,
      },
      // Quest history is exported verbatim, keyed by quest and topic
      completedQuests: allQuests.slice(0, 2).map((quest) => ({
        questId: quest.id,
        topicId: quest.topicId,
        technologyId: quest.technologyId,
        xpEarned: quest.xpReward,
      })),
    })
    // Locked badges are stripped from the backup, leaving only the unlocked one
    const badges = (payload as { badges: Array<{ id: string; unlockedAt: string | null }> }).badges
    expect(badges).toHaveLength(1)
    expect(badges[0].id).toBe(seeded.badges.find((badge) => badge.unlockedAt)?.id)
  })

  it('restores a valid backup and reports success', () => {
    vi.useFakeTimers()
    renderSeededPage(<SettingsPage />, { route: '/settings', url: '/settings' })

    fireEvent.click(screen.getByRole('button', { name: /Import/ }))
    fireEvent.change(screen.getByPlaceholderText('Paste your backup JSON here...'), {
      target: {
        value: JSON.stringify({
          version: '1.0.0',
          exportedAt: '2026-01-01T00:00:00.000Z',
          character: { name: 'Imported Hero', level: 7, xp: 900, gold: 250 },
          completedQuests: [{ id: 'quest_html_intro' }, { id: 'quest_css_intro' }],
          badges: [{ id: 'first_quest', unlockedAt: '2026-01-02T00:00:00.000Z' }],
          companions: [],
          stats: {},
        }),
      },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Restore Backup' }))

    expect(screen.getByText('✓ Import successful! Reloading...')).toBeInTheDocument()
    // The sanitized backup is staged for the reload that follows
    const staged: unknown = JSON.parse(localStorage.getItem('devopsquest-import') ?? 'null')
    expect(staged).toMatchObject({
      version: '1.0.0',
      character: { name: 'Imported Hero', level: 7, xp: 900, gold: 250 },
      completedQuests: [{ id: 'quest_html_intro' }, { id: 'quest_css_intro' }],
    })
  })

  it('rejects a backup file that is missing its version', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    renderSeededPage(<SettingsPage />, { route: '/settings', url: '/settings' })

    fireEvent.click(screen.getByRole('button', { name: /Import/ }))
    fireEvent.change(screen.getByPlaceholderText('Paste your backup JSON here...'), {
      target: {
        value: JSON.stringify({ character: { name: 'Broken' }, completedQuests: [], badges: [] }),
      },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Restore Backup' }))

    expect(screen.getByText('✗ Invalid backup file')).toBeInTheDocument()
    expect(screen.queryByText(/Import successful/)).not.toBeInTheDocument()
    // Nothing was staged, so the live save is untouched
    expect(localStorage.getItem('devopsquest-import')).toBeNull()
    expect(errorSpy).toHaveBeenCalled()
  })

  it('keeps the save intact when the reset is cancelled at either confirmation', () => {
    seedDefaultGame()
    renderPage(<SettingsPage />, { route: '/settings', url: '/settings' })

    // Backing out of the first dialog stops there
    const firstDecline = vi.fn<(message: string) => boolean>().mockReturnValueOnce(false)
    vi.stubGlobal('confirm', firstDecline)
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(firstDecline).toHaveBeenCalledTimes(1)
    expect(firstDecline.mock.calls[0][0]).toContain('reset ALL your progress')

    // Accepting the first but refusing the second also keeps everything
    const secondDecline = vi
      .fn<(message: string) => boolean>()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
    vi.stubGlobal('confirm', secondDecline)
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(secondDecline).toHaveBeenCalledTimes(2)
    expect(secondDecline.mock.calls[1][0]).toContain('You will lose everything')
    expect(localStorage.getItem(STORAGE_KEYS.GAME)).not.toBeNull()
  })

  it('wipes all stored progress once both confirmations are accepted', () => {
    seedDefaultGame()
    renderPage(<SettingsPage />, { route: '/settings', url: '/settings' })
    // jsdom cannot reload the document, so swallow its navigation warning
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal(
      'confirm',
      vi.fn<() => boolean>().mockReturnValueOnce(true).mockReturnValueOnce(true),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))

    expect(localStorage.getItem(STORAGE_KEYS.GAME)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.BACKUP)).toBeNull()
  })

  it('resolves the system appearance from the OS preference', async () => {
    const user = userEvent.setup()
    renderSeededPage(<SettingsPage />, { route: '/settings', url: '/settings' })

    await user.click(screen.getByRole('radio', { name: /System/ }))

    expect(screen.getByRole('radio', { name: /System/ })).toBeChecked()
    expect(screen.getByRole('radio', { name: /Dark Mode/ })).not.toBeChecked()
    expect(localStorage.getItem('theme')).toBe('system')
    // The stubbed media query reports light, so that is what gets resolved
    expect(screen.getByText('Current:')).toHaveTextContent('light')

    // ...and picking Dark explicitly wins over the OS setting again
    await user.click(screen.getByRole('radio', { name: /Dark Mode/ }))
    expect(screen.getByRole('radio', { name: /Dark Mode/ })).toBeChecked()
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(screen.getByText('Current:')).toHaveTextContent('dark')
  })

  it('plays the confirmation sound while sound effects are enabled', async () => {
    const user = userEvent.setup()
    // The app starts muted; opting in is what makes the click sound fire
    localStorage.setItem('soundEnabled', 'true')
    renderPage(<SettingsPage />, { route: '/settings', url: '/settings' })

    expect(screen.getByRole('switch', { name: 'Sound effects' })).toHaveAttribute(
      'aria-checked',
      'true',
    )

    await user.click(screen.getByRole('switch', { name: 'Sound effects' }))

    expect(screen.getByRole('switch', { name: 'Sound effects' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
    expect(screen.getByText('🔇')).toBeInTheDocument()
    expect(localStorage.getItem('soundEnabled')).toBe('false')
  })

  it('reloads the page once a restored backup has been staged', async () => {
    vi.useFakeTimers()
    renderSeededPage(<SettingsPage />, { route: '/settings', url: '/settings' })

    fireEvent.click(screen.getByRole('button', { name: /Import/ }))
    fireEvent.change(screen.getByPlaceholderText('Paste your backup JSON here...'), {
      target: {
        value: JSON.stringify({
          version: '1.0.0',
          character: { name: 'Reloaded Hero', level: 3, xp: 300, gold: 90 },
          completedQuests: [],
          badges: [],
          companions: [],
          stats: {},
        }),
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Restore Backup' }))

    expect(screen.getByText('✓ Import successful! Reloading...')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('devopsquest-import') ?? 'null')).toMatchObject({
      character: { name: 'Reloaded Hero' },
    })

    // The reload is deferred a second so the player can read the confirmation.
    // jsdom cannot reload a document, so the call itself is unobservable here;
    // what matters is that the staged save survives until it happens.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(JSON.parse(localStorage.getItem('devopsquest-import') ?? 'null')).toMatchObject({
      character: { name: 'Reloaded Hero' },
    })
    expect(screen.getByText('✓ Import successful! Reloading...')).toBeInTheDocument()
  })
})
