import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { GameProvider, type GameState } from '../../contexts/GameContext'
import { ThemeProvider } from '../../contexts/ThemeContext'
import { allQuests } from '../../data/quests'
import { HUD } from './HUD'
import { STORAGE_KEYS } from '../../utils/gameUtils'

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
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

/**
 * The provider merges a partial save file over its defaults, so a test only
 * has to spell out the character fields the assertions care about.
 */
function seedCharacter(character: Partial<GameState['character']>) {
  localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify({ character, badges: [] }))
}

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
        `${label} should link to ${href}`,
      ).toBe(true)
    }
  })

  it('marks the active route and leaves the rest unmarked', () => {
    renderHud('/quests')

    expect(screen.getByRole('link', { name: /Quests$/ })).toHaveAttribute('aria-current', 'page')
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
    expect(screen.getByRole('progressbar', { name: 'Experience progress' })).toHaveAttribute(
      'aria-valuenow',
      '0',
    )
  })

  it('hides the XP multiplier badge while no boost is active', () => {
    renderHud()
    expect(screen.queryByText('1x')).toBeNull()
  })

  it('celebrates a long streak with the fire badge and the top tier copy', () => {
    seedCharacter({ streakDays: 8 })
    renderHud('/')

    expect(screen.getByTitle('🔥 8 day streak! Amazing!')).toBeInTheDocument()
    expect(screen.getByText('🔥')).toHaveClass('text-orange-400')
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('Legendary!')).toBeInTheDocument()
  })

  it('encourages a mid streak without the fire badge', () => {
    seedCharacter({ streakDays: 4 })
    renderHud('/')

    expect(screen.getByTitle('🔥 4 day streak! Keep it up!')).toBeInTheDocument()
    expect(screen.getByText('🔥')).toHaveClass('text-orange-400')
    expect(screen.getByText('Great progress!')).toBeInTheDocument()
  })

  it('shows a cold streak in grey with the calendar icon', () => {
    seedCharacter({ streakDays: 0 })
    renderHud('/')

    expect(screen.getByTitle('🔥 0 day streak! Build your streak!')).toBeInTheDocument()
    expect(screen.getByText('📅')).toHaveClass('text-slate-500')
    expect(screen.getByText('Keep going!')).toBeInTheDocument()
  })

  it('surfaces an active XP multiplier', () => {
    seedCharacter({ xpMultiplier: 1.5, gold: 250 })
    renderHud('/')

    expect(screen.getByTitle('✨ 1.5x XP boost active!')).toBeInTheDocument()
    expect(screen.getByText('1.5x')).toBeInTheDocument()
    expect(screen.getByText('✨ 1.5x XP boost')).toBeInTheDocument()
    expect(screen.getByTitle('💰 250 gold - Spend it in the Shop!')).toBeInTheDocument()
  })

  it('closes the mobile menu when the logo is clicked', async () => {
    const user = userEvent.setup()
    renderHud()

    await user.click(screen.getByRole('button', { name: 'Toggle menu' }))
    expect(screen.getByText('Level 1')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /DevOpsQuest/ }))

    expect(screen.queryByText('Level 1')).toBeNull()
  })

  it('closes the mobile menu when a primary destination is picked', async () => {
    const user = userEvent.setup()
    renderHud()

    await user.click(screen.getByRole('button', { name: 'Toggle menu' }))
    expect(screen.getByText('Level 1')).toBeInTheDocument()

    // The desktop bar renders the same destinations without a close handler,
    // so pick the stacked link that only exists inside the mobile menu.
    const mobileHome = screen
      .getAllByRole('link', { name: /Home$/ })
      .find((link) => link.className.includes('flex-col'))
    if (!mobileHome) throw new Error('The mobile menu did not render a Home link')
    await user.click(mobileHome)

    expect(screen.queryByText('Level 1')).toBeNull()
  })

  it('marks the active secondary destination in the mobile menu', async () => {
    const user = userEvent.setup()
    seedCharacter({})
    renderHud('/skills')

    await user.click(screen.getByRole('button', { name: 'Toggle menu' }))

    const skills = screen
      .getAllByRole('link', { name: /Skills/ })
      .find((link) => link.getAttribute('href') === '/skills')
    expect(skills).toHaveClass('bg-amber-600')
    expect(screen.getByRole('link', { name: /Settings/ })).not.toHaveClass('bg-amber-600')
  })

  it('cycles the theme and persists the choice', async () => {
    const user = userEvent.setup()
    renderHud()

    const toggle = screen.getByRole('button', { name: 'Current theme: Dark. Click to change.' })
    await user.click(toggle)
    expect(
      screen.getByRole('button', { name: 'Current theme: System. Click to change.' }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Current theme: System. Click to change.' }),
    )
    expect(
      screen.getByRole('button', { name: 'Current theme: Light. Click to change.' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Current theme: Light. Click to change.' }))
    expect(
      screen.getByRole('button', { name: 'Current theme: Dark. Click to change.' }),
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
      screen.getByRole('button', { name: 'Sound is muted. Click to enable sound.' }),
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
        (item) => item.lastElementChild?.textContent ?? '',
      )
      expect(labels).toEqual(expect.arrayContaining(['Skills', 'Settings', 'Social']))
      expect(menu.querySelectorAll('[role="menuitem"]')).toHaveLength(15)
    })

    it('closes on Escape and hands focus back to the More button', async () => {
      const user = userEvent.setup()
      renderHud()

      await user.click(screen.getByRole('button', { name: 'More navigation options' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()

      // Move focus elsewhere to prove the handler actively restores it
      screen.getByRole('button', { name: 'Current theme: Dark. Click to change.' }).focus()
      expect(
        screen.getByRole('button', { name: 'Current theme: Dark. Click to change.' }),
      ).toHaveFocus()

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(screen.queryByRole('menu')).toBeNull()
      expect(screen.getByRole('button', { name: 'More navigation options' })).toHaveFocus()
    })

    it('closes on a click outside the menu', async () => {
      const user = userEvent.setup()
      renderHud()

      await user.click(screen.getByRole('button', { name: 'More navigation options' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()

      fireEvent.mouseDown(document.body)

      expect(screen.queryByRole('menu')).toBeNull()
    })

    it('opens with the ArrowDown key and closes again on Escape', () => {
      renderHud()

      const more = screen.getByRole('button', { name: 'More navigation options' })
      fireEvent.keyDown(more, { key: 'ArrowDown' })
      expect(screen.getByRole('menu', { name: 'More navigation' })).toBeInTheDocument()
      expect(more).toHaveAttribute('aria-expanded', 'true')

      // ArrowDown is only an opener; it must not toggle the menu back shut.
      fireEvent.keyDown(more, { key: 'ArrowDown' })
      expect(screen.getByRole('menu', { name: 'More navigation' })).toBeInTheDocument()

      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.queryByRole('menu')).toBeNull()
      expect(more).toHaveAttribute('aria-expanded', 'false')
      expect(more).toHaveFocus()
    })

    it('ignores Escape while the menu is already closed', () => {
      renderHud()

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(screen.queryByRole('menu')).toBeNull()
      expect(screen.getByRole('button', { name: 'More navigation options' })).not.toHaveFocus()
    })

    it('highlights the destination matching the current route', async () => {
      const user = userEvent.setup()
      renderHud('/skills')

      await user.click(screen.getByRole('button', { name: 'More navigation options' }))

      const skills = screen
        .getAllByRole('menuitem')
        .find((item) => item.getAttribute('href') === '/skills')
      expect(skills).toHaveClass('bg-amber-600/20')
      expect(
        screen.getAllByRole('menuitem').find((item) => item.getAttribute('href') === '/settings'),
      ).not.toHaveClass('bg-amber-600/20')
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
