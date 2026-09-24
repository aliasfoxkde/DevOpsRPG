// Companion data models: the base companions purchasable in the store and the
// evolved forms they become at max bond. The store's `buy_companion_*` item ids
// map onto COMPANIONS_DATA keys in GameContext.purchaseItem.

export interface Companion {
  id: string
  name: string
  icon: string
  xpBonus: number
  goldBonus: number
  specialAbility?: string
  bondLevel: number // 1-10 bond level
  totalQuestsCompleted: number // Total quests completed with this companion
  evolvedForm?: string // ID of evolved form companion
  maxBondLevel: number // Level at which evolution triggers
}

export const EVOLVED_COMPANIONS: Record<string, Companion> = {
  owl_elder: {
    id: 'owl_elder',
    name: 'Elder Owl',
    icon: '🦉',
    xpBonus: 0.1,
    goldBonus: 0.05,
    specialAbility: 'Wisdom: +10% XP permanently',
    bondLevel: 1,
    totalQuestsCompleted: 0,
    maxBondLevel: 10,
  },
  cat_shadow: {
    id: 'cat_shadow',
    name: 'Shadow Cat',
    icon: '🐱',
    xpBonus: 0.05,
    goldBonus: 0.12,
    specialAbility: 'Lucky: +12% Gold permanently',
    bondLevel: 1,
    totalQuestsCompleted: 0,
    maxBondLevel: 10,
  },
  dragon_elder: {
    id: 'dragon_elder',
    name: 'Elder Dragon',
    icon: '🐲',
    xpBonus: 0.2,
    goldBonus: 0.2,
    specialAbility: 'Fire Breath: +20% XP & Gold permanently',
    bondLevel: 1,
    totalQuestsCompleted: 0,
    maxBondLevel: 10,
  },
  phoenix_legendary: {
    id: 'phoenix_legendary',
    name: 'Legendary Phoenix',
    icon: '🔥',
    xpBonus: 0.3,
    goldBonus: 0.2,
    specialAbility: 'Rebirth: Weekly Streak Shield + 2x XP on streak days',
    bondLevel: 1,
    totalQuestsCompleted: 0,
    maxBondLevel: 10,
  },
}

export const COMPANIONS_DATA: Record<string, Companion> = {
  owl: {
    id: 'owl',
    name: 'Wise Owl',
    icon: '🦉',
    xpBonus: 0.05,
    goldBonus: 0,
    bondLevel: 1,
    totalQuestsCompleted: 0,
    evolvedForm: 'owl_elder',
    maxBondLevel: 10,
  },
  cat: {
    id: 'cat',
    name: 'Lucky Cat',
    icon: '🐱',
    xpBonus: 0,
    goldBonus: 0.05,
    bondLevel: 1,
    totalQuestsCompleted: 0,
    evolvedForm: 'cat_shadow',
    maxBondLevel: 10,
  },
  dragon: {
    id: 'dragon',
    name: 'Baby Dragon',
    icon: '🐲',
    xpBonus: 0.1,
    goldBonus: 0.1,
    bondLevel: 1,
    totalQuestsCompleted: 0,
    evolvedForm: 'dragon_elder',
    maxBondLevel: 10,
  },
  phoenix: {
    id: 'phoenix',
    name: 'Phoenix',
    icon: '🦅',
    xpBonus: 0.2,
    goldBonus: 0.1,
    specialAbility: 'Weekly Streak Shield',
    bondLevel: 1,
    totalQuestsCompleted: 0,
    evolvedForm: 'phoenix_legendary',
    maxBondLevel: 10,
  },
}
