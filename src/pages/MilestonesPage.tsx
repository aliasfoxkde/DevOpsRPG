import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { MILESTONES, type Milestone } from '../data/milestones'

type FilterStatus = 'all' | 'unlocked' | 'locked'
type FilterType = 'all' | 'quest' | 'streak' | 'level' | 'realm' | 'quiz' | 'minigame'

const TYPE_LABELS: Record<FilterType, string> = {
  all: 'All',
  quest: 'Quests',
  streak: 'Streaks',
  level: 'Levels',
  realm: 'Realms',
  quiz: 'Quizzes',
  minigame: 'Mini-games',
}

function getMilestoneCategory(milestone: Milestone): FilterType {
  switch (milestone.trigger.type) {
    case 'quest_count': return 'quest'
    case 'streak': return 'streak'
    case 'level': return 'level'
    case 'realm_complete': return 'realm'
    case 'technology_complete': return 'realm'
    case 'quiz_streak':
    case 'perfect_quiz': return 'quiz'
    case 'minigame_complete': return 'minigame'
    case 'first_boss':
    case 'speed_quest': return 'quest'
    default: return 'quest'
  }
}

function getMilestoneProgress(milestone: Milestone, stats: {
  questCount: number
  streakDays: number
  level: number
  realmCompleted: string[]
  quizStreak: number
  minigameCount: number
  hasDefeatedBoss: boolean
}): { current: number; target: number; percent: number } {
  const { trigger } = milestone

  switch (trigger.type) {
    case 'quest_count':
      return {
        current: stats.questCount,
        target: trigger.count,
        percent: Math.min(100, (stats.questCount / trigger.count) * 100)
      }
    case 'streak':
      return {
        current: stats.streakDays,
        target: trigger.days,
        percent: Math.min(100, (stats.streakDays / trigger.days) * 100)
      }
    case 'level':
      return {
        current: stats.level,
        target: trigger.level,
        percent: Math.min(100, (stats.level / trigger.level) * 100)
      }
    case 'realm_complete':
      return {
        current: stats.realmCompleted.includes(trigger.realm) ? 1 : 0,
        target: 1,
        percent: stats.realmCompleted.includes(trigger.realm) ? 100 : 0
      }
    case 'quiz_streak':
      return {
        current: stats.quizStreak,
        target: trigger.count,
        percent: Math.min(100, (stats.quizStreak / trigger.count) * 100)
      }
    case 'minigame_complete':
      return {
        current: stats.minigameCount,
        target: trigger.count,
        percent: Math.min(100, (stats.minigameCount / trigger.count) * 100)
      }
    case 'first_boss':
      return {
        current: stats.hasDefeatedBoss ? 1 : 0,
        target: 1,
        percent: stats.hasDefeatedBoss ? 100 : 0
      }
    case 'perfect_quiz':
      return {
        current: 0,
        target: 1,
        percent: 0
      }
    case 'speed_quest':
      return {
        current: 0,
        target: 1,
        percent: 0
      }
    case 'technology_complete':
      return {
        current: 0,
        target: 1,
        percent: 0
      }
    default:
      return { current: 0, target: 1, percent: 0 }
  }
}

function getRequirementLabel(milestone: Milestone): string {
  const { trigger } = milestone
  switch (trigger.type) {
    case 'quest_count': return `Complete ${trigger.count} quests`
    case 'streak': return `${trigger.days} day streak`
    case 'level': return `Reach level ${trigger.level}`
    case 'realm_complete': return `Complete ${trigger.realm} realm`
    case 'technology_complete': return `Master ${trigger.tech}`
    case 'quiz_streak': return `${trigger.count} perfect quizzes in a row`
    case 'perfect_quiz': return 'Get 100% on a quiz'
    case 'minigame_complete': return `Complete ${trigger.count} mini-games`
    case 'first_boss': return 'Defeat your first boss'
    case 'speed_quest': return `Complete a quest in under ${trigger.minutes} minutes`
    default: return 'Complete the challenge'
  }
}

