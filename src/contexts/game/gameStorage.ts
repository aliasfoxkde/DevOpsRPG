// Persistence layer for the game store: localStorage load with validation,
// deep-merge recovery onto defaults, backup fallback, dual-key save, and
// cross-tab synchronization. The provider consumes `loadInitialGame` and
// `useGamePersistence`; everything here is storage-shaped so the store itself
// never touches localStorage directly.
import { useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { STORAGE_KEYS } from '../../utils/gameUtils'
import { ACHIEVEMENTS, createDefaultGame } from './defaultState'
import type { GameState } from './types'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

// Achievement record as persisted in a save; only the fields the loader reads
// back are declared.
interface StoredAchievement {
  id: string
  unlockedAt?: string
}

function isStoredAchievementList(value: unknown): value is StoredAchievement[] {
  return (
    Array.isArray(value) &&
    value.every((entry) => isPlainObject(entry) && typeof entry.id === 'string')
  )
}

// Deep merge utility for game state recovery
function deepMerge<T extends object>(target: T, source: object): T {
  const output = { ...(target as Record<string, unknown>) }
  const src = source as Record<string, unknown>
  const tgt = target as Record<string, unknown>
  for (const key in src) {
    if (
      Object.prototype.hasOwnProperty.call(src, key) &&
      Object.prototype.hasOwnProperty.call(tgt, key)
    ) {
      const sourceValue: unknown = src[key]
      const targetValue: unknown = tgt[key]
      if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
        // Recursively merge nested objects
        output[key] = deepMerge(targetValue, sourceValue)
      } else {
        output[key] = sourceValue
      }
    }
  }
  return output as T
}

// Helper function to validate and merge game state
function loadAndValidateGame(storedJson: string | null): GameState | null {
  if (!storedJson) return null
  try {
    const parsed: unknown = JSON.parse(storedJson)
    // Basic validation - check for required top-level properties
    if (
      !isPlainObject(parsed) ||
      !isPlainObject(parsed.character) ||
      !Array.isArray(parsed.badges)
    ) {
      console.warn('Game data validation failed: missing required fields')
      return null
    }
    const defaults = createDefaultGame()
    // Merge stored data with defaults to ensure all fields exist
    const merged = deepMerge(defaults, parsed)
    // Ensure achievements are properly restored
    const storedAchievements = isStoredAchievementList(parsed.achievements)
      ? parsed.achievements
      : []
    merged.achievements = ACHIEVEMENTS.map((a) => {
      const stored = storedAchievements.find((ua) => ua.id === a.id)
      return stored?.unlockedAt ? { ...a, unlockedAt: stored.unlockedAt } : a
    })
    // Ensure arrays exist
    if (!Array.isArray(merged.recentBadgeUnlocks)) merged.recentBadgeUnlocks = []
    if (!Array.isArray(merged.recentMilestoneUnlocks)) merged.recentMilestoneUnlocks = []
    if (!Array.isArray(merged.badges)) merged.badges = []
    if (!Array.isArray(merged.collectibles)) merged.collectibles = []
    if (!Array.isArray(merged.completedRealms)) merged.completedRealms = []
    // Ensure character fields
    if (typeof merged.character.streakShields !== 'number') {
      merged.character.streakShields = 0
    }
    // The "no record yet" sentinel is Infinity, which JSON serializes to
    // null; restore it or Math.min updates would collapse the record to 0.
    if (!Number.isFinite(merged.stats.fastestQuestTime)) {
      merged.stats.fastestQuestTime = Infinity
    }
    return merged
  } catch (error) {
    console.warn('Failed to parse game data:', error)
    return null
  }
}

export function loadInitialGame(): GameState {
  if (typeof window !== 'undefined') {
    // Try main storage first
    const stored = localStorage.getItem(STORAGE_KEYS.GAME)
    let loaded = loadAndValidateGame(stored)
    if (loaded) return loaded

    // Try backup storage if main is corrupted/missing
    const backup = localStorage.getItem(STORAGE_KEYS.BACKUP)
    loaded = loadAndValidateGame(backup)
    if (loaded) {
      console.warn('Restored game from backup')
      return loaded
    }

    // Both failed - start fresh. A first visit (no data at all) is normal;
    // only warn when data existed but was unreadable.
    if (stored !== null || backup !== null) {
      console.warn(
        'Game data was unreadable, starting fresh. Previous data may be recoverable from browser storage.',
      )
    }
  }
  return createDefaultGame()
}

export function useGamePersistence(
  game: GameState,
  setGame: Dispatch<SetStateAction<GameState>>,
): void {
  // Persist to localStorage with backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(game))
      // Also save backup for recovery
      localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(game))
    } catch (error) {
      // Handle QuotaExceededError or other localStorage errors
      console.warn('Failed to save game state to localStorage:', error)
    }
  }, [game])

  // Cross-tab synchronization with deep merge
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.GAME && e.newValue) {
        try {
          const parsed: unknown = JSON.parse(e.newValue)
          if (!isPlainObject(parsed)) return
          // Deep merge with defaults to ensure all fields exist
          const defaults = createDefaultGame()
          const merged = deepMerge(defaults, parsed)
          if (!Array.isArray(merged.achievements)) merged.achievements = defaults.achievements
          if (!Array.isArray(merged.recentBadgeUnlocks)) merged.recentBadgeUnlocks = []
          if (!Array.isArray(merged.recentMilestoneUnlocks)) merged.recentMilestoneUnlocks = []
          setGame(merged)
        } catch {
          // Ignore parse errors
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [setGame])
}
