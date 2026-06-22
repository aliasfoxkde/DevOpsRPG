// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  provider: 'google' | 'github';
  providerId: string;
  xp: number;
  level: number;
  streakDays: number;
  lastActive: string;
  theme: CareerPath;
  createdAt: string;
  updatedAt: string;
}

// Gamification types
export interface Progress {
  id: string;
  userId: string;
  technology: string;
  topic: string;
  completed: boolean;
  xpEarned: number;
  timeSpent: number; // seconds
  completedAt: string | null;
}

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  earnedAt?: string;
}

export interface DailyReward {
  day: number;
  xpBonus: number;
  badge?: string;
}

// Career Path Themes
export type CareerPath =
  | 'web-developer'
  | 'backend-engineer'
  | 'devops-engineer'
  | 'data-scientist'
  | 'mobile-developer';

// Technology categories
export type Category =
  | 'foundations'
  | 'backend-basics'
  | 'frameworks-databases'
  | 'advanced-cloud'
  | 'modern-devops';

// Technology data model
export interface Technology {
  id: string;
  name: string;
  slug: string;
  category: Category;
  phase: number;
  description: string;
  icon: string;
  color: string;
  topics: Topic[];
  prerequisites: string[];
  xpPerTopic: number;
  estimatedHours: number;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  url: string; // W3Schools URL
  order: number;
}

// XP and Level calculations
export interface XPCalculation {
  baseXP: number;
  streakBonus: number;
  totalXP: number;
  newLevel: number;
  leveledUp: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Auth types
export interface Session {
  userId: string;
  token: string;
  expiresAt: string;
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Learning state
export interface LearningState {
  currentTechnology: string | null;
  currentTopic: string | null;
  isComplete: boolean;
  timeSpent: number;
}

// Achievement check result
export interface AchievementResult {
  unlocked: Achievement[];
  totalEarned: number;
}

// Leaderboard entry
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl: string;
  level: number;
  xp: number;
  streakDays: number;
}
