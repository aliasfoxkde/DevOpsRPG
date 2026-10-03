import { describe, expect, it } from 'vitest'
import { MAX_HP, MAX_MP, XP_PER_LEVEL } from '../../utils/gameUtils'
import { BADGES } from '../../data/badges'
import { MILESTONES } from '../../data/milestones'
import {
  generateDailyQuests,
  generateSecretQuests,
  generateWeeklyQuests,
} from '../../data/sidequests'
import { ACHIEVEMENTS, createDefaultGame, createEmptyStats } from './defaultState'

// Defaults are the contract every new save (and prestige reset) starts from.
// The ownedItems=[] default in particular is the v0.1.5 fix: legacy saves that
// predate the field keep their items because the storage layer merges this
// factory's defaults under loaded data.
describe('defaultState', () => {
  it('defines a unique set of achievements', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toContain('first_steps')
  })

  it('zeros every per-run stat', () => {
    const stats = createEmptyStats()
    for (const [key, value] of Object.entries(stats)) {
      if (key === 'fastestQuestTime') {
        // Infinity = no quest time recorded yet; real times compare faster.
        expect(value).toBe(Infinity)
      } else if (typeof value === 'boolean') {
        expect(value).toBe(false)
      } else {
        expect(value).toBe(0)
      }
    }
  })

  it('starts the character at level 1 with full resources and an empty inventory', () => {
    const { character } = createDefaultGame()
    expect(character.name).toBe('Hero')
    expect(character.level).toBe(1)
    expect(character.xp).toBe(0)
    expect(character.xpToNextLevel).toBe(XP_PER_LEVEL)
    expect(character.hp).toBe(MAX_HP)
    expect(character.maxHp).toBe(MAX_HP)
    expect(character.mp).toBe(MAX_MP)
    expect(character.maxMp).toBe(MAX_MP)
    expect(character.gold).toBe(0)
    expect(character.skillPoints).toBe(0)
    expect(character.skillAllocations).toEqual({})
    expect(character.xpMultiplier).toBe(1)
    expect(character.goldMultiplier).toBe(1)
    // Progression defaults: base title/frame equipped and unlocked, nothing owned.
    expect(character.equippedTitle).toBe('novice-devops')
    expect(character.equippedFrame).toBe('default')
    expect(character.unlockedTitles).toEqual(['novice-devops'])
    expect(character.unlockedFrames).toEqual(['default'])
    expect(character.equippedItems).toEqual([])
    expect(character.ownedItems).toEqual([])
  })

  it('stamps the current date on the fresh save', () => {
    const { character, lastDailyReset } = createDefaultGame()
    const today = new Date().toISOString().split('T')[0]
    expect(character.lastActive).toBe(today)
    expect(lastDailyReset).toBe(today)
  })

  it('generates the full side-quest board for a new player', () => {
    const { sideQuests } = createDefaultGame()
    expect(sideQuests).toHaveLength(
      generateDailyQuests().length +
        generateWeeklyQuests().length +
        generateSecretQuests().length,
    )
  })

  it('copies the content catalogs so callers cannot mutate the next save', () => {
    const first = createDefaultGame()
    const badgeCount = first.badges.length
    expect(badgeCount).toBe(BADGES.length)
    expect(first.milestones).toHaveLength(MILESTONES.length)
    expect(first.achievements).toHaveLength(ACHIEVEMENTS.length)

    // Mutating one save's arrays must not bleed into a second factory call.
    first.badges.pop()
    first.achievements.pop()
    const second = createDefaultGame()
    expect(second.badges).toHaveLength(BADGES.length)
    expect(second.achievements).toHaveLength(ACHIEVEMENTS.length)
  })

  it('starts every engagement and progression system clean', () => {
    const state = createDefaultGame()
    expect(state.completedQuests).toEqual([])
    expect(state.completedTopics).toEqual([])
    expect(state.collectibles).toEqual([])
    expect(state.dailyRewardsClaimed).toEqual([])
    expect(state.completedRealms).toEqual([])
    expect(state.recentBadgeUnlocks).toEqual([])
    expect(state.recentMilestoneUnlocks).toEqual([])
    expect(state.weakTopics).toEqual({})
    expect(state.skillXp).toEqual({})
    expect(state.companions).toEqual([])
    expect(state.activeCompanion).toBeNull()
    // Claim ledgers guard one-time rewards; empty by definition.
    expect(state.claimedStoryArcs).toEqual([])
    expect(state.claimedCareerMilestones).toEqual([])
    expect(state.claimedCertifications).toEqual([])
    expect(state.claimedEvents).toEqual([])
    // Prestige starts unspent.
    expect(state.prestigeLevel).toBe(0)
    expect(state.prestigeMultiplier).toBe(1.0)
    expect(state.totalPrestigeXp).toBe(0)
    // PvP record zeroed.
    expect(state.pvpStats).toEqual({ points: 0, wins: 0, losses: 0, streak: 0, bestStreak: 0 })
  })

  it('skips onboarding so quests are reachable immediately (ADR 0003)', () => {
    const { hasSeenOnboarding } = createDefaultGame()
    expect(hasSeenOnboarding).toBe(true)
  })

  it('keeps no quest in progress and no victory pending', () => {
    const state = createDefaultGame()
    expect(state.currentQuestId).toBeNull()
    expect(state.currentQuestStartTime).toBeNull()
    expect(state.showVictory).toBe(false)
    expect(state.lastVictory).toBeNull()
    expect(state.showRealmCompletion).toBeNull()
  })
})
