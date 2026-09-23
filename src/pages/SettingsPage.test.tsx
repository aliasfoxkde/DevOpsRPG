import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SettingsPage from './SettingsPage'
import { renderSeededPage, seedDefaultGame } from './test-utils'

// jsdom does not implement the Web Speech API. SettingsPage always mounts the
// <VoiceSettings /> panel, whose `useVoiceNarration` hook touches
// `window.speechSynthesis` inside an effect. Without a stub the page cannot
// render at all in tests, so provide the smallest possible fake: enough
// surface for the hook (getVoices / onvoiceschanged / speak / cancel) and no
// real audio behaviour. Defining it also flips the hook's `isSupported` check
// (`'speechSynthesis' in window`), which is exactly the code path browsers take.
beforeAll(() => {
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
})

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the settings heading and every section', () => {
    renderSeededPage(<SettingsPage />, { route: '/settings', url: '/settings' })

    expect(
      screen.getByRole('heading', { level: 1, name: /Settings/ }),
    ).toBeInTheDocument()
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

  it('toggles the sound effects switch', async () => {
    const user = userEvent.setup()
    renderSeededPage(<SettingsPage />, { route: '/settings', url: '/settings' })

    const soundSwitch = screen.getByRole('switch', { name: 'Sound effects' })
    const before = soundSwitch.getAttribute('aria-checked')

    await user.click(soundSwitch)

    expect(screen.getByRole('switch', { name: 'Sound effects' })).toHaveAttribute(
      'aria-checked',
      before === 'true' ? 'false' : 'true',
    )
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
    expect(JSON.parse(localStorage.getItem('devopsquest_voice_settings')!)).toMatchObject({
      enabled: true,
    })
  })

  it('reveals the import textarea from the data management section', async () => {
    const user = userEvent.setup()
    renderSeededPage(<SettingsPage />, { route: '/settings', url: '/settings' })

    expect(
      screen.queryByPlaceholderText('Paste your backup JSON here...'),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Import/ }))

    expect(
      screen.getByPlaceholderText('Paste your backup JSON here...'),
    ).toBeInTheDocument()
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
})
