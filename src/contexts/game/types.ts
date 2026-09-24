// State types for the game store. GameContext re-exports `CharacterClass` and
// `GameState` so existing `@/contexts/GameContext` imports keep resolving.
import type { Quest, Realm } from '../../data/quests'
import type { Badge } from '../../data/badges'
import type { Milestone } from '../../data/milestones'
import type { SideQuest } from '../../data/sidequests'
import type { Collectible } from '../../data/collectibles'
import type { Companion } from '../../data/companions'

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
  xpMultiplier: number // Active XP multiplier (1 = no multiplier)
  goldMultiplier: number // Active gold multiplier (1 = no multiplier)
  streakShields: number // Number of streak shields available
  // Titles and Frames
  equippedTitle: string // Currently equipped title ID
  equippedFrame: string // Currently equipped frame ID
  unlockedTitles: string[] // List of unlocked title IDs
  unlockedFrames: string[] // List of unlocked frame IDs
  // Equipment slots
  equippedItems: string[] // List of equipped equipment item IDs
}

interface TopicProgress {
  topicId: string
  technologyId: string
  questId: string
  completed: boolean
  xpEarned: number
  completedAt?: string
}

// Learning topic progress (for w3schools content) - separate from quest completion
interface LearningTopicProgress {
  topicId: string
  technologyId: string
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

// Spaced-repetition tracking for a topic the player keeps missing
interface WeakTopicEntry {
  wrongCount: number
  lastReviewed: string
  nextReview: string
  masteryLevel: number // 0-3, higher = more confident
}

export interface GameState {
  character: Character
  completedQuests: TopicProgress[]
  completedTopics: LearningTopicProgress[] // Learning content topic completions
  currentQuestId: string | null
  currentQuestStartTime: number | null // Timestamp when current quest started
  achievements: Achievement[]
  showVictory: boolean
  lastVictory: {
    xp: number
    levelUp: boolean
    newLevel: number
    milestone?: Milestone
    badge?: Badge
  } | null
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
  // Notification system for recent unlocks
  recentBadgeUnlocks: Badge[] // Badges unlocked since last dismiss
  recentMilestoneUnlocks: Milestone[] // Milestones unlocked since last dismiss
  // Stats for badge unlocking
  stats: {
    quizCount: number
    quizPerfectCount: number // Number of perfect quizzes (100%)
    quizStreak: number // Current quiz streak
    minigameCount: number
    typerCount: number
    memoryCount: number
    mathCount: number
    perfectQuiz: boolean // Had at least one perfect quiz
    wrongAnswerCount: number // Total wrong answers (legacy, for tracking)
    perfectQuestCount: number // Quests completed with 0 wrong answers
    sessionQuestCount: number // Quests in current session for marathon badge
    earlyQuests: number // Quests completed before 8 AM
    nightQuests: number // Quests completed after 10 PM
    fastestQuestTime: number // Fastest quest completion in seconds
    jackpotSpins: number // Times won 500+ gold on wheel
    mysteryBoxesOpened: number // Mystery boxes opened
    challengeComplete: number // Challenge participation count
    sidequestComplete: number // Side quest completion count
    milestoneTier: number // Highest milestone tier reached
    quizMasterScore: number // Quizzes passed with 80%+ score
  }
  // Weak topic tracking for spaced repetition
  weakTopics: Record<string, WeakTopicEntry>
  // Prestige system
  prestigeLevel: number // Times player has prestiged (reset progress for permanent bonuses)
  prestigeMultiplier: number // Permanent XP/Gold multiplier from prestige (starts at 1.0, increases with each prestige)
  totalPrestigeXp: number // Total XP earned across all prestiges (for prestige badges)
  // Companions
  companions: Companion[]
  activeCompanion: Companion | null
  // Daily Dash speedrun challenge
  dailyDash: {
    active: boolean
    startTime: number | null
    completedQuests: string[]
    bestTime: number | null // Best time in seconds
    lastPlayedDate: string | null
  }
  // Per-skill XP tracking (skillId/technologyId -> xp)
  skillXp: Record<string, number>
  // Community challenges tracking
  communityStats: {
    weeklyQuestsCompleted: number
    weeklyXPCompleted: number
    lastWeekReset: string
  }
}

export interface GameContextType {
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
  // Learning topic methods (for w3schools content)
  completeLearningTopic: (topicId: string, technologyId: string, xpEarned: number) => void
  isLearningTopicCompleted: (topicId: string) => boolean
  getCompletedLearningTopicIds: () => Set<string>
  // Badge/Sidequest/Milestone/Collectible methods
  claimDailyReward: (day: number) => { type: string; value?: number; collectible?: Collectible }
  spinWheel: () => {
    segment: {
      id: string
      label: string
      icon: string
      reward: { type: string; value?: number; collectibleId?: string }
    }
  }
  consumeCollectible: (collectibleId: string) => boolean
  getActiveCollectibles: () => Collectible[]
  grantCollectible: (collectible: Collectible) => void
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
  // Per-skill XP tracking
  getSkillXp: (techId: string) => number
  getSkillLevelFromXp: (xp: number) => number
  // Stats tracking for badges
  incrementStat: (
    stat: 'quiz' | 'typer' | 'memory' | 'math' | 'minigame' | 'challenge',
    isPerfect?: boolean,
    wrongAnswers?: number,
    passedWith80?: boolean,
    topicId?: string,
  ) => void
  resetQuizStreak: () => void
  // Spaced repetition
  getWeakTopics: () => Array<{
    topicId: string
    masteryLevel: number
    wrongCount: number
    nextReview: string
  }>
  getTopicsDueForReview: () => string[]
  // Prestige system
  canPrestige: () => boolean
  doPrestige: () => { newPrestigeLevel: number; newMultiplier: number }
  getPrestigeBonuses: () => { xpBonus: number; goldBonus: number; bonusDescription: string }
  // Realm completion
  dismissRealmCompletion: () => void
  // Onboarding
  completeOnboarding: (name: string, charClass: CharacterClass) => void
  // Direct XP/Gold (for mini-games)
  addXP: (amount: number) => void
  addGold: (amount: number) => void
  grantBadge: (badgeId: string) => void
  dismissRecentUnlocks: () => void
  // Streak shields
  useStreakShield: () => boolean
  addStreakShield: (count?: number) => void
  // Daily Dash speedrun
  startDailyDash: () => void
  completeDailyDashQuest: (questId: string) => void
  abandonDailyDash: () => void
  isDailyDashActive: () => boolean
  // Store & Companions
  purchaseItem: (itemId: string, price: number) => boolean
  equipCompanion: (companionId: string) => void
  // Titles & Frames
  checkAndUnlockTitlesFrames: () => { unlockedTitles: string[]; unlockedFrames: string[] }
  equipTitle: (titleId: string) => boolean
  equipFrame: (frameId: string) => boolean
  // Equipment
  equipItem: (itemId: string) => boolean
  unequipItem: (itemId: string) => boolean
  getEquippedItems: () => string[]
  getEquipmentBonuses: () => {
    xpBonus: number
    goldBonus: number
    techBonuses: Record<string, number>
  }
}
