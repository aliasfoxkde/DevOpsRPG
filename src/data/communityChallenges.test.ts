// Behavior tests for the simulated community challenge system: weekly
// generation from player stats, expiry math, and the countdown formatter.
import { describe, it, expect } from 'vitest'
import {
  formatChallengeTimeRemaining,
  generateWeeklyChallenges,
  type CommunityStats,
} from './communityChallenges'
import { TIME_MS } from '@/utils/gameUtils'

function buildStats(overrides: Partial<CommunityStats> = {}): CommunityStats {
  return {
    totalQuestsCompleted: 0,
    totalXPEarned: 0,
    highestStreak: 0,
    totalQuizzesTaken: 0,
    totalPerfectQuizzes: 0,
    weeklyQuestsCompleted: 0,
    weeklyXPCompleted: 0,
    lastWeekReset: new Date().toISOString(),
    challengeHistory: { completedChallenges: [], totalContributions: 0 },
    ...overrides,
  }
}

describe('generateWeeklyChallenges', () => {
  it('generates the four weekly challenges with their targets and rewards', () => {
    const challenges = generateWeeklyChallenges(buildStats())
    expect(challenges.map((c) => c.id)).toEqual([
      'weekly_quest_marathon',
      'weekly_xp_grind',
      'weekly_streak_challenge',
      'weekly_perfect_quiz',
    ])
    expect(challenges.map((c) => c.type)).toEqual(['quests', 'xp', 'streak', 'quiz'])
    expect(challenges.map((c) => c.target)).toEqual([500, 50000, 100, 50])
    expect(challenges.map((c) => c.xpReward)).toEqual([1000, 1500, 800, 1200])
    expect(challenges.map((c) => c.goldReward)).toEqual([500, 750, 400, 600])
    expect(challenges.every((c) => c.current === 0 && !c.completed)).toBe(true)
  })

  it('seeds current progress from the matching community stat', () => {
    const challenges = generateWeeklyChallenges(
      buildStats({
        weeklyQuestsCompleted: 25,
        weeklyXPCompleted: 5000,
        highestStreak: 12,
        totalPerfectQuizzes: 7,
      }),
    )
    expect(challenges.map((c) => c.current)).toEqual([25, 5000, 12, 7])
  })

  it('marks challenges that are already in the completion history', () => {
    const challenges = generateWeeklyChallenges(
      buildStats({
        challengeHistory: { completedChallenges: ['weekly_xp_grind'], totalContributions: 1 },
      }),
    )
    expect(challenges.map((c) => c.completed)).toEqual([false, true, false, false])
  })

  it('expires every challenge next Monday at the end of the day', () => {
    const challenges = generateWeeklyChallenges(buildStats())
    for (const challenge of challenges) {
      const expires = new Date(challenge.expiresAt)
      expect(challenges[0].expiresAt).toBe(challenge.expiresAt)
      expect(expires.getDay(), 'expiry should land on a Monday').toBe(1)
      expect(expires.getHours()).toBe(23)
      expect(expires.getMinutes()).toBe(59)
      expect(expires.getSeconds()).toBe(59)
      expect(expires.getMilliseconds()).toBe(999)
      expect(expires.getTime()).toBeGreaterThan(Date.now())
      expect(expires.getTime() - Date.now()).toBeLessThanOrEqual(7 * TIME_MS.DAY)
    }
  })
})

describe('formatChallengeTimeRemaining', () => {
  it('reports days and hours while more than a day remains', () => {
    // Half an hour of slack keeps the bucket stable while the test runs.
    const expires = new Date(Date.now() + 3 * TIME_MS.DAY + 5 * TIME_MS.HOUR + 30 * TIME_MS.MINUTE)
    expect(formatChallengeTimeRemaining(expires.toISOString())).toBe('3d 5h remaining')
  })

  it('reports hours when less than a day remains', () => {
    const expires = new Date(Date.now() + 5 * TIME_MS.HOUR + 30 * TIME_MS.MINUTE)
    expect(formatChallengeTimeRemaining(expires.toISOString())).toBe('5h remaining')
  })

  it('reports the sub-hour bucket when less than an hour remains', () => {
    const expires = new Date(Date.now() + 30 * TIME_MS.MINUTE)
    expect(formatChallengeTimeRemaining(expires.toISOString())).toBe('Less than 1h')
  })

  it('reports expired challenges', () => {
    const expires = new Date(Date.now() - TIME_MS.HOUR)
    expect(formatChallengeTimeRemaining(expires.toISOString())).toBe('Expired')
  })
})
