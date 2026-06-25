// Encouragement messages and milestone celebrations
export interface Milestone {
  id: string
  title: string
  message: string
  icon: string
  trigger:
    | { type: 'quest_count'; count: number }
    | { type: 'streak'; days: number }
    | { type: 'level'; level: number }
    | { type: 'realm_complete'; realm: string }
    | { type: 'technology_complete'; tech: string }
    | { type: 'quiz_streak'; count: number }
    | { type: 'minigame_complete'; count: number }
    | { type: 'first_boss' }
    | { type: 'speed_quest'; minutes: number }
    | { type: 'perfect_quiz' }
  xpBonus: number
  unlocked: boolean
  unlockedAt?: string
}

export const MILESTONES: Milestone[] = [
  // Quest milestones
  { id: 'first_quest', title: 'First Steps', message: 'You completed your first quest! The journey begins...', icon: '🎯', trigger: { type: 'quest_count', count: 1 }, xpBonus: 25, unlocked: false },
  { id: 'quest_5', title: 'Getting Warmed Up', message: '5 quests complete! You\'re finding your stride.', icon: '🔥', trigger: { type: 'quest_count', count: 5 }, xpBonus: 50, unlocked: false },
  { id: 'quest_10', title: 'Double Digits!', message: '10 quests conquered! Your skills are growing.', icon: '⭐', trigger: { type: 'quest_count', count: 10 }, xpBonus: 100, unlocked: false },
  { id: 'quest_25', title: 'Quarter Way There', message: '25 quests! You\'re making incredible progress!', icon: '🌟', trigger: { type: 'quest_count', count: 25 }, xpBonus: 200, unlocked: false },
  { id: 'quest_50', title: 'Halfway Hero', message: '50 quests! You\'re a true DevOps warrior!', icon: '💫', trigger: { type: 'quest_count', count: 50 }, xpBonus: 500, unlocked: false },
  { id: 'quest_100', title: 'Century Champion', message: '100 quests! Legendary status awaits!', icon: '🏆', trigger: { type: 'quest_count', count: 100 }, xpBonus: 1000, unlocked: false },

  // Streak milestones
  { id: 'streak_3', title: 'Three Day Fire', message: '3-day streak! Consistency is key!', icon: '🔥', trigger: { type: 'streak', days: 3 }, xpBonus: 30, unlocked: false },
  { id: 'streak_7', title: 'Weekly Warrior', message: '7-day streak! You\'re unstoppable!', icon: '📅', trigger: { type: 'streak', days: 7 }, xpBonus: 100, unlocked: false },
  { id: 'streak_14', title: 'Fortnight Focus', message: '14-day streak! Your dedication is inspiring!', icon: '💪', trigger: { type: 'streak', days: 14 }, xpBonus: 200, unlocked: false },
  { id: 'streak_30', title: 'Monthly Master', message: '30-day streak! You\'re a learning machine!', icon: '🗓️', trigger: { type: 'streak', days: 30 }, xpBonus: 500, unlocked: false },

  // Level milestones
  { id: 'level_5', title: 'Rising Star', message: 'Level 5! You\'re no longer a beginner!', icon: '⭐', trigger: { type: 'level', level: 5 }, xpBonus: 75, unlocked: false },
  { id: 'level_10', title: 'Seasoned Adventurer', message: 'Level 10! The skills are stacking up!', icon: '🌟', trigger: { type: 'level', level: 10 }, xpBonus: 150, unlocked: false },
  { id: 'level_15', title: 'DevOps Expert', message: 'Level 15! You\'re in the elite now!', icon: '💫', trigger: { type: 'level', level: 15 }, xpBonus: 300, unlocked: false },
  { id: 'level_20', title: 'DevOps Master', message: 'Level 20! Ultimate mastery achieved!', icon: '👑', trigger: { type: 'level', level: 20 }, xpBonus: 1000, unlocked: false },

  // Realm completions
  { id: 'foundations_complete', title: 'Foundation Master', message: 'Village of Foundations conquered! Onward to greater challenges!', icon: '🏘️', trigger: { type: 'realm_complete', realm: 'foundations' }, xpBonus: 300, unlocked: false },
  { id: 'scripts_complete', title: 'Forest Explorer', message: 'Forest of Scripts cleared! The path brightens!', icon: '🌲', trigger: { type: 'realm_complete', realm: 'scripts' }, xpBonus: 400, unlocked: false },
  { id: 'frameworks_complete', title: 'Castle Champion', message: 'Castle of Frameworks conquered! You\'re unstoppable!', icon: '🏰', trigger: { type: 'realm_complete', realm: 'frameworks' }, xpBonus: 500, unlocked: false },
  { id: 'cloud_complete', title: 'Mountain Climber', message: 'Mountains of Cloud scaled! Almost there!', icon: '⛰️', trigger: { type: 'realm_complete', realm: 'cloud' }, xpBonus: 750, unlocked: false },
  { id: 'devops_complete', title: 'DevOps Sage', message: 'Citadel of DevOps conquered! TRUE MASTER!', icon: '🏛️', trigger: { type: 'realm_complete', realm: 'devops' }, xpBonus: 2000, unlocked: false },

  // Quiz milestones
  { id: 'quiz_streak_3', title: 'Quiz Whiz', message: '3 perfect quizzes in a row!', icon: '🧠', trigger: { type: 'quiz_streak', count: 3 }, xpBonus: 50, unlocked: false },
  { id: 'perfect_quiz', title: 'Perfectionist', message: 'A perfect quiz score! Flawless!', icon: '💎', trigger: { type: 'perfect_quiz' }, xpBonus: 100, unlocked: false },

  // Minigame milestones
  { id: 'minigame_5', title: 'Game Enthusiast', message: '5 mini-games completed!', icon: '🎮', trigger: { type: 'minigame_complete', count: 5 }, xpBonus: 75, unlocked: false },
  { id: 'minigame_10', title: 'Gamer Pro', message: '10 mini-games! You\'re a natural!', icon: '🏅', trigger: { type: 'minigame_complete', count: 10 }, xpBonus: 150, unlocked: false },

  // First boss
  { id: 'first_boss', title: 'Boss Slayer', message: 'Your first boss battle conquered!', icon: '⚔️', trigger: { type: 'first_boss' }, xpBonus: 100, unlocked: false },

  // Technology completions
  { id: 'html_complete', title: 'HTML Hero', message: 'All HTML quests complete! Web structure mastered!', icon: '📄', trigger: { type: 'technology_complete', tech: 'html' }, xpBonus: 200, unlocked: false },
  { id: 'css_complete', title: 'CSS Champion', message: 'All CSS quests complete! Styling virtuoso!', icon: '🎨', trigger: { type: 'technology_complete', tech: 'css' }, xpBonus: 200, unlocked: false },
  { id: 'js_complete', title: 'JavaScript Journeyman', message: 'All JS quests complete! Interactive wizard!', icon: '⚡', trigger: { type: 'technology_complete', tech: 'javascript' }, xpBonus: 300, unlocked: false },
  { id: 'docker_complete', title: 'Docker Master', message: 'All Docker quests complete! Container commander!', icon: '🐳', trigger: { type: 'technology_complete', tech: 'docker' }, xpBonus: 400, unlocked: false },
  { id: 'kubernetes_complete', title: 'K8s Commander', message: 'All Kubernetes quests complete! Orchestration expert!', icon: '☸️', trigger: { type: 'technology_complete', tech: 'kubernetes' }, xpBonus: 500, unlocked: false },
]

