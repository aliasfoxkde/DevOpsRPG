import { describe, expect, it } from 'vitest'
import { XP_PER_LEVEL } from '../../utils/gameUtils'
import { calculateLevel, calculateXpToNextLevel, getTitle } from './xp'

// The character curve is linear and unbounded (XP_PER_LEVEL per level) while
// gameUtils' XP_THRESHOLDS curve caps at level 11 — these tests pin the linear
// contract so the two curves cannot silently merge (see the module comment).
describe('xp (character level curve)', () => {
  it('starts every character at level 1 with 0 XP', () => {
    expect(calculateLevel(0)).toBe(1)
  })

  it('crosses a level exactly at each XP_PER_LEVEL boundary', () => {
    expect(calculateLevel(XP_PER_LEVEL - 1)).toBe(1)
    expect(calculateLevel(XP_PER_LEVEL)).toBe(2)
    expect(calculateLevel(XP_PER_LEVEL * 2)).toBe(3)
    expect(calculateLevel(XP_PER_LEVEL * 10 + 5)).toBe(11)
  })

  it('never caps — the curve is unbounded', () => {
    expect(calculateLevel(XP_PER_LEVEL * 99)).toBe(100)
  })

  it('computes the XP requirement for a level as level * XP_PER_LEVEL', () => {
    expect(calculateXpToNextLevel(1)).toBe(XP_PER_LEVEL)
    expect(calculateXpToNextLevel(7)).toBe(XP_PER_LEVEL * 7)
  })

  it('walks the title ladder at its exact boundaries', () => {
    expect(getTitle(1)).toBe('DevOps Apprentice')
    expect(getTitle(5)).toBe('DevOps Apprentice')
    expect(getTitle(6)).toBe('DevOps Journeyman')
    expect(getTitle(10)).toBe('DevOps Journeyman')
    expect(getTitle(11)).toBe('DevOps Expert')
    expect(getTitle(15)).toBe('DevOps Expert')
    expect(getTitle(16)).toBe('DevOps Master')
    expect(getTitle(20)).toBe('DevOps Master')
    expect(getTitle(21)).toBe('DevOps Sage')
    expect(getTitle(40)).toBe('DevOps Sage')
  })
})
