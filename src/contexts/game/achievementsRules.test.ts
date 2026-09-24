// Threshold tests for the legacy achievement unlock rules extracted from
// GameContext.completeQuest.
import { describe, it, expect } from 'vitest'
import { isLegacyAchievementUnlocked } from './achievementsRules'
import { allQuests } from '../../data/quests'

function ctx(overrides: Partial<Parameters<typeof isLegacyAchievementUnlocked>[1]> = {}) {
  return {
    completedCount: 0,
    newStreak: 0,
    newLevel: 1,
    newXp: 0,
    completedQuestIds: [],
    ...overrides,
  }
}

describe('isLegacyAchievementUnlocked', () => {
  it('unlocks first_steps on the very first quest', () => {
    expect(isLegacyAchievementUnlocked('first_steps', ctx({ completedCount: 1 }), 'q1')).toBe(true)
    expect(isLegacyAchievementUnlocked('first_steps', ctx({ completedCount: 0 }), 'q1')).toBe(false)
  })

  it('shares the 7-day threshold between dedicated and streak_7', () => {
    for (const id of ['dedicated', 'streak_7']) {
      expect(isLegacyAchievementUnlocked(id, ctx({ newStreak: 7 }), 'q')).toBe(true)
      expect(isLegacyAchievementUnlocked(id, ctx({ newStreak: 6 }), 'q')).toBe(false)
    }
  })

  it('applies the level ladder at exact boundaries', () => {
    expect(isLegacyAchievementUnlocked('level_5', ctx({ newLevel: 5 }), 'q')).toBe(true)
    expect(isLegacyAchievementUnlocked('level_5', ctx({ newLevel: 4 }), 'q')).toBe(false)
    expect(isLegacyAchievementUnlocked('level_10', ctx({ newLevel: 10 }), 'q')).toBe(true)
    expect(isLegacyAchievementUnlocked('level_10', ctx({ newLevel: 9 }), 'q')).toBe(false)
    expect(isLegacyAchievementUnlocked('level_15', ctx({ newLevel: 15 }), 'q')).toBe(true)
    expect(isLegacyAchievementUnlocked('level_15', ctx({ newLevel: 14 }), 'q')).toBe(false)
  })

  it('applies XP thresholds at exact boundaries', () => {
    expect(isLegacyAchievementUnlocked('xp_500', ctx({ newXp: 500 }), 'q')).toBe(true)
    expect(isLegacyAchievementUnlocked('xp_500', ctx({ newXp: 499 }), 'q')).toBe(false)
    expect(isLegacyAchievementUnlocked('xp_1000', ctx({ newXp: 1000 }), 'q')).toBe(true)
    expect(isLegacyAchievementUnlocked('xp_1000', ctx({ newXp: 999 }), 'q')).toBe(false)
  })

  it('applies the quest-count ladder at exact boundaries', () => {
    expect(isLegacyAchievementUnlocked('topics_10', ctx({ completedCount: 10 }), 'q')).toBe(true)
    expect(isLegacyAchievementUnlocked('topics_10', ctx({ completedCount: 9 }), 'q')).toBe(false)
    expect(isLegacyAchievementUnlocked('topics_25', ctx({ completedCount: 25 }), 'q')).toBe(true)
    expect(isLegacyAchievementUnlocked('topics_25', ctx({ completedCount: 24 }), 'q')).toBe(false)
  })

  it('unlocks streak_30 only at a 30-day streak', () => {
    expect(isLegacyAchievementUnlocked('streak_30', ctx({ newStreak: 30 }), 'q')).toBe(true)
    expect(isLegacyAchievementUnlocked('streak_30', ctx({ newStreak: 29 }), 'q')).toBe(false)
  })

  it('unlocks all_foundations when the current quest completes the realm', () => {
    const foundations = allQuests.filter((q) => q.realmId === 'foundations')
    expect(foundations.length).toBeGreaterThan(0)
    const last = foundations[foundations.length - 1]
    const earlier = foundations.slice(0, -1).map((q) => q.id)

    expect(
      isLegacyAchievementUnlocked('all_foundations', ctx({ completedQuestIds: earlier }), last.id),
    ).toBe(true)
  })

  it('holds all_foundations while any foundations quest is missing', () => {
    const foundations = allQuests.filter((q) => q.realmId === 'foundations')
    const allButOne = foundations.slice(0, -1).map((q) => q.id)

    expect(
      isLegacyAchievementUnlocked(
        'all_foundations',
        ctx({ completedQuestIds: allButOne }),
        'some-unrelated-quest',
      ),
    ).toBe(false)
  })

  it('returns false for unknown achievement ids', () => {
    expect(isLegacyAchievementUnlocked('nonexistent', ctx(), 'q')).toBe(false)
  })
})
