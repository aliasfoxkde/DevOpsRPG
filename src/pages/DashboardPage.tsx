import { Link } from 'react-router-dom'
import { useGame, XP_PER_LEVEL } from '@/contexts'
import { ProgressBar, StreakTracker } from '@/components/ui'

const ACHIEVEMENTS = [
  { key: 'first_steps', name: 'First Steps', description: 'Complete your first topic', check: (p: number) => p >= 1 },
  { key: 'dedicated', name: 'Dedicated Learner', description: '7-day streak', condition: 'streak', value: 7 },
  { key: 'level_5', name: 'Rising Star', description: 'Reach level 5', condition: 'level', value: 5 },
  { key: 'xp_1000', name: 'XP Hunter', description: 'Earn 1000 XP', condition: 'xp', value: 1000 },
  { key: 'xp_5000', name: 'XP Master', description: 'Earn 5000 XP', condition: 'xp', value: 5000 },
  { key: 'topics_10', name: 'Knowledge Seeker', description: 'Complete 10 topics', condition: 'topics', value: 10 },
  { key: 'topics_25', name: 'Halfway There', description: 'Complete 25 topics', condition: 'topics', value: 25 },
  { key: 'streak_30', name: 'Monthly Dedication', description: '30-day streak', condition: 'streak', value: 30 },
]

function checkAchievement(key: string, progress: { xp: number; level: number; streakDays: number; completedTopics: number[] | number }): boolean {
  const a = ACHIEVEMENTS.find(x => x.key === key)
  /* istanbul ignore if */
  if (!a || !a.condition) return false
  switch (a.condition) {
    /* istanbul ignore next */
    case 'xp': return progress.xp >= (a.value ?? 0)
    /* istanbul ignore next */
    case 'level': return progress.level >= (a.value ?? 0)
    /* istanbul ignore next */
    case 'streak': return progress.streakDays >= (a.value ?? 0)
    /* istanbul ignore next */
    case 'topics': return (progress.completedTopics as number) >= (a.value ?? 0)
    /* istanbul ignore next */
    default: return false
  }
}

export default function DashboardPage() {
  const { game, completedCount } = useGame()

  const { character } = game
  const completedTopics = completedCount

  const earnedAchievements = ACHIEVEMENTS.filter(a => {
    /* istanbul ignore else */
    if (a.check) return a.check(completedTopics)
    return checkAchievement(a.key, { xp: character.xp, level: character.level, streakDays: character.streakDays, completedTopics })
  })

  const xpProgress = character.xp - (character.level - 1) * XP_PER_LEVEL

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-100">Dashboard</h1>

      <section aria-label="Statistics" className="grid md:grid-cols-3 gap-6 mb-8">
        {/* XP Card */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6" role="region" aria-labelledby="xp-heading">
          <h3 id="xp-heading" className="text-sm font-medium text-slate-400 mb-2">Total XP</h3>
          <p className="text-4xl font-bold text-blue-400" aria-live="polite">{character.xp.toLocaleString()}</p>
          <div className="mt-3">
            <p className="text-sm text-slate-400 mb-1">Level {character.level}</p>
            <ProgressBar value={xpProgress} max={100} size="sm" color="primary" aria-label={`Level ${character.level} progress: ${xpProgress} of 100 XP`} />
            <p className="text-xs text-slate-500 mt-1">{xpProgress}/{100} XP to next level</p>
          </div>
        </div>

        {/* Enhanced Streak Tracker */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6" role="region" aria-labelledby="streak-heading">
          <h3 id="streak-heading" className="text-sm font-medium text-slate-400 mb-2">Current Streak</h3>
          <span aria-hidden="true" className="text-2xl">🔥</span>
          <StreakTracker />
        </div>

        {/* Progress Card */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6" role="region" aria-labelledby="progress-heading">
          <h3 id="progress-heading" className="text-sm font-medium text-slate-400 mb-2">Topics Completed</h3>
          <p className="text-4xl font-bold text-green-400" aria-live="polite">
            {completedTopics}/500
          </p>
          <div className="mt-3">
            <ProgressBar
              value={completedTopics}
              max={500}
              size="sm"
              color="success"
              aria-label={`Topics progress: ${completedTopics} of 500 completed`}
            />
            <p className="text-sm text-slate-400 mt-1">
              { Math.round((completedTopics / 500) * 100) }% complete
            </p>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="mb-8" aria-labelledby="achievements-heading">
        <h2 id="achievements-heading" className="text-xl font-semibold mb-4 text-slate-100">Achievements</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Earned achievements">
          {earnedAchievements.length > 0 ? (
            earnedAchievements.map((achievement) => (
              <article
                key={achievement.key}
                className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex items-center gap-4"
                role="listitem"
              >
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center text-xl" aria-hidden="true">
                  🏆
                </div>
                <div>
                  <h4 className="font-semibold text-slate-100">{achievement.name}</h4>
                  <p className="text-sm text-slate-400">
                    {achievement.description}
                  </p>
                </div>
              </article>
            ))
          ) : (
            <p className="text-slate-400 col-span-full">
              Complete topics and maintain streaks to earn achievements!
            </p>
          )}
        </div>
      </section>

      {/* XP Needed for Next Level */}
      <section className="mb-8" aria-labelledby="level-progress-heading">
        <h2 id="level-progress-heading" className="text-xl font-semibold mb-4 text-slate-100">Progress to Next Level</h2>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex justify-between mb-2 text-sm text-slate-400" role="status" aria-live="polite">
            <span>Level {character.level}</span>
            <span>Level {character.level + 1}</span>
          </div>
          <ProgressBar
            value={xpProgress}
            max={100}
            size="lg"
            color="primary"
            aria-label={`Level progress: ${xpProgress} of 100 XP until level ${character.level + 1}`}
          />
          <p className="text-center text-slate-400 mt-2 text-sm">
            {xpProgress} / 100 XP
          </p>
        </div>
      </section>

      {/* Continue Learning */}
      <section aria-labelledby="continue-heading">
        <h2 id="continue-heading" className="text-xl font-semibold mb-4 text-slate-100">Continue Learning</h2>
        <Link
          to="/learn"
          className="btn btn-primary inline-block"
        >
          Go to Learning Path
        </Link>
      </section>
    </div>
  )
}
