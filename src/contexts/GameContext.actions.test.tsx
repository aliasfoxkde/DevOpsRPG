// Behavior tests for the rest of the GameContext action surface: store
// purchases, companions, equipment, collectibles, daily rewards, the bonus
// wheel, side quests, skills, stats, prestige, daily dash, titles, and the
// persistence edge cases. Core XP/quest flows live in GameContext.test.tsx.
//
// Every action runs inside `act` (directly for void actions, via `actOn` when
// the action returns a value). Several actions report their result through a
// variable captured inside their state updater, so that value only settles once
// React processes the update — meaning it is not observable at the call site.
// Those actions are therefore asserted through the state they produce, which is
// the contract the UI actually depends on.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { STORAGE_KEYS, XP_PER_LEVEL, XP_THRESHOLDS } from '@/utils/gameUtils'
import { allQuests, realms, type Quest } from '@/data/quests'
import { BADGES } from '@/data/badges'
import { COLLECTIBLES_POOL } from '@/data/collectibles'
import {
  DAILY_QUESTS_POOL,
  SECRET_QUESTS_POOL,
  generateDailyQuests,
  generateWeeklyQuests,
  type SideQuest,
} from '@/data/sidequests'
import { actOn, renderGame, seedGame } from './test-utils'

const DAY_MS = 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000
const TODAY = new Date().toISOString().split('T')[0]
const YESTERDAY = new Date(Date.now() - DAY_MS).toISOString().split('T')[0]
const TWO_DAYS_AGO = new Date(Date.now() - 2 * DAY_MS).toISOString().split('T')[0]

function questSeed(quest: Quest) {
  return {
    questId: quest.id,
    topicId: quest.topicId,
    technologyId: quest.technologyId,
    completed: true,
    xpEarned: quest.xpReward,
    completedAt: '2026-01-01T00:00:00.000Z',
  }
}

function sideQuestSeed(
  poolEntry: Omit<SideQuest, 'completed' | 'progress'>,
  progress = 0,
): SideQuest {
  return { ...poolEntry, completed: false, progress }
}

/** The store's Wise Owl, bonded part of the way to its evolved form. */
function owlCompanion(bondLevel = 1) {
  return {
    id: 'owl',
    name: 'Wise Owl',
    icon: '🦉',
    xpBonus: 0.05,
    goldBonus: 0,
    bondLevel,
    totalQuestsCompleted: bondLevel - 1,
    evolvedForm: 'owl_elder',
    maxBondLevel: 10,
  }
}

function firstQuest(): Quest {
  const quest = allQuests.find((q) => q.id === 'quest_html_intro')
  if (!quest) throw new Error('quest_html_intro is missing from allQuests')
  return quest
}