// Daily encouragement messages
export const ENCOURAGEMENT_MESSAGES = [
  "You've got this! Every expert was once a beginner. 💪",
  "Small steps lead to big changes. Keep going! 🚀",
  "Your future self will thank you for learning today. ⭐",
  "Consistency beats intensity. You're on the right path! 🔥",
  "Problems are just puzzles waiting to be solved. 🧩",
  "Every line of code you write makes you stronger! 💻",
  "The only bad workout is the one that didn't happen. Same for learning! 💪",
  "You're not just learning DevOps, you're becoming a DevOps warrior! ⚔️",
  "Focus on progress, not perfection. You're doing amazing! 🌟",
  "Code runs, bugs happen, you debug. That's the way! 🐛",
  "Your brain is like a muscle - the more you use it, the stronger it gets! 🧠",
  "Dream big, code bigger. You're building your future! 🏗️",
  "Learning today means commanding tomorrow. Keep climbing! ⛰️",
  "Every master was once a disaster. You're well on your way! 📈",
  "The difference between ordinary and extraordinary is practice! 🎯",
]

// Progressive reward tiers
export interface RewardTier {
  id: string
  name: string
  description: string
  icon: string
  requirement: { type: 'quests' | 'xp' | 'streak' | 'level'; value: number }
  rewards: {
    xp: number
    gold: number
    badge?: string
    feature?: string
  }
}

