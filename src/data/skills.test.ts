// Behavior tests for the skill system: tree/skill catalog invariants plus the
// three pure helpers (getSkillBonuses, meetsRequirements, getRecommendedSkill).
import { describe, it, expect } from 'vitest'
import {
  SKILL_TREES,
  getSkillBonuses,
  meetsRequirements,
  getRecommendedSkill,
  type Skill,
  type SkillTree,
} from './skills'

const treeById = new Map(SKILL_TREES.map((t) => [t.id, t]))
const skillById = new Map(SKILL_TREES.flatMap((t) => t.skills.map((s) => [s.id, s])))

function skill(id: string): Skill {
  const entry = skillById.get(id)
  if (!entry) throw new Error(`skill ${id} is missing from SKILL_TREES`)
  return entry
}

function tree(id: string): SkillTree {
  const entry = treeById.get(id)
  if (!entry) throw new Error(`tree ${id} is missing from SKILL_TREES`)
  return entry
}

/** Full allocation: every shipped skill at level 1. */
const EVERY_SKILL = Object.fromEntries([...skillById.keys()].map((id) => [id, 1]))

describe('SKILL_TREES catalog', () => {
  it('ships exactly four trees with the expected ids', () => {
    expect(SKILL_TREES.map((t) => t.id)).toEqual([
      'devops_fundamentals',
      'coding_mastery',
      'cloud_adventure',
      'hero_traits',
    ])
  })

  it('recommends a path that is a permutation of that tree’s skills', () => {
    for (const entry of SKILL_TREES) {
      expect(entry.recommendedPath, `${entry.id} has no recommended path`).toBeDefined()
      expect([...(entry.recommendedPath ?? [])].sort()).toEqual(
        entry.skills.map((s) => s.id).sort(),
      )
    }
  })

  it('keeps meta skills out of the tech trees and vice versa', () => {
    const metaTree = tree('hero_traits')
    expect(metaTree.skills.every((s) => s.category === 'meta')).toBe(true)
    for (const entry of SKILL_TREES.filter((t) => t.id !== 'hero_traits')) {
      expect(
        entry.skills.every((s) => s.category === 'tech'),
        entry.id,
      ).toBe(true)
    }
  })

  it('orders the recommended path so every dependency is unlocked before its dependant', () => {
    for (const entry of SKILL_TREES) {
      const unlocked = new Set<string>()
      for (const skillId of entry.recommendedPath ?? []) {
        const step = skill(skillId)
        for (const required of step.requires ?? []) {
          expect(
            unlocked.has(required),
            `${entry.id}: ${skillId} is recommended before its dependency ${required}`,
          ).toBe(true)
        }
        unlocked.add(skillId)
      }
    }
  })

  it('maxes tech skills at 10 and meta skills at 5', () => {
    for (const entry of SKILL_TREES) {
      for (const entrySkill of entry.skills) {
        const expectedMax = entrySkill.category === 'tech' ? 10 : 5
        expect(entrySkill.maxLevel, entrySkill.id).toBe(expectedMax)
        expect(entrySkill.benefits?.length ?? 0, entrySkill.id).toBeGreaterThan(0)
        expect(entrySkill.xpInvested).toBe(0)
      }
    }
  })

  it('describes dependencies inside the same tree', () => {
    for (const entry of SKILL_TREES) {
      const localIds = new Set(entry.skills.map((s) => s.id))
      for (const entrySkill of entry.skills) {
        for (const required of entrySkill.requires ?? []) {
          expect(localIds.has(required), `${entrySkill.id} -> ${required}`).toBe(true)
        }
      }
    }
  })
})

describe('getSkillBonuses', () => {
  it('returns nothing for an unallocated player', () => {
    expect(getSkillBonuses({})).toEqual([])
  })

  it('ignores allocations for skills that do not exist', () => {
    // Stale save data can carry ids from a previous version; they must not
    // surface as bonuses.
    expect(getSkillBonuses({ telepathy: 5, removed_skill: 3 })).toEqual([])
  })

  it('grants +2% XP per tech skill level with a matching description', () => {
    expect(getSkillBonuses({ containerization: 3 })).toEqual([
      {
        skillId: 'containerization',
        skillName: 'Containerization',
        bonusType: 'xp',
        bonusValue: 6,
        description: '+6% XP on Containerization quests',
      },
    ])
  })

  it('scales linearly with the invested level', () => {
    expect(getSkillBonuses({ python: 1 })[0]?.bonusValue).toBe(2)
    expect(getSkillBonuses({ python: 10 })[0]?.bonusValue).toBe(20)
  })

  it('turns persistence into streak protection instead of XP', () => {
    expect(getSkillBonuses({ persistence: 4 })).toEqual([
      {
        skillId: 'persistence',
        skillName: 'Persistence',
        bonusType: 'streak',
        bonusValue: 4,
        description: '+4% streak protection',
      },
    ])
  })

  it('turns wisdom into quiz accuracy instead of XP', () => {
    expect(getSkillBonuses({ wisdom: 2 })).toEqual([
      {
        skillId: 'wisdom',
        skillName: 'Wisdom',
        bonusType: 'quiz',
        bonusValue: 4,
        description: '+4% quiz accuracy',
      },
    ])
  })

  it('gives curiosity and speed no numeric bonus (documented gap)', () => {
    // Both are meta skills that are neither persistence nor wisdom, so the
    // bonus loop skips them entirely — levelling them buys nothing measurable.
    expect(getSkillBonuses({ curiosity: 5, speed: 5 })).toEqual([])
  })

  it('stacks every allocated skill in catalog order', () => {
    const bonuses = getSkillBonuses(EVERY_SKILL)
    // 12 tech skills grant XP, plus persistence (streak) and wisdom (quiz).
    expect(bonuses).toHaveLength(14)
    expect(bonuses.filter((b) => b.bonusType === 'xp')).toHaveLength(12)
    expect(bonuses.filter((b) => b.bonusType === 'streak')).toEqual([
      {
        skillId: 'persistence',
        skillName: 'Persistence',
        bonusType: 'streak',
        bonusValue: 1,
        description: '+1% streak protection',
      },
    ])
    expect(bonuses.filter((b) => b.bonusType === 'quiz')).toEqual([
      {
        skillId: 'wisdom',
        skillName: 'Wisdom',
        bonusType: 'quiz',
        bonusValue: 2,
        description: '+2% quiz accuracy',
      },
    ])
  })

  it('treats a level of 0 as unallocated', () => {
    expect(getSkillBonuses({ containerization: 0, persistence: 0 })).toEqual([])
  })
})

