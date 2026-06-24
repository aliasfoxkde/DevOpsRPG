// Collectible bonuses and power-ups
export type CollectibleType = 'xp_boost' | 'gold_boost' | 'hint' | 'streak_shield' | 'mystery_box'

export interface Collectible {
  id: string
  type: CollectibleType
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  effect: {
    type: 'xp_multiplier' | 'gold_multiplier' | 'reveal_answer' | 'prevent_streak_loss' | 'mystery_reward'
    value: number
    duration?: number // in minutes, 0 = instant
  }
  expiresAt?: string
  used: boolean
}

export const COLLECTIBLES_POOL: Collectible[] = [
  // XP boosts
  { id: 'xp_small', type: 'xp_boost', name: 'XP Scroll (2x)', description: 'Double XP for your next quest!', icon: '📜', rarity: 'common', effect: { type: 'xp_multiplier', value: 2 }, used: false },
  { id: 'xp_medium', type: 'xp_boost', name: 'XP Tome (3x)', description: 'Triple XP for your next quest!', icon: '📚', rarity: 'rare', effect: { type: 'xp_multiplier', value: 3 }, used: false },
  { id: 'xp_large', type: 'xp_boost', name: 'XP Codex (5x)', description: 'Quintuple XP for your next quest!', icon: '📖', rarity: 'epic', effect: { type: 'xp_multiplier', value: 5 }, used: false },

  // Gold boosts
  { id: 'gold_small', type: 'gold_boost', name: 'Gold Coin', description: 'Double gold for your next quest!', icon: '🪙', rarity: 'common', effect: { type: 'gold_multiplier', value: 2 }, used: false },
  { id: 'gold_medium', type: 'gold_boost', name: 'Gold Chest', description: 'Triple gold for your next quest!', icon: '💰', rarity: 'rare', effect: { type: 'gold_multiplier', value: 3 }, used: false },
  { id: 'gold_large', type: 'gold_boost', name: 'Gold Vault', description: 'Quintuple gold for your next quest!', icon: '🏦', rarity: 'epic', effect: { type: 'gold_multiplier', value: 5 }, used: false },

  // Hint
  { id: 'hint_scroll', type: 'hint', name: 'Hint Scroll', description: 'Reveals the correct answer on a quiz', icon: '💡', rarity: 'common', effect: { type: 'reveal_answer', value: 1 }, used: false },

  // Streak shield
  { id: 'streak_shield', type: 'streak_shield', name: 'Streak Shield', description: 'Protects your streak for one missed day', icon: '🛡️', rarity: 'rare', effect: { type: 'prevent_streak_loss', value: 1 }, used: false },

  // Mystery box
  { id: 'mystery_common', type: 'mystery_box', name: 'Mystery Box', description: 'Contains a random common reward', icon: '🎁', rarity: 'common', effect: { type: 'mystery_reward', value: 1 }, used: false },
  { id: 'mystery_rare', type: 'mystery_box', name: 'Rare Mystery Box', description: 'Contains a random rare reward', icon: '🎁', rarity: 'rare', effect: { type: 'mystery_reward', value: 2 }, used: false },
  { id: 'mystery_epic', type: 'mystery_box', name: 'Epic Mystery Box', description: 'Contains a random epic reward', icon: '✨', rarity: 'epic', effect: { type: 'mystery_reward', value: 3 }, used: false },
]

// Mystery box rewards
export const MYSTERY_REWARDS = [
  { type: 'xp', min: 50, max: 200, icon: '✨' },
  { type: 'gold', min: 25, max: 100, icon: '🪙' },
  { type: 'collectible', id: 'xp_small', icon: '📜' },
  { type: 'collectible', id: 'gold_small', icon: '🪙' },
  { type: 'collectible', id: 'hint_scroll', icon: '💡' },
]