export default function MilestonesPage() {
  const { game } = useGame()
  const { character, completedQuests, milestones } = game

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)

  // Calculate player stats
  const playerStats = useMemo(() => ({
    questCount: completedQuests.length,
    streakDays: character.streakDays,
    level: character.level,
    realmCompleted: game.completedRealms || [],
    quizStreak: 0, // Not tracked
    minigameCount: 0, // Not tracked
    hasDefeatedBoss: completedQuests.some(q => q.topicId.includes('boss') || q.technologyId.includes('boss')),
  }), [completedQuests, character.streakDays, character.level, game.completedRealms])

  // Check if milestone is unlocked
  const isUnlocked = (milestone: Milestone) => {
    return milestone.unlocked || milestones.some(m => m.id === milestone.id && m.unlocked)
  }

  // Filter milestones
  const filteredMilestones = useMemo(() => {
    return MILESTONES.filter(m => {
      if (filterStatus === 'unlocked' && !isUnlocked(m)) return false
      if (filterStatus === 'locked' && isUnlocked(m)) return false
      if (filterType !== 'all' && getMilestoneCategory(m) !== filterType) return false
      return true
    }).sort((a, b) => {
      // Unlocked first
      const aUnlocked = isUnlocked(a) ? 0 : 1
      const bUnlocked = isUnlocked(b) ? 0 : 1
      if (aUnlocked !== bUnlocked) return aUnlocked - bUnlocked
      // Then by progress (higher first)
      const aProgress = getMilestoneProgress(a, playerStats).percent
      const bProgress = getMilestoneProgress(b, playerStats).percent
      return bProgress - aProgress
    })
  }, [filterStatus, filterType, milestones, playerStats])

  const unlockedCount = milestones.filter(m => m.unlocked).length
  const totalCount = MILESTONES.length
  const completionPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              ← Home
            </Link>
            <h1 className="text-xl font-bold text-white">🏆 Milestones</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats Summary */}
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 rounded-xl border border-amber-600/50 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-amber-400 font-bold text-lg">Milestone Progress</p>
              <p className="text-slate-400 text-sm">{unlockedCount} of {totalCount} milestones achieved</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">{completionPercent}%</div>
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* XP Bonus Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="text-center p-3 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-500">Total XP Earned</p>
              <p className="font-bold text-green-400">{character.xp.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-500">Current Level</p>
              <p className="font-bold text-amber-400">{character.level}</p>
            </div>
            <div className="text-center p-3 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-500">Day Streak</p>
              <p className="font-bold text-orange-400">🔥 {character.streakDays}</p>
            </div>
            <div className="text-center p-3 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-500">Realms Done</p>
              <p className="font-bold text-blue-400">{game.completedRealms?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Status filter */}
          <div className="flex gap-1 bg-slate-800/80 rounded-lg p-1">
            {(['all', 'unlocked', 'locked'] as FilterStatus[]).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-green-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status === 'all' ? 'All' : status === 'unlocked' ? '✓ Achieved' : '🔒 Pending'}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex gap-1 bg-slate-800/80 rounded-lg p-1">
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilterType(key as FilterType)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  filterType === key
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Milestones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMilestones.map(milestone => {
            const unlocked = isUnlocked(milestone)
            const progress = getMilestoneProgress(milestone, playerStats)

            return (
              <button
                key={milestone.id}
                onClick={() => setSelectedMilestone(milestone)}
                className={`relative p-5 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                  unlocked
                    ? 'bg-gradient-to-br from-amber-900/40 to-slate-900 border-amber-600/50'
                    : 'bg-slate-800/80 border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`text-4xl ${!unlocked && 'grayscale opacity-50'}`}>
                    {milestone.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold mb-1 ${unlocked ? 'text-amber-400' : 'text-slate-200'}`}>
                      {milestone.title}
                    </h3>
                    <p className={`text-sm ${unlocked ? 'text-slate-300' : 'text-slate-500'}`}>
                      {unlocked ? milestone.message : getRequirementLabel(milestone)}
                    </p>

                    {/* Progress bar */}
                    {!unlocked && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Progress</span>
                          <span className="text-amber-400">{Math.round(progress.percent)}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all"
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {progress.current} / {progress.target}
                        </p>
                      </div>
                    )}

                    {/* XP Reward */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-green-400 font-medium">
                        +{milestone.xpBonus} XP
                      </span>
                      {!unlocked && (
                        <span className="text-xs text-slate-500">
                          {TYPE_LABELS[getMilestoneCategory(milestone)]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Unlocked badge */}
                {unlocked && (
                  <div className="absolute top-3 right-3 text-green-400 text-lg">✓</div>
                )}
              </button>
            )
          })}
        </div>

        {filteredMilestones.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <div className="text-5xl mb-4">🏆</div>
            <p>No milestones match your filters.</p>
          </div>
        )}
      </main>

      {/* Milestone Detail Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="p-6 text-center border-b border-slate-700 bg-gradient-to-b from-amber-900/30 to-slate-900">
              <div className={`text-7xl mb-4 ${!isUnlocked(selectedMilestone) && 'grayscale opacity-50'}`}>
                {selectedMilestone.icon}
              </div>
              <h2 className={`text-2xl font-bold ${isUnlocked(selectedMilestone) ? 'text-amber-400' : 'text-white'}`}>
                {selectedMilestone.title}
              </h2>
              <p className="text-slate-300 mt-2">
                {isUnlocked(selectedMilestone) ? selectedMilestone.message : getRequirementLabel(selectedMilestone)}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Progress */}
              {!isUnlocked(selectedMilestone) && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-amber-400">
                      {getMilestoneProgress(selectedMilestone, playerStats).current} / {getMilestoneProgress(selectedMilestone, playerStats).target}
                    </span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all"
                      style={{ width: `${getMilestoneProgress(selectedMilestone, playerStats).percent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* XP Reward */}
              <div className="flex justify-center gap-6">
                <div className="text-center p-3 bg-green-900/30 rounded-lg border border-green-700/50">
                  <p className="text-green-400 font-bold text-xl">+{selectedMilestone.xpBonus}</p>
                  <p className="text-slate-400 text-sm">XP Bonus</p>
                </div>
              </div>

              {/* Trigger Info */}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Type</span>
                <span className="text-slate-300">{TYPE_LABELS[getMilestoneCategory(selectedMilestone)]}</span>
              </div>

              {/* Status */}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className={isUnlocked(selectedMilestone) ? 'text-green-400' : 'text-slate-300'}>
                  {isUnlocked(selectedMilestone) ? 'Achieved!' : 'Pending'}
                </span>
              </div>

              {isUnlocked(selectedMilestone) && selectedMilestone.unlockedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Unlocked At</span>
                  <span className="text-slate-300">
                    {new Date(selectedMilestone.unlockedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700">
              <button
                onClick={() => setSelectedMilestone(null)}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
