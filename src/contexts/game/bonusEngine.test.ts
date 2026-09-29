import { describe, it, expect } from 'vitest'
import {
  CLASS_BONUSES,
  CLASS_TECH_BONUS,
  CLASS_ALL_TECH_BONUS,
  SKILL_TECH_MAP,
  computeRewardBonuses,
  techMultiplierFor,
  type BonusInput,
} from './bonusEngine'
import { technologies } from '../../data/technologies'
import { SKILL_TREES } from '../../data/skills'

const BASE_INPUT: BonusInput = {
  characterClass: 'DevOps Sage',
  xpMultiplier: 1,
  goldMultiplier: 1,
  skillAllocations: {},
  equippedItemIds: [],
}

describe('CLASS_BONUSES', () => {
  it('gives every class a bonus, and only the Sage the whole catalog', () => {
    for (const [className, bonus] of Object.entries(CLASS_BONUSES)) {
      expect(bonus.bonus, className).toBeGreaterThan(0)
      if (className === 'DevOps Sage') {
        expect(bonus.techs).toBeNull()
        expect(bonus.bonus).toBe(CLASS_ALL_TECH_BONUS)
      } else {
        // Specialists name real technologies at the deeper rate
        expect(bonus.bonus).toBe(CLASS_TECH_BONUS)
        expect(bonus.techs).not.toBeNull()
        for (const techId of bonus.techs ?? []) {
          expect(technologies[techId], `${className} names ${techId}`).toBeDefined()
        }
      }
    }
  })

  it('maps every skill-backed technology to a real technology', () => {
    for (const techId of Object.values(SKILL_TECH_MAP)) {
      expect(technologies[techId]).toBeDefined()
    }
  })

  it('covers every tech-category skill with a technology mapping', () => {
    const techSkills = SKILL_TREES.flatMap((tree) =>
      tree.skills.filter((skill) => skill.category === 'tech').map((skill) => skill.id),
    )
    for (const skillId of techSkills) {
      expect(SKILL_TECH_MAP[skillId], `${skillId} maps to a technology`).toBeDefined()
    }
  })
})

describe('computeRewardBonuses', () => {
  it('applies the Sage bonus to the global XP multiplier only', () => {
    const bonuses = computeRewardBonuses(BASE_INPUT)

    expect(bonuses.xpMultiplier).toBeCloseTo(1.1)
    expect(bonuses.goldMultiplier).toBe(1)
    // The Sage has no specialist techs, so no tech stands above the global
    expect(Object.keys(bonuses.techXpMultiplier)).toEqual([])
    expect(techMultiplierFor(bonuses, 'docker')).toBeCloseTo(1.1)
  })

  it('applies a specialist class bonus to its technologies and nothing else', () => {
    const bonuses = computeRewardBonuses({ ...BASE_INPUT, characterClass: 'Cloud Knight' })

    // No global class factor: collectibles multiply alone
    expect(bonuses.xpMultiplier).toBe(1)
    expect(techMultiplierFor(bonuses, 'aws')).toBeCloseTo(1.2)
    expect(techMultiplierFor(bonuses, 'kubernetes')).toBeCloseTo(1.2)
    expect(techMultiplierFor(bonuses, 'python')).toBe(1)
  })

  it('stacks skill levels, class bonus and equipment on a technology', () => {
    const bonuses = computeRewardBonuses({
      ...BASE_INPUT,
      characterClass: 'Script Warrior',
      skillAllocations: { python: 5 }, // +10% on python
      equippedItemIds: ['laptop_basic'], // +2% XP everywhere
    })

    expect(bonuses.xpMultiplier).toBeCloseTo(1.02)
    expect(bonuses.skillTechBonuses.python).toBeCloseTo(0.1)
    // global 1.02 x skill 1.10 x class 1.20
    expect(techMultiplierFor(bonuses, 'python')).toBeCloseTo(1.02 * 1.1 * 1.2)
  })

  it('raises quiz score bonus from the Wisdom skill and gear', () => {
    const skilled = computeRewardBonuses({ ...BASE_INPUT, skillAllocations: { wisdom: 3 } })
    expect(skilled.quizScoreBonus).toBeCloseTo(0.06)

    const geared = computeRewardBonuses({ ...BASE_INPUT, equippedItemIds: ['dual_monitors'] }) // quizScoreBonus: 0.1
    expect(geared.quizScoreBonus).toBeCloseTo(0.1)
  })

  it('converts gear streak protection and Persistence levels into shields', () => {
    const geared = computeRewardBonuses({
      ...BASE_INPUT,
      equippedItemIds: ['coffee_mug'], // streakProtection: 1
    })
    expect(geared.virtualStreakShields).toBe(1)

    // 12 Persistence levels = floor(12/5) = 2 more shields
    const persistent = computeRewardBonuses({
      ...BASE_INPUT,
      skillAllocations: { persistence: 12 },
      equippedItemIds: ['coffee_mug'],
    })
    expect(persistent.virtualStreakShields).toBe(3)
  })

  it('drops equipped ids that are not in the catalog from every calculation', () => {
    const bonuses = computeRewardBonuses({
      ...BASE_INPUT,
      equippedItemIds: ['flux_capacitor'],
    })

    expect(bonuses.xpMultiplier).toBeCloseTo(1.1)
    expect(bonuses.equipment.xpBonus).toBe(0)
    expect(bonuses.equipment.techBonuses).toEqual({})
  })

  it('carries collectible multipliers through unchanged', () => {
    const bonuses = computeRewardBonuses({
      ...BASE_INPUT,
      xpMultiplier: 1.5,
      goldMultiplier: 1.25,
    })

    expect(bonuses.xpMultiplier).toBeCloseTo(1.5 * 1.1)
    expect(bonuses.goldMultiplier).toBeCloseTo(1.25)
  })
})
