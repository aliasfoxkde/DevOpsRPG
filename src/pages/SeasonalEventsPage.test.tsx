import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import SeasonalEventsPage from './SeasonalEventsPage'
import {
  SEASONAL_EVENTS,
  getCurrentSeason,
  isEventActive,
} from '@/data/seasonalEvents'
import { renderSeededPage, seedDefaultGame } from './test-utils'

const now = new Date()
const pastEvents = SEASONAL_EVENTS.filter(e => new Date(e.endDate) < now)
const upcomingEvents = SEASONAL_EVENTS.filter(e => new Date(e.startDate) > now)
// Events that ask for more than the starting level 1 and are not running now
const gatedEvents = SEASONAL_EVENTS.filter(
  e => (e.requirements?.minLevel ?? 0) > 1 && !isEventActive(e.id),
)

describe('SeasonalEventsPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the seasonal events header and the current season banner', () => {
    renderSeededPage(<SeasonalEventsPage />, { route: '/seasonal-events', url: '/seasonal-events' })

    expect(
      screen.getByRole('heading', { level: 1, name: /Seasonal Events/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Limited-time challenges and exclusive rewards!'),
    ).toBeInTheDocument()
    // The banner names the season we are currently in
    expect(
      screen.getByText(`${getCurrentSeason()} Season`),
    ).toBeInTheDocument()
  })

  it('groups the calendar into active, upcoming and past sections', () => {
    renderSeededPage(<SeasonalEventsPage />, { route: '/seasonal-events', url: '/seasonal-events' })

    // Every event on the calendar is rendered in one of the sections
    for (const event of SEASONAL_EVENTS) {
      expect(screen.getByText(event.name)).toBeInTheDocument()
    }
    if (upcomingEvents.length > 0) {
      expect(screen.getByText('📅 Upcoming Events')).toBeInTheDocument()
    }
    if (pastEvents.length > 0) {
      expect(screen.getByText('✅ Past Events')).toBeInTheDocument()
      expect(screen.getAllByText('✓ Completed')).toHaveLength(pastEvents.length)
    }
  })

  it('describes each event with its dates, bonus and rewards', () => {
    renderSeededPage(<SeasonalEventsPage />, { route: '/seasonal-events', url: '/seasonal-events' })

    expect(screen.getAllByText('Starts:').length).toBe(SEASONAL_EVENTS.length)
    expect(screen.getAllByText('Ends:').length).toBe(SEASONAL_EVENTS.length)
    expect(screen.getAllByText('XP & Gold Bonus').length).toBeGreaterThan(0)
    for (const event of SEASONAL_EVENTS) {
      expect(screen.getByText(event.description)).toBeInTheDocument()
      expect(screen.getAllByText(`${event.bonusMultiplier}x`).length).toBeGreaterThan(0)
    }
  })

  it('marks events whose level requirements are not met', () => {
    const { character } = seedDefaultGame()
    renderSeededPage(<SeasonalEventsPage />, { route: '/seasonal-events', url: '/seasonal-events' })

    expect(character.level).toBe(1)
    // Every event asking for more than level 1 is out of reach for a new hero
    expect(screen.getAllByText('Requirements not met')).toHaveLength(
      gatedEvents.length,
    )
    // Only some events hand out exclusive rewards
    expect(screen.getAllByText('Exclusive Rewards:').length).toBeGreaterThan(0)
  })
})
