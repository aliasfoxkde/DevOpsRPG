import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import SeasonalEventsPage from './SeasonalEventsPage'
import {
  SEASONAL_EVENTS,
  getCurrentSeason,
  isEventActive,
  type SeasonalEvent,
} from '@/data/seasonalEvents'
import { CLASS_BONUSES } from '@/contexts/game/bonusEngine'
import { closestContainer, renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { STORAGE_KEYS } from '@/utils/gameUtils'

const now = new Date()
const pastEvents = SEASONAL_EVENTS.filter((e) => new Date(e.endDate) < now)
const upcomingEvents = SEASONAL_EVENTS.filter((e) => new Date(e.startDate) > now)
// Events that ask for more than the starting level 1 and are not running now
const gatedEvents = SEASONAL_EVENTS.filter(
  (e) => (e.requirements?.minLevel ?? 0) > 1 && !isEventActive(e.id),
)

describe('SeasonalEventsPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the seasonal events header and the current season banner', () => {
    renderSeededPage(<SeasonalEventsPage />, { route: '/seasonal-events', url: '/seasonal-events' })

    expect(screen.getByRole('heading', { level: 1, name: /Seasonal Events/ })).toBeInTheDocument()
    expect(screen.getByText('Limited-time challenges and exclusive rewards!')).toBeInTheDocument()
    // The banner names the season we are currently in
    expect(screen.getByText(`${getCurrentSeason()} Season`)).toBeInTheDocument()
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
      expect(screen.getByText('🏁 Past Events')).toBeInTheDocument()
      // Past events are reported as over, not as something the player finished
      expect(screen.getAllByText('Ended')).toHaveLength(pastEvents.length)
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
    expect(screen.getAllByText('Requirements not met')).toHaveLength(gatedEvents.length)
    // Only some events hand out claimable rewards
    expect(screen.getAllByText('Event Rewards:').length).toBeGreaterThan(0)
  })

  it('pays a live event bonus exactly once and records the claim', () => {
    // Halloween 2026 runs the whole of October and asks for level 8
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-10T12:00:00Z'))
    const halloween = SEASONAL_EVENTS.find((event) => event.id === 'halloween-2026')
    if (!halloween?.rewards?.bonusXP || !halloween.rewards.bonusGold) {
      throw new Error('halloween-2026 must advertise both bonus XP and gold')
    }
    expect(isEventActive(halloween.id)).toBe(true)

    const base = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({ ...base, character: { ...base.character, level: 8 } }),
    )
    renderPage(<SeasonalEventsPage />, { route: '/seasonal-events', url: '/seasonal-events' })

    // fireEvent (not userEvent): fake timers are pinned to the event window,
    // and userEvent's internal waits would stall on them
    const card = closestContainer(screen.getByText(halloween.name), 'div.relative')
    const button = within(card).getByRole('button', { name: /Claim Event Reward/ })
    // Only halloween pays a login bonus that week — autumn-harvest is live but
    // multiplies rewards instead of paying a claimable stash
    expect(screen.getAllByRole('button', { name: /Claim Event Reward/ }).length).toBe(1)

    fireEvent.click(button)

    // The claimed card flips state and the advertised amounts are paid
    // (the default DevOps Sage class adds +10% XP; gold is unchanged)
    const classBonus = CLASS_BONUSES[base.character.class].bonus
    const expectedXp = Math.floor(halloween.rewards.bonusXP * (1 + classBonus))
    expect(within(card).getByText('✓ Event reward claimed')).toBeInTheDocument()
    expect(
      screen.getByText(
        `${halloween.name} reward claimed: +${expectedXp} XP, +${halloween.rewards.bonusGold} gold!`,
      ),
    ).toBeInTheDocument()

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME) ?? '{}') as {
      claimedEvents?: string[]
      character?: { xp: number; gold: number }
    }
    expect(stored.claimedEvents).toEqual(['halloween-2026'])
    expect(stored.character?.xp).toBe(base.character.xp + expectedXp)
    expect(stored.character?.gold).toBe(base.character.gold + halloween.rewards.bonusGold)
  })

  it('keeps the claim button out of reach while requirements are unmet', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-10T12:00:00Z'))
    // Brand new hero: level 1 misses every gated live event
    renderSeededPage(<SeasonalEventsPage />, { route: '/seasonal-events', url: '/seasonal-events' })

    const liveWithRewards = SEASONAL_EVENTS.filter(
      (event: SeasonalEvent) => isEventActive(event.id) && event.rewards,
    )
    expect(liveWithRewards.length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: /Claim Event Reward/ })).not.toBeInTheDocument()
    for (const event of liveWithRewards) {
      const card = closestContainer(screen.getByText(event.name), 'div.relative')
      expect(
        within(card).getByText('Reach the requirements to claim the event reward'),
      ).toBeInTheDocument()
    }
  })

  afterEach(() => {
    vi.useRealTimers()
  })
})
