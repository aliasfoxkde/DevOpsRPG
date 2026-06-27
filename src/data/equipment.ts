// Equipment system - non-combat items that provide gameplay bonuses
// Per BRAINSTORM.md: Keep simple. Not combat gear. Use: Laptop, Keyboard, Monitor, Backpack, Coffee Mug, Server Rack

export type EquipmentSlot = 'workstation' | 'accessory' | 'cosmetic' | 'special'
export type EquipmentRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface EquipmentItem {
  id: string
  name: string
  description: string
  icon: string
  slot: EquipmentSlot
  rarity: EquipmentRarity
  price: number
  bonuses: {
    xpBonus?: number      // e.g., 0.05 = +5% XP
    goldBonus?: number     // e.g., 0.05 = +5% Gold
    quizScoreBonus?: number // e.g., 0.1 = +10% quiz score
    streakProtection?: number // e.g., 1 = protects 1 day
  }
  // techBonus applies XP bonus to specific technology/skill
  techBonus?: {
    technologyId: string
    bonus: number // e.g., 0.05 = +5% XP for this tech
  }
}

export const EQUIPMENT_ITEMS: EquipmentItem[] = [
  // Workstations
  {
    id: 'laptop_basic',
    name: 'Basic Laptop',
    description: 'A simple laptop for learning on the go',
    icon: '💻',
    slot: 'workstation',
    rarity: 'common',
    price: 200,
    bonuses: { xpBonus: 0.02 },
  },
  {
    id: 'laptop_pro',
    name: 'Pro Developer Laptop',
    description: 'A powerful laptop for serious developers',
    icon: '💻',
    slot: 'workstation',
    rarity: 'rare',
    price: 500,
    bonuses: { xpBonus: 0.05 },
  },
  {
    id: 'workstation_setup',
    name: 'Ultimate Workstation',
    description: 'A complete development environment',
    icon: '🖥️',
    slot: 'workstation',
    rarity: 'epic',
    price: 1000,
    bonuses: { xpBonus: 0.08, goldBonus: 0.03 },
  },
  {
    id: 'cloud_server',
    name: 'Cloud Server Instance',
    description: 'Rent compute power in the cloud',
    icon: '☁️',
    slot: 'workstation',
    rarity: 'rare',
    price: 600,
    bonuses: {},
    techBonus: { technologyId: 'aws', bonus: 0.10 },
  },
  {
    id: 'server_rack',
    name: 'Server Rack Miniature',
    description: 'A desktop replica of enterprise infrastructure',
    icon: '🗄️',
    slot: 'workstation',
    rarity: 'rare',
    price: 450,
    bonuses: {},
    techBonus: { technologyId: 'linux', bonus: 0.08 },
  },

  // Accessories
  {
    id: 'keyboard_basic',
    name: 'Mechanical Keyboard',
    description: 'A satisfying mechanical keyboard for coding',
    icon: '⌨️',
    slot: 'accessory',
    rarity: 'common',
    price: 150,
    bonuses: { xpBonus: 0.03 },
  },
  {
    id: 'keyboard_ergonomic',
    name: 'Ergonomic Keyboard',
    description: 'Comfortable typing for long study sessions',
    icon: '⌨️',
    slot: 'accessory',
    rarity: 'uncommon',
    price: 300,
    bonuses: { xpBonus: 0.05, streakProtection: 1 },
  },
  {
    id: 'dual_monitors',
    name: 'Dual Monitor Setup',
    description: 'Double your screen real estate',
    icon: '🖥️',
    slot: 'accessory',
    rarity: 'uncommon',
    price: 400,
    bonuses: { quizScoreBonus: 0.10 },
  },
  {
    id: 'noise_cancelling',
    name: 'Noise-Cancelling Headphones',
    description: 'Focus without distractions',
    icon: '🎧',
    slot: 'accessory',
    rarity: 'rare',
    price: 350,
    bonuses: { xpBonus: 0.05, goldBonus: 0.02 },
  },
  {
    id: 'gaming_mouse',
    name: 'Precision Mouse',
    description: 'A high-DPI mouse for precise navigation',
    icon: '🖱️',
    slot: 'accessory',
    rarity: 'uncommon',
    price: 200,
    bonuses: { xpBonus: 0.03 },
  },

  // Cosmetic
  {
    id: 'notebook',
    name: 'Cloud Architect Notebook',
    description: 'A notebook for architecture diagrams',
    icon: '📓',
    slot: 'cosmetic',
    rarity: 'uncommon',
    price: 100,
    bonuses: {},
    techBonus: { technologyId: 'aws', bonus: 0.05 },
  },
  {
    id: 'coffee_mug',
    name: 'Developer Coffee Mug',
    description: 'Fuel your coding sessions',
    icon: '☕',
    slot: 'cosmetic',
    rarity: 'common',
    price: 50,
    bonuses: { streakProtection: 1 },
  },
  {
    id: 'linux_penguin_plush',
    name: 'Linux Penguin Plush',
    description: 'A cuddly companion for your desk',
    icon: '🐧',
    slot: 'cosmetic',
    rarity: 'rare',
    price: 250,
    bonuses: {},
    techBonus: { technologyId: 'linux', bonus: 0.05 },
  },
  {
    id: 'backpack',
    name: 'Developer Backpack',
    description: 'Carry your gear in style',
    icon: '🎒',
    slot: 'cosmetic',
    rarity: 'common',
    price: 120,
    bonuses: { goldBonus: 0.02 },
  },
  {
    id: 'desk_plant',
    name: 'Desk Plant',
    description: 'A touch of nature for your workspace',
    icon: '🌱',
    slot: 'cosmetic',
    rarity: 'common',
    price: 80,
    bonuses: { xpBonus: 0.01 },
  },

  // Special
  {
    id: 'lucky_charm',
    name: 'Lucky Charm',
    description: 'A mysterious artifact that brings luck',
    icon: '🍀',
    slot: 'special',
    rarity: 'epic',
    price: 800,
    bonuses: { goldBonus: 0.10, xpBonus: 0.05 },
  },
  {
    id: 'ancient_grimoire',
    name: 'Ancient Code Grimoire',
    description: 'Contains secrets of legendary programmers',
    icon: '📚',
    slot: 'special',
    rarity: 'legendary',
    price: 2000,
    bonuses: {},
    techBonus: { technologyId: 'python', bonus: 0.15 },
  },
  {
    id: 'dragon_orb',
    name: 'Knowledge Dragon Orb',
    description: 'Amplifies learning through visual guidance',
    icon: '🔮',
    slot: 'special',
    rarity: 'legendary',
    price: 2500,
    bonuses: { xpBonus: 0.15, quizScoreBonus: 0.15 },
  },
]