/** Asserts an ISO timestamp lands `days` ahead of now, within an hour of slack. */
function expectDaysAhead(iso: string, days: number) {
  const target = new Date(iso).getTime()
  expect(target).toBeGreaterThan(Date.now() + days * DAY_MS - HOUR_MS)
  expect(target).toBeLessThan(Date.now() + days * DAY_MS + HOUR_MS)
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('GameContext quest helpers', () => {
  it('tracks the current quest and its start time', () => {
    const getGame = renderGame()
    act(() => {
      getGame().setCurrentQuest('quest_html_basic')
    })
    expect(getGame().game.currentQuestId).toBe('quest_html_basic')
    expect(getGame().game.currentQuestStartTime).toBeGreaterThan(0)
    act(() => {
      getGame().setCurrentQuest(null)
    })
    expect(getGame().game.currentQuestId).toBeNull()
    expect(getGame().game.currentQuestStartTime).toBeNull()
  })

  it('reports completion, the next quest and the remaining pool', () => {
    const getGame = renderGame()
    expect(getGame().totalQuests).toBe(allQuests.length)
    expect(getGame().completedCount).toBe(0)
    act(() => {
      getGame().completeQuest('quest_html_intro')
    })
    expect(getGame().isQuestCompleted('quest_html_intro')).toBe(true)
    expect(getGame().isQuestCompleted('quest_html_editors')).toBe(false)
    expect(getGame().completedCount).toBe(1)
    expect(getGame().getAvailableQuests().length).toBe(allQuests.length - 1)
    expect(getGame().getNextQuest()?.id).toBe('quest_html_editors')
    expect(getGame().getCompletedTopicIds()).toEqual(new Set(['html_intro']))
    act(() => {
      getGame().dismissVictory()
    })
    expect(getGame().game.showVictory).toBe(false)
    expect(getGame().game.lastVictory).toBeNull()
  })

  it('reports realm progress and unlock gating', () => {
    const getGame = renderGame()
    const foundationsQuests = allQuests.filter((q) => q.realmId === 'foundations')
    expect(getGame().getRealmProgress('foundations')).toEqual({
      completed: 0,
      total: foundationsQuests.length,
    })
    expect(getGame().isRealmUnlocked(realms.foundations)).toBe(true)
    expect(getGame().isRealmUnlocked(realms.scripts)).toBe(false)
    expect(getGame().isRealmUnlocked(realms.aiintelligence)).toBe(false)
  })

  it('tracks learning topics separately from quests', () => {
    const getGame = renderGame()
    expect(getGame().isLearningTopicCompleted('css_flexbox')).toBe(false)
    act(() => {
      getGame().completeLearningTopic('css_flexbox', 'css', 30)
    })
    expect(getGame().isLearningTopicCompleted('css_flexbox')).toBe(true)
    expect(getGame().getCompletedLearningTopicIds()).toEqual(new Set(['css_flexbox']))
    expect(getGame().game.completedTopics[0]).toMatchObject({
      topicId: 'css_flexbox',
      technologyId: 'css',
      completed: true,
      xpEarned: 30,
    })
    act(() => {
      getGame().completeLearningTopic('css_flexbox', 'css', 30)
    })
    expect(getGame().game.completedTopics.length).toBe(1)
    expect(getGame().game.character.xp).toBe(30)
  })

  it('keeps the level boundary and derived xp-to-next in sync', () => {
    const getGame = renderGame()
    expect(getGame().game.character.xpToNextLevel).toBe(XP_PER_LEVEL)
    act(() => {
      getGame().addXP(XP_PER_LEVEL - 1)
    })
    expect(getGame().game.character.level).toBe(1)
    act(() => {
      getGame().addXP(1)
    })
    expect(getGame().game.character.level).toBe(2)
    expect(getGame().game.character.xpToNextLevel).toBe(2 * XP_PER_LEVEL)
    act(() => {
      getGame().addXP(XP_PER_LEVEL)
    })
    expect(getGame().game.character.level).toBe(3)
    expect(getGame().game.character.xpToNextLevel).toBe(3 * XP_PER_LEVEL)
  })

  it.each([
    [0, 'DevOps Apprentice'],
    [500, 'DevOps Journeyman'],
    [1000, 'DevOps Expert'],
    [1500, 'DevOps Master'],
    [2100, 'DevOps Sage'],
  ])('assigns the title for a hero at %i xp', (xp, title) => {
    seedGame({ character: { xp, level: Math.floor(xp / XP_PER_LEVEL) + 1 } })
    const getGame = renderGame()
    act(() => {
      getGame().completeQuest(firstQuest().id)
    })
    expect(getGame().game.character.title).toBe(title)
  })
})

describe('GameContext daily rewards', () => {
  it('pays gold on day two', () => {
    const getGame = renderGame()
    act(() => {
      getGame().claimDailyReward(2)
    })
    // The day two reward is 25 gold, so xp is untouched.
    expect(getGame().game.character.gold).toBe(25)
    expect(getGame().game.character.xp).toBe(0)
    expect(getGame().game.dailyRewardsClaimed).toEqual([2])
  })

  it('grants the day three collectible', () => {
    const getGame = renderGame()
    act(() => {
      getGame().claimDailyReward(3)
    })
    expect(getGame().game.collectibles.map((c) => c.id)).toEqual(['xp_small'])
    expect(getGame().game.collectibles[0].used).toBe(false)
    expect(getGame().game.character.xp).toBe(0)
  })

  it('adds a streak bonus on top of the base xp', () => {
    seedGame({ character: { streakDays: 10 } })
    const getGame = renderGame()
    act(() => {
      getGame().claimDailyReward(1)
    })
    // 50 base plus floor(50 * 10 streak days * 0.05)
    expect(getGame().game.character.xp).toBe(75)
  })

  it('upgrades the day three collectible once the streak hits a week', () => {
    seedGame({ character: { streakDays: 7 } })
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const getGame = renderGame()
    act(() => {
      getGame().claimDailyReward(3)
    })
    expect(getGame().game.collectibles.map((c) => c.id)).toEqual(['xp_medium'])
  })

  it('awards a bonus streak shield at very high streaks', () => {
    seedGame({ character: { streakDays: 14 } })
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const getGame = renderGame()
    act(() => {
      getGame().claimDailyReward(1)
    })
    expect(getGame().game.character.streakShields).toBe(1)
    // 50 base plus floor(50 * 14 streak days * 0.05)
    expect(getGame().game.character.xp).toBe(85)
  })

  it('never pays a reward twice', () => {
    const getGame = renderGame()
    act(() => {
      getGame().claimDailyReward(5)
      getGame().claimDailyReward(5)
    })
    expect(getGame().game.dailyRewardsClaimed).toEqual([5])
    expect(getGame().game.character.gold).toBe(50)
  })
})

describe('GameContext bonus wheel', () => {
  it('pays the xp segment reward', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const getGame = renderGame()
    act(() => {
      getGame().spinWheel()
    })
    // A zero roll lands on the first segment, the 50 xp one.
    expect(getGame().game.character.xp).toBe(50)
    expect(getGame().game.character.gold).toBe(0)
    expect(getGame().game.stats.jackpotSpins).toBe(0)
  })

  it('banks the collectible from a collectible segment', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999999)
    const getGame = renderGame()
    act(() => {
      getGame().spinWheel()
    })
    // The last segment is the hint scroll collectible; it pays no xp or gold.
    expect(getGame().game.collectibles.map((c) => c.id)).toEqual(['hint_scroll'])
    expect(getGame().game.character.xp).toBe(0)
    expect(getGame().game.character.gold).toBe(0)
  })

  it('pays gold segments as gold only', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const getGame = renderGame()
    act(() => {
      getGame().spinWheel()
    })
    // Halfway across the weighted wheel sits the 25 gold segment, which is a
    // gold reward and must not hand out matching xp on the side.
    expect(getGame().game.character.gold).toBe(25)
    expect(getGame().game.character.xp).toBe(0)
    expect(getGame().game.stats.jackpotSpins).toBe(0)
  })
})

