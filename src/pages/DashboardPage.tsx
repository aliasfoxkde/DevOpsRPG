import { Link } from 'react-router-dom'

// Mock user data - will be connected to auth system later
const user = {
  name: 'Developer',
  xp: 1250,
  level: 5,
  streakDays: 7,
  achievements: [
    { key: 'first_steps', name: 'First Steps', description: 'Complete your first topic' },
    { key: 'dedicated', name: 'Dedicated Learner', description: '7-day streak' },
  ],
  completedTopics: 12,
  totalTopics: 47,
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* XP Card */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-muted-foreground mb-2">Total XP</h3>
          <p className="text-4xl font-bold text-primary">{user.xp}</p>
          <p className="text-sm text-muted-foreground mt-1">Level {user.level}</p>
        </div>

        {/* Streak Card */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-muted-foreground mb-2">Current Streak</h3>
          <p className="text-4xl font-bold text-accent">🔥 {user.streakDays} days</p>
          <p className="text-sm text-muted-foreground mt-1">Keep it going!</p>
        </div>

        {/* Progress Card */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-muted-foreground mb-2">Topics Completed</h3>
          <p className="text-4xl font-bold text-success">
            {user.completedTopics}/{user.totalTopics}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {Math.round((user.completedTopics / user.totalTopics) * 100)}% complete
          </p>
        </div>
      </div>

      {/* Achievements */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Achievements</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user.achievements.map((achievement) => (
            <div
              key={achievement.key}
              className="bg-card rounded-lg border border-border p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-2xl">
                🏆
              </div>
              <div>
                <h4 className="font-semibold">{achievement.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Continue Learning */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Continue Learning</h2>
        <Link
          to="/learn"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
        >
          Go to Learning Path
        </Link>
      </section>
    </div>
  )
}
