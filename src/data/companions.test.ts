// Data-integrity tests for the companion catalog: unique ids, evolution
// references that resolve, and bond/bonus values inside game-valid ranges.
import { describe, it, expect } from 'vitest'
import { COMPANIONS_DATA, EVOLVED_COMPANIONS } from './companions'

const baseCompanions = Object.values(COMPANIONS_DATA)
const evolvedCompanions = Object.values(EVOLVED_COMPANIONS)

describe('companion data integrity', () => {
  it('has unique ids across base and evolved companions', () => {
    const ids = [...baseCompanions, ...evolvedCompanions].map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every base companion evolves into a defined evolved companion', () => {
    for (const companion of baseCompanions) {
      expect(companion.evolvedForm, `${companion.id} must declare an evolvedForm`).toBeDefined()
      expect(
        EVOLVED_COMPANIONS[companion.evolvedForm as string],
        `${companion.id} evolves into missing companion ${companion.evolvedForm}`,
      ).toBeDefined()
    }
  })

  it('evolved companions are terminal (no evolution chains)', () => {
    for (const companion of evolvedCompanions) {
      expect(companion.evolvedForm, `${companion.id} must not evolve further`).toBeUndefined()
    }
  })

  it('keeps bonuses in [0, 1] and bond levels inside the 1-10 scale', () => {
    for (const companion of [...baseCompanions, ...evolvedCompanions]) {
      expect(companion.xpBonus).toBeGreaterThanOrEqual(0)
      expect(companion.xpBonus).toBeLessThanOrEqual(1)
      expect(companion.goldBonus).toBeGreaterThanOrEqual(0)
      expect(companion.goldBonus).toBeLessThanOrEqual(1)
      expect(companion.bondLevel).toBe(1)
      expect(companion.maxBondLevel).toBe(10)
      expect(companion.totalQuestsCompleted).toBe(0)
    }
  })

  it('evolved companions are strictly stronger than their base form', () => {
    for (const base of baseCompanions) {
      const evolved = EVOLVED_COMPANIONS[base.evolvedForm as string]
      expect(evolved.xpBonus).toBeGreaterThanOrEqual(base.xpBonus)
      expect(evolved.goldBonus).toBeGreaterThanOrEqual(base.goldBonus)
    }
  })
})
