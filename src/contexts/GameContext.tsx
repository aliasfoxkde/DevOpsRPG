import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { allQuests, getNextQuest, isRealmUnlocked, type Quest, type Realm } from '../data/quests'

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
  lastVictory: { xp: number; levelUp: boolean; newLevel: number } | null
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
  }
}

function createDefaultGame(): GameState {
  return {
    character: createDefaultCharacter(),
    completedQuests: [],
    currentQuestId: null,
    achievements: ACHIEVEMENTS.map(a => ({ ...a })),
    showVictory: false,
    lastVictory: null,
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
          case 'all_foundations':
            // Check if all foundations quests are complete
            const foundationsQuests = allQuests.filter(q => q.realmId === 'foundations')
            const allFoundationsDone = foundationsQuests.every(
              fq => prev.completedQuests.some(cq => cq.questId === fq.id) || fq.id === questId
            )
            unlocked = allFoundationsDone
            break
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
        },
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
