// @vitest-environment node
// The data modules guard their cross-references at import time: a technology
// without quests (careerPaths) or a topic id without a quest (storylines) is
// a data bug that must fail the import loudly instead of rendering a
// permanently-broken page. These tests re-import the modules against a
// corrupted quest catalog to prove the guards fire — and re-import the real
// catalog afterwards to prove the guards accept valid data.
// (Node environment: pure data-module imports — no DOM is involved.)
import { describe, it, expect, vi, afterEach } from 'vitest'
import { MINI_GAMES, miniGameById } from '../components/minigames/gameCatalog'
import type { MiniGameId } from '../components/minigames/gameCatalog'

/** The quests module shape careerPaths/storylines consume. */
function questCatalog(questCount: number) {
  return {
    allQuests: Array.from({ length: questCount }, (_, index) => ({
      id: `quest_topic${index}`,
      topicId: `topic${index}`,
      technologyId: 'html',
    })),
  }
}

afterEach(() => {
  vi.doUnmock('./quests')
  vi.resetModules()
})

describe('data module import guards', () => {
  it('rejects careerPaths when a technology has no quests', async () => {
    vi.doMock('./quests', () => questCatalog(0))
    await expect(import('./careerPaths')).rejects.toThrow(
      /careerPaths: no quests found for technology/,
    )
  })

  it('rejects storylines when a topic id has no quest', async () => {
    vi.doMock('./quests', () => questCatalog(0))
    await expect(import('./storylines')).rejects.toThrow(/storylines: no quest for topic/)
  })

  it('accepts the real quest catalog for both modules', async () => {
    // No mock: the shipped catalog must import clean (guards never misfire)
    const careerPaths = await import('./careerPaths')
    const storylines = await import('./storylines')
    expect(careerPaths.CAREER_PATHS.length).toBeGreaterThan(0)
    expect(storylines.STORY_ARCS.length).toBeGreaterThan(0)
    // Every generated path technology kept a non-empty quest list
    for (const path of careerPaths.CAREER_PATHS) {
      for (const technology of path.technologies) {
        expect(technology.questIds.length, `${path.id}/${technology.id}`).toBeGreaterThan(0)
      }
    }
  })

  it('rejects unknown mini-game ids from the catalog lookup', () => {
    const real = MINI_GAMES.map((game) => game.id)
    expect(() => miniGameById('definitely-not-a-game' as MiniGameId)).toThrow(
      /Unknown mini-game id: definitely-not-a-game/,
    )
    // Every shipped id resolves; the guard only fires on typos
    for (const id of real) {
      expect(miniGameById(id).id).toBe(id)
    }
  })
})
