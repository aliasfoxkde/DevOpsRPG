import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import WorldMapPage from './WorldMapPage'
import { realms, allQuests } from '@/data/quests'
import { worldMapLocations } from '@/data/worldmap'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { GameProvider, type GameState } from '@/contexts/GameContext'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import { closestContainer, seedDefaultGame } from './test-utils'

/** Renders the journal/rewards destinations with their navigation state. */
function DestinationProbe({ label }: { label: string }) {
  const location = useLocation()
  const state = location.state as { realmId?: string; filter?: string } | null
  const detail = state?.realmId ?? state?.filter
  return <div>{detail ? `${label}:${detail}` : label}</div>
}

/** Mounts the map with the routes it navigates to. */
function renderMap(game?: Partial<GameState>) {
  const defaults = seedDefaultGame()
  localStorage.setItem(
    STORAGE_KEYS.GAME,
    JSON.stringify({
      ...defaults,
      ...game,
      character: { ...defaults.character, ...game?.character },
    }),
  )
  return render(
    <ThemeProvider>
      <GameProvider>
        <MemoryRouter initialEntries={['/worldmap']}>
          <Routes>
            <Route path="/worldmap" element={<WorldMapPage />} />
            <Route path="/quests" element={<DestinationProbe label="journal" />} />
            <Route path="/rewards" element={<DestinationProbe label="rewards" />} />
          </Routes>
        </MemoryRouter>
      </GameProvider>
    </ThemeProvider>,
  )
}

/** A completed-quest record shaped the way GameContext persists them. */
function completedEntry(quest: (typeof allQuests)[number]) {
  return {
    questId: quest.id,
    topicId: quest.topicId,
    technologyId: quest.technologyId,
    title: quest.title,
    xpRewarded: quest.xpReward,
    completed: true,
    xpEarned: quest.xpReward,
    completedAt: new Date().toISOString(),
  }
}

/** The enabled marker button of a location (locked ones are disabled). */
function marker(name: string): HTMLElement {
  const buttons = screen.getAllByRole('button', { name: new RegExp(name) })
  const enabled = buttons.find((button) => !button.hasAttribute('disabled'))
  if (!enabled) throw new Error(`No unlocked marker found for "${name}"`)
  return enabled
}

/** The main trail paths, one per animated connection. */
function trailPaths(): HTMLElement[] {
  return Array.from(document.querySelectorAll('svg path[stroke-dasharray="12,8"]'))
}

/** A saved companion, the way GameContext stores them. */
function companion(id: string, name: string): GameState['companions'][number] {
  return {
    id,
    name,
    icon: '🐾',
    xpBonus: 5,
    goldBonus: 0,
    bondLevel: 1,
    totalQuestsCompleted: 0,
    maxBondLevel: 10,
  }
}