describe('GameContext collectibles', () => {
  function withFullInventory() {
    seedGame({ collectibles: COLLECTIBLES_POOL.map((c) => ({ ...c })) })
  }

  it('arms the xp multiplier and marks the scroll as used', () => {
    withFullInventory()
    const getGame = renderGame()
    act(() => {
      getGame().consumeCollectible('xp_small')
    })
    expect(getGame().game.character.xpMultiplier).toBe(2)
    expect(getGame().game.character.goldMultiplier).toBe(1)
    expect(getGame().game.collectibles.find((c) => c.id === 'xp_small')?.used).toBe(true)
    expect(
      getGame()
        .getActiveCollectibles()
        .map((c) => c.id),
    ).not.toContain('xp_small')
  })

  it('arms the gold multiplier from a gold boost', () => {
    withFullInventory()
    const getGame = renderGame()
    act(() => {
      getGame().consumeCollectible('gold_medium')
    })
    expect(getGame().game.character.goldMultiplier).toBe(3)
    expect(getGame().game.character.xpMultiplier).toBe(1)
  })

  it('spends a hint scroll without touching the multipliers', () => {
    withFullInventory()
    const getGame = renderGame()
    act(() => {
      getGame().consumeCollectible('hint_scroll')
    })
    expect(getGame().game.character.xpMultiplier).toBe(1)
    expect(getGame().game.character.goldMultiplier).toBe(1)
    expect(getGame().game.collectibles.find((c) => c.id === 'hint_scroll')?.used).toBe(true)
  })

  it('opens a mystery box and counts the opening', () => {
    withFullInventory()
    const getGame = renderGame()
    act(() => {
      getGame().consumeCollectible('mystery_common')
    })
    // Box contents are granted separately through grantCollectible.
    expect(getGame().game.character.gold).toBe(0)
    expect(getGame().game.stats.mysteryBoxesOpened).toBe(1)
    expect(getGame().game.collectibles.find((c) => c.id === 'mystery_common')?.used).toBe(true)
  })

  it('adds a granted collectible to the inventory as unused', () => {
    const getGame = renderGame()
    const reward = COLLECTIBLES_POOL.find((c) => c.id === 'hint_scroll')
    if (!reward) throw new Error('hint_scroll is missing from COLLECTIBLES_POOL')
    act(() => {
      getGame().grantCollectible({ ...reward, used: true })
    })
    expect(getGame().game.collectibles).toEqual([{ ...reward, used: false }])
    expect(
      getGame()
        .getActiveCollectibles()
        .map((c) => c.id),
    ).toEqual(['hint_scroll'])
  })

  it('leaves the inventory alone for unknown collectible ids', () => {
    withFullInventory()
    const getGame = renderGame()
    act(() => {
      getGame().consumeCollectible('not_a_collectible')
    })
    expect(getGame().game.collectibles.length).toBe(COLLECTIBLES_POOL.length)
    expect(getGame().game.stats.mysteryBoxesOpened).toBe(0)
  })

  it('never consumes the same collectible twice', () => {
    withFullInventory()
    const getGame = renderGame()
    act(() => {
      getGame().consumeCollectible('streak_shield')
      getGame().consumeCollectible('streak_shield')
    })
    // Owned copies stay in the inventory: they are marked used, not removed.
    expect(getGame().game.collectibles.length).toBe(COLLECTIBLES_POOL.length)
    expect(getGame().getActiveCollectibles().length).toBe(COLLECTIBLES_POOL.length - 1)
  })
})

describe('GameContext badge and milestone unlocks', () => {
  const htmlQuests = allQuests.filter((q) => q.technologyId === 'html')

  it('unlocks every badge the current state qualifies for', () => {
    seedGame({ character: { level: 5 }, completedQuests: htmlQuests.map(questSeed) })
    const getGame = renderGame()
    act(() => {
      getGame().checkAndUnlockBadges()
    })
    expect(getGame().game.recentBadgeUnlocks.map((b) => b.id)).toEqual([
      'first_quest',
      'quest_10',
      'level_5',
      'html_master',
    ])
    expect(getGame().game.recentBadgeUnlocks.every((b) => b.unlockedAt)).toBe(true)
    act(() => {
      getGame().checkAndUnlockBadges()
    })
    // Already-unlocked badges are not announced twice.
    expect(getGame().game.recentBadgeUnlocks.length).toBe(4)
  })

  it('unlocks every milestone the current state qualifies for', () => {
    seedGame({ character: { level: 5 }, completedQuests: htmlQuests.map(questSeed) })
    const getGame = renderGame()
    act(() => {
      getGame().checkAndUnlockMilestones()
    })
    expect(getGame().game.recentMilestoneUnlocks.map((m) => m.id)).toEqual([
      'first_quest',
      'quest_5',
      'quest_10',
      'level_5',
      'first_boss',
      'html_complete',
    ])
    expect(getGame().game.recentMilestoneUnlocks.every((m) => m.unlocked)).toBe(true)
    act(() => {
      getGame().checkAndUnlockMilestones()
    })
    expect(getGame().game.recentMilestoneUnlocks.length).toBe(6)
  })

  it('pays a milestone bonus on every claim once it is unlocked', () => {
    seedGame({ character: { level: 5 } })
    const getGame = renderGame()
    expect(getGame().game.milestones.find((m) => m.id === 'level_5')?.unlocked).toBe(false)
    act(() => {
      getGame().checkAndUnlockMilestones()
    })
    expect(getGame().game.milestones.find((m) => m.id === 'level_5')?.unlocked).toBe(true)
    act(() => {
      getGame().claimMilestone('level_5')
    })
    expect(getGame().game.character.xp).toBe(75)
    // Claiming is not recorded, so a second claim pays out again.
    act(() => {
      getGame().claimMilestone('level_5')
    })
    expect(getGame().game.character.xp).toBe(150)
    act(() => {
      getGame().claimMilestone('quest_100')
    })
    // A locked milestone pays nothing.
    expect(getGame().game.character.xp).toBe(150)
  })

  it('pays badge rewards only after the badge is unlocked', () => {
    const getGame = renderGame()
    const badge = BADGES.find((b) => b.id === 'quest_10')
    if (!badge) throw new Error('quest_10 is missing from BADGES')
    act(() => {
      getGame().claimBadge('quest_10')
    })
    expect(getGame().game.character.xp).toBe(0)
    expect(getGame().game.character.gold).toBe(0)
    act(() => {
      getGame().grantBadge('quest_10')
    })
    act(() => {
      getGame().claimBadge('quest_10')
    })
    expect(getGame().game.character.xp).toBe(badge.xpReward)
    expect(getGame().game.character.gold).toBe(badge.goldReward)
  })
})

