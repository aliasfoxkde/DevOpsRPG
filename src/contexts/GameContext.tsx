import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { allQuests, getNextQuest, isRealmUnlocked, realms, type Quest, type Realm } from '../data/quests'
import { BADGES, shouldUnlockBadge, type Badge } from '../data/badges'
import { MILESTONES, checkMilestone, type Milestone } from '../data/milestones'
import { generateDailyQuests, generateWeeklyQuests, generateSecretQuests, type SideQuest } from '../data/sidequests'
import { getRandomCollectible, COLLECTIBLES_POOL, DAILY_REWARDS, spinWheel as doSpin, type Collectible } from '../data/collectibles'

export type CharacterClass = 'Cloud Knight' | 'Script Warrior' | 'Data Mage' | 'DevOps Sage'

export interface Character {
  name: string
  class: CharacterClass
  avatar: string
  title: string
  level: number
  xp: number
  xpToNextLevel: number
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  gold: number
  streakDays: number
  lastActive: string
  joinedAt: string
  skillPoints: number // Points to spend on skills
  skillAllocations: Record<string, number> // skillId -> level
}

export interface TopicProgress {
  topicId: string
  technologyId: string
  questId: string
  completed: boolean
  xpEarned: number
  completedAt?: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: string
}

export interface GameState {
  character: Character
  completedQuests: TopicProgress[]
  currentQuestId: string | null
  achievements: Achievement[]
  showVictory: boolean
  lastVictory: { xp: number; levelUp: boolean; newLevel: number; milestone?: Milestone; badge?: Badge } | null
  // New engagement systems
  sideQuests: SideQuest[]
  badges: Badge[]
  milestones: Milestone[]
  collectibles: Collectible[]
  dailyRewardsClaimed: number[]
  lastDailyReset: string
  completedRealms: string[] // Track which realms have been completed
  showRealmCompletion: string | null // Realm ID if showing realm completion modal
  hasSeenOnboarding: boolean // Track if user has completed onboarding
}

interface GameContextType {
  game: GameState
  completeQuest: (questId: string) => void
  setCurrentQuest: (questId: string | null) => void
  dismissVictory: () => void
  isQuestCompleted: (questId: string) => boolean
  getNextQuest: () => Quest | null
  getAvailableQuests: () => Quest[]
  getRealmProgress: (realmId: string) => { completed: number; total: number }
  isRealmUnlocked: (realm: Realm) => boolean
  getCompletedTopicIds: () => Set<string>
  totalQuests: number
  completedCount: number
  // Badge/Sidequest/Milestone/Collectible methods
  claimDailyReward: (day: number) => { type: string; value?: number; collectible?: Collectible }
  spinWheel: () => { segment: { id: string; label: string; icon: string; reward: { type: string; value?: number; collectibleId?: string } } }
  useCollectible: (collectibleId: string) => boolean
  getActiveCollectibles: () => Collectible[]
  checkAndUnlockBadges: () => Badge[]
  checkAndUnlockMilestones: () => Milestone[]
  refreshSideQuests: () => void
  claimSideQuest: (questId: string) => { xp: number; gold: number }
  claimMilestone: (milestoneId: string) => { xpBonus: number }
  claimBadge: (badgeId: string) => { xp: number; gold: number }
  // Skill allocation
  allocateSkillPoint: (skillId: string) => boolean
  getSkillLevel: (skillId: string) => number
  getAvailableSkillPoints: () => number
  // Realm completion
  dismissRealmCompletion: () => void
  // Onboarding
  completeOnboarding: (name: string, charClass: CharacterClass) => void
  // Direct XP/Gold (for mini-games)
  addXP: (amount: number) => void
  addGold: (amount: number) => void
  grantBadge: (badgeId: string) => void
}

const STORAGE_KEY = 'devopsquest_game'

const XP_PER_LEVEL = 100
const MAX_HP = 100
const MAX_MP = 100

function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

function calculateXpToNextLevel(level: number): number {
  return level * XP_PER_LEVEL
}