describe('WorldMapPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders the map title, progress bar and character card', () => {
    const { character, completedQuests } = seedDefaultGame()
    renderMap()

    expect(screen.getByRole('heading', { name: 'Realm of DevOps' })).toBeInTheDocument()
    expect(screen.getByText('Overall Journey Progress')).toBeInTheDocument()
    expect(screen.getByText(`${completedQuests.length} quests completed`)).toBeInTheDocument()
    expect(screen.getByText(`Level ${character.level}`)).toBeInTheDocument()
  })

  it('lists every realm with its level requirement in the legend', () => {
    renderMap()

    expect(screen.getByText('Realms')).toBeInTheDocument()
    for (const realm of Object.values(realms)) {
      // Realm names double as map location names, so allow repeats
      expect(screen.getAllByText(realm.name).length).toBeGreaterThan(0)
      expect(screen.getAllByText(`Lv${realm.requiredLevel}`).length).toBeGreaterThan(0)
    }
  })

  it('renders a marker for every map location', () => {
    renderMap()

    for (const location of worldMapLocations) {
      expect(screen.getAllByText(location.name).length).toBeGreaterThan(0)
    }
  })

  it('hides SDLC waypoints when the SDLC overlay is toggled off', async () => {
    const user = userEvent.setup()
    renderMap()

    const sdlcToggle = screen.getAllByRole('button', { name: /SDLC/ })[0]
    expect(sdlcToggle).toHaveTextContent('SDLC ✓')

    const campMarker = screen.getByRole('button', { name: /Coding Camp/ })
    expect(campMarker).toBeEnabled()

    await user.click(sdlcToggle)

    // SDLC waypoints stay on the map but lock while the overlay is hidden
    expect(screen.getByRole('button', { name: /Coding Camp/ })).toBeDisabled()
  })

  it('locks the SDLC waypoints from the legend chips as well', async () => {
    const user = userEvent.setup()
    renderMap()

    await user.click(screen.getAllByRole('button', { name: /Plan/ })[0])

    expect(screen.getByRole('button', { name: 'SDLC' })).toBeInTheDocument()
    expect(screen.queryByText('SDLC ✓')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Coding Camp/ })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'SDLC' }))

    expect(screen.getByRole('button', { name: /Coding Camp/ })).toBeEnabled()
  })

  it('opens a detail modal when a location marker is clicked', async () => {
    const user = userEvent.setup()
    renderMap()

    await user.click(marker('Village of Foundations'))

    const heading = await screen.findByRole('heading', { name: 'Village of Foundations' })
    expect(heading).toBeInTheDocument()
    expect(
      screen.getByText('Every hero begins here. Master the ancient arts of markup and style.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '✕' }))
    expect(
      screen.queryByRole('heading', { name: 'Village of Foundations' }),
    ).not.toBeInTheDocument()
  })

  it('reports the quest progress of a realm in its marker and modal', async () => {
    const user = userEvent.setup()
    const defaults = seedDefaultGame()
    const htmlQuests = allQuests.filter((quest) => quest.technologyId === 'html')
    const realmQuests = allQuests.filter((quest) => quest.realmId === 'foundations')
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...defaults,
        completedQuests: htmlQuests.map(completedEntry),
      }),
    )
    render(
      <ThemeProvider>
        <GameProvider>
          <MemoryRouter initialEntries={['/worldmap']}>
            <Routes>
              <Route path="/worldmap" element={<WorldMapPage />} />
            </Routes>
          </MemoryRouter>
        </GameProvider>
      </ThemeProvider>,
    )

    await user.click(marker('Village of Foundations'))

    const modal = closestContainer(screen.getByText('Quest Progress'), '.p-6')
    expect(
      within(modal).getByText(`${htmlQuests.length}/${realmQuests.length}`),
    ).toBeInTheDocument()
    // Percentages are rounded, so the badge and the bar agree with the counts
    expect(
      screen.getByText(`${Math.round((htmlQuests.length / realmQuests.length) * 100)}%`),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByText('Quest Progress')).not.toBeInTheDocument()
  })

  it('travels to the quest journal of the selected realm', async () => {
    const user = userEvent.setup()
    renderMap()

    await user.click(marker('Village of Foundations'))
    await user.click(screen.getByRole('button', { name: /⚔️ Enter Realm/ }))

    expect(screen.getByText('journal:foundations')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Realm of DevOps' })).not.toBeInTheDocument()
  })

  it('sends a milestone location to the rewards page', async () => {
    const user = userEvent.setup()
    renderMap()

    await user.click(marker('Summit of Mastery'))
    expect(screen.getByRole('heading', { name: 'Summit of Mastery' })).toBeInTheDocument()
    expect(screen.getByText('milestone')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /🏆 View Rewards/ }))

    expect(screen.getByText('rewards')).toBeInTheDocument()
  })

  it('shows the SDLC pipeline of a waypoint in its modal', async () => {
    const user = userEvent.setup()
    renderMap()

    await user.click(marker('Coding Camp'))

    expect(screen.getByRole('heading', { name: 'Coding Camp' })).toBeInTheDocument()
    expect(screen.getByText('SDLC Pipeline')).toBeInTheDocument()
    expect(screen.getByText(/Phase 1/)).toBeInTheDocument()
    // Every phase of the pipeline is drawn, with the waypoint's own highlighted
    const pipeline = closestContainer(screen.getByText('SDLC Pipeline'), '.mb-6')
    expect(within(pipeline).getAllByTitle('Plan')).toHaveLength(1)
    expect(within(pipeline).getByTitle('Deploy')).toBeInTheDocument()

    // Clicking the modal body keeps it open, the backdrop dismisses it
    const heading = screen.getByRole('heading', { name: 'Coding Camp' })
    await user.click(within(pipeline).getByTitle('Plan'))
    expect(screen.getByRole('heading', { name: 'Coding Camp' })).toBeInTheDocument()

    fireEvent.click(closestContainer(heading, '.fixed'))
    expect(screen.queryByRole('heading', { name: 'Coding Camp' })).not.toBeInTheDocument()
  })

  it('marks level-gated locations as locked with their requirement', () => {
    renderMap()

    const castle = screen.getByRole('button', { name: /Castle of Frameworks/ })
    expect(castle).toBeDisabled()
    expect(closestContainer(castle, '.absolute').textContent).toContain('Lv10')
    expect(closestContainer(castle, '.absolute').textContent).toContain('Unlocks at Level 10')

    // The village is reachable at level 1
    expect(marker('Village of Foundations')).toBeEnabled()
  })

  it('shows the locked banner of a location that has just opened up', async () => {
    const user = userEvent.setup()
    renderMap({ character: { level: 10 } as GameState['character'] })

    await user.click(marker('Castle of Frameworks'))

    expect(screen.getByText('Unlocks at Level 10')).toBeInTheDocument()
    expect(screen.getByText('✓ Unlocked')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /⚔️ Enter Realm/ })).toBeInTheDocument()
  })

  it('draws the realm trails once their markers have appeared', () => {
    vi.useFakeTimers()
    renderMap({ character: { level: 25 } as GameState['character'] })

    // Locations fade in on a stagger after an initial delay
    act(() => {
      vi.advanceTimersByTime(200 + worldMapLocations.length * 80 + 500)
    })

    // Six connections, each drawn with a glow, a main path and a dotted path
    const glows = () =>
      trailPaths().map((path) => path.previousElementSibling?.getAttribute('stroke-width'))
    expect(trailPaths()).toHaveLength(6)
    expect(glows()).toEqual(Array(6).fill('8'))

    // Hovering a marker thickens the trail that starts or ends there
    const village = marker('Village of Foundations')
    act(() => {
      fireEvent.mouseOver(village.closest('.absolute') as Element)
    })

    expect(trailPaths().filter((path) => path.getAttribute('stroke-width') === '6')).toHaveLength(1)
    expect(glows()).toContain('12')
    expect(trailPaths().filter((path) => path.getAttribute('stroke-width') === '4')).toHaveLength(5)

    // The animation key keeps cycling while the map is open
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(trailPaths()).toHaveLength(6)
  })

  it('reveals secret locations to a seasoned hero', async () => {
    const user = userEvent.setup()
    const defaults = seedDefaultGame()
    const finished = allQuests.slice(0, 50).map(completedEntry)
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...defaults,
        character: { ...defaults.character, streakDays: 30 },
        stats: { ...defaults.stats, perfectQuestCount: 100 },
        completedQuests: finished,
        companions: [companion('owl', 'Wise Owl'), companion('cat', 'Lucky Cat')],
      }),
    )
    render(
      <ThemeProvider>
        <GameProvider>
          <MemoryRouter initialEntries={['/worldmap']}>
            <Routes>
              <Route path="/worldmap" element={<WorldMapPage />} />
              <Route path="/quests" element={<DestinationProbe label="journal" />} />
              <Route path="/rewards" element={<DestinationProbe label="rewards" />} />
            </Routes>
          </MemoryRouter>
        </GameProvider>
      </ThemeProvider>,
    )

    // 50 quests + 2 companions opens the lair, a 30 day streak the nest and
    // 100 perfect runs the shrine
    expect(await screen.findByText('Lost Library of Code')).toBeInTheDocument()
    expect(screen.getByText("Elder Dragon's Lair")).toBeInTheDocument()
    expect(screen.getByText('Phoenix Nest')).toBeInTheDocument()
    expect(screen.getByText('Shrine of Clean Code')).toBeInTheDocument()
    expect(screen.getAllByText('✨ Secret Location')).toHaveLength(4)

    // Hovering a secret reveals its tooltip and marks the marker as focused
    const shrine = marker('Shrine of Clean Code')
    act(() => {
      fireEvent.mouseOver(shrine.closest('.absolute') as Element)
    })
    expect(shrine.closest('.absolute')?.className).toContain('opacity-100')
    act(() => {
      fireEvent.mouseOut(shrine.closest('.absolute') as Element)
    })

    // The shrine opens its own modal instead of navigating
    await user.click(shrine)
    expect(screen.getByRole('heading', { name: 'Shrine of Clean Code' })).toBeInTheDocument()
    expect(
      screen.getByText(
        /A sacred shrine where developers pray for code clarity. Complete 100 quests/,
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Enter Realm|View Rewards/ }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('heading', { name: 'Shrine of Clean Code' })).not.toBeInTheDocument()

    // The library is the only secret with its own destination
    await user.click(marker('Lost Library of Code'))
    expect(screen.getByText('journal:review')).toBeInTheDocument()
  })

  it('sends the phoenix nest and the shrine to their own handlers', async () => {
    const user = userEvent.setup()
    const defaults = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...defaults,
        character: { ...defaults.character, streakDays: 30 },
        stats: { ...defaults.stats, perfectQuestCount: 100 },
        completedQuests: allQuests.slice(0, 6).map(completedEntry),
      }),
    )
    render(
      <ThemeProvider>
        <GameProvider>
          <MemoryRouter initialEntries={['/worldmap']}>
            <Routes>
              <Route path="/worldmap" element={<WorldMapPage />} />
              <Route path="/quests" element={<DestinationProbe label="journal" />} />
              <Route path="/rewards" element={<DestinationProbe label="rewards" />} />
            </Routes>
          </MemoryRouter>
        </GameProvider>
      </ThemeProvider>,
    )

    await user.click(await screen.findByText('Phoenix Nest'))
    expect(screen.getByText('rewards')).toBeInTheDocument()
  })

  it('hides undiscovered secrets from a new hero', () => {
    renderMap()

    expect(screen.queryByText('Lost Library of Code')).not.toBeInTheDocument()
    expect(screen.queryByText('Phoenix Nest')).not.toBeInTheDocument()
    expect(screen.queryByText('Shrine of Clean Code')).not.toBeInTheDocument()
  })

  it('rewards the konami code and forgets the sequence on a wrong key', () => {
    vi.useFakeTimers()
    renderMap()

    const konami = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ]

    // A wrong key in the middle throws the progress away
    for (const key of konami.slice(0, 4)) {
      act(() => {
        fireEvent.keyDown(window, { key })
      })
    }
    act(() => {
      fireEvent.keyDown(window, { key: 'x' })
    })
    for (const key of konami.slice(0, 9)) {
      act(() => {
        fireEvent.keyDown(window, { key })
      })
    }
    expect(screen.queryByText('KONAMI CODE ACTIVATED!')).not.toBeInTheDocument()

    act(() => {
      fireEvent.keyDown(window, { key: 'a' })
    })

    expect(screen.getByText('KONAMI CODE ACTIVATED!')).toBeInTheDocument()
    expect(screen.getByText('+1 XP Boost Added to Inventory!')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.queryByText('KONAMI CODE ACTIVATED!')).not.toBeInTheDocument()
  })

  it('shows the hero card of the travelling character', () => {
    renderMap({ character: { level: 7, name: 'Kestrel' } as GameState['character'] })

    expect(screen.getByText('Kestrel')).toBeInTheDocument()
    expect(screen.getByText('Level 7')).toBeInTheDocument()
  })
})
