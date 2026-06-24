import { Link } from 'react-router-dom'
import { useProgress } from '@/contexts'
import { ProgressBar } from '@/components/ui'

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
  const { progress, totalTopics } = useProgress()

  const completedTopics = progress.completedTopics.length

  const earnedAchievements = ACHIEVEMENTS.filter(a => {
    /* istanbul ignore else */
    if (a.check) return a.check(completedTopics)
    return checkAchievement(a.key, { ...progress, completedTopics })
  })

  const xpProgress = progress.xp % 100

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <section aria-label="Statistics" className="grid md:grid-cols-3 gap-6 mb-8">
        {/* XP Card */}
        <div className="bg-card rounded-lg border border-border p-6" role="region" aria-labelledby="xp-heading">
          <h3 id="xp-heading" className="text-muted-foreground mb-2">Total XP</h3>
          <p className="text-4xl font-bold text-primary" aria-live="polite">{progress.xp.toLocaleString()}</p>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground mb-1">Level {progress.level}</p>
            <ProgressBar value={xpProgress} max={100} size="sm" color="primary" aria-label={`Level ${progress.level} progress: ${xpProgress} of 100 XP`} />
            <p className="text-xs text-muted-foreground mt-1">{xpProgress}/{100} XP to next level</p>
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-card rounded-lg border border-border p-6" role="region" aria-labelledby="streak-heading">
          <h3 id="streak-heading" className="text-muted-foreground mb-2">Current Streak</h3>
          <p className="text-4xl font-bold text-accent" aria-live="polite">
            <span aria-hidden="true">🔥</span> {progress.streakDays} days
          </p>
          <p className="text-sm text-muted-foreground mt-1">Keep it going!</p>
        </div>

        {/* Progress Card */}
        <div className="bg-card rounded-lg border border-border p-6" role="region" aria-labelledby="progress-heading">
          <h3 id="progress-heading" className="text-muted-foreground mb-2">Topics Completed</h3>
          <p className="text-4xl font-bold text-success" aria-live="polite">
            {completedTopics}/{totalTopics}
          </p>
          <div className="mt-2">
            <ProgressBar
              value={completedTopics}
              max={totalTopics}
              size="sm"
              color="success"
              aria-label={`Topics progress: ${completedTopics} of ${totalTopics} completed`}
            />
            <p className="text-sm text-muted-foreground mt-1">
              { (totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0) }% complete
            </p>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="mb-8" aria-labelledby="achievements-heading">
        <h2 id="achievements-heading" className="text-2xl font-semibold mb-4">Achievements</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Earned achievements">
          {earnedAchievements.length > 0 ? (
            earnedAchievements.map((achievement) => (
              <article
                key={achievement.key}
                className="bg-card rounded-lg border border-border p-4 flex items-center gap-4"
                role="listitem"
              >
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-2xl" aria-hidden="true">
                  🏆
                </div>
                <div>
                  <h4 className="font-semibold">{achievement.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>
              </article>
            ))
          ) : (
            <p className="text-muted-foreground col-span-full">
              Complete topics and maintain streaks to earn achievements!
            </p>
          )}
        </div>
      </section>

      {/* XP Needed for Next Level */}
      <section className="mb-8" aria-labelledby="level-progress-heading">
        <h2 id="level-progress-heading" className="text-2xl font-semibold mb-4">Progress to Next Level</h2>
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex justify-between mb-2" role="status" aria-live="polite">
            <span>Level {progress.level}</span>
            <span>Level {progress.level + 1}</span>
          </div>
          <ProgressBar
            value={xpProgress}
            max={100}
            size="lg"
            color="primary"
            aria-label={`Level progress: ${xpProgress} of 100 XP until level ${progress.level + 1}`}
          />
          <p className="text-center text-muted-foreground mt-2">
            {xpProgress} / 100 XP
          </p>
        </div>
      </section>

      {/* Continue Learning */}
      <section aria-labelledby="continue-heading">
        <h2 id="continue-heading" className="text-2xl font-semibold mb-4">Continue Learning</h2>
        <Link
          to="/learn"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Go to Learning Path
        </Link>
      </section>
    </div>
  )
}
