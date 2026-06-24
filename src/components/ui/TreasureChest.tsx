import { useState } from 'react'

interface LootDrop {
  type: 'xp' | 'gold' | 'badge' | 'collectible' | 'streak'
  value: number
  name: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  icon: string
}

const lootTables = {
  common: [
    { type: 'xp', value: 10, name: '+10 XP', rarity: 'common', icon: '✨' },
    { type: 'xp', value: 25, name: '+25 XP', rarity: 'common', icon: '✨' },
    { type: 'gold', value: 10, name: '+10 Gold', rarity: 'common', icon: '🪙' },
  ],
  rare: [
    { type: 'xp', value: 50, name: '+50 XP', rarity: 'rare', icon: '💫' },
    { type: 'gold', value: 25, name: '+25 Gold', rarity: 'rare', icon: '💰' },
    { type: 'streak', value: 1, name: '+1 Day Streak', rarity: 'rare', icon: '🔥' },
  ],
  epic: [
    { type: 'xp', value: 100, name: '+100 XP', rarity: 'epic', icon: '🌟' },
    { type: 'gold', value: 75, name: '+75 Gold', rarity: 'epic', icon: '👑' },
    { type: 'collectible', value: 1, name: 'Random Collectible', rarity: 'epic', icon: '🎁' },
  ],
  legendary: [
    { type: 'xp', value: 200, name: '+200 XP', rarity: 'legendary', icon: '💎' },
    { type: 'badge', value: 1, name: 'Rare Badge', rarity: 'legendary', icon: '🏆' },
    { type: 'collectible', value: 1, name: 'Legendary Loot!', rarity: 'legendary', icon: '🔮' },
  ],
}

const rarityColors = {
  common: 'from-slate-500 to-slate-600 border-slate-400',
  rare: 'from-blue-500 to-blue-600 border-blue-400',
  epic: 'from-purple-500 to-purple-600 border-purple-400',
  legendary: 'from-amber-500 to-orange-600 border-amber-400 animate-pulse',
}

function getRandomLoot(questDifficulty: number = 1): LootDrop {
  // Higher difficulty = better loot chances
  const roll = Math.random() * 100
  let rarity: keyof typeof lootTables

  if (roll < 50 - questDifficulty * 5) {
    rarity = 'common'
  } else if (roll < 80 - questDifficulty * 3) {
    rarity = 'rare'
  } else if (roll < 95 - questDifficulty * 2) {
    rarity = 'epic'
  } else {
    rarity = 'legendary'
  }

  const table = lootTables[rarity]
  return table[Math.floor(Math.random() * table.length)] as LootDrop
}

interface TreasureChestProps {
  questDifficulty?: number
  onChestOpen?: (loot: LootDrop) => void
}

export default function TreasureChest({ questDifficulty = 1, onChestOpen }: TreasureChestProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loot, setLoot] = useState<LootDrop | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const openChest = () => {
    if (isOpen || isAnimating) return

    setIsAnimating(true)
    const droppedLoot = getRandomLoot(questDifficulty)

    // Delay to show chest opening animation
    setTimeout(() => {
      setLoot(droppedLoot)
      setIsOpen(true)
      setIsAnimating(false)
      if (onChestOpen) onChestOpen(droppedLoot)
    }, 800)
  }

  const closeChest = () => {
    setIsOpen(false)
    setLoot(null)
  }

  return (
    <div className="relative">
      {/* Chest */}
      <button
        onClick={openChest}
        disabled={isOpen || isAnimating}
        className={`relative w-24 h-20 transition-all transform ${
          isAnimating ? 'animate-bounce' : ''
        } ${isOpen ? 'opacity-50' : 'hover:scale-110'}`}
      >
        {!isOpen ? (
          // Closed chest
          <div className="relative w-full h-full">
            {/* Chest body */}
            <div className="absolute bottom-0 w-full h-14 bg-gradient-to-b from-amber-700 to-amber-900 rounded-lg border-4 border-amber-600 shadow-lg">
              {/* Lock */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-amber-500 rounded-full border-2 border-amber-300 flex items-center justify-center">
                <span className="text-xs">🔒</span>
              </div>
              {/* Gold trim */}
              <div className="absolute bottom-2 left-2 right-2 h-1 bg-amber-500 rounded-full" />
            </div>
            {/* Chest lid */}
            <div className="absolute bottom-12 w-full h-8 bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-lg border-4 border-amber-600 border-b-0">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-4 h-2 bg-amber-400 rounded-t-full" />
            </div>
            {/* Glow effect for unopened */}
            <div className="absolute inset-0 bg-amber-500/20 rounded-lg blur-xl animate-pulse" />
          </div>
        ) : (
          // Open chest
          <div className="relative w-full h-full">
            <div className="absolute bottom-0 w-full h-14 bg-gradient-to-b from-amber-700 to-amber-900 rounded-lg border-4 border-amber-600 shadow-lg">
              <div className="absolute bottom-2 left-2 right-2 h-1 bg-amber-500 rounded-full" />
            </div>
            <div className="absolute bottom-12 w-full h-6 bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-lg border-4 border-amber-600 border-b-0 transform -rotate-12 origin-bottom-right">
              <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 w-4 h-2 bg-amber-400 rounded-t-full" />
            </div>
          </div>
        )}
      </button>

      {/* Loot popup */}
      {isOpen && loot && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 -translate-y-full z-20 animate-bounce-in">
          <div className={`bg-gradient-to-b ${rarityColors[loot.rarity]} p-1 rounded-xl shadow-2xl border-2`}>
            <div className="bg-slate-900 rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">{loot.icon}</div>
              <p className={`text-sm font-bold ${
                loot.rarity === 'legendary' ? 'text-amber-400' :
                loot.rarity === 'epic' ? 'text-purple-400' :
                loot.rarity === 'rare' ? 'text-blue-400' :
                'text-slate-300'
              }`}>
                {loot.name}
              </p>
              <p className="text-xs text-slate-500 capitalize">{loot.rarity} Loot!</p>
            </div>
            {/* Pointer */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-900" />
          </div>
          <button
            onClick={closeChest}
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-slate-500 hover:text-white"
          >
            Click to close
          </button>
        </div>
      )}

      {/* Random chance indicator */}
      {!isOpen && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-amber-400 whitespace-nowrap">
          🎲 30% chance per quest!
        </div>
      )}
    </div>
  )
}

// Export helper for random loot
export { getRandomLoot, type LootDrop }
