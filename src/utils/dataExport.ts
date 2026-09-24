// Data Export/Import utilities for game progress

export interface Character {
  name: string
  level?: number
  xp?: number
  gold?: number
  title?: string
  avatar?: string
}

export interface CompletedQuest {
  id: string
  completedAt?: string
}

export interface Badge {
  id: string
  name?: string
  description?: string
  icon?: string
  rarity?: string
  unlockedAt?: string | null
}

export interface Companion {
  id: string
  name?: string
}

export interface Stats {
  totalQuestsCompleted?: number
  fastestQuestTime?: number
  [key: string]: unknown
}

export interface ExportedGameData {
  version: string
  exportedAt: string
  character: Character
  completedQuests: CompletedQuest[]
  badges: Badge[]
  companions: Companion[]
  stats: Stats
  prestigeLevel?: number
  prestigeMultiplier?: number
  totalPrestigeXp?: number
}

export function exportGameData(gameState: {
  character: Character
  completedQuests: CompletedQuest[]
  badges: Badge[]
  companions: Companion[]
  stats: Stats
}): string {
  const exportData: ExportedGameData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    character: gameState.character,
    completedQuests: gameState.completedQuests,
    badges: gameState.badges.filter((b: Badge) => b.unlockedAt),
    companions: gameState.companions,
    stats: gameState.stats,
  }

  const jsonString = JSON.stringify(exportData, null, 2)

  // Create a nicely formatted base64 encoded version for easy copying
  const base64 = btoa(encodeURIComponent(jsonString))

  return base64
}

// Structural subset the exporter reads — kept loose so any GameState-like
// object (e.g. TopicProgress-based quest lists) satisfies it.
export interface ExportableGameState {
  character: object
  completedQuests: unknown[]
  badges: Array<{ id: string; unlockedAt?: string | null }>
  companions: unknown[]
  stats: object
  prestigeLevel?: number
  prestigeMultiplier?: number
  totalPrestigeXp?: number
}

