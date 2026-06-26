import { useMemo } from 'react'
import { useGame } from '../contexts/GameContext'
import { allQuests, realms } from '../data/quests'
import { BADGES } from '../data/badges'

export default function AnalyticsPage() {
  const { game } = useGame()
  const { character, stats, completedQuests, badges } = game

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalQuests = allQuests.length
    const completed = completedQuests.length
    const completionRate = totalQuests > 0 ? Math.round((completed / totalQuests) * 100) : 0

    // Quest completion by realm
    const realmStats = Object.values(realms).map(realm => {
      const realmQuests = allQuests.filter(q => q.realmId === realm.id)
      const realmCompleted = realmQuests.filter(q =>
        completedQuests.some(c => c.questId === q.id)
      ).length
      return {
        name: realm.name,
        icon: realm.icon,
        completed: realmCompleted,
        total: realmQuests.length,
        percentage: realmQuests.length > 0 ? Math.round((realmCompleted / realmQuests.length) * 100) : 0,
      }
    })

    // Badge stats
    const unlockedBadges = badges.filter(b => b.unlockedAt).length
    const totalBadges = BADGES.length

    // XP breakdown
    const xpToNextLevel = character.xpToNextLevel
    const xpInCurrentLevel = character.xp % xpToNextLevel

    // Activity by time
    const earlyQuests = stats.earlyQuests
    const nightQuests = stats.nightQuests
    const dayQuests = completedQuests.length - earlyQuests - nightQuests

    // Performance stats
    const perfectQuests = stats.perfectQuestCount
    const quizAccuracy = stats.quizCount > 0
      ? Math.round(((stats.quizCount - stats.quizPerfectCount) / stats.quizCount) * 100)
      : 0

    // Streak analysis
    const currentStreak = character.streakDays
    const longestStreak = currentStreak // Would need to track this historically

    // Technology breakdown
    const techStats = Object.entries(
      completedQuests.reduce((acc, cq) => {
        const quest = allQuests.find(q => q.id === cq.questId)
        if (quest) {
          acc[quest.technologyId] = (acc[quest.technologyId] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)
    ).map(([tech, count]) => ({ tech, count }))
      .sort((a, b) => b.count - a.count)

    return {
      totalQuests,
      completed,
      completionRate,
      realmStats,
      unlockedBadges,
      totalBadges,
      xpInCurrentLevel,
      xpToNextLevel,
      earlyQuests,
      nightQuests,
      dayQuests,
      perfectQuests,
      quizAccuracy,
      currentStreak,
      longestStreak,
      techStats,
    }
  }, [character, stats, completedQuests, badges])

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">📊 Learning Analytics</h1>
        <p className="text-slate-400">Track your DevOps learning journey</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <div className="text-3xl font-bold text-amber-400">{analytics.completed}</div>
          <div className="text-sm text-slate-400">Quests Completed</div>
          <div className="text-xs text-slate-500 mt-1">of {analytics.totalQuests}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <div className="text-3xl font-bold text-green-400">{analytics.completionRate}%</div>
          <div className="text-sm text-slate-400">Completion Rate</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <div className="text-3xl font-bold text-purple-400">{analytics.unlockedBadges}</div>
          <div className="text-sm text-slate-400">Badges Earned</div>
          <div className="text-xs text-slate-500 mt-1">of {analytics.totalBadges}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <div className="text-3xl font-bold text-red-400">{analytics.currentStreak}</div>
          <div className="text-sm text-slate-400">Day Streak 🔥</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* XP Progress */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            ⭐ Level Progress
          </h2>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Level {character.level}</span>
              <span className="text-amber-400">{analytics.xpInCurrentLevel} / {analytics.xpToNextLevel} XP</span>
            </div>
            <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all"
                style={{ width: `${(analytics.xpInCurrentLevel / analytics.xpToNextLevel) * 100}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xl font-bold text-amber-400">{character.xp}</div>
              <div className="text-xs text-slate-400">Total XP</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xl font-bold text-orange-400">{character.gold}</div>
              <div className="text-xs text-slate-400">Gold</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xl font-bold text-purple-400">{game.prestigeMultiplier.toFixed(1)}x</div>
              <div className="text-xs text-slate-400">Prestige Bonus</div>
            </div>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🕐 Activity Breakdown
          </h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">🌅 Morning Quests</span>
                <span className="text-amber-400">{analytics.earlyQuests}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-600 to-orange-500"
                  style={{ width: `${analytics.completed > 0 ? (analytics.earlyQuests / analytics.completed) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">☀️ Day Quests</span>
                <span className="text-amber-400">{analytics.dayQuests}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-yellow-500"
                  style={{ width: `${analytics.completed > 0 ? (analytics.dayQuests / analytics.completed) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">🌙 Night Quests</span>
                <span className="text-amber-400">{analytics.nightQuests}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-purple-500"
                  style={{ width: `${analytics.completed > 0 ? (analytics.nightQuests / analytics.completed) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Realm Progress */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          🗺️ Realm Progress
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.realmStats.map(realm => (
            <div key={realm.name} className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{realm.icon}</span>
                <span className="font-medium text-white">{realm.name}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">{realm.completed}/{realm.total}</span>
                <span className={realm.percentage === 100 ? 'text-green-400' : 'text-amber-400'}>
                  {realm.percentage}%
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${realm.percentage === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-amber-600 to-amber-400'}`}
                  style={{ width: `${realm.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Technology Stats */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            💻 Technology Breakdown
          </h2>
          <div className="space-y-2">
            {analytics.techStats.slice(0, 8).map(({ tech, count }) => (
              <div key={tech} className="flex items-center justify-between">
                <span className="text-slate-300 uppercase text-sm">{tech}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-600 to-blue-500"
                      style={{ width: `${analytics.completed > 0 ? (count / analytics.completed) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-400 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🎯 Performance Metrics
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{analytics.perfectQuests}</div>
              <div className="text-xs text-slate-400">Flawless Quests</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.quizCount}</div>
              <div className="text-xs text-slate-400">Quizzes Passed</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{analytics.quizAccuracy}%</div>
              <div className="text-xs text-slate-400">Quiz Accuracy</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">
                {stats.fastestQuestTime !== Infinity ? `${Math.round(stats.fastestQuestTime)}s` : '--'}
              </div>
              <div className="text-xs text-slate-400">Fastest Quest</div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Progress */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          🏅 Badge Collection
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Progress</span>
              <span className="text-amber-400">{analytics.unlockedBadges} / {analytics.totalBadges}</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-orange-500 transition-all"
                style={{ width: `${(analytics.unlockedBadges / analytics.totalBadges) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {Math.round((analytics.unlockedBadges / analytics.totalBadges) * 100)}%
          </div>
        </div>
        <div className="text-center text-sm text-slate-400">
          Keep completing quests and mini-games to earn more badges!
        </div>
      </div>
    </div>
  )
}
