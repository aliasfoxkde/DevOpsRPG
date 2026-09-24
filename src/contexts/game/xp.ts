// Linear XP/level math used by the game store.
//
// Deliberately NOT merged with `utils/gameUtils.ts`: the app has two level
// curves by design — this linear, unbounded curve drives character
// level-ups (XP_PER_LEVEL per level), while gameUtils' XP_THRESHOLDS curve
// (capped at level 11) drives skill levels and UI display math. Merging them
// changes progression past 1000 XP and breaks persisted saves' xpToNextLevel.
import { XP_PER_LEVEL } from '../../utils/gameUtils'

export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function calculateXpToNextLevel(level: number): number {
  return level * XP_PER_LEVEL
}

export function getTitle(level: number): string {
  if (level >= 21) return 'DevOps Sage'
  if (level >= 16) return 'DevOps Master'
  if (level >= 11) return 'DevOps Expert'
  if (level >= 6) return 'DevOps Journeyman'
  return 'DevOps Apprentice'
}
