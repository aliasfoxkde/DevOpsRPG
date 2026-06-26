// Badges/Achievements system
export type BadgeCategory = 'quest' | 'streak' | 'skill' | 'social' | 'secret' | 'seasonal'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: BadgeCategory
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  requirement: {
    type: string
    value: number
    tech?: string
  }
  xpReward: number
  goldReward: number
  unlockedAt?: string
}

export const BADGES: Badge[] = [
  // Quest completion badges
  { id: 'first_quest', name: 'First Steps', description: 'Complete your first quest', icon: '🎯', category: 'quest', rarity: 'common', requirement: { type: 'quest_count', value: 1 }, xpReward: 25, goldReward: 10 },
  { id: 'quest_10', name: 'Getting Started', description: 'Complete 10 quests', icon: '📜', category: 'quest', rarity: 'common', requirement: { type: 'quest_count', value: 10 }, xpReward: 100, goldReward: 50 },
  { id: 'quest_25', name: 'Knowledge Seeker', description: 'Complete 25 quests', icon: '📚', category: 'quest', rarity: 'uncommon', requirement: { type: 'quest_count', value: 25 }, xpReward: 200, goldReward: 100 },
  { id: 'quest_50', name: 'Dedicated Learner', description: 'Complete 50 quests', icon: '🎓', category: 'quest', rarity: 'rare', requirement: { type: 'quest_count', value: 50 }, xpReward: 400, goldReward: 200 },
  { id: 'quest_100', name: 'Halfway Hero', description: 'Complete 100 quests', icon: '⭐', category: 'quest', rarity: 'epic', requirement: { type: 'quest_count', value: 100 }, xpReward: 800, goldReward: 400 },
  { id: 'quest_all', name: 'DevOps Grandmaster', description: 'Complete all 163 quests', icon: '👑', category: 'quest', rarity: 'legendary', requirement: { type: 'quest_count', value: 163 }, xpReward: 5000, goldReward: 2500 },

  // Streak badges
  { id: 'streak_3', name: 'On Fire', description: 'Maintain a 3-day streak', icon: '🔥', category: 'streak', rarity: 'common', requirement: { type: 'streak_days', value: 3 }, xpReward: 30, goldReward: 15 },
  { id: 'streak_7', name: 'Weekly Warrior', description: 'Maintain a 7-day streak', icon: '💪', category: 'streak', rarity: 'uncommon', requirement: { type: 'streak_days', value: 7 }, xpReward: 100, goldReward: 50 },
  { id: 'streak_14', name: 'Fortnight Focus', description: 'Maintain a 14-day streak', icon: '📅', category: 'streak', rarity: 'rare', requirement: { type: 'streak_days', value: 14 }, xpReward: 250, goldReward: 125 },
  { id: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '🗓️', category: 'streak', rarity: 'epic', requirement: { type: 'streak_days', value: 30 }, xpReward: 750, goldReward: 375 },
  { id: 'streak_100', name: 'Unstoppable', description: 'Maintain a 100-day streak', icon: '💯', category: 'streak', rarity: 'legendary', requirement: { type: 'streak_days', value: 100 }, xpReward: 2500, goldReward: 1250 },

  // Level badges
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '⭐', category: 'skill', rarity: 'common', requirement: { type: 'level', value: 5 }, xpReward: 75, goldReward: 35 },
  { id: 'level_10', name: 'Seasoned Adventurer', description: 'Reach level 10', icon: '🌟', category: 'skill', rarity: 'uncommon', requirement: { type: 'level', value: 10 }, xpReward: 150, goldReward: 75 },
  { id: 'level_15', name: 'DevOps Expert', description: 'Reach level 15', icon: '💫', category: 'skill', rarity: 'rare', requirement: { type: 'level', value: 15 }, xpReward: 300, goldReward: 150 },
  { id: 'level_20', name: 'DevOps Master', description: 'Reach level 20', icon: '👑', category: 'skill', rarity: 'legendary', requirement: { type: 'level', value: 20 }, xpReward: 1000, goldReward: 500 },

  // Technology mastery badges
  { id: 'html_master', name: 'HTML Guru', description: 'Complete all HTML quests', icon: '📄', category: 'skill', rarity: 'uncommon', requirement: { type: 'tech_complete', value: 1, tech: 'html' }, xpReward: 200, goldReward: 100 },
  { id: 'css_master', name: 'CSS Guru', description: 'Complete all CSS quests', icon: '🎨', category: 'skill', rarity: 'uncommon', requirement: { type: 'tech_complete', value: 1, tech: 'css' }, xpReward: 200, goldReward: 100 },
  { id: 'js_master', name: 'JavaScript Guru', description: 'Complete all JavaScript quests', icon: '⚡', category: 'skill', rarity: 'rare', requirement: { type: 'tech_complete', value: 1, tech: 'javascript' }, xpReward: 300, goldReward: 150 },
  { id: 'python_master', name: 'Python Guru', description: 'Complete all Python quests', icon: '🐍', category: 'skill', rarity: 'rare', requirement: { type: 'tech_complete', value: 1, tech: 'python' }, xpReward: 350, goldReward: 175 },
  { id: 'docker_master', name: 'Docker Guru', description: 'Complete all Docker quests', icon: '🐳', category: 'skill', rarity: 'rare', requirement: { type: 'tech_complete', value: 1, tech: 'docker' }, xpReward: 400, goldReward: 200 },
  { id: 'kubernetes_master', name: 'Kubernetes Guru', description: 'Complete all Kubernetes quests', icon: '☸️', category: 'skill', rarity: 'epic', requirement: { type: 'tech_complete', value: 1, tech: 'kubernetes' }, xpReward: 500, goldReward: 250 },
  { id: 'aws_master', name: 'AWS Guru', description: 'Complete all AWS quests', icon: '☁️', category: 'skill', rarity: 'epic', requirement: { type: 'tech_complete', value: 1, tech: 'aws' }, xpReward: 500, goldReward: 250 },
  { id: 'devops_master', name: 'DevOps Sage', description: 'Complete the DevOps realm', icon: '🏆', category: 'skill', rarity: 'legendary', requirement: { type: 'tech_complete', value: 1, tech: 'cicd' }, xpReward: 1000, goldReward: 500 },

  // Realm completion badges
  { id: 'foundations_complete', name: 'Foundation Master', description: 'Complete the Village of Foundations', icon: '🏘️', category: 'quest', rarity: 'uncommon', requirement: { type: 'realm_complete', value: 1 }, xpReward: 200, goldReward: 100 },
  { id: 'scripts_complete', name: 'Forest Explorer', description: 'Complete the Forest of Scripts', icon: '🌲', category: 'quest', rarity: 'rare', requirement: { type: 'realm_complete', value: 2 }, xpReward: 300, goldReward: 150 },
  { id: 'frameworks_complete', name: 'Castle Champion', description: 'Complete the Castle of Frameworks', icon: '🏰', category: 'quest', rarity: 'rare', requirement: { type: 'realm_complete', value: 3 }, xpReward: 400, goldReward: 200 },
  { id: 'cloud_complete', name: 'Mountain Climber', description: 'Complete the Mountains of Cloud', icon: '⛰️', category: 'quest', rarity: 'epic', requirement: { type: 'realm_complete', value: 4 }, xpReward: 600, goldReward: 300 },
  { id: 'devops_complete', name: 'True DevOps Master', description: 'Complete the Citadel of DevOps', icon: '🏛️', category: 'quest', rarity: 'legendary', requirement: { type: 'realm_complete', value: 5 }, xpReward: 2000, goldReward: 1000 },

  // Quiz badges
  { id: 'quiz_first', name: 'Quiz Taker', description: 'Complete your first quiz', icon: '🧠', category: 'quest', rarity: 'common', requirement: { type: 'quiz_count', value: 1 }, xpReward: 25, goldReward: 10 },
  { id: 'quiz_10', name: 'Quiz Enthusiast', description: 'Complete 10 quizzes', icon: '📝', category: 'quest', rarity: 'uncommon', requirement: { type: 'quiz_count', value: 10 }, xpReward: 100, goldReward: 50 },
  { id: 'quiz_perfect', name: 'Perfectionist', description: 'Get 100% on a quiz', icon: '💎', category: 'skill', rarity: 'rare', requirement: { type: 'perfect_quiz', value: 1 }, xpReward: 150, goldReward: 75 },
  { id: 'quiz_streak_5', name: 'Quiz Streak', description: 'Get 5 perfect quizzes in a row', icon: '🔥', category: 'skill', rarity: 'epic', requirement: { type: 'quiz_streak', value: 5 }, xpReward: 400, goldReward: 200 },

  // Minigame badges
  { id: 'minigame_first', name: 'Gamer', description: 'Complete your first mini-game', icon: '🎮', category: 'quest', rarity: 'common', requirement: { type: 'minigame_count', value: 1 }, xpReward: 30, goldReward: 15 },
  { id: 'minigame_10', name: 'Game Enthusiast', description: 'Complete 10 mini-games', icon: '🏅', category: 'quest', rarity: 'uncommon', requirement: { type: 'minigame_count', value: 10 }, xpReward: 150, goldReward: 75 },
  { id: 'typer_10', name: 'Command Typer', description: 'Complete 10 Command Typer challenges', icon: '⌨️', category: 'skill', rarity: 'uncommon', requirement: { type: 'typer_count', value: 10 }, xpReward: 100, goldReward: 50 },
  { id: 'memory_5', name: 'Memory Master', description: 'Complete 5 Memory Match games', icon: '🧠', category: 'skill', rarity: 'uncommon', requirement: { type: 'memory_count', value: 5 }, xpReward: 100, goldReward: 50 },
  { id: 'math_5', name: 'Math Wizard', description: 'Complete 5 Math Challenges', icon: '🧮', category: 'skill', rarity: 'uncommon', requirement: { type: 'math_count', value: 5 }, xpReward: 100, goldReward: 50 },

  // Secret badges
  { id: 'early_bird', name: 'Early Bird', description: 'Complete a quest before 8 AM', icon: '🐦', category: 'secret', rarity: 'rare', requirement: { type: 'early_quest', value: 1 }, xpReward: 100, goldReward: 50 },
  { id: 'night_owl', name: 'Night Owl', description: 'Complete a quest after 10 PM', icon: '🦉', category: 'secret', rarity: 'rare', requirement: { type: 'night_quest', value: 1 }, xpReward: 100, goldReward: 50 },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a quest in under 2 minutes', icon: '⚡', category: 'secret', rarity: 'epic', requirement: { type: 'speed_quest', value: 1 }, xpReward: 200, goldReward: 100 },
  { id: 'collector', name: 'Collector', description: 'Earn a badge from each category', icon: '🏅', category: 'secret', rarity: 'epic', requirement: { type: 'all_categories', value: 1 }, xpReward: 300, goldReward: 150 },
  { id: 'completionist', name: 'Completionist', description: 'Earn all other badges', icon: '💯', category: 'secret', rarity: 'legendary', requirement: { type: 'all_badges', value: 1 }, xpReward: 5000, goldReward: 2500 },

  // More secret/hidden badges
  { id: 'lucky_spin', name: 'Lucky!', description: 'Win the jackpot (500+ gold) on the bonus wheel', icon: '🎰', category: 'secret', rarity: 'rare', requirement: { type: 'jackpot_spin', value: 1 }, xpReward: 150, goldReward: 75 },
  { id: 'first_mystery', name: 'Mystery Solved', description: 'Open your first mystery box', icon: '🎁', category: 'secret', rarity: 'common', requirement: { type: 'mystery_open', value: 1 }, xpReward: 50, goldReward: 25 },
  { id: 'streak_7_secret', name: 'Unstoppable', description: 'Maintain a 21-day streak', icon: '🔥', category: 'secret', rarity: 'uncommon', requirement: { type: 'streak_days', value: 21 }, xpReward: 100, goldReward: 50 },
  { id: 'centurion', name: 'Centurion', description: 'Complete 100 quests', icon: '💯', category: 'secret', rarity: 'epic', requirement: { type: 'quest_count', value: 100 }, xpReward: 1000, goldReward: 500 },
  { id: 'all_realms', name: 'World Explorer', description: 'Complete all 5 realms', icon: '🗺️', category: 'secret', rarity: 'legendary', requirement: { type: 'all_realms', value: 5 }, xpReward: 2500, goldReward: 1250 },
  { id: 'all_tech', name: 'Tech Master', description: 'Complete quests in all technologies', icon: '🛠️', category: 'secret', rarity: 'epic', requirement: { type: 'all_technologies', value: 1 }, xpReward: 750, goldReward: 375 },
  { id: 'quiz_master', name: 'Quiz Master', description: 'Complete 50 quizzes with 80%+ score', icon: '🧠', category: 'secret', rarity: 'rare', requirement: { type: 'quiz_master', value: 50 }, xpReward: 400, goldReward: 200 },
  { id: 'no_mistakes', name: 'Flawless', description: 'Complete 10 quests without any wrong answers', icon: '💎', category: 'secret', rarity: 'epic', requirement: { type: 'no_mistakes', value: 10 }, xpReward: 500, goldReward: 250 },
  { id: 'marathon', name: 'Marathon', description: 'Complete 10 quests in a single session', icon: '🏃', category: 'secret', rarity: 'rare', requirement: { type: 'marathon', value: 10 }, xpReward: 300, goldReward: 150 },
  { id: 'level_25', name: 'Max Level', description: 'Reach level 25 (max level)', icon: '⬆️', category: 'secret', rarity: 'legendary', requirement: { type: 'max_level', value: 25 }, xpReward: 5000, goldReward: 2500 },
  { id: 'gold_hoarder', name: 'Gold Hoarder', description: 'Accumulate 10,000 gold', icon: '💰', category: 'secret', rarity: 'epic', requirement: { type: 'gold_hoard', value: 10000 }, xpReward: 500, goldReward: 0 },
  { id: 'first_legendary', name: 'Legendary', description: 'Earn your first legendary item', icon: '⭐', category: 'secret', rarity: 'uncommon', requirement: { type: 'first_legendary', value: 1 }, xpReward: 200, goldReward: 100 },

  // Social badges (for future implementation - social features not yet available)
  // NOTE: 'helper' badge removed - help_count requirement type not implemented

  // Challenge completion badges (weekly)
  { id: 'weekly_crusader', name: 'Quest Crusader', description: 'Complete 20 quests in a week', icon: '⚔️', category: 'quest', rarity: 'uncommon', requirement: { type: 'challenge_complete', value: 1 }, xpReward: 600, goldReward: 250 },
  { id: 'streak_sentinel', name: 'Streak Sentinel', description: 'Maintain a 7-day streak through the week', icon: '🔥', category: 'streak', rarity: 'uncommon', requirement: { type: 'challenge_complete', value: 1 }, xpReward: 500, goldReward: 200 },
  { id: 'quiz_wizard', name: 'Quiz Wizard', description: 'Pass 15 quizzes in a week', icon: '🧙', category: 'quest', rarity: 'uncommon', requirement: { type: 'challenge_complete', value: 1 }, xpReward: 450, goldReward: 225 },

  // Challenge completion badges (monthly)
  { id: 'devops_champion', name: 'DevOps Champion', description: 'Complete 100 quests in a month', icon: '🏆', category: 'quest', rarity: 'epic', requirement: { type: 'challenge_complete', value: 1 }, xpReward: 2500, goldReward: 1000 },
  { id: 'monthly_master', name: 'Monthly Master', description: 'Maintain a 30-day streak through the month', icon: '🔥', category: 'streak', rarity: 'epic', requirement: { type: 'challenge_complete', value: 1 }, xpReward: 2000, goldReward: 1000 },
  { id: 'quiz_oracle', name: 'Quiz Oracle', description: 'Pass 75 quizzes in a month', icon: '🔮', category: 'quest', rarity: 'epic', requirement: { type: 'challenge_complete', value: 1 }, xpReward: 1800, goldReward: 900 },

  // Side quest badges
  { id: 'weekly_warrior', name: 'Weekly Warrior', description: 'Complete the weekly warrior quest', icon: '💪', category: 'quest', rarity: 'uncommon', requirement: { type: 'sidequest_complete', value: 1 }, xpReward: 200, goldReward: 100 },
  { id: 'xp_champion', name: 'XP Champion', description: 'Earn the XP champion title', icon: '💎', category: 'quest', rarity: 'uncommon', requirement: { type: 'sidequest_complete', value: 1 }, xpReward: 200, goldReward: 100 },
  { id: 'streak_master', name: 'Streak Master', description: 'Achieve streak mastery', icon: '🔥', category: 'streak', rarity: 'rare', requirement: { type: 'sidequest_complete', value: 1 }, xpReward: 300, goldReward: 150 },
  { id: 'quiz_legend', name: 'Quiz Legend', description: 'Become a quiz legend', icon: '🏅', category: 'quest', rarity: 'rare', requirement: { type: 'sidequest_complete', value: 1 }, xpReward: 300, goldReward: 150 },
  { id: 'world_traveler', name: 'World Traveler', description: 'Explore all realms of DevOps', icon: '🌍', category: 'quest', rarity: 'epic', requirement: { type: 'sidequest_complete', value: 1 }, xpReward: 500, goldReward: 250 },

  // Milestone reward tier badges
  { id: 'journeyman', name: 'Journeyman', description: 'Reach journeyman rank', icon: '⚔️', category: 'quest', rarity: 'uncommon', requirement: { type: 'milestone_tier', value: 1 }, xpReward: 150, goldReward: 75 },
  { id: 'expert', name: 'Expert', description: 'Reach expert rank', icon: '🎖️', category: 'quest', rarity: 'rare', requirement: { type: 'milestone_tier', value: 2 }, xpReward: 300, goldReward: 150 },
  { id: 'master', name: 'Master', description: 'Reach master rank', icon: '🏅', category: 'quest', rarity: 'epic', requirement: { type: 'milestone_tier', value: 3 }, xpReward: 600, goldReward: 300 },
  { id: 'grandmaster', name: 'Grandmaster', description: 'Reach grandmaster rank', icon: '👑', category: 'quest', rarity: 'legendary', requirement: { type: 'milestone_tier', value: 4 }, xpReward: 1200, goldReward: 600 },

  // Companion evolution badges
  { id: 'first_companion', name: 'Best Friends', description: 'Unlock your first companion', icon: '🐾', category: 'secret', rarity: 'uncommon', requirement: { type: 'companion_owned', value: 1 }, xpReward: 100, goldReward: 50 },
  { id: 'all_companions', name: 'Companion Collector', description: 'Unlock all 4 companions', icon: '🎒', category: 'secret', rarity: 'epic', requirement: { type: 'companion_owned', value: 4 }, xpReward: 500, goldReward: 250 },
  { id: 'owl_evolution', name: 'Wise Beyond Years', description: 'Evolve your Owl to Elder Owl', icon: '🦉', category: 'secret', rarity: 'rare', requirement: { type: 'companion_evolution', value: 1 }, xpReward: 300, goldReward: 150 },
  { id: 'cat_evolution', name: 'Shadow Stalker', description: 'Evolve your Cat to Shadow Cat', icon: '🐱', category: 'secret', rarity: 'rare', requirement: { type: 'companion_evolution', value: 1 }, xpReward: 300, goldReward: 150 },
  { id: 'dragon_evolution', name: 'Ancient Fire', description: 'Evolve your Dragon to Elder Dragon', icon: '🐲', category: 'secret', rarity: 'epic', requirement: { type: 'companion_evolution', value: 1 }, xpReward: 500, goldReward: 250 },
  { id: 'phoenix_evolution', name: 'Eternal Flame', description: 'Evolve your Phoenix to Legendary Phoenix', icon: '🔥', category: 'secret', rarity: 'legendary', requirement: { type: 'companion_evolution', value: 1 }, xpReward: 1000, goldReward: 500 },
  { id: 'bond_master', name: 'Bond Master', description: 'Max bond level with any companion', icon: '💝', category: 'secret', rarity: 'epic', requirement: { type: 'max_bond_level', value: 10 }, xpReward: 750, goldReward: 375 },

  // Prestige badges
  { id: 'prestige_1', name: 'Reborn Hero', description: 'Complete your first prestige reset', icon: '🌟', category: 'secret', rarity: 'rare', requirement: { type: 'prestige_level', value: 1 }, xpReward: 500, goldReward: 250 },
  { id: 'prestige_3', name: 'Cycles of Power', description: 'Prestige 3 times', icon: '⭐', category: 'secret', rarity: 'epic', requirement: { type: 'prestige_level', value: 3 }, xpReward: 1000, goldReward: 500 },
  { id: 'prestige_5', name: 'Legendary Rebirth', description: 'Prestige 5 times', icon: '💫', category: 'secret', rarity: 'legendary', requirement: { type: 'prestige_level', value: 5 }, xpReward: 2500, goldReward: 1250 },
  { id: 'prestige_10', name: 'Ascended Master', description: 'Prestige 10 times - true mastery', icon: '👑', category: 'secret', rarity: 'legendary', requirement: { type: 'prestige_level', value: 10 }, xpReward: 5000, goldReward: 2500 },
]

