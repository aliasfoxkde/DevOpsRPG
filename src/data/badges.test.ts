// Behavior tests for the badge catalog and the shouldUnlockBadge condition
// matrix: every shipped requirement type gets a passing and a failing roll.
import { describe, it, expect } from 'vitest'
import { BADGES, HANDLED_REQUIREMENT_TYPES, RARITY_COLORS, shouldUnlockBadge } from './badges'

type BadgeStats = Parameters<typeof shouldUnlockBadge>[1]

function buildStats(overrides: Partial<BadgeStats> = {}): BadgeStats {
  return {
    questCount: 0,
    streakDays: 0,
    level: 1,
    quizCount: 0,
    minigameCount: 0,
    perfectQuiz: false,
    quizStreak: 0,
    techCompleted: [],
    realmCompleted: 0,
    typerCount: 0,
    memoryCount: 0,
    mathCount: 0,
    ...overrides,
  }
}

const badgeById = new Map(BADGES.map((b) => [b.id, b]))

function badge(id: string) {
  const entry = badgeById.get(id)
  if (!entry) throw new Error(`badge ${id} is missing from BADGES`)
  return entry
}

describe('BADGES catalog', () => {
  it('has unique ids with names, icons and non-negative rewards', () => {
    const ids = BADGES.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const entry of BADGES) {
      expect(entry.name.length).toBeGreaterThan(0)
      expect(entry.description.length).toBeGreaterThan(0)
      expect(entry.icon.length).toBeGreaterThan(0)
      expect(entry.xpReward).toBeGreaterThanOrEqual(0)
      expect(entry.goldReward).toBeGreaterThanOrEqual(0)
      expect(entry.requirement.value).toBeGreaterThan(0)
    }
  })

  it('only uses requirement types the unlock check handles', () => {
    const handled = new Set<string>(HANDLED_REQUIREMENT_TYPES)
    for (const entry of BADGES) {
      expect(handled.has(entry.requirement.type), `${entry.id} requirement`).toBe(true)
    }
  })

  it('has a color class for every rarity in use', () => {
    for (const entry of BADGES) {
      expect(RARITY_COLORS[entry.rarity].length).toBeGreaterThan(0)
    }
    expect(Object.keys(RARITY_COLORS)).toEqual(['common', 'uncommon', 'rare', 'epic', 'legendary'])
  })
})

