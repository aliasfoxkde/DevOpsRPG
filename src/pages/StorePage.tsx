import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { EQUIPMENT_ITEMS, type EquipmentItem } from '../data/equipment'

// Shop item definition
interface ShopItem {
  id: string
  name: string
  description: string
  icon: string
  price: number
  category: 'powerup' | 'utility' | 'cosmetics' | 'companion' | 'equipment'
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  effect?: string
  maxPurchases?: number
  // For equipment items
  equipmentData?: EquipmentItem
}

// Convert equipment items to shop items
const EQUIPMENT_SHOP_ITEMS: ShopItem[] = EQUIPMENT_ITEMS.map(item => ({
  id: `buy_equipment_${item.id}`,
  name: item.name,
  description: item.description,
  icon: item.icon,
  price: item.price,
  category: 'equipment' as const,
  rarity: item.rarity,
  effect: item.bonuses.xpBonus ? `+${Math.round(item.bonuses.xpBonus * 100)}% XP` :
          item.bonuses.goldBonus ? `+${Math.round(item.bonuses.goldBonus * 100)}% Gold` :
          item.techBonus ? `+${Math.round(item.techBonus.bonus * 100)}% ${item.techBonus.technologyId.toUpperCase()} XP` :
          item.bonuses.quizScoreBonus ? `+${Math.round(item.bonuses.quizScoreBonus * 100)}% Quiz Score` : 'Special',
  equipmentData: item,
}))

// Available shop items
const SHOP_ITEMS: ShopItem[] = [
  // Powerups
  { id: 'buy_xp_small', name: 'XP Scroll', description: 'Double XP for your next quest', icon: '📜', price: 50, category: 'powerup', rarity: 'common', effect: '2x XP' },
  { id: 'buy_xp_medium', name: 'XP Tome', description: 'Triple XP for your next quest', icon: '📚', price: 120, category: 'powerup', rarity: 'rare', effect: '3x XP' },
  { id: 'buy_xp_large', name: 'XP Codex', description: 'Quintuple XP for your next quest', icon: '📖', price: 250, category: 'powerup', rarity: 'epic', effect: '5x XP' },
  { id: 'buy_gold_small', name: 'Gold Coin', description: 'Double gold for your next quest', icon: '🪙', price: 40, category: 'powerup', rarity: 'common', effect: '2x Gold' },
  { id: 'buy_gold_medium', name: 'Gold Chest', description: 'Triple gold for your next quest', icon: '💰', price: 100, category: 'powerup', rarity: 'rare', effect: '3x Gold' },
  { id: 'buy_gold_large', name: 'Gold Vault', description: 'Quintuple gold for your next quest', icon: '🏦', price: 200, category: 'powerup', rarity: 'epic', effect: '5x Gold' },

  // Utility
  { id: 'buy_hint', name: 'Hint Scroll', description: 'Reveals the correct answer on a quiz', icon: '💡', price: 75, category: 'utility', rarity: 'common', effect: '1 Hint' },
  { id: 'buy_streak_shield', name: 'Streak Shield', description: 'Protects your streak for one missed day', icon: '🛡️', price: 150, category: 'utility', rarity: 'rare', effect: '+1 Shield' },
  { id: 'buy_retry_pass', name: 'Retry Pass', description: 'Retake a quest without penalty', icon: '🔄', price: 100, category: 'utility', rarity: 'common', effect: '1 Retry' },

  // Mystery Boxes
  { id: 'buy_mystery_common', name: 'Mystery Box', description: 'Contains a random common reward', icon: '🎁', price: 80, category: 'utility', rarity: 'common' },
  { id: 'buy_mystery_rare', name: 'Rare Mystery Box', description: 'Contains a random rare reward', icon: '✨', price: 200, category: 'utility', rarity: 'rare' },
  { id: 'buy_mystery_epic', name: 'Epic Mystery Box', description: 'Contains a random epic reward', icon: '💫', price: 400, category: 'utility', rarity: 'epic' },

  // Cosmetics - Avatars
  { id: 'buy_avatar_knight', name: 'Knight Avatar', description: 'A brave knight avatar', icon: '🛡️', price: 300, category: 'cosmetics', rarity: 'rare' },
  { id: 'buy_avatar_wizard', name: 'Wizard Avatar', description: 'A wise wizard avatar', icon: '🧙', price: 300, category: 'cosmetics', rarity: 'rare' },
  { id: 'buy_avatar_ninja', name: 'Ninja Avatar', description: 'A stealthy ninja avatar', icon: '🥷', price: 500, category: 'cosmetics', rarity: 'epic' },
  { id: 'buy_avatar_dragon', name: 'Dragon Tamer', description: 'A dragon tamer avatar', icon: '🐉', price: 1000, category: 'cosmetics', rarity: 'legendary' },

  // Companions
  { id: 'buy_companion_owl', name: 'Wise Owl', description: 'A companion that provides hints and bonuses', icon: '🦉', price: 500, category: 'companion', rarity: 'rare', effect: '+5% XP' },
  { id: 'buy_companion_cat', name: 'Lucky Cat', description: 'A companion that brings good fortune', icon: '🐱', price: 500, category: 'companion', rarity: 'rare', effect: '+5% Gold' },
  { id: 'buy_companion_dragon', name: 'Baby Dragon', description: 'A loyal dragon companion', icon: '🐲', price: 1000, category: 'companion', rarity: 'epic', effect: '+10% XP & Gold' },
  { id: 'buy_companion_phoenix', name: 'Phoenix', description: 'A legendary companion of rebirth', icon: '🦅', price: 2500, category: 'companion', rarity: 'legendary', effect: '+20% XP, +10% Gold, +1 Streak Shield/week' },
]

