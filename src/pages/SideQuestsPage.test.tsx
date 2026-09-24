import { describe, it, expect, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import SideQuestsPage from './SideQuestsPage'
import { renderSeededPage, seedDefaultGame } from './test-utils'

describe('SideQuestsPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the page heading and intro copy', () => {
    renderSeededPage(<SideQuestsPage />)
    expect(screen.getByRole('heading', { level: 1, name: /Side Quests/ })).toBeInTheDocument()
    expect(screen.getByText('Complete bonus objectives for extra rewards!')).toBeInTheDocument()
  })

  it('renders the daily, weekly and secret quest sections', () => {
    renderSeededPage(<SideQuestsPage />)
    expect(screen.getByText('Daily Quests')).toBeInTheDocument()
    expect(screen.getByText('Weekly Quests')).toBeInTheDocument()
    expect(screen.getByText('Secret Quests')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Tips/ })).toBeInTheDocument()
  })

  it('renders freshly generated daily quests with their rewards', () => {
    const { sideQuests } = seedDefaultGame()
    const daily = sideQuests.filter((quest) => quest.type === 'daily')

    renderSeededPage(<SideQuestsPage />)

    // A fresh account rolls 3 of the 8 daily quests from the pool
    expect(daily).toHaveLength(3)
    const dailySection = screen.getByText('Daily Quests').closest('div') as HTMLElement
    for (const quest of daily) {
      expect(within(dailySection).getByText(quest.title)).toBeInTheDocument()
    }
    // Progress starts at zero for a new player
    expect(within(dailySection).getAllByText(/^0 \//).length).toBeGreaterThan(0)
  })

  it('hides claim buttons while quest progress is incomplete', () => {
    renderSeededPage(<SideQuestsPage />)
    // No quest has progress yet, so nothing can be claimed
    expect(screen.queryByText('CLAIM')).not.toBeInTheDocument()
  })

  it('documents the weekly reset cadence', () => {
    renderSeededPage(<SideQuestsPage />)
    expect(screen.getByText('Resets at midnight')).toBeInTheDocument()
    expect(screen.getByText('Resets every Monday')).toBeInTheDocument()
  })
})