describe('GameContext side quests', () => {
  const [dailyQuest] = DAILY_QUESTS_POOL
  const [secretQuest] = SECRET_QUESTS_POOL

  it('claims a side quest once and pays its rewards', () => {
    seedGame({
      sideQuests: [
        sideQuestSeed(dailyQuest, 1),
        { ...sideQuestSeed(secretQuest), completed: true },
      ],
    })
    const getGame = renderGame()
    expect(getGame().game.sideQuests.find((q) => q.id === dailyQuest.id)?.rewards).toEqual({
      xp: 75,
      gold: 30,
    })
    act(() => {
      getGame().claimSideQuest(dailyQuest.id)
    })
    expect(getGame().game.character.xp).toBe(75)
    expect(getGame().game.character.gold).toBe(30)
    expect(getGame().game.sideQuests.find((q) => q.id === dailyQuest.id)?.completed).toBe(true)
    act(() => {
      getGame().claimSideQuest(dailyQuest.id)
    })
    expect(getGame().game.character.xp).toBe(75)
  })

  it('refreshes side quests without resurrecting completed ones', () => {
    seedGame({
      sideQuests: [
        sideQuestSeed(dailyQuest, 1),
        { ...sideQuestSeed(secretQuest), completed: true },
      ],
    })
    const getGame = renderGame()
    act(() => {
      getGame().refreshSideQuests()
    })
    const quests = getGame().game.sideQuests
    // The in-progress quest survives with its progress intact; the completed
    // secret quest does not come back. A fresh daily pick may reuse the
    // in-progress id, so only the carry-over copy is checked for progress.
    expect(quests.some((q) => q.id === dailyQuest.id && q.progress === 1)).toBe(true)
    expect(quests.filter((q) => q.id === secretQuest.id)).toEqual([])
    expect(quests.length).toBe(
      1 +
        generateDailyQuests().length +
        generateWeeklyQuests().length +
        SECRET_QUESTS_POOL.length -
        1,
    )
  })
})

describe('GameContext skills', () => {
  it('refuses to allocate without points', () => {
    const getGame = renderGame()
    expect(getGame().getAvailableSkillPoints()).toBe(0)
    act(() => {
      getGame().allocateSkillPoint('ci_cd')
    })
    expect(getGame().getSkillLevel('ci_cd')).toBe(0)
    expect(getGame().getAvailableSkillPoints()).toBe(0)
  })

  it('spends points one at a time and tracks per-tech xp', () => {
    seedGame({ character: { skillPoints: 2 } })
    const getGame = renderGame()
    act(() => {
      getGame().allocateSkillPoint('ci_cd')
      getGame().allocateSkillPoint('ci_cd')
      getGame().allocateSkillPoint('ci_cd')
    })
    expect(getGame().getSkillLevel('ci_cd')).toBe(2)
    expect(getGame().getAvailableSkillPoints()).toBe(0)
    expect(getGame().getSkillXp('html')).toBe(0)
    act(() => {
      getGame().completeQuest(firstQuest().id)
    })
    expect(getGame().getSkillXp(firstQuest().technologyId)).toBe(firstQuest().xpReward)
  })

  it('maps xp onto the shared level ladder', () => {
    const getGame = renderGame()
    expect(getGame().getSkillLevelFromXp(0)).toBe(0)
    XP_THRESHOLDS.forEach((threshold, index) => {
      expect(getGame().getSkillLevelFromXp(threshold)).toBe(index)
      if (index > 0) {
        expect(getGame().getSkillLevelFromXp(threshold - 1)).toBe(index - 1)
      }
    })
    expect(getGame().getSkillLevelFromXp(999999)).toBe(XP_THRESHOLDS.length - 1)
  })
})

describe('GameContext stats and spaced repetition', () => {
  it('records a perfect quiz that passed with 80%', () => {
    const getGame = renderGame()
    act(() => {
      getGame().incrementStat('quiz', true, 0, true, 'html_intro')
    })
    expect(getGame().game.stats).toMatchObject({
      quizCount: 1,
      quizPerfectCount: 1,
      quizStreak: 1,
      perfectQuiz: true,
      wrongAnswerCount: 0,
      perfectQuestCount: 1,
      quizMasterScore: 1,
    })
  })

  it('resets the streak and records wrong answers for an imperfect quiz', () => {
    seedGame({ stats: { quizStreak: 4, wrongAnswerCount: 2 } })
    const getGame = renderGame()
    act(() => {
      getGame().incrementStat('quiz', false, 3, false, 'css_boxmodel')
    })
    expect(getGame().game.stats).toMatchObject({
      quizCount: 1,
      quizStreak: 0,
      wrongAnswerCount: 5,
      perfectQuestCount: 0,
      quizMasterScore: 0,
    })
    const weak = getGame().game.weakTopics.css_boxmodel
    expect(weak).toMatchObject({ wrongCount: 1, masteryLevel: 0 })
    expectDaysAhead(weak.nextReview, 1)
  })

  it('moves weak-topic mastery up on a correct answer and down on a wrong one', () => {
    const getGame = renderGame()
    act(() => {
      getGame().incrementStat('quiz', false, 2, false, 'html_intro')
    })
    expect(getGame().game.weakTopics.html_intro).toMatchObject({ wrongCount: 1, masteryLevel: 0 })
    act(() => {
      getGame().incrementStat('quiz', false, 0, false, 'html_intro')
    })
    expect(getGame().game.weakTopics.html_intro).toMatchObject({ wrongCount: 1, masteryLevel: 1 })
    expectDaysAhead(getGame().game.weakTopics.html_intro.nextReview, 3)
    act(() => {
      getGame().incrementStat('quiz', false, 1, false, 'html_intro')
    })
    expect(getGame().game.weakTopics.html_intro).toMatchObject({ wrongCount: 2, masteryLevel: 0 })
    expectDaysAhead(getGame().game.weakTopics.html_intro.nextReview, 1)
  })

  it('clamps weak-topic mastery to the top of its range', () => {
    const getGame = renderGame()
    for (let index = 0; index < 5; index += 1) {
      act(() => {
        getGame().incrementStat('quiz', false, 0, false, 'python_variables')
      })
    }
    expect(getGame().game.weakTopics.python_variables).toMatchObject({
      wrongCount: 0,
      masteryLevel: 3,
    })
    expectDaysAhead(getGame().game.weakTopics.python_variables.nextReview, 14)
  })

  it('counts every mini-game stat tracker', () => {
    const getGame = renderGame()
    act(() => {
      getGame().incrementStat('typer')
      getGame().incrementStat('memory')
      getGame().incrementStat('math')
      getGame().incrementStat('minigame')
      getGame().incrementStat('challenge')
    })
    expect(getGame().game.stats).toMatchObject({
      typerCount: 1,
      memoryCount: 1,
      mathCount: 1,
      minigameCount: 1,
      challengeComplete: 1,
    })
  })

  it('resets the quiz streak on demand', () => {
    seedGame({ stats: { quizStreak: 7 } })
    const getGame = renderGame()
    act(() => {
      getGame().resetQuizStreak()
    })
    expect(getGame().game.stats.quizStreak).toBe(0)
  })

  it('lists weak topics and only those due for review', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'))
    const getGame = renderGame()
    act(() => {
      getGame().incrementStat('quiz', false, 2, false, 'html_intro')
      getGame().incrementStat('quiz', false, 1, false, 'css_boxmodel')
    })
    expect(
      getGame()
        .getWeakTopics()
        .map((t) => t.topicId),
    ).toEqual(['html_intro', 'css_boxmodel'])
    // Both reviews are a day out, so nothing is due yet.
    expect(getGame().getTopicsDueForReview()).toEqual([])
    vi.setSystemTime(new Date('2026-01-02T12:00:00.000Z'))
    expect(getGame().getTopicsDueForReview()).toEqual(['html_intro', 'css_boxmodel'])
  })
})

