// Cross-module referential integrity for the static game data.
// technologies.ts is the source of truth; quests and quizzes derive from it.
// A break here silently produces unreachable quests or unwinnable quizzes.
import { describe, it, expect } from 'vitest'
import { technologies, categories } from './technologies'
import { allQuests, realms } from './quests'
import { quizzes } from './quizzes'
import { BADGES, RARITY_COLORS, HANDLED_REQUIREMENT_TYPES } from './badges'
import { MILESTONES } from './milestones'
import { DAILY_QUESTS_POOL, WEEKLY_QUESTS_POOL, SECRET_QUESTS_POOL } from './sidequests'
import { worldMapLocations } from './worldmap'
import { TITLES } from './titles'
import { SKILL_TREES } from './skills'
import { CAREER_PATHS } from './careerPaths'
import { COLLECTIBLES_POOL, DAILY_REWARDS } from './collectibles'
import { codePuzzles } from './minigames'

const techList = Object.values(technologies)
const allTopics = techList.flatMap((t) => t.topics)
const topicIds = new Set(allTopics.map((t) => t.id))
const realmMapByPhase: Record<number, string> = {
  1: 'foundations',
  2: 'scripts',
  3: 'frameworks',
  4: 'cloud',
  5: 'devops',
  6: 'aiintelligence',
  7: 'aiintelligence',
}

function duplicates<T>(items: T[]): T[] {
  const seen = new Set<T>()
  const dupes = new Set<T>()
  for (const item of items) {
    if (seen.has(item)) dupes.add(item)
    seen.add(item)
  }
  return [...dupes]
}

describe('technologies', () => {
  it('has unique, key-consistent technology ids', () => {
    for (const [key, tech] of Object.entries(technologies)) {
      expect(tech.id, `key ${key} should match tech.id`).toBe(key)
    }
    expect(duplicates(techList.map((t) => t.id))).toEqual([])
  })

  it('has globally unique topic ids across all technologies', () => {
    expect(duplicates(allTopics.map((t) => t.id))).toEqual([])
  })

  it('has unique slugs for technologies and topics', () => {
    expect(duplicates(techList.map((t) => t.slug))).toEqual([])
    expect(duplicates(allTopics.map((t) => t.slug))).toEqual([])
  })

  it('numbers topics sequentially from 1 within each technology', () => {
    for (const tech of techList) {
      tech.topics.forEach((topic, index) => {
        expect(topic.order, `${tech.id}/${topic.id}`).toBe(index + 1)
      })
    }
  })

  it('only references prerequisites that exist (no self-references)', () => {
    for (const tech of techList) {
      for (const prereq of tech.prerequisites) {
        expect(technologies[prereq], `${tech.id} prerequisite`).toBeDefined()
        expect(prereq).not.toBe(tech.id)
      }
    }
  })

  it('has no prerequisite cycles', () => {
    const visiting = new Set<string>()
    const visited = new Set<string>()
    const visit = (id: string) => {
      if (visited.has(id)) return
      expect(visiting.has(id), `cycle through ${id}`).toBe(false)
      visiting.add(id)
      for (const prereq of technologies[id].prerequisites) visit(prereq)
      visiting.delete(id)
      visited.add(id)
    }
    for (const tech of techList) visit(tech.id)
  })

  it('keeps numeric fields positive', () => {
    for (const tech of techList) {
      expect(tech.xpPerTopic).toBeGreaterThan(0)
      expect(tech.estimatedHours).toBeGreaterThan(0)
      expect(tech.topics.length).toBeGreaterThan(0)
    }
  })

  it('maps every technology phase to a known category', () => {
    for (const tech of techList) {
      expect(Object.values(categories).map((c) => c.phase)).toContain(tech.phase)
    }
  })
})

describe('realms', () => {
  it('has key-consistent realm ids', () => {
    for (const [key, realm] of Object.entries(realms)) {
      expect(realm.id).toBe(key)
    }
  })

  it('only references existing technologies', () => {
    for (const realm of Object.values(realms)) {
      for (const techId of realm.technologies) {
        expect(technologies[techId], `${realm.id} tech ${techId}`).toBeDefined()
      }
    }
  })

  it('places every technology in the realm matching its phase', () => {
    for (const tech of techList) {
      const expectedRealm = realmMapByPhase[tech.phase]
      expect(expectedRealm, `no realm for phase ${tech.phase}`).toBeDefined()
      expect(realms[expectedRealm].technologies).toContain(tech.id)
    }
  })

  it('gates higher realms behind higher levels', () => {
    const levels = Object.values(realms).map((r) => r.requiredLevel)
    expect([...levels].sort((a, b) => a - b)).toEqual(levels)
    expect(levels[0]).toBe(1)
  })
})