// Get equipment by rarity color
export const RARITY_COLORS: Record<EquipmentRarity, string> = {
  common: '#9ca3af',    // Gray
  uncommon: '#22c55e',  // Green
  rare: '#3b82f6',      // Blue
  epic: '#a855f7',      // Purple
  legendary: '#f59e0b', // Gold
}

// Get all equipment in a specific slot
export function getEquipmentBySlot(slot: EquipmentSlot): EquipmentItem[] {
  return EQUIPMENT_ITEMS.filter(item => item.slot === slot)
}

// Get equipment by ID
export function getEquipmentById(id: string): EquipmentItem | undefined {
  return EQUIPMENT_ITEMS.find(item => item.id === id)
}

// Calculate total bonuses from equipped items
export function calculateEquipmentBonuses(equippedItems: EquipmentItem[]): {
  xpBonus: number
  goldBonus: number
  quizScoreBonus: number
  streakProtection: number
  techBonuses: Record<string, number>
} {
  const bonuses = {
    xpBonus: 0,
    goldBonus: 0,
    quizScoreBonus: 0,
    streakProtection: 0,
    techBonuses: {} as Record<string, number>,
  }

  for (const item of equippedItems) {
    if (item.bonuses.xpBonus) bonuses.xpBonus += item.bonuses.xpBonus
    if (item.bonuses.goldBonus) bonuses.goldBonus += item.bonuses.goldBonus
    if (item.bonuses.quizScoreBonus) bonuses.quizScoreBonus += item.bonuses.quizScoreBonus
    if (item.bonuses.streakProtection) bonuses.streakProtection += item.bonuses.streakProtection
    if (item.techBonus) {
      bonuses.techBonuses[item.techBonus.technologyId] =
        (bonuses.techBonuses[item.techBonus.technologyId] || 0) + item.techBonus.bonus
    }
  }

  return bonuses
}