describe('meetsRequirements', () => {
  it('is satisfied trivially when a skill has no dependencies', () => {
    expect(meetsRequirements(skill('containerization'), {})).toBe(true)
    expect(meetsRequirements(skill('persistence'), {})).toBe(true)
  })

  it('is unsatisfied while any dependency is still at level 0', () => {
    expect(meetsRequirements(skill('ci_cd'), {})).toBe(false)
    expect(meetsRequirements(skill('ci_cd'), { containerization: 0 })).toBe(false)
  })

  it('is satisfied once every dependency is above level 0', () => {
    expect(meetsRequirements(skill('ci_cd'), { containerization: 1 })).toBe(true)
  })

  it('requires all listed dependencies, not just one', () => {
    expect(meetsRequirements(skill('kubernetes'), { aws: 5 })).toBe(false)
    expect(meetsRequirements(skill('kubernetes'), { serverless: 5 })).toBe(false)
    expect(meetsRequirements(skill('kubernetes'), { aws: 1, serverless: 9 })).toBe(true)
  })

  it('ignores allocations that are not dependencies', () => {
    // Levelling unrelated skills satisfies nothing and blocks nothing.
    expect(meetsRequirements(skill('ci_cd'), { python: 9, wisdom: 4 })).toBe(false)
    expect(meetsRequirements(skill('kubernetes'), { python: 9 })).toBe(false)
    expect(meetsRequirements(skill('kubernetes'), { aws: 1, serverless: 1, python: 9 })).toBe(true)
  })
})

describe('getRecommendedSkill', () => {
  it('returns null when the player has no points to spend', () => {
    expect(getRecommendedSkill(tree('devops_fundamentals'), {}, 0)).toBeNull()
    expect(getRecommendedSkill(tree('devops_fundamentals'), {}, -3)).toBeNull()
  })

  it('returns null for a tree with no recommended path', () => {
    const pathless: SkillTree = { ...tree('hero_traits'), recommendedPath: undefined }
    expect(getRecommendedSkill(pathless, {}, 5)).toBeNull()
  })

  it('recommends the first path entry for a fresh player', () => {
    expect(getRecommendedSkill(tree('devops_fundamentals'), {}, 1)?.id).toBe('containerization')
    expect(getRecommendedSkill(tree('hero_traits'), {}, 1)?.id).toBe('persistence')
  })

  it('skips maxed skills and continues down the path', () => {
    expect(getRecommendedSkill(tree('devops_fundamentals'), { containerization: 10 }, 1)?.id).toBe(
      'ci_cd',
    )
  })

  it('skips locked skills whose dependencies are unmet', () => {
    // Synthetic path puts a gated skill first: it must be skipped, not
    // recommended, with the ungated entry picked up instead.
    const gated: SkillTree = {
      id: 'synthetic',
      name: 'Synthetic',
      icon: '🧪',
      description: 'Dependency-gated order',
      recommendedPath: ['ci_cd', 'containerization'],
      skills: [skill('ci_cd'), { ...skill('containerization'), requires: undefined }],
    }
    expect(getRecommendedSkill(gated, {}, 1)?.id).toBe('containerization')
  })

  it('skips recommended path steps that name no known skill', () => {
    const withGhost: SkillTree = {
      ...tree('devops_fundamentals'),
      recommendedPath: ['retired_skill', 'containerization'],
    }
    expect(getRecommendedSkill(withGhost, {}, 1)?.id).toBe('containerization')
  })

  it('returns null once every skill in the tree is maxed', () => {
    const maxed = Object.fromEntries(tree('hero_traits').skills.map((s) => [s.id, s.maxLevel]))
    expect(getRecommendedSkill(tree('hero_traits'), maxed, 10)).toBeNull()
  })

  it('returns the same recommendation until the player spends points (idempotent)', () => {
    const first = getRecommendedSkill(tree('coding_mastery'), {}, 2)
    const second = getRecommendedSkill(tree('coding_mastery'), {}, 2)
    expect(first).toBe(second)
  })
})
