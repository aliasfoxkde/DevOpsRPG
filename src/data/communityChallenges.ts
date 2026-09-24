// Community Challenges - Simulated community progress system
// Since this is a single-player game, "community" progress is simulated
// using stored statistics and weekly goals that player contributes toward

export interface CommunityChallenge {
  id: string
  title: string
  description: string
  icon: string
  type: 'quests' | 'xp' | 'streak' | 'quiz' | 'specific'
  target: number
  current: number
  xpReward: number
  goldReward: number
  completed: boolean
  expiresAt: string // ISO date string for when challenge expires
}

export interface CommunityStats {
  totalQuestsCompleted: number
  totalXPEarned: number
  highestStreak: number
  totalQuizzesTaken: number
  totalPerfectQuizzes: number
  weeklyQuestsCompleted: number
  weeklyXPCompleted: number
  lastWeekReset: string
  challengeHistory: {
    completedChallenges: string[]
    totalContributions: number
  }
}

// Generate weekly community challenges
export function generateWeeklyChallenges(stats: CommunityStats): CommunityChallenge[] {
  const now = new Date()
  const nextMonday = new Date(now)
  nextMonday.setDate(nextMonday.getDate() + ((8 - nextMonday.getDay()) % 7))
  nextMonday.setHours(23, 59, 59, 999)

  const baseChallenges: Omit<CommunityChallenge, 'current' | 'completed'>[] = [
    {
      id: 'weekly_quest_marathon',
      title: 'Community Quest Marathon',
      description: 'Complete quests to help the community reach 500 total quests this week!',
      icon: '🏃',
      type: 'quests',
      target: 500,
      xpReward: 1000,
      goldReward: 500,
      expiresAt: nextMonday.toISOString(),
    },
    {
      id: 'weekly_xp_grind',
      title: 'Collective XP Drive',
      description: 'The community needs to earn 50,000 XP this week!',
      icon: '⚡',
      type: 'xp',
      target: 50000,
      xpReward: 1500,
      goldReward: 750,
      expiresAt: nextMonday.toISOString(),
    },
    {
      id: 'weekly_streak_challenge',
      title: 'Streak Champions',
      description: 'Help the community maintain a combined 100-day streak!',
      icon: '🔥',
      type: 'streak',
      target: 100,
      xpReward: 800,
      goldReward: 400,
      expiresAt: nextMonday.toISOString(),
    },
    {
      id: 'weekly_perfect_quiz',
      title: 'Quiz Masters',
      description: 'Community members to achieve 50 perfect quiz scores!',
      icon: '🧠',
      type: 'quiz',
      target: 50,
      xpReward: 1200,
      goldReward: 600,
      expiresAt: nextMonday.toISOString(),
    },
  ]

  return baseChallenges.map((c) => ({
    ...c,
    current: getCurrentProgress(c.type, stats),
    completed: stats.challengeHistory.completedChallenges.includes(c.id),
  }))
}

function getCurrentProgress(type: CommunityChallenge['type'], stats: CommunityStats): number {
  switch (type) {
    case 'quests':
      return stats.weeklyQuestsCompleted
    case 'xp':
      return stats.weeklyXPCompleted
    case 'streak':
      return stats.highestStreak
    case 'quiz':
      return stats.totalPerfectQuizzes
    // "specific" challenges are one-off events with no aggregate stat to
    // track, so they only complete through their own explicit completion
    // flow and report no automatic progress.
    case 'specific':
      return 0
  }
}

// Format time remaining until challenge expires
export function formatChallengeTimeRemaining(expiresAt: string): string {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diffMs = expires.getTime() - now.getTime()

  if (diffMs <= 0) return 'Expired'

  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  const diffHours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))

  if (diffDays > 0) return `${diffDays}d ${diffHours}h remaining`
  if (diffHours > 0) return `${diffHours}h remaining`
  return 'Less than 1h'
}
