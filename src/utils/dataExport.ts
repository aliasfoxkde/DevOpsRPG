// Data Export/Import utilities for game progress

export interface ExportedGameData {
  version: string
  exportedAt: string
  character: any
  completedQuests: any[]
  badges: any[]
  companions: any[]
  stats: any
  // Add other game state as needed
}

export function exportGameData(gameState: any): string {
  const exportData: ExportedGameData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    character: gameState.character,
    completedQuests: gameState.completedQuests,
    badges: gameState.badges.filter((b: any) => b.unlockedAt),
    companions: gameState.companions,
    stats: gameState.stats,
  }

  const jsonString = JSON.stringify(exportData, null, 2)

  // Create a nicely formatted base64 encoded version for easy copying
  const base64 = btoa(encodeURIComponent(jsonString))

  return base64
}

export function downloadExport(gameState: any, filename?: string): void {
  const jsonString = JSON.stringify({
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    character: gameState.character,
    completedQuests: gameState.completedQuests,
    badges: gameState.badges.filter((b: any) => b.unlockedAt),
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

    // Validate basic structure
    if (!data.version || !data.character || !data.completedQuests) {
      throw new Error('Invalid backup file structure')
    }

    return data as ExportedGameData
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
export function mergeImportData(currentState: any, importedData: ExportedGameData): any {
  // For now, just return the imported data structure
  // In a full implementation, you'd want to merge intelligently
  return {
    ...currentState,
    character: {
      ...currentState.character,
      ...importedData.character,
      // Keep the better of current or imported stats
      xp: Math.max(currentState.character.xp, importedData.character.xp),
      gold: Math.max(currentState.character.gold, importedData.character.gold),
      level: Math.max(currentState.character.level, importedData.character.level),
    },
    // Merge badges - unlock any that aren't already unlocked
    badges: currentState.badges.map((badge: any) => {
      const imported = importedData.badges?.find((b: any) => b.id === badge.id)
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
