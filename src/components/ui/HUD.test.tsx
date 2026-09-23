import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { GameProvider } from '../../contexts/GameContext'
import { ThemeProvider } from '../../contexts/ThemeContext'
import { allQuests } from '../../data/quests'
import { HUD } from './HUD'

// jsdom has no matchMedia. ThemeProvider needs it once the theme is set to
// "system", which the HUD theme cycler can select.
beforeAll(() => {
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
})

afterAll(() => {
  delete (window as unknown as { matchMedia?: unknown }).matchMedia
})

// Real providers, in the same nesting the app shell uses (router > game > theme)
function renderHud(initialPath = '/quests') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <GameProvider>
        <ThemeProvider>
          <HUD />
        </ThemeProvider>
      </GameProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('HUD', () => {
  it('renders the logo link back to the home realm', () => {
    renderHud()
    const logo = screen.getByRole('link', { name: /DevOpsQuest/ })
    expect(logo).toHaveAttribute('href', '/')
  })

  it('renders the primary navigation destinations', () => {
    renderHud()

    const expected = [
      { label: 'Home', href: '/' },
      { label: 'Quests', href: '/quests' },
      { label: 'Map', href: '/worldmap' },
      { label: 'Challenges', href: '/challenges' },
      { label: 'Career', href: '/career-path' },
      { label: 'Rank', href: '/leaderboard' },
      { label: 'Hero', href: '/character' },
    ]

    for (const { label, href } of expected) {
      const links = screen.getAllByRole('link', { name: new RegExp(`${label}$`) })
      expect(
        links.some((link) => link.getAttribute('href') === href),
        `${label} should link to ${href}`
      ).toBe(true)
    }
  })

  it('marks the active route and leaves the rest unmarked', () => {
    renderHud('/quests')

    expect(screen.getByRole('link', { name: /Quests$/ })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('link', { name: /Home$/ })).not.toHaveAttribute('aria-current')
  })

  it('surfaces the character streak and gold from game state', () => {
    renderHud('/')

    expect(screen.getByTitle('🔥 0 day streak! Build your streak!')).toBeInTheDocument()
    expect(screen.getByTitle('💰 0 gold - Spend it in the Shop!')).toBeInTheDocument()
  })

  it('shows quest progress as completed over total', () => {
    renderHud()
    // The count comes straight from the quest data via the game context
    expect(screen.getByText(`0/${allQuests.length}`)).toBeInTheDocument()
    expect(screen.getByText(`0/${allQuests.length} quests`)).toBeInTheDocument()
  })

  it('embeds the compact XP bar fed by the game context', () => {
    renderHud()

    expect(screen.getByText('LV 1')).toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', { name: 'Experience progress' })
    ).toHaveAttribute('aria-valuenow', '0')
  })

  it('hides the XP multiplier badge while no boost is active', () => {
    renderHud()
    expect(screen.queryByText('1x')).toBeNull()
  })

  it('cycles the theme and persists the choice', async () => {
    const user = userEvent.setup()
    renderHud()

    const toggle = screen.getByRole('button', { name: 'Current theme: Dark. Click to change.' })
    await user.click(toggle)
    expect(
      screen.getByRole('button', { name: 'Current theme: System. Click to change.' })
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Current theme: System. Click to change.' }))
    expect(
      screen.getByRole('button', { name: 'Current theme: Light. Click to change.' })
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Current theme: Light. Click to change.' }))
    expect(
      screen.getByRole('button', { name: 'Current theme: Dark. Click to change.' })
    ).toBeInTheDocument()
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('toggles sound between muted and enabled, persisting the preference', async () => {
    const user = userEvent.setup()
    renderHud()

    // Fresh players start muted (opt-in audio)
    const muted = screen.getByRole('button', {
      name: 'Sound is muted. Click to enable sound.',
    })
    await user.click(muted)

    const enabled = screen.getByRole('button', { name: 'Sound is enabled. Click to mute.' })
    expect(localStorage.getItem('soundEnabled')).toBe('true')

    await user.click(enabled)
    expect(
      screen.getByRole('button', { name: 'Sound is muted. Click to enable sound.' })
    ).toBeInTheDocument()
    expect(localStorage.getItem('soundEnabled')).toBe('false')
  })

  describe('More dropdown', () => {
    it('opens the secondary navigation menu', async () => {
      const user = userEvent.setup()
      renderHud()

      const more = screen.getByRole('button', { name: 'More navigation options' })
      expect(more).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByRole('menu')).toBeNull()

      await user.click(more)

      const menu = screen.getByRole('menu', { name: 'More navigation' })
      expect(more).toHaveAttribute('aria-expanded', 'true')
      // Each menu item is an emoji decoration followed by the destination label
      const labels = Array.from(menu.querySelectorAll('[role="menuitem"]')).map(
        (item) => item.lastElementChild?.textContent ?? ''
      )
      expect(labels).toEqual(
        expect.arrayContaining(['Skills', 'Settings', 'Social'])
      )
      expect(menu.querySelectorAll('[role="menuitem"]')).toHaveLength(15)
    })

    it('closes on Escape and hands focus back to the More button', async () => {
      const user = userEvent.setup()
      renderHud()

      await user.click(screen.getByRole('button', { name: 'More navigation options' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()

      // Move focus elsewhere to prove the handler actively restores it
      screen
        .getByRole('button', { name: 'Current theme: Dark. Click to change.' })
        .focus()
      expect(
        screen.getByRole('button', { name: 'Current theme: Dark. Click to change.' })
      ).toHaveFocus()

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(screen.queryByRole('menu')).toBeNull()
      expect(
        screen.getByRole('button', { name: 'More navigation options' })
      ).toHaveFocus()
    })

    it('closes on a click outside the menu', async () => {
      const user = userEvent.setup()
      renderHud()

      await user.click(screen.getByRole('button', { name: 'More navigation options' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()

      fireEvent.mouseDown(document.body)

      expect(screen.queryByRole('menu')).toBeNull()
    })
  })

  describe('mobile menu', () => {
    it('reveals the full navigation and character summary when toggled', async () => {
      const user = userEvent.setup()
      renderHud()

      const toggle = screen.getByRole('button', { name: 'Toggle menu' })
      expect(toggle).toHaveTextContent('☰')
      expect(screen.queryByText('Level 1')).toBeNull()

      await user.click(toggle)

      expect(toggle).toHaveTextContent('✕')
      expect(screen.getByText('Level 1')).toBeInTheDocument()
      expect(screen.getAllByRole('link', { name: /Skills/ }).length).toBeGreaterThan(0)
      // Character quick view repeats the title alongside the desktop avatar
      expect(screen.getAllByText('DevOps Apprentice').length).toBeGreaterThanOrEqual(2)
      expect(screen.getByText('🔥 0 streak')).toBeInTheDocument()
    })

    it('hides the menu again when toggled twice', async () => {
      const user = userEvent.setup()
      renderHud()

      const toggle = screen.getByRole('button', { name: 'Toggle menu' })
      await user.click(toggle)
      await user.click(toggle)

      expect(screen.queryByText('Level 1')).toBeNull()
    })

    it('closes the mobile menu after choosing a destination', async () => {
      const user = userEvent.setup()
      renderHud()

      await user.click(screen.getByRole('button', { name: 'Toggle menu' }))
      await user.click(screen.getAllByRole('link', { name: /Skills/ })[0])

      expect(screen.queryByText('Level 1')).toBeNull()
    })
  })
})