// Daily login rewards
export interface DailyReward {
  day: number
  reward: {
    type: 'xp' | 'gold' | 'collectible' | 'badge'
    value?: number
    collectibleId?: string
    badgeId?: string
  }
  icon: string
  claimed: boolean
}

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, reward: { type: 'xp', value: 50 }, icon: '✨', claimed: false },
  { day: 2, reward: { type: 'gold', value: 25 }, icon: '🪙', claimed: false },
  { day: 3, reward: { type: 'collectible', collectibleId: 'xp_small' }, icon: '📜', claimed: false },
  { day: 4, reward: { type: 'xp', value: 100 }, icon: '💫', claimed: false },
  { day: 5, reward: { type: 'gold', value: 50 }, icon: '💰', claimed: false },
  { day: 6, reward: { type: 'collectible', collectibleId: 'hint_scroll' }, icon: '💡', claimed: false },
  { day: 7, reward: { type: 'collectible', collectibleId: 'xp_medium' }, icon: '📚', claimed: false },
]

// Bonus wheel (spin for rewards)
export interface WheelSegment {
  id: string
  label: string
  icon: string
  reward: {
    type: 'xp' | 'gold' | 'collectible'
    value?: number
    collectibleId?: string
  }
  weight: number // higher = more likely
}

export const WHEEL_SEGMENTS: WheelSegment[] = [
  { id: 'xp_small', label: '50 XP', icon: '✨', reward: { type: 'xp', value: 50 }, weight: 25 },
  { id: 'xp_med', label: '100 XP', icon: '💫', reward: { type: 'xp', value: 100 }, weight: 20 },
  { id: 'gold_small', label: '25 Gold', icon: '🪙', reward: { type: 'gold', value: 25 }, weight: 25 },
  { id: 'gold_med', label: '50 Gold', icon: '💰', reward: { type: 'gold', value: 50 }, weight: 15 },
  { id: 'collectible', label: 'XP Scroll', icon: '📜', reward: { type: 'collectible', collectibleId: 'xp_small' }, weight: 10 },
  { id: 'collectible2', label: 'Hint', icon: '💡', reward: { type: 'collectible', collectibleId: 'hint_scroll' }, weight: 5 },
]

// Spin the wheel
export function spinWheel(): WheelSegment {
  const totalWeight = WHEEL_SEGMENTS.reduce((sum, s) => sum + s.weight, 0)
  let random = Math.random() * totalWeight

  for (const segment of WHEEL_SEGMENTS) {
    random -= segment.weight
    if (random <= 0) {
      return segment
    }
  }

  return WHEEL_SEGMENTS[0]
}

// Get random collectible
export function getRandomCollectible(rarity?: Collectible['rarity']): Collectible {
  const pool = rarity
    ? COLLECTIBLES_POOL.filter(c => c.rarity === rarity)
    : COLLECTIBLES_POOL

  const weights = pool.map(c => {
    switch (c.rarity) {
      case 'common': return 50
      case 'rare': return 30
      case 'epic': return 15
      case 'legendary': return 5
      default: return 10
    }
  })

  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let random = Math.random() * totalWeight

  for (let i = 0; i < pool.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      return { ...pool[i], used: false }
    }
  }

  return { ...pool[0], used: false }
}

// Mystery box opening
export function openMysteryBox(box: Collectible): {
  type: 'xp' | 'gold' | 'collectible'
  value?: number
  collectible?: Collectible
} {
  if (box.type !== 'mystery_box') {
    throw new Error('Not a mystery box')
  }

  const rarityBoost = box.effect.value // 1, 2, or 3 for common, rare, epic
  const availableRewards = MYSTERY_REWARDS.filter(r => {
    if (rarityBoost >= 2) return true // rare+ can get anything
    return r.type === 'xp' || r.type === 'gold'
  })

  const reward = availableRewards[Math.floor(Math.random() * availableRewards.length)]

  if (reward.type === 'collectible' && 'id' in reward) {
    const collectible = COLLECTIBLES_POOL.find(c => c.id === reward.id)
    return { type: 'collectible', collectible }
  }

  // Handle xp/gold rewards
  const variance = Math.random() * 0.4 + 0.8 // 80% to 120%
  const xpReward = reward as { type: string; min: number; max: number; icon: string }
  const rewardMin = xpReward.min ?? 0
  const rewardMax = xpReward.max ?? 0
  const value = Math.floor((rewardMin + (rewardMax - rewardMin) * Math.random()) * variance)

  return { type: reward.type as 'xp' | 'gold', value }
}
