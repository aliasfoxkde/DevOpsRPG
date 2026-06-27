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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function downloadExport(gameState: any, filename?: string): void {
  const jsonString = JSON.stringify({
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    character: gameState.character,
    completedQuests: gameState.completedQuests,
    badges: gameState.badges.filter((b: Badge) => b.unlockedAt),
    companions: gameState.companions,
    stats: gameState.stats,
    prestigeLevel: gameState.prestigeLevel,
    prestigeMultiplier: gameState.prestigeMultiplier,
    totalPrestigeXp: gameState.totalPrestigeXp,
  }, null, 2)

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

export function importGameData(jsonString: string): ExportedGameData | null {
  try {
    const data = JSON.parse(jsonString)

    // Validate structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON structure')
    }

    // Validate required fields exist
    if (!data.version || typeof data.version !== 'string') {
      throw new Error('Missing or invalid version field')
    }
    if (!data.character || typeof data.character !== 'object') {
      throw new Error('Missing or invalid character field')
    }
    if (!Array.isArray(data.completedQuests)) {
      throw new Error('Missing or invalid completedQuests field')
    }
    if (!Array.isArray(data.badges)) {
      throw new Error('Missing or invalid badges field')
    }
    if (!data.character.name || typeof data.character.name !== 'string') {
      throw new Error('Missing or invalid character name')
    }

    // Sanitize data - only keep known fields to prevent injection
    const sanitized: ExportedGameData = {
      version: String(data.version),
      exportedAt: String(data.exportedAt || new Date().toISOString()),
      character: {
        name: String(data.character.name || 'Hero'),
        level: Number(data.character.level) || 1,
        xp: Number(data.character.xp) || 0,
        gold: Number(data.character.gold) || 0,
        title: data.character.title ? String(data.character.title) : undefined,
        avatar: data.character.avatar ? String(data.character.avatar) : undefined,
      },
      completedQuests: Array.isArray(data.completedQuests)
        ? data.completedQuests
            .filter((q: unknown) => q && typeof q === 'object' && 'id' in q)
            .map((q: { id: unknown }) => ({ id: String(q.id) }))
        : [],
      badges: Array.isArray(data.badges)
        ? data.badges
            .filter((b: unknown) => b && typeof b === 'object' && 'id' in b)
            .map((b: { id: unknown; unlockedAt?: unknown }) => ({
              id: String(b.id),
              unlockedAt: b.unlockedAt ? String(b.unlockedAt) : null,
            }))
        : [],
      companions: Array.isArray(data.companions)
        ? data.companions
            .filter((c: unknown) => c && typeof c === 'object' && 'id' in c)
            .map((c: { id: unknown }) => ({ id: String(c.id) }))
        : [],
      stats: data.stats && typeof data.stats === 'object' ? data.stats : {},
      prestigeLevel: Number(data.prestigeLevel) || 0,
      prestigeMultiplier: Number(data.prestigeMultiplier) || 1.0,
      totalPrestigeXp: Number(data.totalPrestigeXp) || 0,
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
  importedData: ExportedGameData
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
      const imported = importedData.badges?.find((b: Badge) => b.id === badge.id)
      if (imported && imported.unlockedAt && !badge.unlockedAt) {
        return { ...badge, unlockedAt: imported.unlockedAt }
      }
      return badge
    }),
    // Merge companions
    companions: importedData.companions?.length > 0 ? importedData.companions : currentState.companions,
    // Merge stats
    stats: {
      ...currentState.stats,
      ...importedData.stats,
      // Keep better stats
      fastestQuestTime: Math.min(
        currentState.stats.fastestQuestTime || Infinity,
        importedData.stats?.fastestQuestTime || Infinity
      ),
    },
  }
}
