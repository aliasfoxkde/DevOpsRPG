// Side quests - daily challenges, weekly missions, secret quests
export type SideQuestType = 'daily' | 'weekly' | 'secret'

export interface SideQuest {
  id: string
  type: SideQuestType
  title: string
  description: string
  icon: string
  requirement: {
    type: 'complete_quests' | 'earn_xp' | 'maintain_streak' | 'minigame' | 'quiz' | 'explore'
    count: number
    technology?: string
  }
  rewards: {
    xp: number
    gold: number
    badge?: string
  }
  expiresAt?: string // For daily/weekly
  completed: boolean
  progress: number
}

export const DAILY_QUESTS_POOL: Omit<SideQuest, 'completed' | 'progress'>[] = [
  { id: 'daily_quests_1', type: 'daily', title: 'Daily Dedication', description: 'Complete 2 quests today', icon: '📜', requirement: { type: 'complete_quests', count: 2 }, rewards: { xp: 75, gold: 30 } },
  { id: 'daily_quests_2', type: 'daily', title: 'Quest Hunter', description: 'Complete 3 quests today', icon: '⚔️', requirement: { type: 'complete_quests', count: 3 }, rewards: { xp: 125, gold: 50 } },
  { id: 'daily_xp_1', type: 'daily', title: 'XP Harvester', description: 'Earn 200 XP today', icon: '✨', requirement: { type: 'earn_xp', count: 200 }, rewards: { xp: 50, gold: 25 } },
  { id: 'daily_xp_2', type: 'daily', title: 'XP Machine', description: 'Earn 500 XP today', icon: '💫', requirement: { type: 'earn_xp', count: 500 }, rewards: { xp: 100, gold: 75 } },
  { id: 'daily_streak', type: 'daily', title: 'Streak Keeper', description: 'Maintain your daily streak', icon: '🔥', requirement: { type: 'maintain_streak', count: 1 }, rewards: { xp: 50, gold: 20 } },
  { id: 'daily_minigame', type: 'daily', title: 'Game Player', description: 'Complete 1 mini-game', icon: '🎮', requirement: { type: 'minigame', count: 1 }, rewards: { xp: 60, gold: 30 } },
  { id: 'daily_quiz', type: 'daily', title: 'Quiz Master', description: 'Pass 2 quizzes', icon: '🧠', requirement: { type: 'quiz', count: 2 }, rewards: { xp: 80, gold: 40 } },
  { id: 'daily_explore', type: 'daily', title: 'Realm Explorer', description: 'Visit 2 different realms', icon: '🗺️', requirement: { type: 'explore', count: 2 }, rewards: { xp: 40, gold: 20 } },
]

export const WEEKLY_QUESTS_POOL: Omit<SideQuest, 'completed' | 'progress'>[] = [
  { id: 'weekly_quests_1', type: 'weekly', title: 'Weekly Warrior', description: 'Complete 15 quests this week', icon: '📜', requirement: { type: 'complete_quests', count: 15 }, rewards: { xp: 500, gold: 200, badge: 'weekly_warrior' } },
  { id: 'weekly_xp', type: 'weekly', title: 'XP Champion', description: 'Earn 2000 XP this week', icon: '🏆', requirement: { type: 'earn_xp', count: 2000 }, rewards: { xp: 300, gold: 150, badge: 'xp_champion' } },
  { id: 'weekly_streak', type: 'weekly', title: 'Streak Master', description: 'Maintain a 7-day streak', icon: '🔥', requirement: { type: 'maintain_streak', count: 7 }, rewards: { xp: 400, gold: 200, badge: 'streak_master' } },
  { id: 'weekly_minigames', type: 'weekly', title: 'Gamer Elite', description: 'Complete 5 mini-games this week', icon: '🎮', requirement: { type: 'minigame', count: 5 }, rewards: { xp: 250, gold: 100 } },
  { id: 'weekly_quizzes', type: 'weekly', title: 'Quiz Legend', description: 'Pass 10 quizzes this week', icon: '🧠', requirement: { type: 'quiz', count: 10 }, rewards: { xp: 350, gold: 175, badge: 'quiz_legend' } },
]

export const SECRET_QUESTS_POOL: Omit<SideQuest, 'completed' | 'progress' | 'expiresAt'>[] = [
  { id: 'secret_early_bird', type: 'secret', title: 'Early Bird', description: 'Complete a quest before 8 AM', icon: '🐦', requirement: { type: 'complete_quests', count: 1 }, rewards: { xp: 100, gold: 50, badge: 'early_bird' } },
  { id: 'secret_night_owl', type: 'secret', title: 'Night Owl', description: 'Complete a quest after 10 PM', icon: '🦉', requirement: { type: 'complete_quests', count: 1 }, rewards: { xp: 100, gold: 50, badge: 'night_owl' } },
  { id: 'secret_speed_demon', type: 'secret', title: 'Speed Demon', description: 'Complete a quest in under 2 minutes', icon: '⚡', requirement: { type: 'complete_quests', count: 1 }, rewards: { xp: 150, gold: 75, badge: 'speed_demon' } },
  { id: 'secret_perfectionist', type: 'secret', title: 'Perfectionist', description: 'Get 100% on 3 quizzes in a row', icon: '💎', requirement: { type: 'quiz', count: 3 }, rewards: { xp: 300, gold: 150, badge: 'perfectionist' } },
  { id: 'secret_explorer', type: 'secret', title: 'Realm Traveler', description: 'Visit all 5 realms', icon: '🗺️', requirement: { type: 'explore', count: 5 }, rewards: { xp: 200, gold: 100, badge: 'world_traveler' } },
  { id: 'secret_technology_collector', type: 'secret', title: 'Technology Collector', description: 'Complete at least 1 quest in each technology', icon: '🏅', requirement: { type: 'complete_quests', count: 10 }, rewards: { xp: 250, gold: 125, badge: 'collector' } },
]

// Generate daily quests (reset at midnight)
export function generateDailyQuests(): SideQuest[] {
  const shuffled = [...DAILY_QUESTS_POOL].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, 3)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  return selected.map(q => ({
    ...q,
    completed: false,
    progress: 0,
    expiresAt: tomorrow.toISOString(),
  }))
}

// Generate weekly quests (reset on Monday)
export function generateWeeklyQuests(): SideQuest[] {
  const shuffled = [...WEEKLY_QUESTS_POOL].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, 2)

  const nextMonday = new Date()
  nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7))
  nextMonday.setHours(0, 0, 0, 0)

  return selected.map(q => ({
    ...q,
    completed: false,
    progress: 0,
    expiresAt: nextMonday.toISOString(),
  }))
}

// Generate secret quests (always available, one at a time)
export function generateSecretQuests(): SideQuest[] {
  return SECRET_QUESTS_POOL.map(q => ({
    ...q,
    completed: false,
    progress: 0,
  }))
}

// Check if quest is expired
export function isQuestExpired(quest: SideQuest): boolean {
  if (!quest.expiresAt) return false
  return new Date(quest.expiresAt) < new Date()
}