describe('quests', () => {
  it('derives exactly one quest per topic', () => {
    expect(allQuests.length).toBe(allTopics.length)
  })

  it('has unique quest ids', () => {
    expect(duplicates(allQuests.map((q) => q.id))).toEqual([])
  })

  it('references valid technologies, topics and realms', () => {
    for (const quest of allQuests) {
      expect(technologies[quest.technologyId], quest.id).toBeDefined()
      expect(topicIds.has(quest.topicId), quest.id).toBe(true)
      expect(realms[quest.realmId], quest.id).toBeDefined()
      expect(quest.id).toBe(`quest_${quest.topicId}`)
    }
  })

  it('keeps difficulty, XP and time in valid ranges', () => {
    for (const quest of allQuests) {
      expect(quest.difficulty).toBeGreaterThanOrEqual(1)
      expect(quest.difficulty).toBeLessThanOrEqual(5)
      expect(quest.xpReward).toBeGreaterThan(0)
      expect(quest.estimatedMinutes).toBeGreaterThanOrEqual(3)
      expect(quest.estimatedMinutes).toBeLessThanOrEqual(15)
    }
  })

  it('only uses battle and boss quest types', () => {
    for (const quest of allQuests) {
      expect(['battle', 'boss']).toContain(quest.type)
    }
  })
})

describe('quizzes', () => {
  it('is keyed by existing topic ids', () => {
    for (const key of Object.keys(quizzes)) {
      expect(topicIds.has(key), `quiz key ${key} has no topic`).toBe(true)
    }
  })

  it('has question topicIds that match their quiz key', () => {
    for (const [key, questions] of Object.entries(quizzes)) {
      for (const question of questions) {
        expect(question.topicId, `${key}/${question.id}`).toBe(key)
      }
    }
  })

  it('has unique question ids', () => {
    const ids = Object.values(quizzes).flatMap((qs) => qs.map((q) => q.id))
    expect(duplicates(ids)).toEqual([])
  })

  it('keeps multiple-choice questions answerable', () => {
    for (const questions of Object.values(quizzes)) {
      for (const q of questions) {
        const type = q.type ?? 'multiple_choice'
        if (type === 'multiple_choice') {
          expect(q.options?.length, q.id).toBeGreaterThan(1)
          expect(q.correctIndex ?? -1, q.id).toBeGreaterThanOrEqual(0)
          expect(q.correctIndex ?? -1, q.id).toBeLessThan(q.options?.length ?? 0)
        }
        if (type === 'true_false') {
          expect(q.options?.length, q.id).toBe(2)
        }
      }
    }
  })

  it('gives every question an explanation', () => {
    for (const questions of Object.values(quizzes)) {
      for (const q of questions) {
        expect(q.explanation.trim().length, q.id).toBeGreaterThan(0)
      }
    }
  })

  it('covers the majority of topics with quiz questions', () => {
    const quizzedTopics = new Set(Object.keys(quizzes))
    const coverage = quizzedTopics.size / topicIds.size
    expect(coverage).toBeGreaterThan(0.5)
  })
})

describe('badges, milestones and titles', () => {
  it('has unique badge ids with valid rarity tiers', () => {
    expect(duplicates(BADGES.map((b) => b.id))).toEqual([])
    const rarities = Object.keys(RARITY_COLORS)
    for (const badge of BADGES) {
      expect(rarities, `${badge.id} rarity ${badge.rarity}`).toContain(badge.rarity)
      expect(badge.requirement.value, badge.id).toBeGreaterThan(0)
      expect(badge.xpReward, badge.id).toBeGreaterThanOrEqual(0)
      expect(badge.goldReward, badge.id).toBeGreaterThanOrEqual(0)
    }
  })

  it('only uses requirement types that shouldUnlockBadge handles', () => {
    // shouldUnlockBadge's default case returns false, so an unhandled type
    // would make the badge permanently unobtainable with no error anywhere.
    const handled = HANDLED_REQUIREMENT_TYPES as readonly string[]
    for (const badge of BADGES) {
      expect(handled, `${badge.id} type ${badge.requirement.type}`).toContain(
        badge.requirement.type,
      )
    }
  })

  it('has unique milestone ids with valid triggers and bonuses', () => {
    expect(duplicates(MILESTONES.map((m) => m.id))).toEqual([])
    for (const milestone of MILESTONES) {
      const { trigger, xpBonus } = milestone
      const numericTarget =
        trigger.type === 'quest_count'
          ? trigger.count
          : trigger.type === 'streak'
            ? trigger.days
            : trigger.type === 'level'
              ? trigger.level
              : trigger.type === 'quiz_streak'
                ? trigger.count
                : trigger.type === 'minigame_complete'
                  ? trigger.count
                  : trigger.type === 'speed_quest'
                    ? trigger.minutes
                    : undefined
      if (numericTarget !== undefined) {
        expect(numericTarget, milestone.id).toBeGreaterThan(0)
      }
      if (trigger.type === 'realm_complete') {
        expect(realms[trigger.realm], milestone.id).toBeDefined()
      }
      if (trigger.type === 'technology_complete') {
        expect(technologies[trigger.tech], milestone.id).toBeDefined()
      }
      expect(xpBonus, milestone.id).toBeGreaterThan(0)
      expect(milestone.unlocked).toBe(false)
    }
  })

  it('has unique title ids', () => {
    expect(duplicates(TITLES.map((t) => t.id))).toEqual([])
  })
})