export function downloadExport(gameState: ExportableGameState, filename?: string): void {
  const jsonString = JSON.stringify(
    {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      character: gameState.character,
      completedQuests: gameState.completedQuests,
      badges: gameState.badges.filter((b) => b.unlockedAt),
      companions: gameState.companions,
      stats: gameState.stats,
      prestigeLevel: gameState.prestigeLevel,
      prestigeMultiplier: gameState.prestigeMultiplier,
      totalPrestigeXp: gameState.totalPrestigeXp,
    },
    null,
    2,
  )

  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `devopsquest-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Imported JSON is untyped: narrow it to a record of unknowns first and then
// validate each field before use.
function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// List entries are kept only when they are objects carrying an id, matching
// what the exporter writes.
function isIdentifiedEntry(value: unknown): value is Record<string, unknown> {
  return isObjectLike(value) && 'id' in value
}

// Stringify the scalar values the exporter writes; anything else becomes an
// empty string instead of leaking "[object Object]" into stored ids.
function toText(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

// Copies a plain object into the deliberately loose Stats shape without
// trusting the incoming values.
function sanitizeStats(value: unknown): Stats {
  const stats: Stats = {}
  if (!isObjectLike(value)) return stats
  for (const [key, entry] of Object.entries(value)) {
    stats[key] = entry
  }
  return stats
}

export function importGameData(jsonString: string): ExportedGameData | null {
  try {
    const parsed: unknown = JSON.parse(jsonString)

    // Validate structure
    if (!isObjectLike(parsed)) {
      throw new Error('Invalid JSON structure')
    }
    const data = parsed

    // Validate required fields exist
    const version = data.version
    if (!version || typeof version !== 'string') {
      throw new Error('Missing or invalid version field')
    }
    if (!isObjectLike(data.character)) {
      throw new Error('Missing or invalid character field')
    }
    const character = data.character
    if (!Array.isArray(data.completedQuests)) {
      throw new Error('Missing or invalid completedQuests field')
    }
    if (!Array.isArray(data.badges)) {
      throw new Error('Missing or invalid badges field')
    }
    if (!character.name || typeof character.name !== 'string') {
      throw new Error('Missing or invalid character name')
    }

    // Sanitize data - only keep known fields to prevent injection
    // Add bounds checking to prevent invalid game state
    const level = Number(character.level) || 1
    const xp = Number(character.xp) || 0
    const gold = Number(character.gold) || 0

    const sanitized: ExportedGameData = {
      version,
      exportedAt:
        typeof data.exportedAt === 'string' && data.exportedAt.length > 0
          ? data.exportedAt
          : new Date().toISOString(),
      character: {
        name: character.name.slice(0, 50), // Max 50 chars
        level: Math.min(Math.max(level, 1), 100), // Bound between 1-100
        xp: Math.min(Math.max(xp, 0), 10000000), // Bound between 0-10M
        gold: Math.min(Math.max(gold, 0), 10000000), // Bound between 0-10M
        title: character.title ? toText(character.title).slice(0, 100) : undefined,
        avatar: character.avatar ? toText(character.avatar).slice(0, 200) : undefined,
      },
      completedQuests: data.completedQuests
        .filter(isIdentifiedEntry)
        .slice(0, 1000) // Max 1000 quests
        .map((q) => ({ id: toText(q.id).slice(0, 100) })),
      badges: data.badges
        .filter(isIdentifiedEntry)
        .slice(0, 500) // Max 500 badges
        .map((b) => ({
          id: toText(b.id).slice(0, 100),
          unlockedAt: b.unlockedAt ? toText(b.unlockedAt) : null,
        })),
      companions: Array.isArray(data.companions)
        ? data.companions
            .filter(isIdentifiedEntry)
            .slice(0, 20) // Max 20 companions
            .map((c) => ({ id: toText(c.id).slice(0, 100) }))
        : [],
      stats: sanitizeStats(data.stats),
      prestigeLevel: Math.min(Math.max(Number(data.prestigeLevel) || 0, 0), 100),
      prestigeMultiplier: Math.min(Math.max(Number(data.prestigeMultiplier) || 1.0, 1.0), 10.0),
      totalPrestigeXp: Math.min(Math.max(Number(data.totalPrestigeXp) || 0, 0), 100000000),
    }

    return sanitized
  } catch (error) {
    console.error('Failed to parse import data:', error)
    return null
  }
}

export function parseBase64Import(base64String: string): ExportedGameData | null {
  try {
    const jsonString = decodeURIComponent(atob(base64String))
    return importGameData(jsonString)
  } catch (error) {
    console.error('Failed to decode base64 import:', error)
    return null
  }
}

// Merge imported data with current game state
export function mergeImportData(
  currentState: {
    character: Character
    badges: Badge[]
    companions: Companion[]
    stats: Stats
  },
  importedData: ExportedGameData,
): {
  character: Character
  badges: Badge[]
  companions: Companion[]
  stats: Stats
} {
  // For now, just return the imported data structure
  // In a full implementation, you'd want to merge intelligently
  return {
    ...currentState,
    character: {
      ...currentState.character,
      ...importedData.character,
      // Keep the better of current or imported stats
      xp: Math.max(currentState.character.xp || 0, importedData.character.xp || 0),
      gold: Math.max(currentState.character.gold || 0, importedData.character.gold || 0),
      level: Math.max(currentState.character.level || 0, importedData.character.level || 0),
    },
    // Merge badges - unlock any that aren't already unlocked
    badges: currentState.badges.map((badge: Badge) => {
      const imported = importedData.badges.find((b: Badge) => b.id === badge.id)
      if (imported && imported.unlockedAt && !badge.unlockedAt) {
        return { ...badge, unlockedAt: imported.unlockedAt }
      }
      return badge
    }),
    // Merge companions
    companions:
      importedData.companions.length > 0 ? importedData.companions : currentState.companions,
    // Merge stats
    stats: {
      ...currentState.stats,
      ...importedData.stats,
      // Keep better stats
      fastestQuestTime: Math.min(
        currentState.stats.fastestQuestTime || Infinity,
        importedData.stats.fastestQuestTime || Infinity,
      ),
    },
  }
}