// Companions data
export interface Companion {
  id: string
  name: string
  icon: string
  xpBonus: number
  goldBonus: number
  specialAbility?: string
}

export const COMPANIONS: Companion[] = [
  { id: 'owl', name: 'Wise Owl', icon: '🦉', xpBonus: 0.05, goldBonus: 0 },
  { id: 'cat', name: 'Lucky Cat', icon: '🐱', xpBonus: 0, goldBonus: 0.05 },
  { id: 'dragon', name: 'Baby Dragon', icon: '🐲', xpBonus: 0.10, goldBonus: 0.10 },
  { id: 'phoenix', name: 'Phoenix', icon: '🦅', xpBonus: 0.20, goldBonus: 0.10, specialAbility: 'Weekly Streak Shield' },
]

const CATEGORIES = [
  { id: 'all', name: 'All Items', icon: '🏪' },
  { id: 'powerup', name: 'Power-Ups', icon: '⚡' },
  { id: 'utility', name: 'Utilities', icon: '🔧' },
  { id: 'cosmetics', name: 'Cosmetics', icon: '👕' },
  { id: 'companion', name: 'Companions', icon: '🐾' },
  { id: 'equipment', name: 'Equipment', icon: '⚙️' },
]

export default function StorePage() {
  const { game, purchaseItem, equipItem, equipCompanion } = useGame()
  const { character, activeCompanion } = game
  const [category, setCategory] = useState('all')
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null)

  // Get all items including equipment
  const getAllItems = (): ShopItem[] => {
    if (category === 'equipment') {
      return EQUIPMENT_SHOP_ITEMS
    }
    if (category === 'all') {
      return [...SHOP_ITEMS, ...EQUIPMENT_SHOP_ITEMS]
    }
    return SHOP_ITEMS.filter(item => item.category === category)
  }

  const filteredItems = getAllItems()

  const handlePurchase = (item: ShopItem) => {
    if (character.gold < item.price) {
      setPurchaseMessage(`Not enough gold! Need ${item.price} gold.`)
      return
    }

    // Handle equipment purchase
    if (item.category === 'equipment' && item.equipmentData) {
      // Check if already owned
      if (character.equippedItems.includes(item.equipmentData.id)) {
        setPurchaseMessage(`You already own ${item.name}!`)
        return
      }
      // Deduct gold and equip
      purchaseItem(item.id, item.price)
      equipItem(item.equipmentData.id)
      setPurchaseMessage(`Purchased and equipped ${item.name}!`)
      setTimeout(() => setPurchaseMessage(null), 3000)
      return
    }

    const success = purchaseItem(item.id, item.price)
    if (success) {
      setPurchaseMessage(`Purchased ${item.name}!`)
      setTimeout(() => setPurchaseMessage(null), 3000)
    }
  }

  const getRarityBg = (rarity?: string) => {
    switch (rarity) {
      case 'common': return 'from-slate-700 to-slate-800'
      case 'uncommon': return 'from-green-900/50 to-slate-800'
      case 'rare': return 'from-blue-900/50 to-slate-800'
      case 'epic': return 'from-purple-900/50 to-slate-800'
      case 'legendary': return 'from-amber-900/50 to-slate-800'
      default: return 'from-slate-700 to-slate-800'
    }
  }

  const getRarityBorder = (rarity?: string) => {
    switch (rarity) {
      case 'common': return 'border-slate-500'
      case 'uncommon': return 'border-green-600'
      case 'rare': return 'border-blue-600'
      case 'epic': return 'border-purple-600'
      case 'legendary': return 'border-amber-600'
      default: return 'border-slate-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-400 mb-2">🏪 Quest Shop</h1>
          <p className="text-slate-400">Spend your hard-earned gold on powerful items!</p>
        </div>

        {/* Gold Balance */}
        <div className="bg-slate-800/80 rounded-xl border border-amber-600/30 p-4 mb-8 text-center">
          <span className="text-yellow-400 text-3xl font-bold">💰 {character.gold}</span>
          <span className="text-slate-400 ml-2">Gold Available</span>
        </div>

        {/* Purchase Message */}
        {purchaseMessage && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-amber-600 text-white px-6 py-3 rounded-lg shadow-xl animate-bounce">
            {purchaseMessage}
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat.id
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Active Companion */}
        {activeCompanion && (
          <div className="bg-gradient-to-r from-purple-900/30 to-slate-800/50 rounded-xl border border-purple-600/30 p-4 mb-8">
            <h3 className="text-purple-400 font-bold mb-2">🐾 Active Companion</h3>
            <div className="flex items-center gap-4">
              <span className="text-4xl">{activeCompanion.icon}</span>
              <div className="flex-1">
                <div className="text-white font-bold">{activeCompanion.name}</div>
                <div className="text-slate-400 text-sm">
                  +{Math.round(activeCompanion.xpBonus * 100)}% XP • +{Math.round(activeCompanion.goldBonus * 100)}% Gold
                  {activeCompanion.specialAbility && ` • ${activeCompanion.specialAbility}`}
                </div>
                {/* Bond Level */}
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-pink-400">Bond Lv.{activeCompanion.bondLevel}</span>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden max-w-[120px]">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all"
                        style={{ width: `${(activeCompanion.bondLevel / activeCompanion.maxBondLevel) * 100}%` }}
                      />
                    </div>
                    <span className="text-slate-500">{activeCompanion.bondLevel}/{activeCompanion.maxBondLevel}</span>
                  </div>
                  {activeCompanion.evolvedForm && !activeCompanion.id.includes('_') && (
                    <div className="text-xs text-slate-500 mt-1">
                      ✨ Evolves at bond level {activeCompanion.maxBondLevel}
                    </div>
                  )}
                  {activeCompanion.totalQuestsCompleted > 0 && (
                    <div className="text-xs text-slate-500 mt-1">
                      Quests together: {activeCompanion.totalQuestsCompleted}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shop Items Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const canAfford = character.gold >= item.price
            const bgClass = getRarityBg(item.rarity)
            const borderClass = getRarityBorder(item.rarity)
            const isEquipment = item.category === 'equipment'
            const isOwned = isEquipment && character.equippedItems.includes(item.equipmentData?.id || '')
            const isAlreadyPurchased = item.category === 'companion' && game.companions.some(c => c.id === `buy_companion_${item.id.replace('buy_companion_', '')}`)

            return (
              <div
                key={item.id}
                className={`bg-gradient-to-br ${bgClass} rounded-xl border ${borderClass} overflow-hidden transition-all hover:scale-105 ${isOwned || isAlreadyPurchased ? 'opacity-60' : ''}`}
              >
                {/* Header */}
                <div className="p-4 text-center border-b border-slate-700/50">
                  <span className="text-5xl mb-2 block">{item.icon}</span>
                  <h3 className="text-white font-bold">{item.name}</h3>
                  {item.rarity && (
                    <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${
                      item.rarity === 'legendary' ? 'bg-amber-600/30 text-amber-400' :
                      item.rarity === 'epic' ? 'bg-purple-600/30 text-purple-400' :
                      item.rarity === 'rare' ? 'bg-blue-600/30 text-blue-400' :
                      item.rarity === 'uncommon' ? 'bg-green-600/30 text-green-400' :
                      'bg-slate-600/30 text-slate-400'
                    }`}>
                      {item.rarity.toUpperCase()}
                    </span>
                  )}
                  {isEquipment && (
                    <span className="text-xs px-2 py-0.5 rounded mt-1 ml-1 inline-block bg-slate-600/30 text-slate-300">
                      {item.equipmentData?.slot.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-slate-300 text-sm mb-3 text-center">{item.description}</p>

                  {item.effect && (
                    <div className="text-center text-amber-400 text-sm mb-3">
                      {item.effect}
                    </div>
                  )}

                  {/* Price & Buy */}
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400 font-bold">💰 {item.price}</span>
                    {isOwned ? (
                      <span className="px-3 py-1 bg-green-600/30 text-green-400 text-sm rounded">Owned</span>
                    ) : isAlreadyPurchased ? (
                      <span className="px-3 py-1 bg-green-600/30 text-green-400 text-sm rounded">Purchased</span>
                    ) : item.category === 'companion' ? (
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={!canAfford}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          canAfford
                            ? 'bg-purple-600 hover:bg-purple-500 text-white'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Buy & Equip' : 'Need Gold'}
                      </button>
                    ) : isEquipment ? (
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={!canAfford}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          canAfford
                            ? 'bg-amber-600 hover:bg-amber-500 text-white'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Buy & Equip' : 'Need Gold'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={!canAfford}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          canAfford
                            ? 'bg-amber-600 hover:bg-amber-500 text-white'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Buy' : 'Need Gold'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Inventory Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-amber-400 mb-6 text-center">🎒 Your Inventory</h2>

          {/* Collectibles */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 mb-4">
            <h3 className="text-slate-300 font-bold mb-3">⚡ Power-Ups & Items</h3>
            {game.collectibles.filter(c => !c.used).length === 0 ? (
              <p className="text-slate-500 text-sm">No items in inventory. Purchase some from the shop!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {game.collectibles.filter(c => !c.used).map((item, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded-lg border ${
                      item.rarity === 'epic' ? 'bg-purple-900/30 border-purple-600' :
                      item.rarity === 'rare' ? 'bg-blue-900/30 border-blue-600' :
                      'bg-slate-700 border-slate-600'
                    }`}
                  >
                    <span className="text-xl mr-2">{item.icon}</span>
                    <span className="text-slate-200 text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Companions */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
            <h3 className="text-slate-300 font-bold mb-3">🐾 Companions</h3>
            {game.companions && game.companions.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {game.companions.map((comp: Companion) => (
                  <div
                    key={comp.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                      activeCompanion?.id === comp.id
                        ? 'bg-purple-900/30 border-purple-500'
                        : 'bg-slate-700 border-slate-600'
                    }`}
                  >
                    <span className="text-3xl">{comp.icon}</span>
                    <div>
                      <div className="text-white font-bold">{comp.name}</div>
                      <div className="text-slate-400 text-xs">
                        +{Math.round(comp.xpBonus * 100)}% XP • +{Math.round(comp.goldBonus * 100)}% Gold
                      </div>
                    </div>
                    {activeCompanion?.id !== comp.id && (
                      <button
                        onClick={() => equipCompanion(comp.id)}
                        className="ml-2 px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded"
                      >
                        Equip
                      </button>
                    )}
                    {activeCompanion?.id === comp.id && (
                      <span className="ml-2 px-2 py-1 bg-purple-600 text-white text-xs rounded">Active</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No companions yet. Purchase one from the shop!</p>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
