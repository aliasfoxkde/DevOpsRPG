import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import TitlesFramesPage from './TitlesFramesPage'
import { TITLES, FRAMES } from '@/data/titles'
import { renderSeededPage, seedDefaultGame } from './test-utils'

describe('TitlesFramesPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the page heading and equipped summary', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<TitlesFramesPage />, { route: '/titles-frames', url: '/titles-frames' })

    expect(
      screen.getByRole('heading', { level: 1, name: /Titles & Frames/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Currently Equipped' })).toBeInTheDocument()
    expect(screen.getAllByText('DevOps Novice').length).toBeGreaterThan(0)
    expect(character.equippedTitle).toBe('novice-devops')
  })

  it('reports collection progress across titles and frames', () => {
    renderSeededPage(<TitlesFramesPage />, { route: '/titles-frames', url: '/titles-frames' })

    expect(screen.getByText('Collection Progress')).toBeInTheDocument()
    expect(screen.getByText(`/ ${TITLES.length} Titles`)).toBeInTheDocument()
    expect(screen.getByText(`/ ${FRAMES.length} Frames`)).toBeInTheDocument()
  })

  it('lists every title and frame with its unlock requirement', () => {
    renderSeededPage(<TitlesFramesPage />, { route: '/titles-frames', url: '/titles-frames' })

    for (const title of TITLES) {
      expect(screen.getAllByText(title.name).length).toBeGreaterThan(0)
      expect(screen.getAllByText(title.description).length).toBeGreaterThan(0)
    }
    for (const frame of FRAMES) {
      expect(screen.getAllByText(frame.name).length).toBeGreaterThan(0)
    }
  })

  it('offers no equip action for titles the player has not unlocked', () => {
    renderSeededPage(<TitlesFramesPage />, { route: '/titles-frames', url: '/titles-frames' })

    // A brand new player only owns the starter title, so at most one Equip button
    const equipButtons = screen.queryAllByRole('button', { name: 'Equip' })
    expect(equipButtons.length).toBeLessThanOrEqual(1)
  })
})
