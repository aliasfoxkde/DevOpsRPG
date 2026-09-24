// Behavior tests for milestone triggers, reward tiers, and encouragement copy.
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  MILESTONES,
  REWARD_TIERS,
  checkMilestone,
  getRandomEncouragement,
  type Milestone,
} from './milestones'
import { BADGES } from './badges'

type MilestoneState = Parameters<typeof checkMilestone>[1]

function buildState(overrides: Partial<MilestoneState> = {}): MilestoneState {
  return {
    completedQuests: 0,
    streakDays: 0,
    level: 1,
    completedRealms: [],
    completedTechnologies: [],
    quizStreak: 0,
    minigamesCompleted: 0,
    hasDefeatedBoss: false,
    hasPerfectQuiz: false,
    ...overrides,
  }
}

describe('MILESTONES catalog', () => {
  it('has unique ids and locked entries with positive bonuses', () => {
    const ids = MILESTONES.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const milestone of MILESTONES) {
      expect(milestone.unlocked).toBe(false)
      expect(milestone.unlockedAt).toBeUndefined()
      expect(milestone.xpBonus).toBeGreaterThan(0)
      expect(milestone.message.length).toBeGreaterThan(0)
    }
  })
})

describe('checkMilestone', () => {
  const milestoneById = new Map(MILESTONES.map((m) => [m.id, m]))
  function byId(id: string): Milestone {
    const milestone = milestoneById.get(id)
    if (!milestone) throw new Error(`milestone ${id} is missing from MILESTONES`)
    return milestone
  }

  it.each([
    ['first_quest', { completedQuests: 1 }, true],
    ['first_quest', { completedQuests: 0 }, false],
    ['quest_5', { completedQuests: 5 }, true],
    ['quest_50', { completedQuests: 50 }, true],
    ['streak_3', { streakDays: 3 }, true],
    ['streak_30', { streakDays: 29 }, false],
    ['level_5', { level: 5 }, true],
    ['level_20', { level: 20 }, true],
    ['level_20', { level: 19 }, false],
    ['foundations_complete', { completedRealms: ['foundations'] }, true],
    ['foundations_complete', { completedRealms: ['scripts'] }, false],
    ['html_complete', { completedTechnologies: ['html'] }, true],
    ['js_complete', { completedTechnologies: ['javascript'] }, true],
    ['kubernetes_complete', { completedTechnologies: ['kubernetes'] }, true],
    ['css_complete', { completedTechnologies: ['docker'] }, false],
    ['quiz_streak_3', { quizStreak: 3 }, true],
    ['quiz_streak_3', { quizStreak: 2 }, false],
    ['perfect_quiz', { hasPerfectQuiz: true }, true],
    ['perfect_quiz', { hasPerfectQuiz: false }, false],
    ['minigame_5', { minigamesCompleted: 5 }, true],
    ['minigame_10', { minigamesCompleted: 9 }, false],
    ['first_boss', { hasDefeatedBoss: true }, true],
    ['first_boss', { hasDefeatedBoss: false }, false],
  ] as Array<[id: string, overrides: Partial<MilestoneState>, expected: boolean]>)(
    '%s with %j unlocks: %s',
    (id, overrides, expected) => {
      expect(checkMilestone(byId(id), buildState(overrides))).toBe(expected)
    },
  )

  describe('speed_quest triggers', () => {
    // No shipped milestone uses speed_quest yet, so the trigger is exercised
    // through a minimal milestone that matches the exported shape.
    const speedMilestone: Milestone = {
      id: 'speed_quest_under_five_minutes',
      title: 'Speed Run',
      message: 'Quest cleared in under five minutes!',
      icon: '⚡',
      trigger: { type: 'speed_quest', minutes: 5 },
      xpBonus: 10,
      unlocked: false,
    }

    it('unlocks when the fastest quest time is within the threshold', () => {
      expect(checkMilestone(speedMilestone, buildState({ fastestQuestTime: 300 }))).toBe(true)
      expect(checkMilestone(speedMilestone, buildState({ fastestQuestTime: 301 }))).toBe(false)
    })

    it('ignores quest times that were never recorded', () => {
      expect(checkMilestone(speedMilestone, buildState())).toBe(false)
      expect(checkMilestone(speedMilestone, buildState({ fastestQuestTime: 0 }))).toBe(false)
    })
  })
})

describe('REWARD_TIERS', () => {
  it('lists five tiers with escalating requirements and rewards', () => {
    expect(REWARD_TIERS.map((t) => t.id)).toEqual([
      'tier_1',
      'tier_2',
      'tier_3',
      'tier_4',
      'tier_5',
    ])
    expect(REWARD_TIERS.map((t) => t.requirement)).toEqual([
      { type: 'quests', value: 5 },
      { type: 'quests', value: 15 },
      { type: 'level', value: 10 },
      { type: 'level', value: 15 },
      { type: 'quests', value: 163 },
    ])
    expect(REWARD_TIERS.map((t) => t.rewards.xp)).toEqual([100, 250, 500, 1000, 5000])
    expect(REWARD_TIERS.map((t) => t.rewards.gold)).toEqual([50, 150, 300, 500, 2500])
  })

  it('only references badges that exist in the catalog', () => {
    const badgeIds = new Set(BADGES.map((b) => b.id))
    for (const tier of REWARD_TIERS) {
      if (!tier.rewards.badge) continue
      expect(badgeIds.has(tier.rewards.badge), `${tier.id} badge`).toBe(true)
    }
  })
})

describe('getRandomEncouragement', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('picks the first message when the roll lands at the start of the list', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(getRandomEncouragement()).toBe("You've got this! Every expert was once a beginner. 💪")
  })

  it('picks the last message when the roll lands at the end of the list', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999999)
    expect(getRandomEncouragement()).toBe(
      'The difference between ordinary and extraordinary is practice! 🎯',
    )
  })

  it('always returns a non-empty message', () => {
    for (let i = 0; i < 25; i++) {
      expect(getRandomEncouragement().length).toBeGreaterThan(0)
    }
  })
})
