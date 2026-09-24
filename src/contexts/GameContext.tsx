import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { allQuests, getNextQuest, isRealmUnlocked, realms, type Realm } from '../data/quests'
import { BADGES, shouldUnlockBadge, type Badge } from '../data/badges'
import { checkMilestone, type Milestone } from '../data/milestones'
import { generateDailyQuests, generateWeeklyQuests, generateSecretQuests } from '../data/sidequests'
import {
  getRandomCollectible,
  COLLECTIBLES_POOL,
  DAILY_REWARDS,
  spinWheel as doSpin,
  type Collectible,
  type DailyReward,
} from '../data/collectibles'
import { technologies } from '../data/technologies'
import { TITLES, FRAMES } from '../data/titles'
import { getEquipmentById, calculateEquipmentBonuses } from '../data/equipment'
import { COLLECTIBLE_DROP_RATE, GOLD_XP_RATIO } from '../utils/gameUtils'

import { COMPANIONS_DATA, EVOLVED_COMPANIONS } from '../data/companions'
import { loadInitialGame, useGamePersistence } from './game/gameStorage'
import { createEmptyStats } from './game/defaultState'
import { calculateLevel, calculateXpToNextLevel, getTitle } from './game/xp'
import type { Character, CharacterClass, GameContextType, GameState } from './game/types'

// State types live in ./game/types; re-exported so existing imports of
// `GameState` / `CharacterClass` from this module keep resolving.
export type { CharacterClass, GameState } from './game/types'

// Game balance constants live in utils/gameUtils.ts (import GAME_BALANCE from there)

// Keyed game data is looked up with values that come from user input or other
// records, so a miss is always possible at runtime even though index-access
// typing reports the value type as always present. These helpers surface the
// miss in their return types.
function lookupRecordValue<T>(record: Record<string, T>, key: string): T | undefined {
  return record[key]
}