describe('side quests and collectibles', () => {
  it('gives every side quest a unique id and positive reward', () => {
    const pools = [DAILY_QUESTS_POOL, WEEKLY_QUESTS_POOL, SECRET_QUESTS_POOL]
    const ids = pools.flatMap((pool) => pool.map((q) => q.id))
    expect(duplicates(ids)).toEqual([])
    for (const quest of pools.flat()) {
      expect(quest.rewards.xp, quest.id).toBeGreaterThan(0)
      expect(quest.rewards.gold, quest.id).toBeGreaterThanOrEqual(0)
      expect(quest.requirement.count, quest.id).toBeGreaterThan(0)
      if (quest.rewards.badge) {
        expect(
          BADGES.some((b) => b.id === quest.rewards.badge),
          `${quest.id} badge ${quest.rewards.badge}`,
        ).toBe(true)
      }
    }
  })

  it('has unique collectible ids', () => {
    expect(duplicates(COLLECTIBLES_POOL.map((c) => c.id))).toEqual([])
  })

  it('offers daily rewards for a 7-day cycle', () => {
    expect(DAILY_REWARDS.length).toBe(7)
  })
})

describe('world map', () => {
  it('only connects locations that exist', () => {
    const ids = new Set(worldMapLocations.map((l) => l.id))
    expect(duplicates(worldMapLocations.map((l) => l.id))).toEqual([])
    for (const location of worldMapLocations) {
      for (const connection of location.connectedTo) {
        expect(ids.has(connection), `${location.id} -> ${connection}`).toBe(true)
      }
    }
  })

  it('keeps map positions within the viewport', () => {
    for (const location of worldMapLocations) {
      expect(location.position.x).toBeGreaterThanOrEqual(0)
      expect(location.position.x).toBeLessThanOrEqual(100)
      expect(location.position.y).toBeGreaterThanOrEqual(0)
      expect(location.position.y).toBeLessThanOrEqual(100)
    }
  })

  it('references valid realms', () => {
    for (const location of worldMapLocations) {
      if (location.realmId) {
        expect(realms[location.realmId], location.id).toBeDefined()
      }
    }
  })
})

describe('code puzzles', () => {
  it('gives every puzzle a unique id and non-empty options containing the answer', () => {
    expect(duplicates(codePuzzles.map((p) => p.id))).toEqual([])
    for (const puzzle of codePuzzles) {
      // Puzzles are answered by clicking an option; without options (or with
      // the answer missing from them) the round can never be solved.
      expect(puzzle.options?.length, `${puzzle.id} options`).toBeGreaterThan(1)
      expect(puzzle.options, `${puzzle.id} answer "${puzzle.answer}"`).toContain(puzzle.answer)
    }
  })
})

describe('skill trees and career paths', () => {
  it('has unique skill tree and skill ids', () => {
    expect(duplicates(SKILL_TREES.map((t) => t.id))).toEqual([])
    const skillIds = SKILL_TREES.flatMap((t) => t.skills.map((s) => s.id))
    expect(duplicates(skillIds)).toEqual([])
  })

  it('only references existing skills in dependencies and paths', () => {
    const skillIds = new Set(SKILL_TREES.flatMap((t) => t.skills.map((s) => s.id)))
    for (const tree of SKILL_TREES) {
      for (const skill of tree.skills) {
        expect(skill.maxLevel, skill.id).toBeGreaterThan(0)
        expect(skill.currentLevel, skill.id).toBe(0)
        for (const dep of skill.requires ?? []) {
          expect(skillIds.has(dep), `${skill.id} requires ${dep}`).toBe(true)
        }
      }
      for (const step of tree.recommendedPath ?? []) {
        expect(skillIds.has(step), `${tree.id} path step ${step}`).toBe(true)
      }
    }
  })

  it('has unique career path ids', () => {
    expect(duplicates(CAREER_PATHS.map((p) => p.id))).toEqual([])
  })
})
