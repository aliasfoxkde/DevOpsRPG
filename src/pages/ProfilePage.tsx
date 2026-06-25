import { useGame, XP_PER_LEVEL } from '../contexts/GameContext'
import { BADGES, RARITY_COLORS, type Badge } from '../data/badges'
import { MILESTONES } from '../data/milestones'
import { useSoundEffects } from '../hooks/useSoundEffects'

// Rarity display order
const RARITY_ORDER: Badge['rarity'][] = ['legendary', 'epic', 'rare', 'uncommon', 'common']

export default function ProfilePage() {
  const { game } = useGame()
  const { isMuted, toggleMute, playSound } = useSoundEffects()

  // Calculate stats
  const totalBadges = BADGES.length
  const unlockedBadges = game.badges.filter(b => b.unlockedAt).length
  const unlockedMilestones = game.milestones.filter(m => m.unlocked).length

  // Get unlocked badges by rarity
  const badgesByRarity = RARITY_ORDER.map(rarity => ({
    rarity,
    badges: game.badges.filter(b => b.rarity === rarity),
  }))

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">📜 Hero Profile</h1>
        <p className="text-slate-400">View your achievements, badges, and progress</p>
      </div>

      {/* Settings */}
      <div className="bg-card rounded-xl border border-border p-4 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔊</span>
          <div>
            <h3 className="font-medium">Sound Effects</h3>
            <p className="text-xs text-slate-400">Play sounds for actions and achievements</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (!isMuted) playSound('click')
            toggleMute()
          }}
          className={`relative w-14 h-7 rounded-full transition-colors ${
            isMuted ? 'bg-slate-600' : 'bg-green-600'
          }`}
        >
          <div
            className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
              isMuted ? 'left-1' : 'translate-x-8'
            }`}
          />
        </button>
      </div>

      {/* Character Summary */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="text-6xl">{game.character.avatar}</div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold">{game.character.name}</h2>
            <p className="text-amber-400">{game.character.title}</p>
            <p className="text-slate-400 text-sm">Level {game.character.level} {game.character.class}</p>
          </div>
          <div className="flex gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-amber-400">{game.character.xp}</div>
              <div className="text-xs text-slate-400">Total XP</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">{game.character.gold}</div>
              <div className="text-xs text-slate-400">Gold</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">{game.character.streakDays}</div>
              <div className="text-xs text-slate-400">Day Streak 🔥</div>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-1">
            <span>Level {game.character.level}</span>
            <span>{game.character.xp - (game.character.level - 1) * XP_PER_LEVEL} / {XP_PER_LEVEL} XP</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all"
              style={{ width: `${Math.min(100, ((game.character.xp - (game.character.level - 1) * XP_PER_LEVEL) / XP_PER_LEVEL) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-3xl mb-1">⚔️</div>
          <div className="text-2xl font-bold">{game.completedQuests.length}</div>
          <div className="text-xs text-slate-400">Quests Completed</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-3xl mb-1">🎖️</div>
          <div className="text-2xl font-bold">{unlockedBadges}/{totalBadges}</div>
          <div className="text-xs text-slate-400">Badges Earned</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-3xl mb-1">🏆</div>
          <div className="text-2xl font-bold">{unlockedMilestones}/{MILESTONES.length}</div>
          <div className="text-xs text-slate-400">Milestones</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-3xl mb-1">🎁</div>
          <div className="text-2xl font-bold">{game.collectibles.filter(c => !c.used).length}</div>
          <div className="text-xs text-slate-400">Collectibles</div>
        </div>
      </div>

      {/* Badges Collection */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>🎖️</span> Badge Collection
        </h2>

        {badgesByRarity.map(({ rarity, badges }) => (
          <div key={rarity} className="mb-6">
            <h3 className={`text-lg font-semibold mb-2 ${RARITY_COLORS[rarity].split(' ')[0]}`}>
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)} ({badges.filter(b => b.unlockedAt).length}/{badges.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {badges.map(badge => {
                const isUnlocked = !!badge.unlockedAt
                return (
                  <div
                    key={badge.id}
                    className={`relative p-3 rounded-lg border ${
                      isUnlocked
                        ? `${RARITY_COLORS[badge.rarity]} opacity-100`
                        : 'bg-slate-800/50 border-slate-700 opacity-50'
                    }`}
                  >
                    <div className="text-3xl mb-1">{badge.icon}</div>
                    <div className={`font-medium text-sm ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                      {badge.name}
                    </div>
                    <div className={`text-xs ${isUnlocked ? 'text-slate-300' : 'text-slate-600'}`}>
                      {badge.description}
                    </div>
                    {isUnlocked && (
                      <div className="absolute top-1 right-1 text-xs">✓</div>
                    )}
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-slate-600 text-2xl">🔒</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>🏆</span> Milestones
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {game.milestones.map(milestone => (
            <div
              key={milestone.id}
              className={`p-4 rounded-lg border flex items-center gap-4 ${
                milestone.unlocked
                  ? 'bg-purple-900/30 border-purple-500/50'
                  : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              <div className={`text-3xl ${!milestone.unlocked && 'grayscale opacity-50'}`}>
                {milestone.icon}
              </div>
              <div className="flex-1">
                <div className={`font-medium ${milestone.unlocked ? 'text-white' : 'text-slate-500'}`}>
                  {milestone.title}
                </div>
                <div className={`text-sm ${milestone.unlocked ? 'text-purple-300' : 'text-slate-600'}`}>
                  {milestone.message}
                </div>
              </div>
              {milestone.unlocked && (
                <div className="text-green-400">✓</div>
              )}
              {!milestone.unlocked && (
                <div className="text-amber-500 text-sm">+{milestone.xpBonus} XP</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