function lookupDailyReward(day: number): DailyReward | undefined {
  return DAILY_REWARDS[day - 1]
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<GameState>(loadInitialGame)

  useGamePersistence(game, setGame)

  const completeQuest = useCallback((questId: string) => {
    setGame((prev) => {
      // Find the quest
      const quest = allQuests.find((q) => q.id === questId)
      if (!quest) return prev

      // Check if already completed
      if (prev.completedQuests.some((q) => q.questId === questId)) return prev

      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      // Apply XP and gold multipliers from collectibles, companions, and prestige
      const companionXpBonus = prev.activeCompanion ? prev.activeCompanion.xpBonus : 0
      const companionGoldBonus = prev.activeCompanion ? prev.activeCompanion.goldBonus : 0
      const prestigeMultiplier = prev.prestigeMultiplier
      const xpReward = Math.floor(
        quest.xpReward * prev.character.xpMultiplier * (1 + companionXpBonus) * prestigeMultiplier,
      )
      const goldReward = Math.floor(
        quest.xpReward *
          GOLD_XP_RATIO *
          prev.character.goldMultiplier *
          (1 + companionGoldBonus) *
          prestigeMultiplier,
      )

      // Calculate new XP and level
      const newXp = prev.character.xp + xpReward
      const newLevel = calculateLevel(newXp)
      const leveledUp = newLevel > prev.character.level

      // Update streak
      let newStreak = prev.character.streakDays
      // A shield spent here is charged to the character below, so a broken day
      // costs exactly one shield instead of protecting the streak forever.
      let shieldSpent = false
      if (prev.character.lastActive === yesterday) {
        newStreak += 1
      } else if (prev.character.lastActive !== today) {
        // Streak was broken - use shield if available
        if (prev.character.streakShields > 0 && newStreak > 0) {
          // Shield protects the streak - don't reset
          // Shield is consumed but streak is preserved
          newStreak = prev.character.streakDays // Keep current streak
          shieldSpent = true
        } else {
          newStreak = 1
        }
      }

      // Check for new achievements
      const completedCount = prev.completedQuests.length + 1
      const newAchievements = prev.achievements.map((a) => {
        if (a.unlockedAt) return a

        let unlocked = false
        switch (a.id) {
          case 'first_steps':
            unlocked = completedCount >= 1
            break
          case 'dedicated':
          case 'streak_7':
            unlocked = newStreak >= 7
            break
          case 'level_5':
            unlocked = newLevel >= 5
            break
          case 'level_10':
            unlocked = newLevel >= 10
            break
          case 'level_15':
            unlocked = newLevel >= 15
            break
          case 'xp_500':
            unlocked = newXp >= 500
            break
          case 'xp_1000':
            unlocked = newXp >= 1000
            break
          case 'topics_10':
            unlocked = completedCount >= 10
            break
          case 'topics_25':
            unlocked = completedCount >= 25
            break
          case 'all_foundations': {
            // Check if all foundations quests are complete
            const foundationsQuests = allQuests.filter((q) => q.realmId === 'foundations')
            const allFoundationsDone = foundationsQuests.every(
              (fq) => prev.completedQuests.some((cq) => cq.questId === fq.id) || fq.id === questId,
            )
            unlocked = allFoundationsDone
            break
          }
          case 'streak_30':
            unlocked = newStreak >= 30
            break
        }

        return unlocked ? { ...a, unlockedAt: new Date().toISOString() } : a
      })

      // Determine next quest
      const nextQuest = getNextQuest(
        new Set([...prev.completedQuests.map((q) => q.topicId), quest.topicId]),
      )

      // Check for realm completion first
      const completedRealmIds = [...prev.completedRealms]
      let newShowRealmCompletion: string | null = null

      for (const realm of Object.values(realms)) {
        if (completedRealmIds.includes(realm.id)) continue
        const realmQuests = allQuests.filter((q) => q.realmId === realm.id)
        const allComplete = realmQuests.every(
          (rq) => prev.completedQuests.some((cq) => cq.questId === rq.id) || rq.id === questId,
        )
        if (allComplete) {
          completedRealmIds.push(realm.id)
          // Only show modal for first newly completed realm
          if (!newShowRealmCompletion) {
            newShowRealmCompletion = realm.id
          }
        }
      }

      // Calculate completed technologies
      const completedTechIds = [...new Set(prev.completedQuests.map((q) => q.technologyId))]
      if (!completedTechIds.includes(quest.technologyId)) {
        const techQuests = allQuests.filter((q) => q.technologyId === quest.technologyId)
        const allTechComplete = techQuests.every(
          (tq) => prev.completedQuests.some((cq) => cq.questId === tq.id) || tq.id === questId,
        )
        if (allTechComplete) completedTechIds.push(quest.technologyId)
      }

      // Check for new badges with proper stats (use actual game stats)
      // Calculate earned categories from already-unlocked badges
      const earnedCategories = new Set(
        prev.badges.filter((b) => b.unlockedAt).map((b) => b.category),
      )
      const badgeStats = {
        questCount: completedCount,
        streakDays: newStreak,
        level: newLevel,
        quizCount: prev.stats.quizCount,
        minigameCount: prev.stats.minigameCount,
        perfectQuiz: prev.stats.perfectQuiz,
        quizStreak: prev.stats.quizStreak,
        techCompleted: completedTechIds,
        realmCompleted: completedRealmIds.length,
        typerCount: prev.stats.typerCount,
        memoryCount: prev.stats.memoryCount,
        mathCount: prev.stats.mathCount,
        wrongAnswerCount: prev.stats.wrongAnswerCount,
        perfectQuestCount: prev.stats.perfectQuestCount,
        // Derived stats for new badge requirement types
        allRealms: completedRealmIds.length >= Object.keys(realms).length,
        allTechnologies: completedTechIds.length >= Object.keys(technologies).length,
        goldHoard: prev.character.gold,
        badgesEarned: prev.badges.filter((b) => b.unlockedAt).length,
        earnedCategories: Array.from(earnedCategories),
        challengeComplete: prev.stats.challengeComplete,
        sidequestComplete: prev.stats.sidequestComplete,
        milestoneTier: prev.stats.milestoneTier,
        quizMasterScore: prev.stats.quizMasterScore,
        // Companion stats for evolution badges
        companionOwned: prev.companions.length,
        companionEvolution: prev.companions.filter(
          (c) => c.id.includes('_elder') || c.id.includes('_shadow') || c.id.includes('_legendary'),
        ).length,
        maxBondLevel: Math.max(1, ...prev.companions.map((c) => c.bondLevel)),
        // Prestige stats for prestige badges
        prestigeLevel: prev.prestigeLevel,
      }

      let newBadge: Badge | undefined
      const updatedBadges = prev.badges.map((b) => {
        if (b.unlockedAt) return b
        if (!newBadge && shouldUnlockBadge(b, badgeStats)) {
          newBadge = { ...b, unlockedAt: new Date().toISOString() }
          return newBadge
        }
        return b
      })

      // Check for new milestones with proper state (use actual game stats)
      const milestoneState = {
        completedQuests: completedCount,
        streakDays: newStreak,
        level: newLevel,
        completedRealms: completedRealmIds,
        completedTechnologies: completedTechIds,
        quizStreak: prev.stats.quizStreak,
        minigamesCompleted: prev.stats.minigameCount,
        hasDefeatedBoss: quest.type === 'boss',
        hasPerfectQuiz: prev.stats.perfectQuiz,
      }

      let newMilestone: Milestone | undefined
      const updatedMilestones = prev.milestones.map((m) => {
        if (m.unlocked) return m
        if (!newMilestone && checkMilestone(m, milestoneState)) {
          newMilestone = { ...m, unlocked: true, unlockedAt: new Date().toISOString() }
          return newMilestone
        }
        return m
      })

      // Maybe give a collectible
      let newCollectibles = prev.collectibles
      if (Math.random() < COLLECTIBLE_DROP_RATE) {
        const collectible = getRandomCollectible()
        newCollectibles = [...prev.collectibles, collectible]
      }

      // Skill points on level up (1 point per level gained)
      const levelsGained = newLevel - prev.character.level
      const newSkillPoints = prev.character.skillPoints + levelsGained

      // Companion bond system - increase bond level and check for evolution.
      // The evolved form has a different id, so the active companion is read
      // back from the updated roster (matching either form) instead of the
      // pre-quest roster, which would leave a stale companion equipped.
      const updatedCompanions = prev.activeCompanion
        ? prev.companions.map((c) => {
            if (c.id !== prev.activeCompanion?.id) return c
            const newBondLevel = Math.min(c.bondLevel + 1, c.maxBondLevel)
            const newTotalQuests = c.totalQuestsCompleted + 1
            // Check if companion should evolve
            if (
              newBondLevel >= c.maxBondLevel &&
              c.evolvedForm &&
              !c.id.includes('_elder') &&
              !c.id.includes('_shadow') &&
              !c.id.includes('_legendary')
            ) {
              const evolvedCompanion = lookupRecordValue(EVOLVED_COMPANIONS, c.evolvedForm)
              if (evolvedCompanion) {
                return {
                  ...evolvedCompanion,
                  bondLevel: newBondLevel,
                  totalQuestsCompleted: newTotalQuests,
                }
              }
            }
            return {
              ...c,
              bondLevel: newBondLevel,
              totalQuestsCompleted: newTotalQuests,
            }
          })
        : prev.companions
      const activeCompanion = prev.activeCompanion
        ? (updatedCompanions.find(
            (c) => c.id === prev.activeCompanion?.id || c.id === prev.activeCompanion?.evolvedForm,
          ) ?? null)
        : null

      return {
        ...prev,
        character: {
          ...prev.character,
          xp: newXp,
          level: newLevel,
          xpToNextLevel: calculateXpToNextLevel(newLevel),
          title: getTitle(newLevel),
          streakDays: newStreak,
          streakShields: shieldSpent
            ? prev.character.streakShields - 1
            : prev.character.streakShields,
          lastActive: today,
          gold: prev.character.gold + goldReward,
          skillPoints: newSkillPoints,
          xpMultiplier: 1, // Reset after use
          goldMultiplier: 1, // Reset after use
        },
        completedQuests: [
          ...prev.completedQuests,
          {
            topicId: quest.topicId,
            technologyId: quest.technologyId,
            questId,
            completed: true,
            xpEarned: xpReward, // Track actual XP earned (with multiplier)
            completedAt: new Date().toISOString(),
          },
        ],
        // Award skill XP for this technology
        skillXp: {
          ...prev.skillXp,
          [quest.technologyId]: (prev.skillXp[quest.technologyId] || 0) + xpReward,
        },
        currentQuestId: nextQuest?.id || null,
        achievements: newAchievements,
        showVictory: true,
        lastVictory: {
          xp: xpReward, // Show multiplied XP in victory screen
          levelUp: leveledUp,
          newLevel: leveledUp ? newLevel : prev.character.level,
          milestone: newMilestone,
          badge: newBadge,
        },
        badges: updatedBadges,
        milestones: updatedMilestones,
        collectibles: newCollectibles,
        completedRealms: completedRealmIds,
        showRealmCompletion: newShowRealmCompletion,
        // Update side quest progress
        sideQuests: prev.sideQuests.map((sq) => {
          if (sq.completed) return sq
          // Increment progress for quest completion type
          if (sq.requirement.type === 'complete_quests') {
            return { ...sq, progress: sq.progress + 1 }
          }
          // Increment progress for XP earned (check if enough XP)
          if (sq.requirement.type === 'earn_xp') {
            const xpGained = quest.xpReward
            return { ...sq, progress: sq.progress + xpGained }
          }
          // Streak quests - if today counts toward streak
          if (sq.requirement.type === 'maintain_streak' && newStreak >= 1) {
            return { ...sq, progress: sq.progress + 1 }
          }
          return sq
        }),
        // Track secret badge stats
        stats: {
          ...prev.stats,
          sessionQuestCount: prev.stats.sessionQuestCount + 1,
          earlyQuests:
            new Date().getHours() < 8 ? prev.stats.earlyQuests + 1 : prev.stats.earlyQuests,
          nightQuests:
            new Date().getHours() >= 22 ? prev.stats.nightQuests + 1 : prev.stats.nightQuests,
          // Track fastest quest time for speed_demon badge
          fastestQuestTime: prev.currentQuestStartTime
            ? Math.min(
                prev.stats.fastestQuestTime,
                (Date.now() - prev.currentQuestStartTime) / 1000,
              )
            : prev.stats.fastestQuestTime,
        },
        // Companion bond system - increase bond level and check for evolution
        companions: updatedCompanions,
        activeCompanion,
        // Daily Dash speedrun challenge - track quest completion
        dailyDash: (() => {
          if (!prev.dailyDash.active || !prev.dailyDash.startTime) return prev.dailyDash
          if (prev.dailyDash.completedQuests.includes(questId)) return prev.dailyDash

          const newCompletedQuests = [...prev.dailyDash.completedQuests, questId]

          // Auto-complete dash when all 5 quests done
          if (newCompletedQuests.length >= 5) {
            const elapsed = Math.floor((Date.now() - prev.dailyDash.startTime) / 1000)
            const newBestTime =
              prev.dailyDash.bestTime === null || elapsed < prev.dailyDash.bestTime
                ? elapsed
                : prev.dailyDash.bestTime
            return {
              active: false,
              startTime: null,
              completedQuests: newCompletedQuests,
              bestTime: newBestTime,
              lastPlayedDate: new Date().toISOString().split('T')[0],
            }
          }

          return {
            ...prev.dailyDash,
            completedQuests: newCompletedQuests,
          }
        })(),
        // Community challenges - update weekly stats
        communityStats: (() => {
          const now = new Date()
          const lastReset = new Date(prev.communityStats.lastWeekReset)
          const needsReset =
            now.getDay() === 1 && now.getTime() - lastReset.getTime() > 6 * 24 * 60 * 60 * 1000

          return {
            weeklyQuestsCompleted: needsReset ? 1 : prev.communityStats.weeklyQuestsCompleted + 1,
            weeklyXPCompleted: needsReset
              ? xpReward
              : prev.communityStats.weeklyXPCompleted + xpReward,
            lastWeekReset: needsReset ? now.toISOString() : prev.communityStats.lastWeekReset,
          }
        })(),
      }
    })
  }, [])

  const setCurrentQuest = useCallback((questId: string | null) => {
    setGame((prev) => ({
      ...prev,
      currentQuestId: questId,
      currentQuestStartTime: questId ? Date.now() : null,
    }))
  }, [])

  const dismissVictory = useCallback(() => {
    setGame((prev) => ({ ...prev, showVictory: false, lastVictory: null }))
  }, [])

  const isQuestCompleted = useCallback(
    (questId: string) => {
      return game.completedQuests.some((q) => q.questId === questId)
    },
    [game.completedQuests],
  )

  const getNextQuestInternal = useCallback(() => {
    const completedIds = new Set(game.completedQuests.map((q) => q.topicId))
    return getNextQuest(completedIds)
  }, [game.completedQuests])

  const getAvailableQuests = useCallback(() => {
    const completedIds = new Set(game.completedQuests.map((q) => q.questId))
    return allQuests.filter((q) => !completedIds.has(q.id))
  }, [game.completedQuests])

  const getCompletedTopicIds = useCallback(() => {
    return new Set(game.completedQuests.map((q) => q.topicId))
  }, [game.completedQuests])

  // Learning topic methods (for w3schools content)
  const completeLearningTopic = useCallback(
    (topicId: string, technologyId: string, xpEarned: number) => {
      setGame((prev) => {
        // Check if already completed
        if (prev.completedTopics.some((t) => t.topicId === topicId)) return prev

        const newXp = prev.character.xp + xpEarned
        const newLevel = calculateLevel(newXp)

        return {
          ...prev,
          completedTopics: [
            ...prev.completedTopics,
            {
              topicId,
              technologyId,
              completed: true,
              xpEarned,
              completedAt: new Date().toISOString(),
            },
          ],
          character: {
            ...prev.character,
            xp: newXp,
            level: newLevel,
            xpToNextLevel: calculateXpToNextLevel(newLevel),
          },
        }
      })
    },
    [],
  )

  const isLearningTopicCompleted = useCallback(
    (topicId: string) => {
      return game.completedTopics.some((t) => t.topicId === topicId)
    },
    [game.completedTopics],
  )

  const getCompletedLearningTopicIds = useCallback(() => {
    return new Set(game.completedTopics.map((t) => t.topicId))
  }, [game.completedTopics])

  const isRealmUnlockedInternal = useCallback(
    (realm: Realm) => {
      const completedIds = getCompletedTopicIds()
      return isRealmUnlocked(realm, game.character.level, completedIds)
    },
    [game.character.level, getCompletedTopicIds],
  )

  const getRealmProgress = useCallback(
    (realmId: string) => {
      const realmQuests = allQuests.filter((q) => q.realmId === realmId)
      const completed = realmQuests.filter((q) =>
        game.completedQuests.some((cq) => cq.questId === q.id),
      ).length
      return { completed, total: realmQuests.length }
    },
    [game.completedQuests],
  )

  // Set initial current quest on first load
  useEffect(() => {
    if (!game.currentQuestId) {
      const next = getNextQuestInternal()
      if (next) {
        requestAnimationFrame(() => {
          setGame((prev) => ({ ...prev, currentQuestId: next.id }))
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentional: run once on mount to set initial quest

  // Check for daily reset
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    if (game.lastDailyReset !== today) {
      // Reset daily quests and daily rewards for new day
      requestAnimationFrame(() => {
        setGame((prev) => ({
          ...prev,
          sideQuests: [
            ...generateDailyQuests(),
            ...generateWeeklyQuests(),
            ...generateSecretQuests(),
          ],
          dailyRewardsClaimed: [], // Reset daily rewards on new day
          lastDailyReset: today,
        }))
      })
    }
  }, [game.lastDailyReset])

  // Badge/Sidequest/Milestone/Collectible methods
  const claimDailyReward = useCallback((day: number) => {
    let result = { type: 'xp' as const, value: 50 }
    setGame((prev) => {
      if (prev.dailyRewardsClaimed.includes(day)) return prev
      const reward = lookupDailyReward(day)
      if (!reward) return prev
      result = reward.reward as typeof result

      // Calculate streak bonus (scales with streak length)
      const streakBonus = Math.min(prev.character.streakDays, 30) // Cap at 30x bonus
      const streakMultiplier = 1 + streakBonus * 0.05 // 5% bonus per streak day

      const newCollectibles = [...prev.collectibles]
      if (reward.reward.collectibleId) {
        const collectible = COLLECTIBLES_POOL.find((c) => c.id === reward.reward.collectibleId)
        if (collectible) {
          // Higher streak = chance for better collectible
          if (prev.character.streakDays >= 7 && Math.random() < 0.3) {
            const upgradedCollectible = COLLECTIBLES_POOL.find(
              (c) => c.id === 'xp_medium' || c.id === 'gold_medium',
            )
            if (upgradedCollectible) newCollectibles.push({ ...upgradedCollectible, used: false })
          } else {
            newCollectibles.push({ ...collectible, used: false })
          }
        }
      }

      // Calculate XP/Gold rewards with streak bonus
      const baseXp = reward.reward.type === 'xp' ? reward.reward.value || 0 : 0
      const baseGold = reward.reward.type === 'gold' ? reward.reward.value || 0 : 0
      const bonusXp = Math.floor(baseXp * (streakMultiplier - 1))
      const bonusGold = Math.floor(baseGold * (streakMultiplier - 1))

      // Chance for bonus streak shield at high streaks
      let newStreakShields = prev.character.streakShields
      if (prev.character.streakDays >= 14 && Math.random() < COLLECTIBLE_DROP_RATE) {
        newStreakShields += 1
      }

      return {
        ...prev,
        dailyRewardsClaimed: [...prev.dailyRewardsClaimed, day],
        collectibles: newCollectibles,
        character: {
          ...prev.character,
          xp: prev.character.xp + baseXp + bonusXp,
          gold: prev.character.gold + baseGold + bonusGold,
          streakShields: newStreakShields,
        },
      }
    })
    return result
  }, [])

  const spinWheel = useCallback(() => {
    const segment = doSpin()
    setGame((prev) => {
      const newCollectibles = [...prev.collectibles]
      if (segment.reward.collectibleId) {
        const collectible = COLLECTIBLES_POOL.find((c) => c.id === segment.reward.collectibleId)
        if (collectible) newCollectibles.push({ ...collectible, used: false })
      }
      // Track jackpot spin (500+ gold)
      const isJackpot = segment.reward.type === 'gold' && (segment.reward.value || 0) >= 500
      return {
        ...prev,
        collectibles: newCollectibles,
        character: {
          ...prev.character,
          // Only xp segments pay xp; gold/collectible segments have their own
          // handling below and must not grant bonus xp on the side.
          xp: prev.character.xp + (segment.reward.type === 'xp' ? segment.reward.value || 0 : 0),
          gold:
            prev.character.gold + (segment.reward.type === 'gold' ? segment.reward.value || 0 : 0),
        },
        stats: {
          ...prev.stats,
          jackpotSpins: isJackpot ? prev.stats.jackpotSpins + 1 : prev.stats.jackpotSpins,
        },
      }
    })
    return { segment }
  }, [])

  const consumeCollectible = useCallback((collectibleId: string): boolean => {
    let found = false
    setGame((prev) => {
      const collectible = COLLECTIBLES_POOL.find((c) => c.id === collectibleId)
      if (!collectible) return prev

      const updates: Partial<GameState> = {
        collectibles: prev.collectibles.map((c) => {
          if (c.id === collectibleId && !c.used) {
            found = true
            return { ...c, used: true }
          }
          return c
        }),
      }

      // Apply collectible effects
      if (found) {
        const characterUpdates: Partial<Character> = {}
        switch (collectible.effect.type) {
          case 'xp_multiplier':
            // Set XP multiplier for next quest
            characterUpdates.xpMultiplier = collectible.effect.value
            break
          case 'gold_multiplier':
            // Set gold multiplier for next quest
            characterUpdates.goldMultiplier = collectible.effect.value
            break
          case 'reveal_answer':
            // Hint effects are handled in the quiz component
            break
          case 'prevent_streak_loss':
            // Streak shield is handled in the daily reset logic
            break
          case 'mystery_reward':
            // The box contents are rolled by openMysteryBox() and granted by the
            // page that opened it, so consuming only marks the box as used.
            // (It used to roll a second, unrelated gold amount here.)
            break
        }
        if (Object.keys(characterUpdates).length > 0) {
          updates.character = { ...prev.character, ...characterUpdates }
        }
        // Track mystery box opens
        if (collectible.type === 'mystery_box') {
          updates.stats = {
            ...prev.stats,
            mysteryBoxesOpened: prev.stats.mysteryBoxesOpened + 1,
          }
        }
      }

      return { ...prev, ...updates }
    })
    return found
  }, [])

  const getActiveCollectibles = useCallback((): Collectible[] => {
    return game.collectibles.filter((c) => !c.used)
  }, [game.collectibles])

  // Grant a specific collectible (e.g. the contents of a mystery box)
  const grantCollectible = useCallback((collectible: Collectible) => {
    setGame((prev) => ({
      ...prev,
      collectibles: [...prev.collectibles, { ...collectible, used: false }],
    }))
  }, [])

  const checkAndUnlockBadges = useCallback((): Badge[] => {
    const newlyUnlocked: Badge[] = []
    setGame((prev) => {
      // Compute completed technologies from completed quests
      const completedTopicIds = new Set(prev.completedQuests.map((q) => q.topicId))
      const techCompleted: string[] = []
      for (const tech of Object.values(technologies)) {
        const techQuests = allQuests.filter((q) => q.technologyId === tech.id)
        if (techQuests.length > 0 && techQuests.every((q) => completedTopicIds.has(q.topicId))) {
          techCompleted.push(tech.id)
        }
      }

      const stats = {
        questCount: prev.completedQuests.length,
        streakDays: prev.character.streakDays,
        level: prev.character.level,
        quizCount: prev.stats.quizCount,
        minigameCount: prev.stats.minigameCount,
        perfectQuiz: prev.stats.perfectQuiz,
        quizStreak: prev.stats.quizStreak,
        techCompleted,
        realmCompleted: prev.completedRealms.length,
        typerCount: prev.stats.typerCount,
        memoryCount: prev.stats.memoryCount,
        mathCount: prev.stats.mathCount,
      }
      const newRecentBadges: Badge[] = []
      const updated = prev.badges.map((b) => {
        if (b.unlockedAt) return b
        if (shouldUnlockBadge(b, stats)) {
          const unlocked = { ...b, unlockedAt: new Date().toISOString() }
          newlyUnlocked.push(unlocked)
          newRecentBadges.push(unlocked)
          return unlocked
        }
        return b
      })
      return {
        ...prev,
        badges: updated,
        recentBadgeUnlocks: [...prev.recentBadgeUnlocks, ...newRecentBadges],
      }
    })
    return newlyUnlocked
  }, [])

  const incrementStat = useCallback(
    (
      stat: 'quiz' | 'typer' | 'memory' | 'math' | 'minigame' | 'challenge',
      isPerfect?: boolean,
      wrongAnswers?: number,
      passedWith80?: boolean,
      topicId?: string,
    ) => {
      setGame((prev) => {
        const updates: Partial<GameState['stats']> = {}
        switch (stat) {
          case 'quiz':
            updates.quizCount = prev.stats.quizCount + 1
            if (isPerfect) {
              updates.quizPerfectCount = prev.stats.quizPerfectCount + 1
              updates.quizStreak = prev.stats.quizStreak + 1
              updates.perfectQuiz = true
            } else {
              updates.quizStreak = 0
            }
            // Track wrong answers for no_mistakes badge (legacy tracking)
            if (wrongAnswers !== undefined) {
              updates.wrongAnswerCount = (prev.stats.wrongAnswerCount || 0) + wrongAnswers
              // Track perfect quests (0 wrong answers) for flawless badge
              if (wrongAnswers === 0) {
                updates.perfectQuestCount = (prev.stats.perfectQuestCount || 0) + 1
              }
            }
            // Track 80%+ scores for quiz_master badge
            if (passedWith80) {
              updates.quizMasterScore = (prev.stats.quizMasterScore || 0) + 1
            }
            break
          case 'typer':
            updates.typerCount = prev.stats.typerCount + 1
            break
          case 'memory':
            updates.memoryCount = prev.stats.memoryCount + 1
            break
          case 'math':
            updates.mathCount = prev.stats.mathCount + 1
            break
          case 'minigame':
            updates.minigameCount = prev.stats.minigameCount + 1
            break
          case 'challenge':
            updates.challengeComplete = (prev.stats.challengeComplete || 0) + 1
            break
        }

        // Update weak topics for spaced repetition
        let weakTopicsUpdate = prev.weakTopics
        if (stat === 'quiz' && topicId && wrongAnswers !== undefined) {
          const now = new Date().toISOString()
          const existing = lookupRecordValue(prev.weakTopics, topicId)
          const previous = existing ?? { wrongCount: 0, masteryLevel: 0 }
          const newWrongCount = previous.wrongCount + (wrongAnswers > 0 ? 1 : 0)
          // Mastery levels: 0=new, 1=learning, 2=reviewing, 3=mastered
          // Decrease mastery if wrong, increase if correct
          const masteryDelta = wrongAnswers === 0 ? 1 : -1
          const newMastery = Math.max(0, Math.min(3, previous.masteryLevel + masteryDelta))

          // Spaced repetition intervals: 1 day, 3 days, 7 days, 14 days
          const intervals = [1, 3, 7, 14]
          const intervalDays = intervals[Math.min(newMastery, intervals.length - 1)]
          const nextReview = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString()

          weakTopicsUpdate = {
            ...prev.weakTopics,
            [topicId]: {
              wrongCount: newWrongCount,
              lastReviewed: now,
              nextReview,
              masteryLevel: newMastery,
            },
          }
        }

        return { ...prev, stats: { ...prev.stats, ...updates }, weakTopics: weakTopicsUpdate }
      })
    },
    [],
  )

  const resetQuizStreak = useCallback(() => {
    setGame((prev) => ({
      ...prev,
      stats: { ...prev.stats, quizStreak: 0 },
    }))
  }, [])

  // Get all weak topics for review
  const getWeakTopics = useCallback(() => {
    return Object.entries(game.weakTopics).map(([topicId, data]) => ({
      topicId,
      masteryLevel: data.masteryLevel,
      wrongCount: data.wrongCount,
      nextReview: data.nextReview,
    }))
  }, [game.weakTopics])

  // Get topics that are due for review (past their nextReview date)
  const getTopicsDueForReview = useCallback(() => {
    const now = new Date().toISOString()
    return Object.entries(game.weakTopics)
      .filter(([, data]) => data.nextReview <= now && data.masteryLevel < 3)
      .map(([topicId]) => topicId)
  }, [game.weakTopics])

  // Prestige system - check if player can prestige (all quests complete)
  const canPrestige = useCallback(() => {
    return game.completedQuests.length >= allQuests.length && game.prestigeLevel >= 0
  }, [game.completedQuests.length, game.prestigeLevel])

  // Get prestige bonuses description
  const getPrestigeBonuses = useCallback(() => {
    const currentBonus = (game.prestigeMultiplier - 1) * 100
    const nextBonus = game.prestigeLevel * 5
    return {
      xpBonus: Math.round(currentBonus),
      goldBonus: Math.round(currentBonus * 0.5),
      bonusDescription: `Current: +${Math.round(currentBonus)}% XP, +${Math.round(currentBonus * 0.5)}% Gold | After prestige: +${nextBonus}% XP, +${Math.round(nextBonus * 0.5)}% Gold`,
    }
  }, [game.prestigeMultiplier, game.prestigeLevel])

  // Perform prestige reset
  const doPrestige = useCallback(() => {
    const newPrestigeLevel = game.prestigeLevel + 1
    const newMultiplier = 1 + newPrestigeLevel * 0.05 // +5% per prestige level

    setGame((prev) => ({
      ...prev,
      // Keep character basics but reset progress
      character: {
        ...prev.character,
        xp: 0,
        level: 1,
        xpToNextLevel: 100,
        title: 'Novice',
        gold: 0, // Gold reset on prestige
        streakDays: 0,
        streakShields: 0,
        skillPoints: 0,
        skillAllocations: {},
        xpMultiplier: 1,
        goldMultiplier: 1,
      },
      // Reset all quest progress
      completedQuests: [],
      currentQuestId: null,
      completedRealms: [],
      // Keep companions but reset their bond progress
      companions: prev.companions.map((c) => ({
        ...c,
        bondLevel: 1,
        totalQuestsCompleted: 0,
      })),
      activeCompanion: null,
      // Reset collectibles
      collectibles: [],
      // Reset side quests
      sideQuests: generateDailyQuests().concat(generateWeeklyQuests(), generateSecretQuests()),
      // Update prestige state
      prestigeLevel: newPrestigeLevel,
      prestigeMultiplier: newMultiplier,
      totalPrestigeXp: prev.totalPrestigeXp + prev.character.xp,
      // Keep badges (don't reset)
      // Keep milestones (don't reset)
      // Keep achievements (don't reset)
      // Reset stats
      stats: createEmptyStats(),
      // Reset weak topics
      weakTopics: {},
      // Reset daily rewards
      dailyRewardsClaimed: [],
      lastDailyReset: new Date().toISOString().split('T')[0],
      // Keep settings
      hasSeenOnboarding: true,
      recentBadgeUnlocks: [],
      recentMilestoneUnlocks: [],
      showVictory: false,
      showRealmCompletion: null,
    }))

    return { newPrestigeLevel, newMultiplier }
  }, [game.prestigeLevel])

  const checkAndUnlockMilestones = useCallback((): Milestone[] => {
    const newlyUnlocked: Milestone[] = []
    setGame((prev) => {
      // Compute completed technologies from completed quests
      const completedTopicIds = new Set(prev.completedQuests.map((q) => q.topicId))
      const completedTechnologies: string[] = []
      for (const tech of Object.values(technologies)) {
        const techQuests = allQuests.filter((q) => q.technologyId === tech.id)
        if (techQuests.length > 0 && techQuests.every((q) => completedTopicIds.has(q.topicId))) {
          completedTechnologies.push(tech.id)
        }
      }

      const state = {
        completedQuests: prev.completedQuests.length,
        streakDays: prev.character.streakDays,
        level: prev.character.level,
        completedRealms: prev.completedRealms,
        completedTechnologies,
        quizStreak: prev.stats.quizStreak,
        minigamesCompleted: prev.stats.minigameCount,
        hasDefeatedBoss: prev.completedQuests.some((q) => {
          const quest = allQuests.find((aq) => aq.id === q.questId)
          return quest?.type === 'boss'
        }),
        hasPerfectQuiz: prev.stats.perfectQuiz,
      }
      const newRecentMilestones: Milestone[] = []
      const updated = prev.milestones.map((m) => {
        if (m.unlocked) return m
        if (checkMilestone(m, state)) {
          const unlocked = { ...m, unlocked: true, unlockedAt: new Date().toISOString() }
          newlyUnlocked.push(unlocked)
          newRecentMilestones.push(unlocked)
          return unlocked
        }
        return m
      })
      return {
        ...prev,
        milestones: updated,
        recentMilestoneUnlocks: [...prev.recentMilestoneUnlocks, ...newRecentMilestones],
      }
    })
    return newlyUnlocked
  }, [])

  const refreshSideQuests = useCallback(() => {
    setGame((prev) => {
      const newQuests = [
        ...generateDailyQuests(),
        ...generateWeeklyQuests(),
        ...generateSecretQuests(),
      ]
      const existingInProgress = prev.sideQuests.filter((q) => !q.completed)
      const existingCompletedIds = new Set(
        prev.sideQuests.filter((q) => q.completed).map((q) => q.id),
      )
      const freshQuests = newQuests.filter((q) => !existingCompletedIds.has(q.id))
      return {
        ...prev,
        sideQuests: [...existingInProgress, ...freshQuests],
      }
    })
  }, [])

  const claimSideQuest = useCallback((questId: string): { xp: number; gold: number } => {
    let rewards = { xp: 0, gold: 0 }
    setGame((prev) => {
      const quest = prev.sideQuests.find((q) => q.id === questId)
      if (!quest || quest.completed) return prev
      rewards = quest.rewards
      return {
        ...prev,
        sideQuests: prev.sideQuests.map((q) => (q.id === questId ? { ...q, completed: true } : q)),
        character: {
          ...prev.character,
          xp: prev.character.xp + quest.rewards.xp,
          gold: prev.character.gold + quest.rewards.gold,
        },
      }
    })
    return rewards
  }, [])

  const claimMilestone = useCallback((milestoneId: string): { xpBonus: number } => {
    let xpBonus = 0
    setGame((prev) => {
      const milestone = prev.milestones.find((m) => m.id === milestoneId)
      if (!milestone || !milestone.unlocked) return prev
      xpBonus = milestone.xpBonus
      return {
        ...prev,
        character: {
          ...prev.character,
          xp: prev.character.xp + milestone.xpBonus,
        },
      }
    })
    return { xpBonus }
  }, [])

  const claimBadge = useCallback((badgeId: string): { xp: number; gold: number } => {
    let rewards = { xp: 0, gold: 0 }
    setGame((prev) => {
      const badge = prev.badges.find((b) => b.id === badgeId)
      if (!badge || !badge.unlockedAt) return prev
      rewards = { xp: badge.xpReward, gold: badge.goldReward }
      return {
        ...prev,
        character: {
          ...prev.character,
          xp: prev.character.xp + badge.xpReward,
          gold: prev.character.gold + badge.goldReward,
        },
      }
    })
    return rewards
  }, [])

  // Skill allocation methods
  const allocateSkillPoint = useCallback((skillId: string): boolean => {
    let success = false
    setGame((prev) => {
      if (prev.character.skillPoints <= 0) return prev
      const currentLevel = prev.character.skillAllocations[skillId] || 0
      success = true
      return {
        ...prev,
        character: {
          ...prev.character,
          skillPoints: prev.character.skillPoints - 1,
          skillAllocations: {
            ...prev.character.skillAllocations,
            [skillId]: currentLevel + 1,
          },
        },
      }
    })
    return success
  }, [])

  const getSkillLevel = useCallback(
    (skillId: string): number => {
      return game.character.skillAllocations[skillId] || 0
    },
    [game.character.skillAllocations],
  )

  const getAvailableSkillPoints = useCallback((): number => {
    return game.character.skillPoints
  }, [game.character.skillPoints])

  // Get XP for a specific technology/skill
  const getSkillXp = useCallback(
    (techId: string): number => {
      return game.skillXp[techId] || 0
    },
    [game.skillXp],
  )

  // Calculate skill level from XP (each level requires more XP)
  const getSkillLevelFromXp = useCallback((xp: number): number => {
    // Level 0-10 based on XP: 0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250
    if (xp < 100) return 0
    if (xp < 250) return 1
    if (xp < 450) return 2
    if (xp < 700) return 3
    if (xp < 1000) return 4
    if (xp < 1350) return 5
    if (xp < 1750) return 6
    if (xp < 2200) return 7
    if (xp < 2700) return 8
    if (xp < 3250) return 9
    return 10
  }, [])

  const dismissRealmCompletion = useCallback(() => {
    setGame((prev) => ({ ...prev, showRealmCompletion: null }))
  }, [])

  // Complete onboarding with character name and class
  const completeOnboarding = useCallback((name: string, charClass: CharacterClass) => {
    setGame((prev) => ({
      ...prev,
      hasSeenOnboarding: true,
      character: {
        ...prev.character,
        name,
        class: charClass,
      },
    }))
  }, [])

  // Add XP to character (used by mini-games)
  const addXP = useCallback((amount: number) => {
    setGame((prev) => {
      const newXp = prev.character.xp + amount
      const newLevel = calculateLevel(newXp)
      return {
        ...prev,
        character: {
          ...prev.character,
          xp: newXp,
          level: newLevel,
          xpToNextLevel: calculateXpToNextLevel(newLevel),
        },
      }
    })
  }, [])

  // Add gold to character
  const addGold = useCallback((amount: number) => {
    setGame((prev) => ({
      ...prev,
      character: {
        ...prev.character,
        gold: prev.character.gold + amount,
      },
    }))
  }, [])

  // Grant a badge directly
  const grantBadge = useCallback((badgeId: string) => {
    setGame((prev) => {
      const badge = BADGES.find((b) => b.id === badgeId)
      // The full catalog is pre-seeded in locked state, so an existing entry
      // only blocks the grant when it is already unlocked.
      const existing = prev.badges.find((b) => b.id === badgeId)
      if (!badge || existing?.unlockedAt) return prev
      const newlyUnlocked = { ...badge, unlockedAt: new Date().toISOString() }
      return {
        ...prev,
        badges: existing
          ? prev.badges.map((b) => (b.id === badgeId ? newlyUnlocked : b))
          : [...prev.badges, newlyUnlocked],
        recentBadgeUnlocks: [...prev.recentBadgeUnlocks, newlyUnlocked],
      }
    })
  }, [])

  // Dismiss recent unlocks (clear the notification queue)
  const dismissRecentUnlocks = useCallback(() => {
    setGame((prev) => ({
      ...prev,
      recentBadgeUnlocks: [],
      recentMilestoneUnlocks: [],
    }))
  }, [])

  // Use a streak shield to protect the current streak
  const useStreakShield = useCallback(() => {
    if (game.character.streakShields <= 0) return false
    setGame((prev) => ({
      ...prev,
      character: {
        ...prev.character,
        streakShields: prev.character.streakShields - 1,
      },
    }))
    return true
  }, [game.character.streakShields])

  // Add streak shields (e.g., from collectibles or rewards)
  const addStreakShield = useCallback((count = 1) => {
    setGame((prev) => ({
      ...prev,
      character: {
        ...prev.character,
        streakShields: prev.character.streakShields + count,
      },
    }))
  }, [])

  // Daily Dash speedrun challenge
  const startDailyDash = useCallback(() => {
    setGame((prev) => ({
      ...prev,
      dailyDash: {
        active: true,
        startTime: Date.now(),
        completedQuests: [],
        bestTime: prev.dailyDash.bestTime,
        lastPlayedDate: new Date().toISOString().split('T')[0],
      },
    }))
  }, [])

  const completeDailyDashQuest = useCallback((questId: string) => {
    setGame((prev) => {
      if (!prev.dailyDash.active || !prev.dailyDash.startTime) return prev
      if (prev.dailyDash.completedQuests.includes(questId)) return prev

      const newCompletedQuests = [...prev.dailyDash.completedQuests, questId]

      // Auto-complete dash when all 5 quests done
      if (newCompletedQuests.length >= 5) {
        const elapsed = Math.floor((Date.now() - prev.dailyDash.startTime) / 1000)
        const newBestTime =
          prev.dailyDash.bestTime === null || elapsed < prev.dailyDash.bestTime
            ? elapsed
            : prev.dailyDash.bestTime

        return {
          ...prev,
          dailyDash: {
            ...prev.dailyDash,
            active: false,
            startTime: null,
            completedQuests: newCompletedQuests,
            bestTime: newBestTime,
          },
        }
      }

      return {
        ...prev,
        dailyDash: {
          ...prev.dailyDash,
          completedQuests: newCompletedQuests,
        },
      }
    })
  }, [])

  const abandonDailyDash = useCallback(() => {
    setGame((prev) => ({
      ...prev,
      dailyDash: {
        active: false,
        startTime: null,
        completedQuests: [],
        bestTime: prev.dailyDash.bestTime,
        lastPlayedDate: prev.dailyDash.lastPlayedDate,
      },
    }))
  }, [])

  const isDailyDashActive = useCallback(() => {
    return game.dailyDash.active
  }, [game.dailyDash.active])

  const purchaseItem = useCallback(
    (itemId: string, price: number): boolean => {
      if (game.character.gold < price) return false

      // Check if it's a companion purchase
      if (itemId.startsWith('buy_companion_')) {
        const companionKey = itemId.replace('buy_companion_', '')
        const companion = lookupRecordValue(COMPANIONS_DATA, companionKey)
        if (companion) {
          // Check if already owned
          if (game.companions.some((c) => c.id === companion.id)) return false

          setGame((prev) => ({
            ...prev,
            character: { ...prev.character, gold: prev.character.gold - price },
            companions: [...prev.companions, companion],
            activeCompanion: companion, // Auto-equip
          }))
          return true
        }
      }

      // Check if it's a collectible purchase
      const collectibleId = itemId.replace('buy_', '')
      const collectible = COLLECTIBLES_POOL.find((c) => c.id === collectibleId)
      if (collectible) {
        setGame((prev) => ({
          ...prev,
          character: { ...prev.character, gold: prev.character.gold - price },
          collectibles: [...prev.collectibles, { ...collectible, used: false }],
        }))
        return true
      }

      return false
    },
    [game.character.gold, game.companions],
  )

  // Equip a companion
  const equipCompanion = useCallback(
    (companionId: string) => {
      const companion = game.companions.find((c) => c.id === companionId)
      if (companion) {
        setGame((prev) => ({ ...prev, activeCompanion: companion }))
      }
    },
    [game.companions],
  )

  const checkAndUnlockTitlesFrames = useCallback((): {
    unlockedTitles: string[]
    unlockedFrames: string[]
  } => {
    let newTitles: string[] = []
    let newFrames: string[] = []

    setGame((prev) => {
      const completedQuestCount = prev.completedQuests.length
      const level = prev.character.level
      const streakDays = prev.character.streakDays

      // Count tech-specific completions
      const techCounts: Record<string, number> = {}
      for (const cq of prev.completedQuests) {
        const quest = allQuests.find((q) => q.id === cq.questId)
        if (quest) {
          techCounts[quest.technologyId] = (techCounts[quest.technologyId] || 0) + 1
        }
      }

      // Check titles
      newTitles = []
      for (const title of TITLES) {
        if (prev.character.unlockedTitles.includes(title.id)) continue

        let unlocked = false
        switch (title.id) {
          case 'novice-devops':
            unlocked = completedQuestCount >= 5
            break
          case 'eager-learner':
            unlocked = completedQuestCount >= 10
            break
          case 'quest-seeker':
            unlocked = completedQuestCount >= 15
            break
          case 'code-crusader':
            unlocked = completedQuestCount >= 25
            break
          case 'cloud-hopeful':
            unlocked = (techCounts['aws'] || 0) >= 5
            break
          case 'container-captain':
            unlocked = (techCounts['docker'] || 0) >= 5
            break
          case 'git-guru':
            unlocked = (techCounts['git'] || 0) >= 5
            break
          case 'python-pro':
            unlocked = (techCounts['python'] || 0) >= 5
            break
          case 'ci-cd-champion':
            unlocked = (techCounts['cicd'] || 0) >= 10
            break
          case 'kubernetes-knight':
            unlocked = (techCounts['kubernetes'] || 0) >= 10
            break
          case 'infrastructure-inquisitor':
            unlocked = (techCounts['terraform'] || 0) >= 10
            break
          case 'monitoring-master':
            unlocked = (techCounts['monitoring'] || 0) >= 10
            break
          case 'streak-slayer':
            unlocked = streakDays >= 14
            break
          case 'devops-dragon':
            unlocked = completedQuestCount >= 100
            break
          case 'realm-ruler':
            unlocked = prev.completedRealms.length >= Object.keys(realms).length
            break
          case 'almighty-architect':
            unlocked = level >= 50
            break
          case 'golden-gamer':
            unlocked = prev.badges.filter((b) => b.unlockedAt).length >= 50
            break
          case 'speed-demon':
            unlocked = prev.stats.fastestQuestTime < 30
            break
        }
        if (unlocked) newTitles.push(title.id)
      }

      // Check frames
      newFrames = []
      for (const frame of FRAMES) {
        if (prev.character.unlockedFrames.includes(frame.id)) continue

        let unlocked = false
        switch (frame.id) {
          case 'default':
            unlocked = true
            break
          case 'bronze':
            unlocked = completedQuestCount >= 10
            break
          case 'silver':
            unlocked = completedQuestCount >= 25
            break
          case 'gold':
            unlocked = completedQuestCount >= 50
            break
          case 'emerald':
            unlocked = (techCounts['python'] || 0) >= 10
            break
          case 'ruby':
            unlocked = (techCounts['git'] || 0) >= 10
            break
          case 'sapphire':
            unlocked = (techCounts['aws'] || 0) >= 10
            break
          case 'amethyst':
            unlocked = (techCounts['docker'] || 0) >= 10
            break
          case 'diamond':
            unlocked = completedQuestCount >= 100
            break
          case 'prismatic':
            unlocked = level >= 50
            break
        }
        if (unlocked) newFrames.push(frame.id)
      }

      if (newTitles.length === 0 && newFrames.length === 0) return prev

      return {
        ...prev,
        character: {
          ...prev.character,
          unlockedTitles: [...prev.character.unlockedTitles, ...newTitles],
          unlockedFrames: [...prev.character.unlockedFrames, ...newFrames],
        },
      }
    })
    return { unlockedTitles: newTitles, unlockedFrames: newFrames }
  }, [])

  const equipTitle = useCallback(
    (titleId: string): boolean => {
      if (!game.character.unlockedTitles.includes(titleId)) return false
      setGame((prev) => ({
        ...prev,
        character: { ...prev.character, equippedTitle: titleId },
      }))
      return true
    },
    [game.character.unlockedTitles],
  )

  const equipFrame = useCallback(
    (frameId: string): boolean => {
      if (!game.character.unlockedFrames.includes(frameId)) return false
      setGame((prev) => ({
        ...prev,
        character: { ...prev.character, equippedFrame: frameId },
      }))
      return true
    },
    [game.character.unlockedFrames],
  )

  // Equipment management
  const equipItem = useCallback((itemId: string): boolean => {
    setGame((prev) => {
      const equipped = prev.character.equippedItems
      if (equipped.includes(itemId)) return prev // Already equipped
      return {
        ...prev,
        character: {
          ...prev.character,
          equippedItems: [...equipped, itemId],
        },
      }
    })
    return true
  }, [])

  const unequipItem = useCallback((itemId: string): boolean => {
    setGame((prev) => {
      const equipped = prev.character.equippedItems
      if (!equipped.includes(itemId)) return prev // Not equipped
      return {
        ...prev,
        character: {
          ...prev.character,
          equippedItems: equipped.filter((id) => id !== itemId),
        },
      }
    })
    return true
  }, [])

  const getEquippedItems = useCallback((): string[] => {
    return game.character.equippedItems
  }, [game.character.equippedItems])

  const getEquipmentBonuses = useCallback(() => {
    const equipped = game.character.equippedItems
      .map((id: string) => getEquipmentById(id))
      .filter((item): item is NonNullable<typeof item> => item !== undefined)
    return calculateEquipmentBonuses(equipped)
  }, [game.character.equippedItems])

  return (
    <GameContext.Provider
      value={{
        game,
        completeQuest,
        setCurrentQuest,
        dismissVictory,
        isQuestCompleted,
        getNextQuest: getNextQuestInternal,
        getAvailableQuests,
        getRealmProgress,
        isRealmUnlocked: isRealmUnlockedInternal,
        getCompletedTopicIds,
        totalQuests: allQuests.length,
        completedCount: game.completedQuests.length,
        // Learning topic methods (for w3schools content)
        completeLearningTopic,
        isLearningTopicCompleted,
        getCompletedLearningTopicIds,
        // New engagement systems
        claimDailyReward,
        spinWheel,
        consumeCollectible,
        getActiveCollectibles,
        grantCollectible,
        checkAndUnlockBadges,
        checkAndUnlockMilestones,
        refreshSideQuests,
        claimSideQuest,
        claimMilestone,
        claimBadge,
        // Skill allocation
        allocateSkillPoint,
        getSkillLevel,
        getAvailableSkillPoints,
        // Per-skill XP tracking
        getSkillXp,
        getSkillLevelFromXp,
        // Realm completion
        dismissRealmCompletion,
        // Onboarding
        completeOnboarding,
        // Direct XP/Gold for mini-games
        addXP,
        addGold,
        grantBadge,
        dismissRecentUnlocks,
        // Stats tracking
        incrementStat,
        resetQuizStreak,
        // Spaced repetition
        getWeakTopics,
        getTopicsDueForReview,
        // Prestige system
        canPrestige,
        doPrestige,
        getPrestigeBonuses,
        // Streak shields
        useStreakShield,
        addStreakShield,
        // Daily Dash speedrun
        startDailyDash,
        completeDailyDashQuest,
        abandonDailyDash,
        isDailyDashActive,
        // Store & Companions
        purchaseItem,
        equipCompanion,
        // Titles & Frames
        checkAndUnlockTitlesFrames,
        equipTitle,
        equipFrame,
        // Equipment
        equipItem,
        unequipItem,
        getEquippedItems,
        getEquipmentBonuses,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

/* eslint-disable react-refresh/only-export-components */
export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
