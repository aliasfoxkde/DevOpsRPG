import { Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { XPBar } from '../components/ui/XPBar'

export default function CharacterSheetPage() {
  const { game, completedCount, totalQuests } = useGame()
  const { character, achievements } = game

  const unlockedAchievements = achievements.filter(a => a.unlockedAt)
  const lockedAchievements = achievements.filter(a => !a.unlockedAt)

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

        {/* Achievements */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-6">
          <h3 className="text-xl font-bold text-slate-100 mb-4">
            🏆 Achievements ({unlockedAchievements.length}/{achievements.length})
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
