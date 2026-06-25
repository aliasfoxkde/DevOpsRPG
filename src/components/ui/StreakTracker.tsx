import { useMemo } from 'react'
import { useGame } from '../../contexts/GameContext'

const STREAK_MILESTONES = [
  { days: 7, icon: '🔥', name: 'Week Warrior', reward: '50 XP' },
  { days: 14, icon: '🔥', name: 'Fortnight Fighter', reward: '100 XP' },
  { days: 30, icon: '💎', name: 'Monthly Master', reward: '250 XP' },
  { days: 60, icon: '👑', name: 'Diamond Dedication', reward: '500 XP' },
  { days: 90, icon: '🏆', name: 'Legendary Learner', reward: '1000 XP' },
]

function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push(date.toISOString().split('T')[0])
  }
  return days
}

function getActivityFromQuests(completedQuests: { completedAt?: string }[]): Set<string> {
  const activityDays = new Set<string>()
  completedQuests.forEach(q => {
    if (q.completedAt) {
      const day = q.completedAt.split('T')[0]
      activityDays.add(day)
    }
  })
  return activityDays
}

export function StreakTracker() {
  const { game } = useGame()
  const { character } = game

  const last7Days = useMemo(() => getLast7Days(), [])
  const activityDays = useMemo(() => getActivityFromQuests(game.completedQuests), [game.completedQuests])

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])
  const yesterday = useMemo(() => new Date(Date.now() - 86400000).toISOString().split('T')[0], [])

  const isStreakAtRisk = character.lastActive !== today && character.lastActive !== yesterday && character.streakDays > 0
  const hasActiveToday = character.lastActive === today

  // Calculate next milestone
  const nextMilestone = STREAK_MILESTONES.find(m => m.days > character.streakDays)

  const daysUntilNextMilestone = nextMilestone ? nextMilestone.days - character.streakDays : 0

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">{character.streakDays >= 7 ? '🔥' : '📅'}</span>
            <span>Daily Streak</span>
          </h3>
          <p className="text-sm text-slate-400">
            {hasActiveToday
              ? "You've earned today's XP!"
              : isStreakAtRisk
              ? "⚠️ Complete a quest to save your streak!"
              : 'Complete a quest today to keep your streak!'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-orange-400">{character.streakDays}</div>
          <div className="text-xs text-slate-400">day{character.streakDays !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Streak Status Banner */}
      {isStreakAtRisk && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg animate-pulse">
          <p className="text-red-300 text-sm text-center">
            ⚠️ Your streak is at risk! Complete a quest now to save it!
          </p>
        </div>
      )}

      {/* 7-Day Activity Grid */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-slate-300 mb-2">Last 7 Days</h4>
        <div className="grid grid-cols-7 gap-1">
          {last7Days.map((day) => {
            const isActive = activityDays.has(day)
            const isToday = day === today
            const dayName = new Date(day).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)

            return (
              <div
                key={day}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : isToday
                    ? 'bg-amber-600/50 text-amber-200 border border-amber-500'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                <span className="text-[10px]">{dayName}</span>
                <span className="text-lg">{isActive ? '✓' : ''}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Milestone Progress */}
      {nextMilestone && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Next milestone</span>
            <span className="text-amber-400">{daysUntilNextMilestone} days to {nextMilestone.name}</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all"
              style={{ width: `${(character.streakDays / nextMilestone.days) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>{character.streakDays} days</span>
            <span>{nextMilestone.days} days</span>
          </div>
        </div>
      )}

      {/* Milestone Markers */}
      <div className="flex flex-wrap gap-2">
        {STREAK_MILESTONES.map((milestone) => {
          const achieved = character.streakDays >= milestone.days
          const isNext = nextMilestone?.days === milestone.days

          return (
            <div
              key={milestone.days}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                achieved
                  ? 'bg-amber-900/50 text-amber-400 border border-amber-500/50'
                  : isNext
                  ? 'bg-slate-800 text-slate-400 border border-slate-600 animate-pulse'
                  : 'bg-slate-800/50 text-slate-500 border border-slate-700'
              }`}
              title={`${milestone.name}: ${milestone.days} days streak - Reward: ${milestone.reward}`}
            >
              <span>{milestone.icon}</span>
              <span>{milestone.days}</span>
              {achieved && <span className="text-green-400">✓</span>}
            </div>
          )
        })}
      </div>

      {/* Streak Tips */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-xs text-slate-400">
          {character.streakDays === 0
            ? "💡 Start your streak by completing a quest today!"
            : character.streakDays < 7
            ? `🔥 Just ${7 - character.streakDays} more days to reach Week Warrior status!`
            : character.streakDays < 30
            ? `💎 ${30 - character.streakDays} days to Monthly Master!`
            : "🏆 You're a legendary learner! Keep it going!"}
        </p>
      </div>
    </div>
  )
}
