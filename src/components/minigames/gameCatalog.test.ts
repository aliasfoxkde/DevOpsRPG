import { describe, expect, it } from 'vitest'
import { MINI_GAME_UNLOCK_LEVEL, MINI_GAMES, miniGameById, type MiniGameId } from './gameCatalog'

// The catalog is the single source of truth for the roster AND the payout
// caps: the hub, library and home page render from it and games cap their
// rewards by the same numbers. These tests pin the invariants the UI relies on.
describe('gameCatalog', () => {
  it('ships exactly the seven advertised games', () => {
    expect(MINI_GAMES.map((game) => game.id)).toEqual([
      'command',
      'memory',
      'math',
      'code',
      'quiz',
      'terminal',
      'incident',
    ])
  })

  it('keeps gold potential at (rounded) half the XP potential for every game', () => {
    for (const game of MINI_GAMES) {
      // Integer gold: the 75-XP games round 37.5 up to 38.
      expect(game.goldPotential).toBe(Math.round(game.xpPotential / 2))
    }
  })

  it('gives every entry a non-empty name, description and tile styling', () => {
    for (const game of MINI_GAMES) {
      expect(game.name.length).toBeGreaterThan(0)
      expect(game.description.length).toBeGreaterThan(0)
      expect(game.icon.length).toBeGreaterThan(0)
      expect(game.tileGradient).toMatch(/from-.*to-/)
      expect(game.accent).toMatch(/^text-/)
    }
  })

  it('never repeats a game id', () => {
    const ids = MINI_GAMES.map((game) => game.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('unlocks mini-games at level 3', () => {
    expect(MINI_GAME_UNLOCK_LEVEL).toBe(3)
  })

  it('looks up entries by id', () => {
    expect(miniGameById('incident').name).toBe('Incident Response')
    expect(miniGameById('command').xpPotential).toBe(50)
  })

  it('throws on an unknown id instead of returning undefined', () => {
    expect(() => miniGameById('nonexistent' as MiniGameId)).toThrow('Unknown mini-game id')
  })
})