describe('GameContext prestige', () => {
  it('blocks prestige until every quest is complete', () => {
    const getGame = renderGame()
    expect(getGame().canPrestige()).toBe(false)
    expect(getGame().getPrestigeBonuses()).toEqual({
      xpBonus: 0,
      goldBonus: 0,
      bonusDescription: 'Current: +0% XP, +0% Gold | After prestige: +0% XP, +0% Gold',
    })
  })

  it('resets progress, keeps badges and banks the multiplier', () => {
    seedGame({
      character: { xp: 2500, level: 26, gold: 900 },
      completedQuests: allQuests.map(questSeed),
      completedRealms: Object.keys(realms),
      collectibles: [{ ...COLLECTIBLES_POOL[0] }],
      companions: [owlCompanion(5)],
      activeCompanion: owlCompanion(5),
      dailyRewardsClaimed: [1, 2],
      stats: { quizCount: 5 },
      badges: [{ ...BADGES[0], unlockedAt: '2026-01-01T00:00:00.000Z' }],
    })
    const getGame = renderGame()
    expect(getGame().canPrestige()).toBe(true)
    act(() => {
      getGame().doPrestige()
    })
    const after = getGame()
    expect(after.game.character).toMatchObject({
      xp: 0,
      level: 1,
      gold: 0,
      title: 'Novice',
      streakDays: 0,
      skillPoints: 0,
      xpMultiplier: 1,
      goldMultiplier: 1,
    })
    expect(after.game.character.xpToNextLevel).toBe(XP_PER_LEVEL)
    expect(after.game.completedQuests).toEqual([])
    expect(after.game.completedRealms).toEqual([])
    expect(after.game.collectibles).toEqual([])
    expect(after.game.dailyRewardsClaimed).toEqual([])
    expect(after.game.stats.quizCount).toBe(0)
    expect(after.game.prestigeLevel).toBe(1)
    expect(after.game.prestigeMultiplier).toBe(1 + 1 * 0.05)
    expect(after.game.totalPrestigeXp).toBe(2500)
    expect(after.game.hasSeenOnboarding).toBe(true)
    expect(after.game.activeCompanion).toBeNull()
    expect(after.game.companions).toEqual([owlCompanion(1)])
    expect(after.game.badges[0].unlockedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(after.getPrestigeBonuses()).toEqual({
      xpBonus: 5,
      goldBonus: 3,
      bonusDescription: 'Current: +5% XP, +3% Gold | After prestige: +5% XP, +3% Gold',
    })
  })
})

describe('GameContext daily dash', () => {
  it('completes a dash after five quests and keeps the best time', () => {
    seedGame({ dailyDash: { bestTime: 600 } })
    const getGame = renderGame()
    expect(getGame().isDailyDashActive()).toBe(false)
    act(() => {
      getGame().startDailyDash()
    })
    expect(getGame().isDailyDashActive()).toBe(true)
    expect(getGame().game.dailyDash.lastPlayedDate).toBe(TODAY)
    const dashQuests = allQuests.slice(0, 5)
    act(() => {
      for (const quest of dashQuests) {
        getGame().completeDailyDashQuest(quest.id)
      }
    })
    const dash = getGame().game.dailyDash
    expect(dash.completedQuests).toEqual(dashQuests.map((q) => q.id))
    expect(dash.active).toBe(false)
    expect(dash.startTime).toBeNull()
    expect(dash.bestTime).toBeGreaterThanOrEqual(0)
    expect(dash.bestTime).toBeLessThanOrEqual(600)
  })

  it('ignores completions outside a dash and duplicate quests', () => {
    const getGame = renderGame()
    act(() => {
      getGame().completeDailyDashQuest('quest_html_intro')
    })
    expect(getGame().game.dailyDash.completedQuests).toEqual([])
    act(() => {
      getGame().startDailyDash()
      getGame().completeDailyDashQuest('quest_html_intro')
      getGame().completeDailyDashQuest('quest_html_intro')
    })
    expect(getGame().game.dailyDash.completedQuests).toEqual(['quest_html_intro'])
    expect(getGame().isDailyDashActive()).toBe(true)
  })

  it('abandons the dash but keeps the best time and date', () => {
    seedGame({ dailyDash: { bestTime: 30, lastPlayedDate: '2026-01-01' } })
    const getGame = renderGame()
    act(() => {
      getGame().startDailyDash()
      getGame().abandonDailyDash()
    })
    expect(getGame().game.dailyDash).toEqual({
      active: false,
      startTime: null,
      completedQuests: [],
      bestTime: 30,
      lastPlayedDate: TODAY,
    })
  })
})

describe('GameContext store purchases', () => {
  it('rejects purchases the hero cannot afford', () => {
    const getGame = renderGame()
    expect(actOn(() => getGame().purchaseItem('buy_companion_owl', 500))).toBe(false)
    expect(getGame().game.companions).toEqual([])
    expect(getGame().game.character.gold).toBe(0)
  })

  it('buys and auto-equips a companion exactly once', () => {
    seedGame({ character: { gold: 600 } })
    const getGame = renderGame()
    expect(actOn(() => getGame().purchaseItem('buy_companion_owl', 500))).toBe(true)
    expect(getGame().game.character.gold).toBe(100)
    expect(getGame().game.companions.map((c) => c.id)).toEqual(['owl'])
    expect(getGame().game.activeCompanion?.id).toBe('owl')
    expect(actOn(() => getGame().purchaseItem('buy_companion_owl', 500))).toBe(false)
    expect(getGame().game.character.gold).toBe(100)
    expect(getGame().game.companions.length).toBe(1)
  })

  it('rejects unknown companions and unknown items', () => {
    seedGame({ character: { gold: 1000 } })
    const getGame = renderGame()
    expect(actOn(() => getGame().purchaseItem('buy_companion_dragon_lord', 100))).toBe(false)
    expect(actOn(() => getGame().purchaseItem('lucky_rabbit_foot', 100))).toBe(false)
    expect(getGame().game.character.gold).toBe(1000)
    expect(getGame().game.collectibles).toEqual([])
  })

  it('buys collectibles into the inventory', () => {
    seedGame({ character: { gold: 100 } })
    const getGame = renderGame()
    expect(actOn(() => getGame().purchaseItem('buy_gold_small', 40))).toBe(true)
    expect(getGame().game.character.gold).toBe(60)
    expect(getGame().game.collectibles.map((c) => c.id)).toEqual(['gold_small'])
    expect(
      getGame()
        .getActiveCollectibles()
        .map((c) => c.id),
    ).toEqual(['gold_small'])
  })

  it('equips only owned companions', () => {
    seedGame({ character: { gold: 1200 } })
    const getGame = renderGame()
    act(() => {
      getGame().purchaseItem('buy_companion_cat', 500)
    })
    expect(getGame().game.activeCompanion?.id).toBe('cat')
    act(() => {
      getGame().equipCompanion('owl')
    })
    expect(getGame().game.activeCompanion?.id).toBe('cat')
  })
})

describe('GameContext equipment', () => {
  it('equips, sums bonuses and unequips items', () => {
    const getGame = renderGame()
    expect(getGame().getEquippedItems()).toEqual([])
    expect(actOn(() => getGame().equipItem('laptop_basic'))).toBe(true)
    expect(actOn(() => getGame().equipItem('laptop_basic'))).toBe(true)
    expect(actOn(() => getGame().equipItem('cloud_server'))).toBe(true)
    expect(getGame().getEquippedItems()).toEqual(['laptop_basic', 'cloud_server'])
    expect(getGame().getEquipmentBonuses()).toEqual({
      xpBonus: 0.02,
      goldBonus: 0,
      quizScoreBonus: 0,
      streakProtection: 0,
      techBonuses: { aws: 0.1 },
    })
    expect(actOn(() => getGame().unequipItem('laptop_basic'))).toBe(true)
    expect(actOn(() => getGame().unequipItem('laptop_basic'))).toBe(true)
    expect(getGame().getEquippedItems()).toEqual(['cloud_server'])
  })

  it('keeps unknown item ids out of the bonus calculation', () => {
    const getGame = renderGame()
    expect(actOn(() => getGame().equipItem('flux_capacitor'))).toBe(true)
    expect(getGame().getEquipmentBonuses()).toEqual({
      xpBonus: 0,
      goldBonus: 0,
      quizScoreBonus: 0,
      streakProtection: 0,
      techBonuses: {},
    })
  })
})

describe('GameContext titles and frames', () => {
  it('unlocks the ten-quest title and bronze frame once', () => {
    seedGame({ completedQuests: allQuests.slice(0, 10).map(questSeed) })
    const getGame = renderGame()
    act(() => {
      getGame().checkAndUnlockTitlesFrames()
    })
    expect(getGame().game.character.unlockedTitles).toContain('eager-learner')
    expect(getGame().game.character.unlockedFrames).toContain('bronze')
    act(() => {
      getGame().checkAndUnlockTitlesFrames()
    })
    expect(
      getGame().game.character.unlockedTitles.filter((t) => t === 'eager-learner').length,
    ).toBe(1)
    expect(getGame().game.character.unlockedFrames.filter((f) => f === 'bronze').length).toBe(1)
  })

  it('equips only unlocked titles and frames', () => {
    seedGame({ completedQuests: allQuests.slice(0, 10).map(questSeed) })
    const getGame = renderGame()
    act(() => {
      getGame().checkAndUnlockTitlesFrames()
    })
    expect(actOn(() => getGame().equipTitle('eager-learner'))).toBe(true)
    expect(getGame().game.character.equippedTitle).toBe('eager-learner')
    expect(actOn(() => getGame().equipTitle('code-crusader'))).toBe(false)
    expect(getGame().game.character.equippedTitle).toBe('eager-learner')
    expect(actOn(() => getGame().equipFrame('bronze'))).toBe(true)
    expect(getGame().game.character.equippedFrame).toBe('bronze')
    expect(actOn(() => getGame().equipFrame('diamond'))).toBe(false)
    expect(getGame().game.character.equippedFrame).toBe('bronze')
  })
})

describe('GameContext quest completion edge paths', () => {
  it('completes a realm, unlocks achievements and awards a skill point', () => {
    const foundations = allQuests.filter((q) => q.realmId === 'foundations')
    const last = foundations[foundations.length - 1]
    seedGame({ character: { xp: 50 }, completedQuests: foundations.slice(0, -1).map(questSeed) })
    const getGame = renderGame()
    act(() => {
      getGame().completeQuest(last.id)
    })
    const game = getGame().game
    expect(game.completedRealms).toEqual(['foundations'])
    expect(game.showRealmCompletion).toBe('foundations')
    expect(game.milestones.find((m) => m.id === 'first_quest')?.unlocked).toBe(true)
    expect(game.badges.find((b) => b.id === 'first_quest')?.unlockedAt).toBeDefined()
    expect(game.achievements.find((a) => a.id === 'first_steps')?.unlockedAt).toBeDefined()
    expect(game.achievements.find((a) => a.id === 'all_foundations')?.unlockedAt).toBeDefined()
    // One level was gained (50 -> 103 xp), which grants one skill point.
    expect(game.character.skillPoints).toBe(1)
    act(() => {
      getGame().dismissRealmCompletion()
    })
    expect(getGame().game.showRealmCompletion).toBeNull()
  })

  it('spends a streak shield to protect a broken streak', () => {
    seedGame({ character: { streakDays: 5, streakShields: 2, lastActive: TWO_DAYS_AGO } })
    const getGame = renderGame()
    act(() => {
      getGame().completeQuest(firstQuest().id)
    })
    expect(getGame().game.character.streakDays).toBe(5)
    expect(getGame().game.character.streakShields).toBe(1)
  })

  it('resets a broken streak when no shield is left', () => {
    seedGame({ character: { streakDays: 5, streakShields: 0, lastActive: TWO_DAYS_AGO } })
    const getGame = renderGame()
    act(() => {
      getGame().completeQuest(firstQuest().id)
    })
    expect(getGame().game.character.streakDays).toBe(1)
    expect(getGame().game.character.streakShields).toBe(0)
  })

  it('extends the streak on consecutive days', () => {
    seedGame({ character: { streakDays: 4, lastActive: YESTERDAY } })
    const getGame = renderGame()
    act(() => {
      getGame().completeQuest(firstQuest().id)
    })
    expect(getGame().game.character.streakDays).toBe(5)
    expect(getGame().game.character.lastActive).toBe(TODAY)
  })

  it('keeps the streak untouched when the hero already played today', () => {
    seedGame({ character: { streakDays: 4, lastActive: TODAY } })
    const getGame = renderGame()
    act(() => {
      getGame().completeQuest(firstQuest().id)
    })
    expect(getGame().game.character.streakDays).toBe(4)
    expect(getGame().game.character.streakShields).toBe(0)
  })

  it('doubles quest rewards while an xp collectible is armed', () => {
    seedGame({ collectibles: [{ ...COLLECTIBLES_POOL[0] }] })
    const getGame = renderGame()
    act(() => {
      getGame().consumeCollectible('xp_small')
      getGame().completeQuest(firstQuest().id)
    })
    const quest = firstQuest()
    expect(getGame().game.character.xp).toBe(quest.xpReward * 2)
    // Gold has its own multiplier, which the xp scroll does not touch.
    expect(getGame().game.character.gold).toBe(Math.floor(quest.xpReward * 0.1))
    expect(getGame().game.character.xpMultiplier).toBe(1)
    expect(getGame().getSkillXp(quest.technologyId)).toBe(quest.xpReward * 2)
  })

  it('applies the active companion bonus to quest rewards', () => {
    seedGame({ companions: [owlCompanion()], activeCompanion: owlCompanion() })
    const getGame = renderGame()
    const quest = firstQuest()
    act(() => {
      getGame().completeQuest(quest.id)
    })
    const game = getGame().game
    expect(game.character.xp).toBe(Math.floor(quest.xpReward * 1.05))
    expect(game.character.gold).toBe(Math.floor(quest.xpReward * 0.1 * 1.05))
    expect(game.companions[0]).toMatchObject({ id: 'owl', bondLevel: 2, totalQuestsCompleted: 1 })
  })

  it('advances every side quest tracker on quest completion', () => {
    const questTracker = DAILY_QUESTS_POOL.find((q) => q.requirement.type === 'complete_quests')
    const xpTracker = DAILY_QUESTS_POOL.find((q) => q.requirement.type === 'earn_xp')
    const streakTracker = DAILY_QUESTS_POOL.find((q) => q.requirement.type === 'maintain_streak')
    if (!questTracker || !xpTracker || !streakTracker) {
      throw new Error('the daily pool is missing a tracker side quest')
    }
    seedGame({
      character: { streakDays: 1, lastActive: TODAY },
      sideQuests: [
        sideQuestSeed(questTracker),
        sideQuestSeed(xpTracker),
        sideQuestSeed(streakTracker),
      ],
    })
    const getGame = renderGame()
    act(() => {
      getGame().completeQuest(firstQuest().id)
    })
    const progress = (id: string) => getGame().game.sideQuests.find((q) => q.id === id)?.progress
    expect(progress(questTracker.id)).toBe(1)
    expect(progress(xpTracker.id)).toBe(firstQuest().xpReward)
    expect(progress(streakTracker.id)).toBe(1)
  })

  it('tracks community and dash progress for a completed quest', () => {
    seedGame({ dailyDash: { active: true, startTime: Date.now() - 5000 } })
    const getGame = renderGame()
    act(() => {
      getGame().completeQuest(firstQuest().id)
    })
    const game = getGame().game
    expect(game.communityStats.weeklyQuestsCompleted).toBe(1)
    expect(game.communityStats.weeklyXPCompleted).toBe(firstQuest().xpReward)
    expect(game.dailyDash.active).toBe(true)
    expect(game.dailyDash.completedQuests).toEqual([firstQuest().id])
    expect(game.stats.sessionQuestCount).toBe(1)
  })

  it('drops a collectible when the drop roll succeeds', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const getGame = renderGame()
    act(() => {
      getGame().completeQuest(firstQuest().id)
    })
    expect(getGame().game.collectibles.map((c) => c.id)).toEqual(['xp_small'])
  })

  it('persists every change to both storage keys', () => {
    seedGame({ character: { gold: 600 } })
    const getGame = renderGame()
    actOn(() => getGame().purchaseItem('buy_companion_owl', 500))
    for (const key of [STORAGE_KEYS.GAME, STORAGE_KEYS.BACKUP]) {
      const raw = localStorage.getItem(key)
      if (!raw) throw new Error(`expected a persisted save under ${key}`)
      const stored: unknown = JSON.parse(raw)
      if (typeof stored !== 'object' || stored === null || !('character' in stored)) {
        throw new Error(`the save under ${key} did not match the persisted shape`)
      }
      const save = stored as { character: { gold: number }; companions: { id: string }[] }
      expect(save.character.gold).toBe(100)
      expect(save.companions.map((c) => c.id)).toEqual(['owl'])
    }
  })

  it('evolves the active companion at max bond and keeps it equipped', () => {
    seedGame({ character: { gold: 600 } })
    const getGame = renderGame()
    act(() => {
      getGame().purchaseItem('buy_companion_owl', 500)
    })
    // Bond starts at 1 and grows once per quest, so the ninth quest reaches the
    // max bond level of 10 and triggers the evolution.
    act(() => {
      for (const quest of allQuests.slice(0, 9)) {
        getGame().completeQuest(quest.id)
      }
    })
    expect(getGame().game.companions.map((c) => c.id)).toEqual(['owl_elder'])
    expect(getGame().game.activeCompanion?.id).toBe('owl_elder')
    expect(getGame().game.companions[0]).toMatchObject({
      bondLevel: 10,
      totalQuestsCompleted: 9,
    })
    act(() => {
      getGame().completeQuest(allQuests[9].id)
    })
    // The evolved form is already evolved, so it stays equipped and keeps counting.
    expect(getGame().game.companions.map((c) => c.id)).toEqual(['owl_elder'])
    expect(getGame().game.activeCompanion?.id).toBe('owl_elder')
    expect(getGame().game.companions[0].totalQuestsCompleted).toBe(10)
  })
})