export const REWARD_TIERS: RewardTier[] = [
  { id: 'tier_1', name: 'Apprentice Pack', description: 'Complete 5 quests', icon: '📦', requirement: { type: 'quests', value: 5 }, rewards: { xp: 100, gold: 50 } },
  { id: 'tier_2', name: 'Journeyman Pack', description: 'Complete 15 quests', icon: '🎁', requirement: { type: 'quests', value: 15 }, rewards: { xp: 250, gold: 150, badge: 'journeyman' } },
  { id: 'tier_3', name: 'Expert Pack', description: 'Reach Level 10', icon: '🏺', requirement: { type: 'level', value: 10 }, rewards: { xp: 500, gold: 300, badge: 'expert', feature: 'hint_mode' } },
  { id: 'tier_4', name: 'Master Pack', description: 'Reach Level 15', icon: '💎', requirement: { type: 'level', value: 15 }, rewards: { xp: 1000, gold: 500, badge: 'master' } },
  { id: 'tier_5', name: 'Grandmaster Pack', description: 'Complete all quests', icon: '👑', requirement: { type: 'quests', value: 118 }, rewards: { xp: 5000, gold: 2500, badge: 'grandmaster', feature: 'mentor_mode' } },
]

// Check if milestone should trigger
export function checkMilestone(milestone: Milestone, gameState: {
  completedQuests: number
  streakDays: number
  level: number
  completedRealms: string[]
  completedTechnologies: string[]
  quizStreak: number
  minigamesCompleted: number
  hasDefeatedBoss: boolean
  hasPerfectQuiz: boolean
  fastestQuestTime?: number // in seconds
}): boolean {
  switch (milestone.trigger.type) {
    case 'quest_count':
      return gameState.completedQuests >= milestone.trigger.count
    case 'streak':
      return gameState.streakDays >= milestone.trigger.days
    case 'level':
      return gameState.level >= milestone.trigger.level
    case 'realm_complete':
      return gameState.completedRealms.includes(milestone.trigger.realm)
    case 'technology_complete':
      return gameState.completedTechnologies.includes(milestone.trigger.tech)
    case 'quiz_streak':
      return gameState.quizStreak >= milestone.trigger.count
    case 'minigame_complete':
      return gameState.minigamesCompleted >= milestone.trigger.count
    case 'first_boss':
      return gameState.hasDefeatedBoss
    case 'perfect_quiz':
      return gameState.hasPerfectQuiz
    case 'speed_quest':
      // milestone.trigger.minutes is the threshold in minutes
      return gameState.fastestQuestTime != null &&
        gameState.fastestQuestTime > 0 &&
        gameState.fastestQuestTime <= milestone.trigger.minutes * 60
    default:
      return false
  }
}

// Get random encouragement message
export function getRandomEncouragement(): string {
  return ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)]
}

// Get milestone by ID
export function getMilestoneById(id: string): Milestone | undefined {
  return MILESTONES.find(m => m.id === id)
}