function getTitle(level: number): string {
  if (level >= 21) return 'DevOps Sage'
  if (level >= 16) return 'DevOps Master'
  if (level >= 11) return 'DevOps Expert'
  if (level >= 6) return 'DevOps Journeyman'
  return 'DevOps Apprentice'
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_steps', name: 'First Steps', description: 'Complete your first quest', icon: '🎯' },
  { id: 'dedicated', name: 'Dedicated Learner', description: 'Maintain a 7-day streak', icon: '🔥' },
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '⭐' },
  { id: 'level_10', name: 'Seasoned Adventurer', description: 'Reach level 10', icon: '🌟' },
  { id: 'level_15', name: 'DevOps Expert', description: 'Reach level 15', icon: '💫' },
  { id: 'xp_500', name: 'XP Hunter', description: 'Earn 500 XP', icon: '💎' },
  { id: 'xp_1000', name: 'XP Master', description: 'Earn 1000 XP', icon: '👑' },
  { id: 'topics_10', name: 'Knowledge Seeker', description: 'Complete 10 quests', icon: '📚' },
  { id: 'topics_25', name: 'Halfway There', description: 'Complete 25 quests', icon: '🏆' },
  { id: 'all_foundations', name: 'Foundation Master', description: 'Complete all Foundations quests', icon: '🏠' },
  { id: 'streak_7', name: 'Weekly Warrior', description: '7-day learning streak', icon: '📅' },
  { id: 'streak_30', name: 'Monthly Dedication', description: '30-day learning streak', icon: '🗓️' },
]

function createDefaultCharacter(): Character {
  return {
    name: 'Hero',
    class: 'DevOps Sage',
    avatar: '🧙',
    title: 'DevOps Apprentice',
    level: 1,
    xp: 0,
    xpToNextLevel: XP_PER_LEVEL,
    hp: MAX_HP,
    maxHp: MAX_HP,
    mp: MAX_MP,
    maxMp: MAX_MP,
    gold: 0,
    streakDays: 0,
    lastActive: new Date().toISOString().split('T')[0],
    joinedAt: new Date().toISOString(),
    skillPoints: 0,
    skillAllocations: {},
  }
}

