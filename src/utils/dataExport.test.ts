import { describe, it, expect } from 'vitest'
import {
  exportGameData,
  importGameData,
  parseBase64Import,
  mergeImportData,
  type Character,
  type Badge,
  type CompletedQuest,
  type Stats,
} from './dataExport'

const mockGameState: {
  character: Character
  completedQuests: CompletedQuest[]
  badges: Badge[]
  companions: { id: string; name?: string }[]
  stats: Stats
} = {
  character: {
    name: 'TestHero',
    level: 5,
    xp: 450,
    gold: 100,
  },
  completedQuests: [
    { id: 'quest_1', completedAt: '2024-01-01' },
    { id: 'quest_2', completedAt: '2024-01-02' },
  ],
  badges: [
    { id: 'badge_1', name: 'Badge 1', unlockedAt: '2024-01-01' },
    { id: 'badge_2', name: 'Badge 2', unlockedAt: null },
  ],
  companions: [{ id: 'companion_1', name: 'Buddy' }],
  stats: {
    totalQuestsCompleted: 10,
    fastestQuestTime: 120,
  },
}

describe('dataExport', () => {
  describe('exportGameData', () => {
    it('should export game data as base64 string', () => {
      const result = exportGameData(mockGameState)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should contain valid base64 encoded JSON', () => {
      const base64 = exportGameData(mockGameState)
      const decoded = parseBase64Import(base64)
      expect(decoded).not.toBeNull()
      expect(decoded?.version).toBe('1.0.0')
      expect(decoded?.character.name).toBe('TestHero')
    })

    it('should only export unlocked badges', () => {
      const base64 = exportGameData(mockGameState)
      const decoded = parseBase64Import(base64)
      expect(decoded?.badges).toHaveLength(1)
      expect(decoded?.badges[0].id).toBe('badge_1')
    })
  })

  describe('importGameData', () => {
    it('should import valid JSON data', () => {
      const jsonData = JSON.stringify({
        version: '1.0.0',
        character: { name: 'Imported', level: 10 },
        completedQuests: [],
        badges: [],
        companions: [],
        stats: {},
      })
      const result = importGameData(jsonData)
      expect(result).not.toBeNull()
      expect(result?.character.name).toBe('Imported')
    })

    it('should return null for invalid JSON', () => {
      const result = importGameData('not valid json')
      expect(result).toBeNull()
    })

    it('should return null for missing required fields', () => {
      const jsonData = JSON.stringify({
        version: '1.0.0',
        character: { name: 'Test' },
        // missing completedQuests
      })
      const result = importGameData(jsonData)
      expect(result).toBeNull()
    })
  })

  describe('parseBase64Import', () => {
    it('should decode base64 and parse JSON', () => {
      const base64 = exportGameData(mockGameState)
      const result = parseBase64Import(base64)
      expect(result).not.toBeNull()
      expect(result?.character.name).toBe('TestHero')
    })

    it('should return null for invalid base64', () => {
      const result = parseBase64Import('not-valid-base64!!!')
      expect(result).toBeNull()
    })
  })

  describe('mergeImportData', () => {
    const currentState = {
      character: { name: 'Current', xp: 100, gold: 50, level: 3 },
      badges: [
        { id: 'b1', unlockedAt: '2024-01-01' },
        { id: 'b2', unlockedAt: null },
      ],
      companions: [{ id: 'c1' }],
      stats: { fastestQuestTime: 100 },
    }

    const importedData = {
      version: '1.0.0',
      exportedAt: '2024-01-15',
      character: { name: 'Imported', xp: 200, gold: 150, level: 5 },
      completedQuests: [],
      badges: [
        { id: 'b1', unlockedAt: '2024-01-01' },
        { id: 'b2', unlockedAt: '2024-01-10' },
        { id: 'b3', unlockedAt: '2024-01-10' },
      ],
      companions: [{ id: 'c2' }],
      stats: { fastestQuestTime: 80 },
    }

    it('should keep higher XP and gold from imported data', () => {
      const result = mergeImportData(currentState, importedData)
      expect(result.character.xp).toBe(200)
      expect(result.character.gold).toBe(150)
    })

    it('should unlock badges that were locked in current state', () => {
      const result = mergeImportData(currentState, importedData)
      const badge2 = result.badges.find((b) => b.id === 'b2')
      expect(badge2?.unlockedAt).toBe('2024-01-10')
    })

    it('should keep existing unlocked badges', () => {
      const result = mergeImportData(currentState, importedData)
      const badge1 = result.badges.find((b) => b.id === 'b1')
      expect(badge1?.unlockedAt).toBe('2024-01-01')
    })

    it('should use better (lower) fastestQuestTime', () => {
      const result = mergeImportData(currentState, importedData)
      expect(result.stats.fastestQuestTime).toBe(80)
    })
  })
})
