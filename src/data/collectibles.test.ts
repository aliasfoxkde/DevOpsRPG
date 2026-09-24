// Behavior tests for collectible drops, the bonus wheel, mystery box rewards,
// and the daily login reward table.
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  COLLECTIBLES_POOL,
  DAILY_REWARDS,
  getRandomCollectible,
  openMysteryBox,
  spinWheel,
} from './collectibles'

const poolById = new Map(COLLECTIBLES_POOL.map((c) => [c.id, c]))

function poolEntry(id: string) {
  const entry = poolById.get(id)
  if (!entry) throw new Error(`collectible ${id} is missing from COLLECTIBLES_POOL`)
  return entry
}

/** Queues Math.random results for a deterministic roll, then falls back to the real RNG. */
function roll(...values: number[]) {
  const spy = vi.spyOn(Math, 'random')
  for (const value of values) spy.mockReturnValueOnce(value)
  return spy
}

describe('COLLECTIBLES_POOL', () => {
  it('has unique ids and a known mystery box tier per rarity', () => {
    const ids = COLLECTIBLES_POOL.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(poolEntry('mystery_common').effect.value).toBe(1)
    expect(poolEntry('mystery_rare').effect.value).toBe(2)
    expect(poolEntry('mystery_epic').effect.value).toBe(3)
  })
})

describe('DAILY_REWARDS', () => {
  it('covers days one to seven in order', () => {
    expect(DAILY_REWARDS.map((r) => r.day)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('only grants collectibles that exist in the pool', () => {
    for (const reward of DAILY_REWARDS) {
      if (!reward.reward.collectibleId) continue
      expect(poolById.has(reward.reward.collectibleId), `${reward.day} collectible`).toBe(true)
    }
  })

  it('keeps the documented xp and gold values', () => {
    expect(DAILY_REWARDS.filter((r) => r.reward.type === 'xp').map((r) => r.reward.value)).toEqual([
      50, 100,
    ])
    expect(
      DAILY_REWARDS.filter((r) => r.reward.type === 'gold').map((r) => r.reward.value),
    ).toEqual([25, 50])
  })
})

describe('spinWheel', () => {
  const segmentIds = ['xp_small', 'xp_med', 'gold_small', 'gold_med', 'collectible', 'collectible2']

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lands on the first segment when the roll is zero', () => {
    roll(0)
    expect(spinWheel()).toEqual({
      id: 'xp_small',
      label: '50 XP',
      icon: '✨',
      reward: { type: 'xp', value: 50 },
      weight: 25,
    })
  })

  it('lands on the last segment when the roll is nearly one', () => {
    roll(0.999999)
    expect(spinWheel()).toEqual({
      id: 'collectible2',
      label: 'Hint',
      icon: '💡',
      reward: { type: 'collectible', collectibleId: 'hint_scroll' },
      weight: 5,
    })
  })

  it('walks the weights in order', () => {
    roll(0.3)
    expect(spinWheel().id).toBe('xp_med')
  })

  it('always returns a weighted segment with a valid reward', () => {
    for (let i = 0; i < 20; i++) {
      const segment = spinWheel()
      expect(segmentIds).toContain(segment.id)
      expect(segment.weight).toBeGreaterThan(0)
      if (segment.reward.type === 'collectible') {
        expect(poolById.has(segment.reward.collectibleId ?? '')).toBe(true)
      } else {
        expect(segment.reward.value).toBeGreaterThan(0)
      }
    }
  })
})

describe('getRandomCollectible', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a fresh unused copy of the first pool entry on a zero roll', () => {
    roll(0)
    const collectible = getRandomCollectible()
    expect(collectible).toEqual({ ...poolEntry('xp_small'), used: false })
    expect(collectible).not.toBe(poolEntry('xp_small'))
  })

  it('picks the last item of a rarity pool on a near-one roll', () => {
    roll(0.999999)
    expect(getRandomCollectible('epic')).toEqual({ ...poolEntry('mystery_epic'), used: false })
  })

  it('respects the rarity filter', () => {
    roll(0)
    expect(getRandomCollectible('rare')).toEqual({ ...poolEntry('xp_medium'), used: false })
  })

  it('only returns collectibles of the requested rarity', () => {
    for (let i = 0; i < 20; i++) {
      expect(getRandomCollectible('common').rarity).toBe('common')
    }
  })
})

describe('openMysteryBox', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects collectibles that are not mystery boxes', () => {
    expect(() => openMysteryBox(poolEntry('xp_small'))).toThrow('Not a mystery box')
  })

  it('keeps common boxes on the xp/gold reward track', () => {
    roll(0, 0.99, 0.99)
    // Reward index 0 (xp), variance 0.99 * 0.4 + 0.8, roll 0.99 within 50..200.
    expect(openMysteryBox(poolEntry('mystery_common'))).toEqual({ type: 'xp', value: 237 })
  })

  it('rolls gold rewards from the low end of the range', () => {
    roll(0.75, 0.9, 0.5)
    // Reward index 1 (gold), variance 0.9 * 0.4 + 0.8, roll 0.5 within 25..100.
    expect(openMysteryBox(poolEntry('mystery_common'))).toEqual({ type: 'gold', value: 72 })
  })

  it('lets rare boxes drop collectibles', () => {
    roll(0.4)
    const reward = openMysteryBox(poolEntry('mystery_rare'))
    expect(reward.type).toBe('collectible')
    expect(reward.collectible).toEqual(poolEntry('xp_small'))
  })

  it('lets epic boxes drop the last reward in the table', () => {
    roll(0.999999)
    const reward = openMysteryBox(poolEntry('mystery_epic'))
    expect(reward.collectible).toEqual(poolEntry('hint_scroll'))
  })

  it('stays inside the reward ranges without a rigged roll', () => {
    const common = openMysteryBox(poolEntry('mystery_common'))
    if (common.type === 'xp') {
      expect(common.value).toBeGreaterThanOrEqual(40)
      expect(common.value).toBeLessThanOrEqual(240)
    } else {
      expect(common.type).toBe('gold')
      expect(common.value).toBeGreaterThanOrEqual(20)
      expect(common.value).toBeLessThanOrEqual(120)
    }
    const epic = openMysteryBox(poolEntry('mystery_epic'))
    if (epic.type === 'collectible') {
      expect(poolById.has(epic.collectible?.id ?? '')).toBe(true)
    }
  })
})
