/**
 * Shared game utilities to eliminate code duplication
 */

// Fisher-Yates shuffle - used in multiple minigames
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Time constants in milliseconds
export const TIME_MS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const

// Format seconds as "m:ss" or "mm:ss"
export function formatTime(seconds: number): string {
  const mins = Math.floor(Math.abs(seconds) / 60)
  const secs = Math.abs(seconds) % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Format time ago (e.g., "5m ago", "2h ago", "3d ago")
export function formatTimeAgo(date: Date | string): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diff = now - then

  const minutes = Math.floor(diff / TIME_MS.MINUTE)
  const hours = Math.floor(diff / TIME_MS.HOUR)
  const days = Math.floor(diff / TIME_MS.DAY)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// Calculate percentage score
export function calculatePercentage(score: number, max: number): number {
  if (max === 0) return 0
  return Math.round((score / max) * 100)
}

// Game scoring weights
export const SCORING = {
  PASS_THRESHOLD: 60, // 60% to pass
  TIME_BONUS_WEIGHT: 0.3,
  ACCURACY_BONUS_WEIGHT: 0.7,
  XP_PER_100_SCORE: 50,
  GOLD_PER_100_SCORE: 25,
} as const

// XP thresholds for levels
export const XP_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250]

// Calculate level from XP
export function calculateLevel(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) {
      return i + 1
    }
  }
  return 1
}

// XP needed for next level
export function xpForNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP)
  if (currentLevel >= XP_THRESHOLDS.length) return Infinity
  return XP_THRESHOLDS[currentLevel] - currentXP
}