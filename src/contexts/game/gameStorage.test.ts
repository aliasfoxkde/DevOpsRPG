// @vitest-environment node
// Persistence-layer behavior tests: the loader's validation, backup
// fallback, migration defaults and sentinels. These guard the paths a
// corrupted or legacy save takes — a broken browser storage entry must
// degrade to defaults (or the backup), never crash the provider.
// Node environment with a stubbed localStorage: the module is storage-shaped
// and touches no DOM.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { MockInstance } from 'vitest'
import { loadInitialGame } from './gameStorage'
import { createDefaultGame, ACHIEVEMENTS } from './defaultState'
import { STORAGE_KEYS } from '../../utils/gameUtils'
import type { GameState } from './types'

class MemoryStorage {
  private store = new Map<string, string>()
  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }
  removeItem(key: string): void {
    this.store.delete(key)
  }
  clear(): void {
    this.store.clear()
  }
}

/** Installs window + localStorage stubs so the loader takes its real path. */
function installStorage(): MemoryStorage {
  const storage = new MemoryStorage()
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('window', {})
  return storage
}

/** A minimal valid save: the loader only requires character + badges. */
function validSave(overrides: Partial<GameState> = {}): string {
  return JSON.stringify({ ...createDefaultGame(), ...overrides })
}

let warnSpy: MockInstance

describe('loadInitialGame', () => {
  // createDefaultGame() is non-deterministic (joinedAt timestamp, rolled
  // side quests), so defaults are compared through their stable fields.
  function expectFreshDefaults(game: GameState): void {
    const ref = createDefaultGame()
    expect(game.character.name).toBe(ref.character.name)
    expect(game.character.xp).toBe(0)
    expect(game.character.level).toBe(1)
    expect(game.character.gold).toBe(0)
    expect(game.badges).toEqual(ref.badges)
    expect(game.achievements).toHaveLength(ACHIEVEMENTS.length)
  }

  beforeEach(() => {
    installStorage()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    warnSpy.mockRestore()
  })

  it('returns a fresh game when storage is empty', () => {
    const game = loadInitialGame()
    expectFreshDefaults(game)
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('falls back to defaults and warns when the main save is corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEYS.GAME, '{not json')
    const game = loadInitialGame()
    expectFreshDefaults(game)
    expect(warnSpy).toHaveBeenCalledWith('Failed to parse game data:', expect.any(Error))
  })

  it('recovers from the backup when the main save is corrupt', () => {
    localStorage.setItem(STORAGE_KEYS.GAME, '{not json')
    localStorage.setItem(STORAGE_KEYS.BACKUP, validSave())
    const game = loadInitialGame()
    expect(game).not.toBeNull()
    expect(warnSpy).toHaveBeenCalledWith('Restored game from backup')
  })

  it('rejects saves missing the required shape and warns about unreadable data', () => {
    localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify({ character: 42 }))
    const game = loadInitialGame()
    expectFreshDefaults(game)
    expect(warnSpy).toHaveBeenCalledWith('Game data validation failed: missing required fields')
    // Data existed but was unusable — the recoverable-data warning fires too
    expect(warnSpy).toHaveBeenCalledWith(
      'Game data was unreadable, starting fresh. Previous data may be recoverable from browser storage.',
    )
  })

  it('deep-merges a partial save onto defaults and restores achievement stamps', () => {
    const first = ACHIEVEMENTS[0]
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        character: { name: 'Pip', xp: 250 },
        badges: [],
        achievements: [
          { id: first.id, unlockedAt: '2026-09-01T00:00:00.000Z' },
          { id: 'not-in-catalog', unlockedAt: 'now' },
        ],
      }),
    )
    const game = loadInitialGame()
    // Merged fields survive; omitted ones come from defaults
    expect(game.character.name).toBe('Pip')
    expect(game.character.xp).toBe(250)
    expect(game.character.level).toBe(createDefaultGame().character.level)
    // Catalog achievements regain their unlock stamps; unknown ones are dropped
    expect(game.achievements.find((a) => a.id === first.id)?.unlockedAt).toBe(
      '2026-09-01T00:00:00.000Z',
    )
    expect(game.achievements.some((a) => a.id === 'not-in-catalog')).toBe(false)
    expect(game.achievements).toHaveLength(ACHIEVEMENTS.length)
  })

  it('seeds ownedItems from equippedItems for pre-ownedItems saves', () => {
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        character: { name: 'Legacy', equippedItems: ['laptop_basic'] },
        badges: [],
      }),
    )
    const game = loadInitialGame()
    expect(game.character.ownedItems).toEqual(['laptop_basic'])
  })

  it('restores the Infinity sentinel for fastestQuestTime from its null form', () => {
    const save = validSave()
    const parsed = JSON.parse(save) as { stats: { fastestQuestTime: number | null } }
    parsed.stats.fastestQuestTime = null // JSON.stringify(Infinity) === null
    localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(parsed))
    expect(loadInitialGame().stats.fastestQuestTime).toBe(Infinity)
  })

  it('normalizes non-array collection fields left corrupt by a bad merge', () => {
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        character: { streakShields: 'many' },
        badges: [],
        recentBadgeUnlocks: 'oops',
        recentMilestoneUnlocks: 'oops',
        collectibles: 'oops',
        completedRealms: 'oops',
        claimedStoryArcs: 'oops',
        claimedCareerMilestones: 'oops',
        claimedCertifications: 'oops',
        claimedEvents: 'oops',
      }),
    )
    const game = loadInitialGame()
    expect(game.character.streakShields).toBe(0)
    expect(game.recentBadgeUnlocks).toEqual([])
    expect(game.recentMilestoneUnlocks).toEqual([])
    expect(game.collectibles).toEqual([])
    expect(game.completedRealms).toEqual([])
    // The one-time-reward claim ledgers must survive repair as empty arrays,
    // or claim-gated UI crashes on .includes()
    expect(game.claimedStoryArcs).toEqual([])
    expect(game.claimedCareerMilestones).toEqual([])
    expect(game.claimedCertifications).toEqual([])
    expect(game.claimedEvents).toEqual([])
  })

  it('filters non-string ids from the legacy seed and drops non-array equippedItems', () => {
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        character: { name: 'Legacy', equippedItems: ['laptop_basic', 7, null] },
        badges: [],
      }),
    )
    expect(loadInitialGame().character.ownedItems).toEqual(['laptop_basic'])

    // equippedItems itself corrupt: seed nothing rather than crash
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({ character: { name: 'Legacy', equippedItems: 'sword' }, badges: [] }),
    )
    expect(loadInitialGame().character.ownedItems).toEqual([])
  })

  it('keeps a valid save intact through the load round-trip', () => {
    const original = createDefaultGame()
    localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(original))
    const loaded = loadInitialGame()
    // fastestQuestTime round-trips through its sentinel; everything else is equal
    expect({ ...loaded, stats: { ...loaded.stats, fastestQuestTime: 0 } }).toEqual({
      ...original,
      stats: { ...original.stats, fastestQuestTime: 0 },
    })
  })
})
