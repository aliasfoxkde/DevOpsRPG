import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WorldMapPage from './WorldMapPage'
import { realms } from '@/data/quests'
import { worldMapLocations } from '@/data/worldmap'
import { renderSeededPage, seedDefaultGame } from './test-utils'

describe('WorldMapPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the map title, progress bar and character card', () => {
    const { character, completedQuests } = seedDefaultGame()
    renderSeededPage(<WorldMapPage />, { route: '/worldmap', url: '/worldmap' })

    expect(screen.getByRole('heading', { name: 'Realm of DevOps' })).toBeInTheDocument()
    expect(screen.getByText('Overall Journey Progress')).toBeInTheDocument()
    expect(screen.getByText(`${completedQuests.length} quests completed`)).toBeInTheDocument()
    expect(screen.getByText(`Level ${character.level}`)).toBeInTheDocument()
  })

  it('lists every realm with its level requirement in the legend', () => {
    renderSeededPage(<WorldMapPage />, { route: '/worldmap', url: '/worldmap' })

    expect(screen.getByText('Realms')).toBeInTheDocument()
    for (const realm of Object.values(realms)) {
      // Realm names double as map location names, so allow repeats
      expect(screen.getAllByText(realm.name).length).toBeGreaterThan(0)
      expect(screen.getAllByText(`Lv${realm.requiredLevel}`).length).toBeGreaterThan(0)
    }
  })

  it('renders a marker for every map location', () => {
    renderSeededPage(<WorldMapPage />, { route: '/worldmap', url: '/worldmap' })

    for (const location of worldMapLocations) {
      expect(screen.getAllByText(location.name).length).toBeGreaterThan(0)
    }
  })

  it('hides SDLC waypoints when the SDLC overlay is toggled off', async () => {
    const user = userEvent.setup()
    renderSeededPage(<WorldMapPage />, { route: '/worldmap', url: '/worldmap' })

    const sdlcToggle = screen.getAllByRole('button', { name: /SDLC/ })[0]
    expect(sdlcToggle).toHaveTextContent('SDLC ✓')

    const campMarker = screen.getByRole('button', { name: /Coding Camp/ })
    expect(campMarker).toBeEnabled()

    await user.click(sdlcToggle)

    // SDLC waypoints stay on the map but lock while the overlay is hidden
    expect(screen.getByRole('button', { name: /Coding Camp/ })).toBeDisabled()
  })

  it('opens a detail modal when a location marker is clicked', async () => {
    const user = userEvent.setup()
    renderSeededPage(<WorldMapPage />, { route: '/worldmap', url: '/worldmap' })

    const village = screen
      .getAllByRole('button', { name: /Village of Foundations/ })
      .find((button) => !button.hasAttribute('disabled'))
    expect(village).toBeDefined()
    await user.click(village as HTMLElement)

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
})