describe('GameContext persistence edge cases', () => {
  it('restores the no-record sentinel for the fastest quest time', () => {
    seedGame({ stats: { fastestQuestTime: null } })
    const getGame = renderGame()
    expect(getGame().game.stats.fastestQuestTime).toBe(Infinity)
  })

  it('repairs non-numeric streak shields', () => {
    seedGame({ character: { streakShields: 'many' } })
    const getGame = renderGame()
    expect(getGame().game.character.streakShields).toBe(0)
  })

  it('replaces malformed collections with defaults', () => {
    seedGame({
      recentBadgeUnlocks: 'nope',
      recentMilestoneUnlocks: 7,
      achievements: 'nope',
      collectibles: 'nope',
      completedRealms: 'nope',
    })
    const getGame = renderGame()
    const game = getGame().game
    expect(game.recentBadgeUnlocks).toEqual([])
    expect(game.recentMilestoneUnlocks).toEqual([])
    expect(game.collectibles).toEqual([])
    expect(game.completedRealms).toEqual([])
    expect(game.achievements.length).toBeGreaterThan(0)
    expect(
      game.achievements.every((a) => typeof a.id === 'string' && a.unlockedAt === undefined),
    ).toBe(true)
  })

  it('keeps achievement timestamps for known ids only', () => {
    seedGame({
      achievements: [
        { id: 'first_steps', unlockedAt: '2026-02-03T04:05:06.000Z' },
        { id: 'ghost', unlockedAt: '2026-02-03T04:05:06.000Z' },
      ],
    })
    const getGame = renderGame()
    const achievements = getGame().game.achievements
    expect(achievements.find((a) => a.id === 'first_steps')?.unlockedAt).toBe(
      '2026-02-03T04:05:06.000Z',
    )
    expect(achievements.find((a) => a.id === 'dedicated')?.unlockedAt).toBeUndefined()
    expect(achievements.some((a) => a.id === 'ghost')).toBe(false)
  })

  it('keeps playing when localStorage writes fail', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })
    const getGame = renderGame()
    act(() => {
      getGame().addGold(1)
      getGame().addGold(1)
    })
    expect(getGame().game.character.gold).toBe(2)
    expect(warn).toHaveBeenCalledWith(
      'Failed to save game state to localStorage:',
      expect.any(Error),
    )
  })

  it('ignores malformed, non-object and empty cross-tab payloads', () => {
    const getGame = renderGame()
    for (const newValue of ['{not json', '"just a string"', 'null', '']) {
      act(() => {
        window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEYS.GAME, newValue }))
      })
      expect(getGame().game.character.name).toBe('Hero')
    }
  })

  it('merges a cross-tab payload back onto the defaults', () => {
    const getGame = renderGame()
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEYS.GAME,
          newValue: JSON.stringify({
            character: { name: 'TabTwo', xp: 55 },
            achievements: 'nope',
            recentBadgeUnlocks: 'nope',
            recentMilestoneUnlocks: 3,
          }),
        }),
      )
    })
    const game = getGame().game
    expect(game.character.name).toBe('TabTwo')
    expect(game.character.xp).toBe(55)
    expect(game.character.gold).toBe(0)
    expect(game.achievements.length).toBeGreaterThan(0)
    expect(game.recentBadgeUnlocks).toEqual([])
    expect(game.recentMilestoneUnlocks).toEqual([])
  })

  it('ignores storage events for the backup key', () => {
    const getGame = renderGame()
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEYS.BACKUP,
          newValue: JSON.stringify({ character: { name: 'BackupTab' } }),
        }),
      )
    })
    expect(getGame().game.character.name).toBe('Hero')
  })

  it('regenerates daily content when the save is from a previous day', async () => {
    seedGame({ lastDailyReset: '2020-01-01', dailyRewardsClaimed: [1, 2, 3] })
    const getGame = renderGame()
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve))
    })
    expect(getGame().game.lastDailyReset).toBe(TODAY)
    expect(getGame().game.dailyRewardsClaimed).toEqual([])
    expect(getGame().game.sideQuests.length).toBe(
      generateDailyQuests().length + generateWeeklyQuests().length + SECRET_QUESTS_POOL.length,
    )
  })

  it('keeps the seeded daily content when the save is current', () => {
    seedGame({
      lastDailyReset: TODAY,
      dailyRewardsClaimed: [1],
      sideQuests: [sideQuestSeed(DAILY_QUESTS_POOL[0], 2)],
    })
    const getGame = renderGame()
    expect(getGame().game.lastDailyReset).toBe(TODAY)
    expect(getGame().game.dailyRewardsClaimed).toEqual([1])
    expect(getGame().game.sideQuests.map((q) => q.id)).toEqual([DAILY_QUESTS_POOL[0].id])
  })
})
