// XP and Level utilities

import { getXPForLevel, getLevelFromXP, getStreakBonus } from '@/data/achievements';

export interface XPGainResult {
  baseXP: number;
  streakBonusXP: number;
  totalXP: number;
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
}

/**
 * Calculate XP gain with streak bonus
 */
export const calculateXPGain = (
  baseXP: number,
  currentXP: number,
  streakDays: number
): XPGainResult => {
  const previousLevel = getLevelFromXP(currentXP);
  const streakMultiplier = getStreakBonus(streakDays);
  const streakBonusXP = Math.floor(baseXP * streakMultiplier);
  const totalXP = baseXP + streakBonusXP;
  const newXP = currentXP + totalXP;
  const newLevel = getLevelFromXP(newXP);

  return {
    baseXP,
    streakBonusXP,
    totalXP,
    previousLevel,
    newLevel,
    leveledUp: newLevel > previousLevel,
  };
};

/**
 * Calculate progress to next level
 */
export const getLevelProgress = (xp: number): { current: number; needed: number; percentage: number } => {
  const level = getLevelFromXP(xp);
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  const xpIntoLevel = xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const percentage = Math.round((xpIntoLevel / xpNeeded) * 100);

  return {
    current: xpIntoLevel,
    needed: xpNeeded,
    percentage,
  };
};

/**
 * Calculate how many topics completed for a technology
 */
export const calculateTechnologyProgress = (
  completedTopics: number,
  totalTopics: number
): { completed: number; total: number; percentage: number } => {
  return {
    completed: completedTopics,
    total: totalTopics,
    percentage: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
  };
};

/**
 * Calculate overall learning progress
 */
export const calculateOverallProgress = (
  completedTopics: number,
  totalTopics: number
): { completed: number; total: number; percentage: number; phase: number } => {
  const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  // Calculate which phase the user is in based on progress
  const phase = Math.min(Math.floor(percentage / 20) + 1, 5);

  return {
    completed: completedTopics,
    total: totalTopics,
    percentage,
    phase,
  };
};