describe('shouldUnlockBadge', () => {
  it.each([
    ['first_quest', { questCount: 1 }, true],
    ['first_quest', { questCount: 0 }, false],
    ['quest_10', { questCount: 10 }, true],
    ['quest_10', { questCount: 9 }, false],
    ['quest_all', { questCount: 163 }, true],
    ['quest_all', { questCount: 162 }, false],
    ['streak_7', { streakDays: 7 }, true],
    ['streak_7', { streakDays: 6 }, false],
    ['streak_7_secret', { streakDays: 21 }, true],
    ['level_5', { level: 5 }, true],
    ['level_5', { level: 4 }, false],
    ['quiz_first', { quizCount: 1 }, true],
    ['quiz_10', { quizCount: 9 }, false],
    ['quiz_perfect', { perfectQuiz: true }, true],
    ['quiz_perfect', {}, false],
    ['perfectionist', { quizStreak: 3 }, true],
    ['perfectionist', { quizStreak: 2 }, false],
    ['minigame_first', { minigameCount: 1 }, true],
    ['minigame_10', { minigameCount: 10 }, true],
    ['minigame_10', { minigameCount: 9 }, false],
    ['typer_10', { typerCount: 10 }, true],
    ['typer_10', { typerCount: 9 }, false],
    ['memory_5', { memoryCount: 5 }, true],
    ['math_5', { mathCount: 5 }, true],
    ['early_bird', { earlyQuests: 1 }, true],
    ['early_bird', {}, false],
    ['night_owl', { nightQuests: 1 }, true],
    ['night_owl', {}, false],
    ['lucky_spin', { jackpotSpins: 1 }, true],
    ['lucky_spin', {}, false],
    ['first_mystery', { mysteryBoxesOpened: 1 }, true],
    ['no_mistakes', { perfectQuestCount: 10 }, true],
    ['no_mistakes', { perfectQuestCount: 9 }, false],
    ['marathon', { sessionQuestCount: 10 }, true],
    ['marathon', { sessionQuestCount: 4 }, false],
    ['weekly_crusader', { challengeComplete: 1 }, true],
    ['weekly_crusader', {}, false],
    ['weekly_warrior', { sidequestComplete: 1 }, true],
    ['weekly_warrior', {}, false],
    ['journeyman', { milestoneTier: 1 }, true],
    ['expert', { milestoneTier: 2 }, true],
    ['grandmaster', { milestoneTier: 3 }, false],
    ['all_realms', { allRealms: true }, true],
    ['all_realms', {}, false],
    ['all_tech', { allTechnologies: true }, true],
    ['all_tech', {}, false],
    ['gold_hoarder', { goldHoard: 10000 }, true],
    ['gold_hoarder', { goldHoard: 9999 }, false],
    ['first_legendary', { firstLegendary: true }, true],
    ['first_legendary', {}, false],
    ['quiz_master', { quizMasterScore: 50 }, true],
    ['quiz_master', { quizMasterScore: 49 }, false],
    ['level_25', { level: 25 }, true],
    ['level_25', { level: 24 }, false],
    ['first_companion', { companionOwned: 1 }, true],
    ['first_companion', {}, false],
    ['all_companions', { companionOwned: 4 }, true],
    ['owl_evolution', { companionEvolution: 1 }, true],
    ['owl_evolution', {}, false],
    ['bond_master', { maxBondLevel: 10 }, true],
    ['bond_master', { maxBondLevel: 9 }, false],
    ['prestige_1', { prestigeLevel: 1 }, true],
    ['prestige_1', {}, false],
    ['prestige_10', { prestigeLevel: 10 }, true],
    ['prestige_10', { prestigeLevel: 9 }, false],
  ] as Array<[id: string, overrides: Partial<BadgeStats>, expected: boolean]>)(
    '%s with %j unlocks: %s',
    (id, overrides, expected) => {
      expect(shouldUnlockBadge(badge(id), buildStats(overrides))).toBe(expected)
    },
  )

  it('unlocks tech badges only for the technology they name', () => {
    expect(shouldUnlockBadge(badge('html_master'), buildStats({ techCompleted: ['html'] }))).toBe(
      true,
    )
    expect(shouldUnlockBadge(badge('html_master'), buildStats({ techCompleted: ['css'] }))).toBe(
      false,
    )
    expect(shouldUnlockBadge(badge('html_master'), buildStats())).toBe(false)
    expect(
      shouldUnlockBadge(badge('kubernetes_master'), buildStats({ techCompleted: ['kubernetes'] })),
    ).toBe(true)
  })

  it('counts completed realms', () => {
    expect(
      shouldUnlockBadge(badge('foundations_complete'), buildStats({ realmCompleted: 1 })),
    ).toBe(true)
    expect(shouldUnlockBadge(badge('devops_complete'), buildStats({ realmCompleted: 4 }))).toBe(
      false,
    )
    expect(shouldUnlockBadge(badge('devops_complete'), buildStats({ realmCompleted: 5 }))).toBe(
      true,
    )
  })

  it('unlocks speed badges for fast recorded quests only', () => {
    expect(shouldUnlockBadge(badge('speed_demon'), buildStats({ fastestQuestTime: 60 }))).toBe(true)
    expect(shouldUnlockBadge(badge('speed_demon'), buildStats({ fastestQuestTime: 61 }))).toBe(
      false,
    )
    expect(shouldUnlockBadge(badge('speed_demon'), buildStats())).toBe(false)
    expect(shouldUnlockBadge(badge('speed_demon'), buildStats({ fastestQuestTime: 0 }))).toBe(false)
  })

  it('unlocks the collector badge once every tracked category is earned', () => {
    const earned = ['quest', 'streak', 'skill', 'secret']
    expect(shouldUnlockBadge(badge('collector'), buildStats({ earnedCategories: earned }))).toBe(
      true,
    )
    expect(
      shouldUnlockBadge(badge('collector'), buildStats({ earnedCategories: earned.slice(0, 3) })),
    ).toBe(false)
    expect(shouldUnlockBadge(badge('collector'), buildStats())).toBe(false)
  })

  it('unlocks the completionist badge only when every other badge is earned', () => {
    // The meta-badges themselves are excluded from the required total.
    const total = BADGES.length - 2
    expect(shouldUnlockBadge(badge('completionist'), buildStats({ badgesEarned: total }))).toBe(
      true,
    )
    expect(shouldUnlockBadge(badge('completionist'), buildStats({ badgesEarned: total - 1 }))).toBe(
      false,
    )
  })
})
