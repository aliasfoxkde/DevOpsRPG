// Behavior tests for the seasonal event calendar: catalog shape, the active/next
// event lookups that drive SeasonalEventsPage, and the season/color helpers.
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  SEASONAL_EVENTS,
  getActiveEvents,
  isEventActive,
  getNextEvent,
  getCurrentSeason,
  getSeasonalColors,
  type SeasonalEvent,
} from './seasonalEvents'
import { BADGES } from './badges'

const badgeIds = new Set(BADGES.map((badge) => badge.id))
const TYPES: SeasonalEvent['type'][] = ['holiday', 'challenge', 'limited', 'special']

/** Local-time date so assertions hold regardless of the runner's timezone. */
function at(year: number, monthIndex: number, day = 15, hour = 12): Date {
  return new Date(year, monthIndex, day, hour)
}

describe('SEASONAL_EVENTS catalog', () => {
  it('ships the eight events it advertises, with unique ids', () => {
    const ids = SEASONAL_EVENTS.map((event) => event.id)
    expect(ids).toEqual([
      'summer-quest-2026',
      'autumn-harvest-2026',
      'winter-holiday-2026',
      'spring-bloom-2026',
      'anniversary-2026',
      'halloween-2026',
      'summer-code-jam',
      'k8s-week',
    ])
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps every window inside the same year and ordered start -> end', () => {
    for (const event of SEASONAL_EVENTS) {
      const start = new Date(event.startDate)
      const end = new Date(event.endDate)
      expect(Number.isNaN(start.getTime()), `${event.id} start`).toBe(false)
      expect(Number.isNaN(end.getTime()), `${event.id} end`).toBe(false)
      expect(start.getTime(), `${event.id} starts after it ends`).toBeLessThan(end.getTime())
      expect(start.getUTCFullYear(), event.id).toBe(2026)
    }
  })

  it('only uses the four shipped event types and always pays a bonus', () => {
    for (const event of SEASONAL_EVENTS) {
      expect(TYPES, `${event.id} type`).toContain(event.type)
      expect(event.bonusMultiplier, event.id).toBeGreaterThan(1)
      expect(event.name.length, event.id).toBeGreaterThan(0)
      expect(event.description.length, event.id).toBeGreaterThan(0)
      expect(event.icon.length, event.id).toBeGreaterThan(0)
    }
  })

  it('gates each event behind an explicit level requirement', () => {
    for (const event of SEASONAL_EVENTS) {
      if (event.requirements?.minLevel !== undefined) {
        expect(event.requirements.minLevel, event.id).toBeGreaterThanOrEqual(1)
      }
      if (event.requirements?.minQuests !== undefined) {
        expect(event.requirements.minQuests, event.id).toBeGreaterThan(0)
      }
    }
    const gated = SEASONAL_EVENTS.map((event) => event.requirements?.minLevel ?? 0)
    expect(gated).toEqual([1, 5, 10, 3, 15, 8, 10, 12])
  })

  it('pays the exact rewards the event cards advertise', () => {
    const byId = new Map(SEASONAL_EVENTS.map((event) => [event.id, event]))
    expect(byId.get('winter-holiday-2026')?.rewards).toEqual({
      badgeId: 'holiday_spirit',
      bonusXP: 500,
      bonusGold: 200,
    })
    expect(byId.get('anniversary-2026')).toMatchObject({
      type: 'special',
      bonusMultiplier: 2.5,
      rewards: { title: 'Anniversary Hero', bonusXP: 1000, bonusGold: 500 },
    })
    expect(byId.get('k8s-week')).toMatchObject({
      type: 'limited',
      bonusMultiplier: 2,
      rewards: { badgeId: 'k8s_champion', bonusXP: 400 },
    })
    expect(byId.get('summer-quest-2026')?.rewards).toBeUndefined()
  })

  it('references badge ids that exist in the badge catalog (documented gap)', () => {
    // KNOWN GAP (tripwire, not an assertion of correctness): four events promise
    // a "Special Badge" whose id has no BADGES entry, so nothing can ever award
    // them. Adding those badges should let this whitelist shrink to [].
    const referenced = [
      ...new Set(
        SEASONAL_EVENTS.flatMap((event) => (event.rewards?.badgeId ? [event.rewards.badgeId] : [])),
      ),
    ]
    const dangling = referenced.filter((id) => !badgeIds.has(id))
    expect(dangling).toEqual([
      'holiday_spirit',
      'anniversary_celebrant',
      'hacktober_survivor',
      'k8s_champion',
    ])
  })
})

