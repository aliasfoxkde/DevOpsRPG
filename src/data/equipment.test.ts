// Behavior tests for the equipment shop catalog and the bonus aggregation the
// character sheet displays. integrity.test.ts does not cover this module.
import { describe, it, expect } from 'vitest'
import {
  EQUIPMENT_ITEMS,
  RARITY_COLORS,
  getEquipmentById,
  calculateEquipmentBonuses,
  type EquipmentItem,
  type EquipmentRarity,
} from './equipment'
import { technologies } from './technologies'

const SLOTS = ['workstation', 'accessory', 'cosmetic', 'special'] as const
const RARITIES = Object.keys(RARITY_COLORS) as EquipmentRarity[]

const TECH_IDS = new Set(Object.keys(technologies))

function item(id: string): EquipmentItem {
  const entry = getEquipmentById(id)
  if (!entry) throw new Error(`equipment ${id} is missing from EQUIPMENT_ITEMS`)
  return entry
}

/** Bonus percentages are stored as fractions (0.05 = +5%). */
function pct(fraction: number): number {
  return Math.round(fraction * 100)
}

describe('EQUIPMENT_ITEMS catalog', () => {
  it('has unique ids that getEquipmentById can resolve', () => {
    const ids = EQUIPMENT_ITEMS.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) {
      expect(getEquipmentById(id)?.id, id).toBe(id)
    }
  })

  it('only uses the four slots and five rarities, all of which have a color', () => {
    for (const entry of EQUIPMENT_ITEMS) {
      expect(SLOTS, `${entry.id} slot`).toContain(entry.slot)
      expect(RARITIES, `${entry.id} rarity`).toContain(entry.rarity)
      expect(RARITY_COLORS[entry.rarity], entry.id).toMatch(/^#[0-9a-f]{6}$/)
    }
    for (const slot of SLOTS) {
      expect(
        EQUIPMENT_ITEMS.some((entry) => entry.slot === slot),
        slot,
      ).toBe(true)
    }
  })

  it('prices every item positively and describes it', () => {
    for (const entry of EQUIPMENT_ITEMS) {
      expect(entry.price, entry.id).toBeGreaterThan(0)
      expect(entry.name.length, entry.id).toBeGreaterThan(0)
      expect(entry.description.length, entry.id).toBeGreaterThan(0)
      expect(entry.icon.length, entry.id).toBeGreaterThan(0)
    }
  })

  it('ramps prices with rarity: each tier starts above the one below it', () => {
    const cheapest: Record<EquipmentRarity, number> = {
      common: Number.POSITIVE_INFINITY,
      uncommon: Number.POSITIVE_INFINITY,
      rare: Number.POSITIVE_INFINITY,
      epic: Number.POSITIVE_INFINITY,
      legendary: Number.POSITIVE_INFINITY,
    }
    for (const entry of EQUIPMENT_ITEMS) {
      cheapest[entry.rarity] = Math.min(cheapest[entry.rarity], entry.price)
    }
    const ladder: EquipmentRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']
    for (let index = 1; index < ladder.length; index += 1) {
      expect(
        cheapest[ladder[index]],
        `cheapest ${ladder[index]} vs cheapest ${ladder[index - 1]}`,
      ).toBeGreaterThan(cheapest[ladder[index - 1]])
    }
    expect(cheapest.common).toBe(50)
    expect(cheapest.legendary).toBe(2000)
  })

  it('keeps bonuses inside a sane percentage band', () => {
    for (const entry of EQUIPMENT_ITEMS) {
      const { bonuses, techBonus } = entry
      for (const fraction of [bonuses.xpBonus, bonuses.goldBonus, bonuses.quizScoreBonus]) {
        if (fraction === undefined) continue
        expect(pct(fraction), entry.id).toBeGreaterThan(0)
        expect(pct(fraction), entry.id).toBeLessThanOrEqual(15)
      }
      if (bonuses.streakProtection !== undefined) {
        expect(bonuses.streakProtection, entry.id).toBeGreaterThanOrEqual(1)
      }
      if (techBonus) {
        expect(pct(techBonus.bonus), entry.id).toBeGreaterThan(0)
        expect(pct(techBonus.bonus), entry.id).toBeLessThanOrEqual(15)
      }
    }
  })

  it('only grants tech bonuses for technologies the catalog knows about', () => {
    // KNOWN GAP (tripwire, not an assertion of correctness): 'linux' is sold as
    // a collectible card in technologyCollection.ts but has no entry in
    // technologies.ts, so Server Rack Miniature and the Linux Penguin Plush
    // advertise +X% Linux XP that can never apply to any quest. Adding a real
    // Linux technology should let this whitelist shrink to [].
    const referenced = [
      ...new Set(
        EQUIPMENT_ITEMS.flatMap((entry) => (entry.techBonus ? [entry.techBonus.technologyId] : [])),
      ),
    ]
    const dangling = referenced.filter((id) => !TECH_IDS.has(id))
    expect(dangling).toEqual(['linux'])
  })

  it('ships the exact loadout for one item per slot', () => {
    expect(item('laptop_basic')).toEqual({
      id: 'laptop_basic',
      name: 'Basic Laptop',
      description: 'A simple laptop for learning on the go',
      icon: '💻',
      slot: 'workstation',
      rarity: 'common',
      price: 200,
      bonuses: { xpBonus: 0.02 },
    })
    expect(item('keyboard_ergonomic').bonuses).toEqual({ xpBonus: 0.05, streakProtection: 1 })
    expect(item('coffee_mug')).toMatchObject({ slot: 'cosmetic', rarity: 'common', price: 50 })
    expect(item('ancient_grimoire')).toMatchObject({
      slot: 'special',
      rarity: 'legendary',
      price: 2000,
      techBonus: { technologyId: 'python', bonus: 0.15 },
    })
  })
})

