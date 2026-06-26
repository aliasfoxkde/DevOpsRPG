export interface SeasonalEvent {
  id: string
  name: string
  description: string
  icon: string
  startDate: string // ISO date string
  endDate: string // ISO date string
  type: 'holiday' | 'challenge' | 'limited' | 'special'
  bonusMultiplier: number // XP/Gold bonus during event
  rewards?: {
    badgeId?: string
    title?: string
    frame?: string
    bonusXP?: number
    bonusGold?: number
  }
  requirements?: {
    minLevel?: number
    minQuests?: number
  }
  quests?: string[] // Quest IDs that are part of the event
}

export const SEASONAL_EVENTS: SeasonalEvent[] = [
  // Summer Event (June-August)
  {
    id: 'summer-quest-2026',
    name: 'Summer Quest Challenge',
    description: 'The sun shines bright on DevOps heroes! Complete summer-themed quests for bonus XP.',
    icon: '☀️',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    type: 'holiday',
    bonusMultiplier: 1.5,
    requirements: {
      minLevel: 1,
    },
  },
  // Autumn Event (September-November)
  {
    id: 'autumn-harvest-2026',
    name: 'Autumn Harvest Festival',
    description: 'Reap the rewards of your DevOps journey! Special autumn quests with golden rewards.',
    icon: '🍂',
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    type: 'holiday',
    bonusMultiplier: 1.25,
    requirements: {
      minLevel: 5,
    },
  },
  // Winter Holiday Event (December)
  {
    id: 'winter-holiday-2026',
    name: 'Winter Holiday Celebration',
    description: 'Celebrate the season with special holiday quests and exclusive rewards!',
    icon: '🎄',
    startDate: '2026-12-01',
    endDate: '2026-12-31',
    type: 'holiday',
    bonusMultiplier: 2.0,
    rewards: {
      badgeId: 'holiday_spirit',
      bonusXP: 500,
      bonusGold: 200,
    },
    requirements: {
      minLevel: 10,
    },
  },
  // Spring Event (March-May)
  {
    id: 'spring-bloom-2026',
    name: 'Spring Learning Bloom',
    description: 'A time for growth and new beginnings! Focus on learning new technologies.',
    icon: '🌸',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    type: 'holiday',
    bonusMultiplier: 1.25,
    requirements: {
      minLevel: 3,
    },
  },
  // Anniversary Event (April - representing launch)
  {
    id: 'anniversary-2026',
    name: 'DevOpsQuest Anniversary',
    description: 'Celebrate another year of DevOps learning! Special challenges and rewards await.',
    icon: '🎉',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    type: 'special',
    bonusMultiplier: 2.5,
    rewards: {
      badgeId: 'anniversary_celebrant',
      title: 'Anniversary Hero',
      bonusXP: 1000,
      bonusGold: 500,
    },
    requirements: {
      minLevel: 15,
    },
  },
  // Halloween Spooky Event (October)
  {
    id: 'halloween-2026',
    name: 'Hacktober Spooktacular',
    description: 'Beware the haunted servers! Complete spooky quests or face the consequences.',
    icon: '🎃',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    type: 'holiday',
    bonusMultiplier: 1.75,
    rewards: {
      badgeId: 'hacktober_survivor',
      bonusXP: 300,
      bonusGold: 150,
    },
    requirements: {
      minLevel: 8,
    },
  },
  // Summer Coding Challenge
  {
    id: 'summer-code-jam',
    name: 'Summer Code Jam',
    description: 'A coding marathon across the realms! See how many quests you can complete.',
    icon: '🏖️',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    type: 'challenge',
    bonusMultiplier: 2.0,
    requirements: {
      minLevel: 10,
      minQuests: 50,
    },
  },
  // Kubernetes Week (Cloud realm focus)
  {
    id: 'k8s-week',
    name: 'Kubernetes Week',
    description: 'Master the container orchestration realm during this special week!',
    icon: '☸️',
    startDate: '2026-06-15',
    endDate: '2026-06-21',
    type: 'limited',
    bonusMultiplier: 2.0,
    rewards: {
      badgeId: 'k8s_champion',
      bonusXP: 400,
    },
    requirements: {
      minLevel: 12,
    },
  },
]

// Get currently active events
export function getActiveEvents(): SeasonalEvent[] {
  const now = new Date()
  return SEASONAL_EVENTS.filter(event => {
    const start = new Date(event.startDate)
    const end = new Date(event.endDate)
    return now >= start && now <= end
  })
}

// Check if a specific event is active
export function isEventActive(eventId: string): boolean {
  const event = SEASONAL_EVENTS.find(e => e.id === eventId)
  if (!event) return false
  const now = new Date()
  const start = new Date(event.startDate)
  const end = new Date(event.endDate)
  return now >= start && now <= end
}

// Get the next upcoming event
export function getNextEvent(): SeasonalEvent | null {
  const now = new Date()
  const upcoming = SEASONAL_EVENTS
    .filter(event => new Date(event.startDate) > now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  return upcoming[0] || null
}

// Get the current season
export function getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

// Get seasonal colors
export function getSeasonalColors(season: 'spring' | 'summer' | 'autumn' | 'winter') {
  switch (season) {
    case 'spring':
      return { primary: '#10b981', secondary: '#34d399', glow: 'rgba(16, 185, 129, 0.5)' }
    case 'summer':
      return { primary: '#f59e0b', secondary: '#fbbf24', glow: 'rgba(245, 158, 11, 0.5)' }
    case 'autumn':
      return { primary: '#f97316', secondary: '#fb923c', glow: 'rgba(249, 115, 22, 0.5)' }
    case 'winter':
      return { primary: '#3b82f6', secondary: '#60a5fa', glow: 'rgba(59, 130, 246, 0.5)' }
  }
}