describe('getActiveEvents', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the events whose window contains now', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-15T12:00:00Z'))
    expect(getActiveEvents().map((event) => event.id)).toEqual([
      'summer-quest-2026',
      'summer-code-jam',
    ])
  })

  it('stacks overlapping events in catalog order', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-10T12:00:00Z'))
    expect(getActiveEvents().map((event) => event.id)).toEqual([
      'autumn-harvest-2026',
      'halloween-2026',
    ])
  })

  it('returns an empty calendar in the quiet season', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
    expect(getActiveEvents()).toEqual([])
  })

  it('treats the first and last day of a window as active', () => {
    vi.useFakeTimers()
    // startDate/endDate are date-only strings, parsed as UTC midnight.
    vi.setSystemTime(new Date('2026-06-01T00:00:00Z'))
    expect(getActiveEvents().map((event) => event.id)).toContain('summer-quest-2026')
    vi.setSystemTime(new Date('2026-08-31T00:00:00Z'))
    expect(getActiveEvents().map((event) => event.id)).toContain('summer-quest-2026')
    vi.setSystemTime(new Date('2026-09-01T00:00:00Z'))
    expect(getActiveEvents().map((event) => event.id)).not.toContain('summer-quest-2026')
  })
})

describe('isEventActive', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('answers true inside a window and false outside it', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-20T12:00:00Z'))
    expect(isEventActive('halloween-2026')).toBe(true)
    expect(isEventActive('winter-holiday-2026')).toBe(false)
    expect(isEventActive('summer-quest-2026')).toBe(false)
  })

  it('answers false for an event id that does not exist', () => {
    expect(isEventActive('nonexistent-event')).toBe(false)
    expect(isEventActive('')).toBe(false)
  })

  it('is inclusive of both endpoints', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-12-01T00:00:00Z'))
    expect(isEventActive('winter-holiday-2026')).toBe(true)
    vi.setSystemTime(new Date('2026-12-31T00:00:00Z'))
    expect(isEventActive('winter-holiday-2026')).toBe(true)
    vi.setSystemTime(new Date('2026-12-31T00:00:01Z'))
    expect(isEventActive('winter-holiday-2026')).toBe(false)
  })
})

describe('getNextEvent', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('picks the soonest event that has not started yet', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
    expect(getNextEvent()?.id).toBe('spring-bloom-2026')
    vi.setSystemTime(new Date('2026-06-25T12:00:00Z'))
    expect(getNextEvent()?.id).toBe('summer-code-jam')
  })

  it('skips events that are currently running', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-05T12:00:00Z'))
    expect(getNextEvent()?.id).toBe('winter-holiday-2026')
  })

  it('returns null once the calendar is exhausted', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2027-06-01T12:00:00Z'))
    expect(getNextEvent()).toBeNull()
  })

  it('hands back the same event object the catalog holds', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-01T12:00:00Z'))
    const next = getNextEvent()
    if (!next) throw new Error('expected an upcoming event in November 2026')
    expect(SEASONAL_EVENTS).toContain(next)
  })
})

describe('getCurrentSeason', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('maps the calendar months onto the four seasons', () => {
    const EXPECTED = [
      'winter',
      'winter',
      'spring',
      'spring',
      'spring',
      'summer',
      'summer',
      'summer',
      'autumn',
      'autumn',
      'autumn',
      'winter',
    ]
    vi.useFakeTimers()
    EXPECTED.forEach((season, monthIndex) => {
      // Local-time construction keeps the month stable on any runner TZ.
      vi.setSystemTime(at(2026, monthIndex))
      expect(getCurrentSeason(), `month index ${monthIndex}`).toBe(season)
    })
  })

  it('changes season across a month boundary', () => {
    vi.useFakeTimers()
    vi.setSystemTime(at(2026, 7, 31, 23))
    expect(getCurrentSeason()).toBe('summer')
    vi.setSystemTime(at(2026, 8, 1, 0))
    expect(getCurrentSeason()).toBe('autumn')
  })
})

describe('getSeasonalColors', () => {
  it('returns the exact palette for each season', () => {
    expect(getSeasonalColors('spring')).toEqual({
      primary: '#10b981',
      secondary: '#34d399',
      glow: 'rgba(16, 185, 129, 0.5)',
    })
    expect(getSeasonalColors('summer')).toEqual({
      primary: '#f59e0b',
      secondary: '#fbbf24',
      glow: 'rgba(245, 158, 11, 0.5)',
    })
    expect(getSeasonalColors('autumn')).toEqual({
      primary: '#f97316',
      secondary: '#fb923c',
      glow: 'rgba(249, 115, 22, 0.5)',
    })
    expect(getSeasonalColors('winter')).toEqual({
      primary: '#3b82f6',
      secondary: '#60a5fa',
      glow: 'rgba(59, 130, 246, 0.5)',
    })
  })

  it('gives every season a distinct primary color', () => {
    const seasons = ['spring', 'summer', 'autumn', 'winter'] as const
    const primaries = seasons.map((season) => getSeasonalColors(season).primary)
    expect(new Set(primaries).size).toBe(seasons.length)
    for (const season of seasons) {
      expect(getSeasonalColors(season).primary).toMatch(/^#[0-9a-f]{6}$/)
    }
  })
})
