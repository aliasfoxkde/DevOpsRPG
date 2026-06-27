import { Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { XPBar } from '../components/ui/XPBar'
import { EQUIPMENT_ITEMS, RARITY_COLORS, type EquipmentItem } from '../data/equipment'

export default function CharacterSheetPage() {
  const { game, completedCount, totalQuests, getEquipmentBonuses, unequipItem } = useGame()
  const { character, companions, activeCompanion } = game
  const { achievements } = game

  const unlockedAchievements = achievements.filter(a => a.unlockedAt)
  const lockedAchievements = achievements.filter(a => !a.unlockedAt)

  // Get equipped items with full data
  const equippedItems = character.equippedItems
    .map(id => EQUIPMENT_ITEMS.find(item => item.id === id))
    .filter((item): item is EquipmentItem => item !== undefined)

  // Get equipment bonuses
  const equipmentBonuses = getEquipmentBonuses()

  // Group equipped items by slot
  const equippedBySlot = equippedItems.reduce((acc, item) => {
    if (!acc[item.slot]) acc[item.slot] = []
    acc[item.slot].push(item)
    return acc
  }, {} as Record<string, EquipmentItem[]>)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <Link
            to="/quests"
            className="text-slate-400 hover:text-amber-400 transition-colors text-sm mb-4 inline-block"
          >
            ← Back to Quest Journal
          </Link>
          <h1 className="text-3xl font-bold text-amber-400">👤 Character Sheet</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Character Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-amber-600/50 p-6 mb-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="text-8xl">{character.avatar}</div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{character.name}</h2>
              <p className="text-amber-400 font-medium mb-4">{character.title}</p>

              {/* XP Bar */}
              <div className="mb-4">
                <XPBar />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-400">{character.level}</div>
                  <div className="text-xs text-slate-400">Level</div>
                </div>
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{character.xp}</div>
                  <div className="text-xs text-slate-400">Total XP</div>
                </div>
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">{character.streakDays}</div>
                  <div className="text-xs text-slate-400">Day Streak</div>
                </div>
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">{character.gold}</div>
                  <div className="text-xs text-slate-400">Gold</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-6 mb-8">
          <h3 className="text-xl font-bold text-slate-100 mb-4">📊 Journey Progress</h3>

          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">Overall Completion</span>
              <span className="text-slate-200">{completedCount}/{totalQuests} Quests</span>
            </div>
            <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-700"
                style={{ width: `${totalQuests > 0 ? (completedCount / totalQuests) * 100 : 0}%` }}
              />
            </div>
            <div className="text-right mt-1">
              <span className="text-amber-400 font-medium">
                {Math.round(totalQuests > 0 ? (completedCount / totalQuests) * 100 : 0)}% Complete
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <div className="text-3xl mb-2">⚔️</div>
              <div className="text-2xl font-bold text-slate-100">{completedCount}</div>
              <div className="text-sm text-slate-400">Quests Conquered</div>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <div className="text-3xl mb-2">📚</div>
              <div className="text-2xl font-bold text-slate-100">{totalQuests - completedCount}</div>
              <div className="text-sm text-slate-400">Quests Remaining</div>
            </div>
          </div>
        </div>

        {/* Equipment Section */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-6 mb-8">
          <h3 className="text-xl font-bold text-slate-100 mb-4">Equipment Loadout</h3>

          {/* Active Bonuses */}
          {(equipmentBonuses.xpBonus > 0 || equipmentBonuses.goldBonus > 0 || Object.keys(equipmentBonuses.techBonuses).length > 0) && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
              <h4 className="text-sm font-semibold text-green-400 mb-2">Active Bonuses</h4>
              <div className="flex flex-wrap gap-2">
                {equipmentBonuses.xpBonus > 0 && (
                  <span className="px-2 py-1 bg-green-900/50 rounded text-sm text-green-300">
                    +{Math.round(equipmentBonuses.xpBonus * 100)}% XP
                  </span>
                )}
                {equipmentBonuses.goldBonus > 0 && (
                  <span className="px-2 py-1 bg-yellow-900/50 rounded text-sm text-yellow-300">
                    +{Math.round(equipmentBonuses.goldBonus * 100)}% Gold
                  </span>
                )}
                {Object.entries(equipmentBonuses.techBonuses).map(([techId, bonus]) => (
                  <span key={techId} className="px-2 py-1 bg-blue-900/50 rounded text-sm text-blue-300">
                    +{Math.round(bonus * 100)}% {techId.toUpperCase()} XP
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Equipped Items */}
          {equippedItems.length === 0 ? (
            <p className="text-slate-400 text-sm">No equipment equipped. Visit the Store to buy gear!</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(equippedBySlot).map(([slot, items]) => (
                <div key={slot}>
                  <h4 className="text-sm text-slate-400 mb-2 capitalize">{slot}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border relative group"
                        style={{ borderColor: RARITY_COLORS[item.rarity], backgroundColor: `${RARITY_COLORS[item.rarity]}15` }}
                      >
                        <button
                          onClick={() => unequipItem(item.id)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-600/80 hover:bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          title="Unequip"
                        >
                          ×
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <div className="text-sm font-semibold text-slate-100">{item.name}</div>
                            <div className="text-xs capitalize" style={{ color: RARITY_COLORS[item.rarity] }}>{item.rarity}</div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                        {/* Show bonuses */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.bonuses.xpBonus && (
                            <span className="text-xs px-1 py-0.5 bg-blue-900/50 text-blue-300 rounded">+{Math.round(item.bonuses.xpBonus * 100)}% XP</span>
                          )}
                          {item.bonuses.goldBonus && (
                            <span className="text-xs px-1 py-0.5 bg-yellow-900/50 text-yellow-300 rounded">+{Math.round(item.bonuses.goldBonus * 100)}% Gold</span>
                          )}
                          {item.techBonus && (
                            <span className="text-xs px-1 py-0.5 bg-purple-900/50 text-purple-300 rounded">+{Math.round(item.techBonus.bonus * 100)}% {item.techBonus.technologyId.toUpperCase()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Companions Section */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-6 mb-8">
          <h3 className="text-xl font-bold text-slate-100 mb-4">Companions</h3>

          {companions.length === 0 ? (
            <p className="text-slate-400 text-sm">No companions yet. Visit the Store to buy companions!</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {companions.map(companion => (
                <div
                  key={companion.id}
                  className={`p-4 rounded-lg border ${
                    activeCompanion?.id === companion.id
                      ? 'bg-amber-900/30 border-amber-600/50'
                      : 'bg-slate-700/50 border-slate-600/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{companion.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-slate-100">{companion.name}</div>
                      <div className="text-xs text-slate-400">
                        {companion.xpBonus > 0 && <span className="text-green-400">+{Math.round(companion.xpBonus * 100)}% XP</span>}
                        {companion.goldBonus > 0 && <span className="text-yellow-400"> +{Math.round(companion.goldBonus * 100)}% Gold</span>}
                      </div>
                      {companion.specialAbility && (
                        <div className="text-xs text-purple-400 mt-1">{companion.specialAbility}</div>
                      )}
                    </div>
                  </div>
                  {activeCompanion?.id === companion.id && (
                    <div className="mt-2 text-xs text-amber-400 font-medium">Active</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-6">
          <h3 className="text-xl font-bold text-slate-100 mb-4">
            Achievements ({unlockedAchievements.length}/{achievements.length})
          </h3>

          {/* Unlocked */}
          {unlockedAchievements.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm text-slate-400 mb-3">Unlocked</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {unlockedAchievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className="p-3 bg-gradient-to-br from-amber-900/30 to-amber-950/30 rounded-lg border border-amber-600/50"
                  >
                    <div className="text-2xl mb-1">{achievement.icon}</div>
                    <div className="text-sm font-bold text-amber-400">{achievement.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{achievement.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked */}
          {lockedAchievements.length > 0 && (
            <div>
              <h4 className="text-sm text-slate-500 mb-3">Locked</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {lockedAchievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30 opacity-60"
                  >
                    <div className="text-2xl mb-1 grayscale">🔒</div>
                    <div className="text-sm font-bold text-slate-400">{achievement.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{achievement.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            to="/quests"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105"
          >
            ⚔️ Continue Your Quest
          </Link>
        </div>
      </main>
    </div>
  )
}
