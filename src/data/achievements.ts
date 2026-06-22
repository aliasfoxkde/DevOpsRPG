import type { Achievement, DailyReward } from '@/types';

export const ACHIEVEMENTS: Achievement[] = [
  // Beginner achievements
  {
    id: 'first-steps',
    key: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first topic',
    icon: '🎯',
    xpReward: 25,
  },
  {
    id: 'getting-started',
    key: 'getting_started',
    name: 'Getting Started',
    description: 'Complete 5 topics',
    icon: '🌟',
    xpReward: 50,
  },
  {
    id: 'curious-learner',
    key: 'curious_learner',
    name: 'Curious Learner',
    description: 'Complete 10 topics',
    icon: '💡',
    xpReward: 100,
  },
  {
    id: 'knowledge-seeker',
    key: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Complete 25 topics',
    icon: '📚',
    xpReward: 200,
  },
  {
    id: 'scholar',
    key: 'scholar',
    name: 'Scholar',
    description: 'Complete 50 topics',
    icon: '🎓',
    xpReward: 500,
  },
  {
    id: 'polymath',
    key: 'polymath',
    name: 'Polymath',
    description: 'Complete 100 topics',
    icon: '🏆',
    xpReward: 1000,
  },

  // Streak achievements
  {
    id: 'streak-3',
    key: 'streak_3',
    name: 'On a Roll',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    xpReward: 30,
  },
  {
    id: 'streak-7',
    key: 'streak_7',
    name: 'Dedicated Learner',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    xpReward: 100,
  },
  {
    id: 'streak-14',
    key: 'streak_14',
    name: 'Fortnight of Focus',
    description: 'Maintain a 14-day streak',
    icon: '🔥',
    xpReward: 250,
  },
  {
    id: 'streak-30',
    key: 'streak_30',
    name: 'Monthly Champion',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    xpReward: 500,
  },
  {
    id: 'streak-100',
    key: 'streak_100',
    name: 'Century Club',
    description: 'Maintain a 100-day streak',
    icon: '💎',
    xpReward: 2000,
  },

  // Category achievements
  {
    id: 'foundations-master',
    key: 'foundations_master',
    name: 'Foundation Master',
    description: 'Complete all Foundations topics',
    icon: '🏗️',
    xpReward: 300,
  },
  {
    id: 'backend-master',
    key: 'backend_master',
    name: 'Backend Master',
    description: 'Complete all Backend Basics topics',
    icon: '⚙️',
    xpReward: 400,
  },
  {
    id: 'framework-master',
    key: 'framework_master',
    name: 'Framework Master',
    description: 'Complete all Frameworks & Databases topics',
    icon: '🗄️',
    xpReward: 500,
  },
  {
    id: 'advanced-master',
    key: 'advanced_master',
    name: 'Cloud & Advanced Master',
    description: 'Complete all Advanced & Cloud topics',
    icon: '☁️',
    xpReward: 600,
  },
  {
    id: 'devops-master',
    key: 'devops_master',
    name: 'DevOps Master',
    description: 'Complete all Modern DevOps topics',
    icon: '🚀',
    xpReward: 700,
  },
  {
    id: 'full-stack',
    key: 'full_stack',
    name: 'Full Stack Developer',
    description: 'Complete all technologies',
    icon: '🌈',
    xpReward: 5000,
  },

  // Speed achievements
  {
    id: 'speed-demon',
    key: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a topic in under 5 minutes',
    icon: '⚡',
    xpReward: 50,
  },
  {
    id: 'quick-learner',
    key: 'quick_learner',
    name: 'Quick Learner',
    description: 'Complete 10 topics in under 5 minutes each',
    icon: '🚀',
    xpReward: 200,
  },

  // XP achievements
  {
    id: 'xp-1000',
    key: 'xp_1000',
    name: 'XP Hunter',
    description: 'Earn 1,000 total XP',
    icon: '💰',
    xpReward: 0,
  },
  {
    id: 'xp-10000',
    key: 'xp_10000',
    name: 'XP Master',
    description: 'Earn 10,000 total XP',
    icon: '💎',
    xpReward: 0,
  },

  // Level achievements
  {
    id: 'level-5',
    key: 'level_5',
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    xpReward: 100,
  },
  {
    id: 'level-10',
    key: 'level_10',
    name: 'Rising Expert',
    description: 'Reach level 10',
    icon: '🌟',
    xpReward: 200,
  },
  {
    id: 'level-25',
    key: 'level_25',
    name: 'Expert',
    description: 'Reach level 25',
    icon: '💫',
    xpReward: 500,
  },
  {
    id: 'level-50',
    key: 'level_50',
    name: 'Master',
    description: 'Reach level 50',
    icon: '👑',
    xpReward: 1000,
  },

  // Polyglot achievements
  {
    id: 'polyglot-3',
    key: 'polyglot_3',
    name: 'Polyglot',
    description: 'Complete topics in 3 different languages',
    icon: '🌍',
    xpReward: 150,
  },
  {
    id: 'polyglot-5',
    key: 'polyglot_5',
    name: 'Languages Expert',
    description: 'Complete topics in 5 different languages',
    icon: '🌐',
    xpReward: 300,
  },
];

// Daily rewards schedule
export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, xpBonus: 10 },
  { day: 2, xpBonus: 15 },
  { day: 3, xpBonus: 25 },
  { day: 4, xpBonus: 25 },
  { day: 5, xpBonus: 35 },
  { day: 6, xpBonus: 35 },
  { day: 7, xpBonus: 50, badge: 'Dedicated Learner' },
  { day: 14, xpBonus: 75, badge: 'Fortnight Champion' },
  { day: 30, xpBonus: 200, badge: 'Monthly Champion' },
  { day: 60, xpBonus: 300, badge: 'Bimonthly Champion' },
  { day: 100, xpBonus: 500, badge: 'Century Champion' },
  { day: 365, xpBonus: 1000, badge: 'Year of Dedication' },
];

// Get daily reward for current streak
export const getDailyReward = (streakDays: number): DailyReward | null => {
  // Find the highest reward tier that applies
  const applicableRewards = DAILY_REWARDS.filter(r => r.day <= streakDays);
  if (applicableRewards.length === 0) return null;

  // Return the highest applicable reward
  return applicableRewards.reduce((prev, curr) =>
    curr.day > prev.day ? curr : prev
  );
};

// Calculate XP needed for a level
export const getXPForLevel = (level: number): number => {
  return level * level * 100;
};

// Calculate level from total XP
export const getLevelFromXP = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 100));
};

// Calculate streak bonus multiplier
export const getStreakBonus = (streakDays: number): number => {
  // 10% bonus per day, capped at 100% (10 days)
  return Math.min(streakDays * 0.10, 1.0);
};

// Format XP display
export const formatXP = (xp: number): string => {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M XP`;
  }
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K XP`;
  }
  return `${xp} XP`;
};

// Format time spent
export const formatTimeSpent = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
};

// Check if achievement is earned
export const isAchievementEarned = (
  achievementKey: string,
  earnedAchievements: string[]
): boolean => {
  return earnedAchievements.includes(achievementKey);
};