// Get badge by ID
export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find(b => b.id === id)
}

// Get badges by category
export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return BADGES.filter(b => b.category === category)
}

// Get badges by rarity
export function getBadgesByRarity(rarity: Badge['rarity']): Badge[] {
  return BADGES.filter(b => b.rarity === rarity)
}

// Rarity colors
export const RARITY_COLORS: Record<Badge['rarity'], string> = {
  common: 'text-slate-400 bg-slate-700/50 border-slate-600',
  uncommon: 'text-green-400 bg-green-900/30 border-green-700',
  rare: 'text-blue-400 bg-blue-900/30 border-blue-700',
  epic: 'text-purple-400 bg-purple-900/30 border-purple-700',
  legendary: 'text-amber-400 bg-amber-900/30 border-amber-600 animate-pulse',
}

// Check if badge should unlock
export function shouldUnlockBadge(badge: Badge, stats: {
  questCount: number
  streakDays: number
  level: number
  quizCount: number
  minigameCount: number
  perfectQuiz: boolean
  quizStreak: number
  techCompleted: string[]
  realmCompleted: number
  typerCount: number
  memoryCount: number
  mathCount: number
  wrongAnswerCount?: number
  perfectQuestCount?: number
  sessionQuestCount?: number
  earlyQuests?: number
  nightQuests?: number
  fastestQuestTime?: number
  jackpotSpins?: number
  mysteryBoxesOpened?: number
  challengeComplete?: number
  sidequestComplete?: number
  milestoneTier?: number
  allRealms?: boolean
  allTechnologies?: boolean
  goldHoard?: number
  firstLegendary?: boolean
  quizMasterScore?: number
  badgesEarned?: number
  earnedCategories?: string[]
  companionOwned?: number
  companionEvolution?: number
  maxBondLevel?: number
  prestigeLevel?: number
}): boolean {
  switch (badge.requirement.type) {
    case 'quest_count':
      return stats.questCount >= badge.requirement.value
    case 'streak_days':
      return stats.streakDays >= badge.requirement.value
    case 'level':
      return stats.level >= badge.requirement.value
    case 'quiz_count':
      return stats.quizCount >= badge.requirement.value
    case 'perfect_quiz':
      return stats.perfectQuiz
    case 'quiz_streak':
      return stats.quizStreak >= badge.requirement.value
    case 'minigame_count':
      return stats.minigameCount >= badge.requirement.value
    case 'tech_complete':
      return stats.techCompleted.includes(badge.requirement.tech || '')
    case 'realm_complete':
      return stats.realmCompleted >= badge.requirement.value
    case 'typer_count':
      return stats.typerCount >= badge.requirement.value
    case 'memory_count':
      return stats.memoryCount >= badge.requirement.value
    case 'math_count':
      return stats.mathCount >= badge.requirement.value
    case 'early_quest':
      return (stats.earlyQuests || 0) >= badge.requirement.value
    case 'night_quest':
      return (stats.nightQuests || 0) >= badge.requirement.value
    case 'speed_quest':
      return stats.fastestQuestTime != null && stats.fastestQuestTime > 0 && stats.fastestQuestTime <= badge.requirement.value * 60
    case 'all_categories':
      // Requires badges from quest, streak, skill, and secret categories
      {
        const requiredCategories = ['quest', 'streak', 'skill', 'secret']
        const earned = stats.earnedCategories || []
        return requiredCategories.every(cat => earned.includes(cat))
      }
    case 'all_badges':
      // Requires all other badges to be earned (total badges minus these 2 meta-badges)
      {
        const totalBadges = BADGES.length - 2 // Exclude collector and completionist themselves
        return (stats.badgesEarned || 0) >= totalBadges
      }
    case 'jackpot_spin':
      return (stats.jackpotSpins || 0) >= badge.requirement.value
    case 'mystery_open':
      return (stats.mysteryBoxesOpened || 0) >= badge.requirement.value
    case 'no_mistakes':
      return (stats.perfectQuestCount || 0) >= badge.requirement.value
    case 'marathon':
      return (stats.sessionQuestCount || 0) >= badge.requirement.value
    case 'challenge_complete':
      return (stats.challengeComplete || 0) >= badge.requirement.value
    case 'sidequest_complete':
      return (stats.sidequestComplete || 0) >= badge.requirement.value
    case 'milestone_tier':
      return (stats.milestoneTier || 0) >= badge.requirement.value
    case 'all_realms':
      return stats.allRealms === true
    case 'all_technologies':
      return stats.allTechnologies === true
    case 'gold_hoard':
      return (stats.goldHoard || 0) >= badge.requirement.value
    case 'first_legendary':
      return stats.firstLegendary === true
    case 'quiz_master':
      // Requires 50 quizzes with 80%+ score - tracked via quizMasterScore
      return (stats.quizMasterScore || 0) >= badge.requirement.value
    case 'max_level':
      return stats.level >= badge.requirement.value
    case 'companion_owned':
      return (stats.companionOwned || 0) >= badge.requirement.value
    case 'companion_evolution':
      return (stats.companionEvolution || 0) >= badge.requirement.value
    case 'max_bond_level':
      return (stats.maxBondLevel || 0) >= badge.requirement.value
    case 'prestige_level':
      return (stats.prestigeLevel || 0) >= badge.requirement.value
    default:
      return false
  }
}
