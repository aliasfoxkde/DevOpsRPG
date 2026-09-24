// Default game state factories: what a brand-new player (and each prestige
// reset) starts from.
import { BADGES } from '../../data/badges'
import { MILESTONES } from '../../data/milestones'
import {
  generateDailyQuests,
  generateWeeklyQuests,
  generateSecretQuests,
} from '../../data/sidequests'
import { XP_PER_LEVEL, MAX_HP, MAX_MP } from '../../utils/gameUtils'
import type { Achievement, Character, GameState } from './types'

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_steps', name: 'First Steps', description: 'Complete your first quest', icon: '🎯' },
  {
    id: 'dedicated',
    name: 'Dedicated Learner',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
  },
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '⭐' },
  { id: 'level_10', name: 'Seasoned Adventurer', description: 'Reach level 10', icon: '🌟' },
  { id: 'level_15', name: 'DevOps Expert', description: 'Reach level 15', icon: '💫' },
  { id: 'xp_500', name: 'XP Hunter', description: 'Earn 500 XP', icon: '💎' },
  { id: 'xp_1000', name: 'XP Master', description: 'Earn 1000 XP', icon: '👑' },
  { id: 'topics_10', name: 'Knowledge Seeker', description: 'Complete 10 quests', icon: '📚' },
  { id: 'topics_25', name: 'Halfway There', description: 'Complete 25 quests', icon: '🏆' },
  {
    id: 'all_foundations',
    name: 'Foundation Master',
    description: 'Complete all Foundations quests',
    icon: '🏠',
  },
  { id: 'streak_7', name: 'Weekly Warrior', description: '7-day learning streak', icon: '📅' },
  {
    id: 'streak_30',
    name: 'Monthly Dedication',
    description: '30-day learning streak',
    icon: '🗓️',
  },
]

// Zeroed per-run stats, shared by createDefaultGame and the prestige reset so
// the two can never drift apart.
export function createEmptyStats(): GameState['stats'] {
  return {
    quizCount: 0,
    quizPerfectCount: 0,
    quizStreak: 0,
    minigameCount: 0,
    typerCount: 0,
    memoryCount: 0,
    mathCount: 0,
    perfectQuiz: false,
    wrongAnswerCount: 0,
    perfectQuestCount: 0,
    sessionQuestCount: 0,
    earlyQuests: 0,
    nightQuests: 0,
    fastestQuestTime: Infinity,
    jackpotSpins: 0,
    mysteryBoxesOpened: 0,
    challengeComplete: 0,
    sidequestComplete: 0,
    milestoneTier: 0,
    quizMasterScore: 0,
  }
}

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
    xpMultiplier: 1,
    goldMultiplier: 1,
    streakShields: 0,
    equippedTitle: 'novice-devops',
    equippedFrame: 'default',
    unlockedTitles: ['novice-devops'],
    unlockedFrames: ['default'],
    equippedItems: [],
  }
}

export function createDefaultGame(): GameState {
  const today = new Date().toISOString().split('T')[0]
  return {
    character: createDefaultCharacter(),
    completedQuests: [],
    completedTopics: [], // Learning content topic completions
    currentQuestId: null,
    currentQuestStartTime: null,
    achievements: ACHIEVEMENTS.map((a) => ({ ...a })),
    showVictory: false,
    lastVictory: null,
    // Engagement systems - initialized fresh
    sideQuests: [...generateDailyQuests(), ...generateWeeklyQuests(), ...generateSecretQuests()],
    badges: BADGES.map((b) => ({ ...b })),
    milestones: MILESTONES.map((m) => ({ ...m })),
    collectibles: [],
    dailyRewardsClaimed: [],
    lastDailyReset: today,
    completedRealms: [],
    showRealmCompletion: null,
    hasSeenOnboarding: true, // Default to true so users can access quests immediately
    recentBadgeUnlocks: [],
    recentMilestoneUnlocks: [],
    stats: createEmptyStats(),
    weakTopics: {},
    prestigeLevel: 0,
    prestigeMultiplier: 1.0,
    totalPrestigeXp: 0,
    companions: [],
    activeCompanion: null,
    dailyDash: {
      active: false,
      startTime: null,
      completedQuests: [],
      bestTime: null,
      lastPlayedDate: null,
    },
    skillXp: {},
    communityStats: {
      weeklyQuestsCompleted: 0,
      weeklyXPCompleted: 0,
      lastWeekReset: new Date().toISOString(),
    },
  }
}
