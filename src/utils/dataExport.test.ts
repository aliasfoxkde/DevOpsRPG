import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  exportGameData,
  importGameData,
  parseBase64Import,
  mergeImportData,
  downloadExport,
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

describe('importGameData sanitization', () => {
  const valid = (overrides: Record<string, unknown> = {}) =>
    JSON.stringify({
      version: '1.0.0',
      character: { name: 'Hero' },
      completedQuests: [],
      badges: [],
      companions: [],
      stats: {},
      ...overrides,
    })

  it('rejects a payload without a version', () => {
    expect(importGameData(valid({ version: undefined }))).toBeNull()
  })

  it('rejects a payload whose character is not an object', () => {
    expect(importGameData(valid({ character: 'Hero' }))).toBeNull()
  })

  it('rejects a payload without badges array', () => {
    expect(importGameData(valid({ badges: undefined }))).toBeNull()
  })

  it('rejects a payload without a character name', () => {
    expect(importGameData(valid({ character: { level: 3 } }))).toBeNull()
  })

  it('clamps level to 1-100 and xp/gold to non-negative bounds', () => {
    const result = importGameData(
      valid({ character: { name: 'Hero', level: 9999, xp: -50, gold: 20_000_000 } })
    )
    expect(result?.character.level).toBe(100)
    expect(result?.character.xp).toBe(0)
    expect(result?.character.gold).toBe(10_000_000)
  })

  it('defaults missing numeric fields for a brand-new character', () => {
    const result = importGameData(valid())
    expect(result?.character.level).toBe(1)
    expect(result?.character.xp).toBe(0)
    expect(result?.character.gold).toBe(0)
  })

  it('truncates the character name to 50 characters', () => {
    const result = importGameData(valid({ character: { name: 'x'.repeat(80) } }))
    expect(result?.character.name).toHaveLength(50)
  })

  it('truncates title and avatar fields', () => {
    const result = importGameData(
      valid({ character: { name: 'Hero', title: 't'.repeat(150), avatar: 'a'.repeat(300) } })
    )
    expect(result?.character.title).toHaveLength(100)
    expect(result?.character.avatar).toHaveLength(200)
  })

  it('drops list entries without ids and stringifies id values', () => {
    const result = importGameData(
      valid({
        completedQuests: [{ id: 42 }, { nope: true }, { id: 'quest_1' }],
        badges: [{ id: 'b1' }, null, { id: 'b2', unlockedAt: '2026-01-01' }],
        companions: [{ id: 'c1' }, 'garbage'],
      })
    )
    expect(result?.completedQuests).toEqual([{ id: '42' }, { id: 'quest_1' }])
    expect(result?.badges).toEqual([
      { id: 'b1', unlockedAt: null },
      { id: 'b2', unlockedAt: '2026-01-01' },
    ])
    expect(result?.companions).toEqual([{ id: 'c1' }])
  })

  it('caps imported collections at sane sizes', () => {
    const quests = Array.from({ length: 1500 }, (_, i) => ({ id: `q${i}` }))
    const badges = Array.from({ length: 800 }, (_, i) => ({ id: `b${i}` }))
    const companions = Array.from({ length: 50 }, (_, i) => ({ id: `c${i}` }))
    const result = importGameData(valid({ completedQuests: quests, badges, companions }))
    expect(result?.completedQuests).toHaveLength(1000)
    expect(result?.badges).toHaveLength(500)
    expect(result?.companions).toHaveLength(20)
  })

  it('bounds prestige values', () => {
    const result = importGameData(
      valid({ prestigeLevel: 500, prestigeMultiplier: 99, totalPrestigeXp: -10 })
    )
    expect(result?.prestigeLevel).toBe(100)
    expect(result?.prestigeMultiplier).toBe(10)
    expect(result?.totalPrestigeXp).toBe(0)
  })

  it('keeps stats objects and defaults missing stats to empty', () => {
    expect(importGameData(valid({ stats: { quizCount: 3 } }))?.stats).toEqual({ quizCount: 3 })
    expect(importGameData(valid({ stats: 'nope' }))?.stats).toEqual({})
  })
})

describe('downloadExport', () => {
  const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:mock-url')
  const revokeObjectURL = vi.fn<(url: string) => void>()
  // downloadExport removes its anchor from the DOM after clicking, so capture
  // the created element in a spy to inspect the download attributes.
  let clicked: HTMLAnchorElement | null = null
  const realCreateElement = document.createElement.bind(document)

  beforeEach(() => {
    clicked = null
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true })
    Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL, configurable: true })
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = realCreateElement(tag)
      if (tag === 'a') clicked = el as HTMLAnchorElement
      return el
    })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('downloads JSON containing only unlocked badges under a dated filename', async () => {
    downloadExport(
      {
        character: { name: 'DlHero', level: 4, xp: 300, gold: 25 },
        completedQuests: [{ questId: 'quest_html_intro', topicId: 'html_intro' }],
        badges: [
          { id: 'earned', unlockedAt: '2026-01-01' },
          { id: 'locked', unlockedAt: null },
        ],
        companions: [],
        stats: { quizCount: 2 },
        prestigeLevel: 2,
        prestigeMultiplier: 1.5,
        totalPrestigeXp: 900,
      },
      'my-save.json'
    )

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    const data = JSON.parse(await createObjectURL.mock.calls[0][0].text())
    expect(data.version).toBe('1.0.0')
    expect(data.character.name).toBe('DlHero')
    expect(data.badges.map((b: { id: string }) => b.id)).toEqual(['earned'])
    expect(data.prestigeLevel).toBe(2)

    expect(clicked?.download).toBe('my-save.json')
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('falls back to a dated backup filename', () => {
    downloadExport({
      character: { name: 'Hero' },
      completedQuests: [],
      badges: [],
      companions: [],
      stats: {},
    })
    const today = new Date().toISOString().split('T')[0]
    expect(clicked?.download).toBe(`devopsquest-backup-${today}.json`)
  })
})

describe('mergeImportData keeps the player ahead', () => {
  it('keeps current progress when the import is behind', () => {
    const result = mergeImportData(
      {
        character: { name: 'Current', xp: 900, gold: 500, level: 10 },
        badges: [],
        companions: [{ id: 'kept' }],
        stats: { fastestQuestTime: 30 },
      },
      {
        version: '1.0.0',
        exportedAt: '2026-01-01',
        character: { name: 'Old', xp: 10, gold: 5, level: 1 },
        completedQuests: [],
        badges: [],
        companions: [],
        stats: {},
      }
    )
    expect(result.character.xp).toBe(900)
    expect(result.character.gold).toBe(500)
    expect(result.character.level).toBe(10)
    expect(result.companions).toEqual([{ id: 'kept' }])
    expect(result.stats.fastestQuestTime).toBe(30)
  })

  it('keeps the current companions when the import has none', () => {
    const result = mergeImportData(
      {
        character: { name: 'Current' },
        badges: [],
        companions: [{ id: 'kept' }],
        stats: {},
      },
      {
        version: '1.0.0',
        exportedAt: '2026-01-01',
        character: { name: 'Imported' },
        completedQuests: [],
        badges: [],
        companions: [],
        stats: {},
      }
    )
    expect(result.companions).toEqual([{ id: 'kept' }])
  })
})