describe('RARITY_COLORS', () => {
  it('colors all five tiers, gray through gold', () => {
    expect(RARITY_COLORS).toEqual({
      common: '#9ca3af',
      uncommon: '#22c55e',
      rare: '#3b82f6',
      epic: '#a855f7',
      legendary: '#f59e0b',
    })
  })
})

describe('getEquipmentById', () => {
  it('returns the catalog entry itself, not a copy', () => {
    expect(getEquipmentById('dragon_orb')).toBe(EQUIPMENT_ITEMS.find((e) => e.id === 'dragon_orb'))
  })

  it('returns undefined for an unknown id instead of throwing', () => {
    expect(getEquipmentById('nonexistent_item')).toBeUndefined()
    expect(getEquipmentById('')).toBeUndefined()
  })
})

describe('calculateEquipmentBonuses', () => {
  it('returns a zeroed bonus sheet for an empty loadout', () => {
    expect(calculateEquipmentBonuses([])).toEqual({
      xpBonus: 0,
      goldBonus: 0,
      quizScoreBonus: 0,
      streakProtection: 0,
      techBonuses: {},
    })
  })

  it('sums each bonus kind across the equipped set', () => {
    const loadout = [
      item('laptop_pro'), // xp 0.05
      item('noise_cancelling'), // xp 0.05, gold 0.02
      item('dual_monitors'), // quiz 0.10
      item('keyboard_ergonomic'), // xp 0.05, streak 1
    ]
    const totals = calculateEquipmentBonuses(loadout)
    expect(totals.xpBonus).toBeCloseTo(0.15, 10)
    expect(totals.goldBonus).toBeCloseTo(0.02, 10)
    expect(totals.quizScoreBonus).toBeCloseTo(0.1, 10)
    expect(totals.streakProtection).toBe(1)
    expect(totals.techBonuses).toEqual({})
  })

  it('groups tech bonuses per technology', () => {
    const totals = calculateEquipmentBonuses([
      item('cloud_server'), // aws 0.10
      item('notebook'), // aws 0.05
      item('server_rack'), // linux 0.08
    ])
    expect(totals.techBonuses['aws']).toBeCloseTo(0.15, 10)
    expect(totals.techBonuses['linux']).toBeCloseTo(0.08, 10)
    expect(Object.keys(totals.techBonuses).sort()).toEqual(['aws', 'linux'])
    expect(totals.xpBonus).toBe(0)
  })

  it('treats items with empty bonuses as cosmetic', () => {
    expect(item('cloud_server').bonuses).toEqual({})
    const totals = calculateEquipmentBonuses([item('cloud_server')])
    expect(totals.xpBonus).toBe(0)
    expect(totals.techBonuses['aws']).toBeCloseTo(0.1, 10)
  })

  it('aggregates the entire catalog without losing a single bonus', () => {
    const totals = calculateEquipmentBonuses(EQUIPMENT_ITEMS)
    const sum = (pick: (entry: EquipmentItem) => number | undefined) =>
      EQUIPMENT_ITEMS.reduce((total, entry) => total + (pick(entry) ?? 0), 0)
    expect(totals.xpBonus).toBeCloseTo(
      sum((entry) => entry.bonuses.xpBonus),
      10,
    )
    expect(totals.goldBonus).toBeCloseTo(
      sum((entry) => entry.bonuses.goldBonus),
      10,
    )
    expect(totals.quizScoreBonus).toBeCloseTo(
      sum((entry) => entry.bonuses.quizScoreBonus),
      10,
    )
    expect(totals.streakProtection).toBe(
      EQUIPMENT_ITEMS.reduce((total, entry) => total + (entry.bonuses.streakProtection ?? 0), 0),
    )
    expect(Object.keys(totals.techBonuses).sort()).toEqual(['aws', 'linux', 'python'])
  })

  it('never mutates the loadout it is handed', () => {
    const loadout = [item('lucky_charm'), item('desk_plant')]
    const snapshot = [...loadout]
    calculateEquipmentBonuses(loadout)
    expect(loadout).toEqual(snapshot)
    expect(loadout).toHaveLength(2)
  })
})
