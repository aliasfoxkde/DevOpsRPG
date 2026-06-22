import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">Welcome to DevOpsQuest</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Master DevOps skills through gamified learning
        </p>
        <Link
          to="/learn"
          className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90"
        >
          Start Learning
        </Link>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-xl font-semibold mb-2">🎮 Gamified Learning</h3>
          <p className="text-muted-foreground">
            Earn XP, level up, and unlock achievements as you progress through
            your DevOps journey.
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-xl font-semibold mb-2">📚 47+ Technologies</h3>
          <p className="text-muted-foreground">
            From HTML to Rust, learn everything you need to become a DevOps
            engineer.
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-xl font-semibold mb-2">💼 Career Paths</h3>
          <p className="text-muted-foreground">
            Choose your path: Web Developer, Backend Engineer, DevOps, Data
            Science, or Mobile.
          </p>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold mb-8">Quick Start</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link
            to="/learn"
            className="bg-card p-6 rounded-lg border border-border hover:border-primary transition-colors"
          >
            <h4 className="font-semibold mb-2">Continue Learning</h4>
            <p className="text-sm text-muted-foreground">
              Pick up where you left off
            </p>
          </Link>
          <Link
            to="/dashboard"
            className="bg-card p-6 rounded-lg border border-border hover:border-primary transition-colors"
          >
            <h4 className="font-semibold mb-2">View Progress</h4>
            <p className="text-sm text-muted-foreground">
              Check your XP, level, and achievements
            </p>
          </Link>
        </div>
      </section>
    </div>
  )
}