function createDefaultGame(): GameState {
  const today = new Date().toISOString().split('T')[0]
  return {
    character: createDefaultCharacter(),
    completedQuests: [],
    currentQuestId: null,
    achievements: ACHIEVEMENTS.map(a => ({ ...a })),
    showVictory: false,
    lastVictory: null,
    // Engagement systems - initialized fresh
    sideQuests: [...generateDailyQuests(), ...generateWeeklyQuests(), ...generateSecretQuests()],
    badges: BADGES.map(b => ({ ...b })),
    milestones: MILESTONES.map(m => ({ ...m })),
    collectibles: [],
    dailyRewardsClaimed: [],
    lastDailyReset: today,
    completedRealms: [],
    showRealmCompletion: null,
    hasSeenOnboarding: false,
  }
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<GameState>(() => {
    /* istanbul ignore if */
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // Ensure achievements are properly restored
          parsed.achievements = ACHIEVEMENTS.map(a => {
            const stored = parsed.achievements.find((ua: Achievement) => ua.id === a.id)
            return stored?.unlockedAt ? { ...a, unlockedAt: stored.unlockedAt } : a
          })
          return parsed
        } catch {
          return createDefaultGame()
        }
      }
    }
    return createDefaultGame()
  })

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game))
  }, [game])

  const completeQuest = useCallback((questId: string) => {
    setGame(prev => {
      // Find the quest
      const quest = allQuests.find(q => q.id === questId)
      if (!quest) return prev

      // Check if already completed
      if (prev.completedQuests.some(q => q.questId === questId)) return prev

      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      // Calculate new XP and level
      const newXp = prev.character.xp + quest.xpReward
      const newLevel = calculateLevel(newXp)
      const leveledUp = newLevel > prev.character.level

      // Update streak
      let newStreak = prev.character.streakDays
      if (prev.character.lastActive === yesterday) {
        newStreak += 1
      } else if (prev.character.lastActive !== today) {
        newStreak = 1
      }

      // Check for new achievements
      const completedCount = prev.completedQuests.length + 1
      const newAchievements = prev.achievements.map(a => {
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
            const foundationsQuests = allQuests.filter(q => q.realmId === 'foundations')
            const allFoundationsDone = foundationsQuests.every(
              fq => prev.completedQuests.some(cq => cq.questId === fq.id) || fq.id === questId
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
        new Set([...prev.completedQuests.map(q => q.topicId), quest.topicId])
      )

      // Check for realm completion first
      const completedRealmIds = [...prev.completedRealms]
      let newShowRealmCompletion: string | null = null

      for (const realm of Object.values(realms)) {
        if (completedRealmIds.includes(realm.id)) continue
        const realmQuests = allQuests.filter(q => q.realmId === realm.id)
        const allComplete = realmQuests.every(rq =>
          prev.completedQuests.some(cq => cq.questId === rq.id) || rq.id === questId
        )
        if (allComplete) {
          completedRealmIds.push(realm.id)
          newShowRealmCompletion = realm.id
          break
        }
      }

      // Calculate completed technologies
      const completedTechIds = [...new Set(prev.completedQuests.map(q => q.technologyId))]
      if (!completedTechIds.includes(quest.technologyId)) {
        const techQuests = allQuests.filter(q => q.technologyId === quest.technologyId)
        const allTechComplete = techQuests.every(tq =>
          prev.completedQuests.some(cq => cq.questId === tq.id) || tq.id === questId
        )
        if (allTechComplete) completedTechIds.push(quest.technologyId)
      }

      // Check for new badges with proper stats
      const badgeStats = {
        questCount: completedCount,
        streakDays: newStreak,
        level: newLevel,
        quizCount: 0,
        minigameCount: 0,
        perfectQuiz: false,
        quizStreak: 0,
        techCompleted: completedTechIds,
        realmCompleted: completedRealmIds.length,
        typerCount: 0,
        memoryCount: 0,
        mathCount: 0,
      }

      let newBadge: Badge | undefined
      const updatedBadges = prev.badges.map(b => {
        if (b.unlockedAt) return b
        if (!newBadge && shouldUnlockBadge(b, badgeStats)) {
          newBadge = { ...b, unlockedAt: new Date().toISOString() }
          return newBadge
        }
        return b
      })

      // Check for new milestones with proper state
      const milestoneState = {
        completedQuests: completedCount,
        streakDays: newStreak,
        level: newLevel,
        completedRealms: completedRealmIds,
        completedTechnologies: completedTechIds,
        quizStreak: 0,
        minigamesCompleted: 0,
        hasDefeatedBoss: quest.type === 'boss',
        hasPerfectQuiz: false,
      }

      let newMilestone: Milestone | undefined
      const updatedMilestones = prev.milestones.map(m => {
        if (m.unlocked) return m
        if (!newMilestone && checkMilestone(m, milestoneState)) {
          newMilestone = { ...m, unlocked: true, unlockedAt: new Date().toISOString() }
          return newMilestone
        }
        return m
      })

      // Maybe give a collectible
      let newCollectibles = prev.collectibles
      if (Math.random() < 0.15) { // 15% chance
        const collectible = getRandomCollectible()
        newCollectibles = [...prev.collectibles, collectible]
      }

      // Skill points on level up (1 point per level gained)
      const levelsGained = newLevel - prev.character.level
      const newSkillPoints = prev.character.skillPoints + levelsGained

      return {
        ...prev,
        character: {
          ...prev.character,
          xp: newXp,
          level: newLevel,
          xpToNextLevel: calculateXpToNextLevel(newLevel),
          title: getTitle(newLevel),
          streakDays: newStreak,
          lastActive: today,
          gold: prev.character.gold + Math.floor(quest.xpReward / 10),
          skillPoints: newSkillPoints,
        },
        completedQuests: [
          ...prev.completedQuests,
          {
            topicId: quest.topicId,
            technologyId: quest.technologyId,
            questId,
            completed: true,
            xpEarned: quest.xpReward,
            completedAt: new Date().toISOString(),
          },
        ],
        currentQuestId: nextQuest?.id || null,
        achievements: newAchievements,
        showVictory: true,
        lastVictory: {
          xp: quest.xpReward,
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
        sideQuests: prev.sideQuests.map(sq => {
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
      }
    })
  }, [])

  const setCurrentQuest = useCallback((questId: string | null) => {
    setGame(prev => ({ ...prev, currentQuestId: questId }))
  }, [])

  const dismissVictory = useCallback(() => {
    setGame(prev => ({ ...prev, showVictory: false, lastVictory: null }))
  }, [])

  const isQuestCompleted = useCallback((questId: string) => {
    return game.completedQuests.some(q => q.questId === questId)
  }, [game.completedQuests])

  const getNextQuestInternal = useCallback(() => {
    const completedIds = new Set(game.completedQuests.map(q => q.topicId))
    return getNextQuest(completedIds)
  }, [game.completedQuests])

  const getAvailableQuests = useCallback(() => {
    const completedIds = new Set(game.completedQuests.map(q => q.questId))
    return allQuests.filter(q => !completedIds.has(q.id))
  }, [game.completedQuests])

  const getCompletedTopicIds = useCallback(() => {
    return new Set(game.completedQuests.map(q => q.topicId))
  }, [game.completedQuests])

  const isRealmUnlockedInternal = useCallback((realm: Realm) => {
    const completedIds = getCompletedTopicIds()
    return isRealmUnlocked(realm, game.character.level, completedIds)
  }, [game.character.level, getCompletedTopicIds])

  const getRealmProgress = useCallback((realmId: string) => {
    const realmQuests = allQuests.filter(q => q.realmId === realmId)
    const completed = realmQuests.filter(q =>
      game.completedQuests.some(cq => cq.questId === q.id)
    ).length
    return { completed, total: realmQuests.length }
  }, [game.completedQuests])

  // Set initial current quest on first load
  useEffect(() => {
    if (!game.currentQuestId) {
      const next = getNextQuestInternal()
      if (next) {
        setGame(prev => ({ ...prev, currentQuestId: next.id }))
      }
    }
  }, [])

  // Check for daily reset
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    if (game.lastDailyReset !== today) {
      // Reset daily quests and daily rewards for new day
      setGame(prev => ({
        ...prev,
        sideQuests: [...generateDailyQuests(), ...generateWeeklyQuests(), ...generateSecretQuests()],
        dailyRewardsClaimed: [], // Reset daily rewards on new day
        lastDailyReset: today,
      }))
    }
  }, [game.lastDailyReset])

  // Badge/Sidequest/Milestone/Collectible methods
  const claimDailyReward = useCallback((day: number) => {
    let result = { type: 'xp' as const, value: 50 }
    setGame(prev => {
      if (prev.dailyRewardsClaimed.includes(day)) return prev
      const reward = DAILY_REWARDS[day - 1]
      if (!reward) return prev
      result = reward.reward as typeof result
      const newCollectibles = [...prev.collectibles]
      if (reward.reward.collectibleId) {
        const collectible = COLLECTIBLES_POOL.find(c => c.id === reward.reward.collectibleId)
        if (collectible) newCollectibles.push({ ...collectible, used: false })
      }
      return {
        ...prev,
        dailyRewardsClaimed: [...prev.dailyRewardsClaimed, day],
        collectibles: newCollectibles,
        character: {
          ...prev.character,
          xp: prev.character.xp + (reward.reward.value || 0),
          gold: prev.character.gold + (reward.reward.type === 'gold' ? reward.reward.value || 0 : 0),
        },
      }
    })
    return result
  }, [])

  const spinWheel = useCallback(() => {
    const segment = doSpin()
    setGame(prev => {
      const newCollectibles = [...prev.collectibles]
      if (segment.reward.collectibleId) {
        const collectible = COLLECTIBLES_POOL.find(c => c.id === segment.reward.collectibleId)
        if (collectible) newCollectibles.push({ ...collectible, used: false })
      }
      return {
        ...prev,
        collectibles: newCollectibles,
        character: {
          ...prev.character,
          xp: prev.character.xp + (segment.reward.value || 0),
          gold: prev.character.gold + (segment.reward.type === 'gold' ? segment.reward.value || 0 : 0),
        },
      }
    })
    return { segment }
  }, [])

  const useCollectible = useCallback((collectibleId: string): boolean => {
    let found = false
    setGame(prev => ({
      ...prev,
      collectibles: prev.collectibles.map(c => {
        if (c.id === collectibleId && !c.used) {
          found = true
          return { ...c, used: true }
        }
        return c
      }),
    }))
    return found
  }, [])

  const getActiveCollectibles = useCallback((): Collectible[] => {
    return game.collectibles.filter(c => !c.used)
  }, [game.collectibles])

  const checkAndUnlockBadges = useCallback((): Badge[] => {
    const newlyUnlocked: Badge[] = []
    setGame(prev => {
      const stats = {
        questCount: prev.completedQuests.length,
        streakDays: prev.character.streakDays,
        level: prev.character.level,
        quizCount: 0,
        minigameCount: 0,
        perfectQuiz: false,
        quizStreak: 0,
        techCompleted: [] as string[],
        realmCompleted: 0,
        typerCount: 0,
        memoryCount: 0,
        mathCount: 0,
      }
      const updated = prev.badges.map(b => {
        if (b.unlockedAt) return b
        if (shouldUnlockBadge(b, stats)) {
          const unlocked = { ...b, unlockedAt: new Date().toISOString() }
          newlyUnlocked.push(unlocked)
          return unlocked
        }
        return b
      })
      return { ...prev, badges: updated }
    })
    return newlyUnlocked
  }, [])

  const checkAndUnlockMilestones = useCallback((): Milestone[] => {
    const newlyUnlocked: Milestone[] = []
    setGame(prev => {
      const state = {
        completedQuests: prev.completedQuests.length,
        streakDays: prev.character.streakDays,
        level: prev.character.level,
        completedRealms: [],
        completedTechnologies: [],
        quizStreak: 0,
        minigamesCompleted: 0,
        hasDefeatedBoss: false,
        hasPerfectQuiz: false,
      }
      const updated = prev.milestones.map(m => {
        if (m.unlocked) return m
        if (checkMilestone(m, state)) {
          const unlocked = { ...m, unlocked: true, unlockedAt: new Date().toISOString() }
          newlyUnlocked.push(unlocked)
          return unlocked
        }
        return m
      })
      return { ...prev, milestones: updated }
    })
    return newlyUnlocked
  }, [])

  const refreshSideQuests = useCallback(() => {
    setGame(prev => ({
      ...prev,
      sideQuests: [...generateDailyQuests(), ...generateWeeklyQuests(), ...generateSecretQuests()],
    }))
  }, [])

  const claimSideQuest = useCallback((questId: string): { xp: number; gold: number } => {
    let rewards = { xp: 0, gold: 0 }
    setGame(prev => {
      const quest = prev.sideQuests.find(q => q.id === questId)
      if (!quest || quest.completed) return prev
      rewards = quest.rewards
      return {
        ...prev,
        sideQuests: prev.sideQuests.map(q =>
          q.id === questId ? { ...q, completed: true } : q
        ),
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
    setGame(prev => {
      const milestone = prev.milestones.find(m => m.id === milestoneId)
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
    setGame(prev => {
      const badge = prev.badges.find(b => b.id === badgeId)
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
    setGame(prev => {
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

  const getSkillLevel = useCallback((skillId: string): number => {
    return game.character.skillAllocations[skillId] || 0
  }, [game.character.skillAllocations])

  const getAvailableSkillPoints = useCallback((): number => {
    return game.character.skillPoints
  }, [game.character.skillPoints])

  const dismissRealmCompletion = useCallback(() => {
    setGame(prev => ({ ...prev, showRealmCompletion: null }))
  }, [])

  // Complete onboarding with character name and class
  const completeOnboarding = useCallback((name: string, charClass: CharacterClass) => {
    setGame(prev => ({
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
    setGame(prev => {
      const newXp = prev.character.xp + amount
      const newLevel = calculateLevel(newXp)
      return {
        ...prev,
        character: {
          ...prev.character,
          xp: newXp,
          level: newLevel,
        },
      }
    })
  }, [])

  // Add gold to character
  const addGold = useCallback((amount: number) => {
    setGame(prev => ({
      ...prev,
      character: {
        ...prev.character,
        gold: prev.character.gold + amount,
      },
    }))
  }, [])

  // Grant a badge directly
  const grantBadge = useCallback((badgeId: string) => {
    setGame(prev => {
      const badge = BADGES.find(b => b.id === badgeId)
      if (!badge || prev.badges.some(b => b.id === badgeId)) return prev
      return {
        ...prev,
        badges: [...prev.badges, { ...badge, unlockedAt: new Date().toISOString() }],
      }
    })
  }, [])

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
        // New engagement systems
        claimDailyReward,
        spinWheel,
        useCollectible,
        getActiveCollectibles,
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
        // Realm completion
        dismissRealmCompletion,
        // Onboarding
        completeOnboarding,
        // Direct XP/Gold for mini-games
        addXP,
        addGold,
        grantBadge,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
