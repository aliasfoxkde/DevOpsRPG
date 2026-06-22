'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { ALL_TECHNOLOGIES, CATEGORIES, CAREER_PATHS } from '@/data/technologies';
import { formatXP } from '@/data/achievements';
import { getLevelProgress } from '@/lib/utils';
import { cn } from '@/lib/auth';

export default function HomePage() {
  const { user, isAuthenticated, login } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const levelProgress = user ? getLevelProgress(user.xp) : { current: 0, needed: 100, percentage: 0 };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎮</span>
            <div>
              <h1 className="text-xl font-bold text-[var(--color-text)]">DevOpsQuest</h1>
              <p className="text-xs text-[var(--color-text-muted)]">Gamified Learning</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? '🌙' : '☀️'}
            </button>

            {/* Auth */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-[var(--color-text)]">{user.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{formatXP(user.xp)}</p>
                </div>
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border-2 border-primary-500"
                />
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => login('google')}
                  className="px-4 py-2 bg-[var(--color-surface-hover)] rounded-lg text-sm font-medium hover:bg-[var(--color-border)] transition-colors"
                >
                  Sign in with Google
                </button>
                <button
                  onClick={() => login('github')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Sign in with GitHub
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
            Level Up Your DevOps Skills
          </h2>
          <p className="text-xl text-[var(--color-text-muted)] mb-8">
            Transform your learning journey into an RPG adventure. Complete topics, earn XP, unlock achievements, and master DevOps technologies through W3Schools' comprehensive tutorials.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/learn"
              className="px-8 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-all hover:scale-105 shadow-lg glow-primary"
            >
              🚀 Start Learning
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl font-bold text-lg hover:bg-[var(--color-surface-hover)] transition-all"
            >
              📊 Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-primary-500">{ALL_TECHNOLOGIES.length}</p>
              <p className="text-[var(--color-text-muted)]">Technologies</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-secondary-500">47</p>
              <p className="text-[var(--color-text-muted)]">Total Topics</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-accent-500">5</p>
              <p className="text-[var(--color-text-muted)]">Career Paths</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-success">80%</p>
              <p className="text-[var(--color-text-muted)]">Test Coverage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Career Paths */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-[var(--color-text)]">
            Choose Your Career Path
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(CAREER_PATHS).map(([key, path]) => (
              <Link
                key={key}
                href={`/learn?path=${key}`}
                className="card-hover p-6 group cursor-pointer"
              >
                <div className="text-4xl mb-4">{path.icon}</div>
                <h4 className="text-xl font-bold mb-2 text-[var(--color-text)] group-hover:text-primary-400 transition-colors">
                  {path.name}
                </h4>
                <p className="text-[var(--color-text-muted)] text-sm mb-4">
                  {path.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {path.technologies.slice(0, 4).map(tech => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 text-xs rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                  {path.technologies.length > 4 && (
                    <span className="px-2 py-1 bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] text-xs rounded-full">
                      +{path.technologies.length - 4} more
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies by Phase */}
      <section className="py-16 px-4 bg-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-[var(--color-text)]">
            Learning Path
          </h3>
          <div className="space-y-12">
            {CATEGORIES.map(category => (
              <div key={category.id}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">{category.icon}</span>
                  <h4 className="text-xl font-bold text-[var(--color-text)]">
                    Phase {category.phase}: {category.name}
                  </h4>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {ALL_TECHNOLOGIES.filter(t => t.category === category.id).map(tech => (
                    <Link
                      key={tech.id}
                      href={`/learn/${tech.slug}`}
                      className="card-hover p-4 flex items-center gap-3"
                    >
                      <span className="text-2xl">{tech.icon}</span>
                      <div>
                        <h5 className="font-medium text-[var(--color-text)]">{tech.name}</h5>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {tech.topics.length} topics · {tech.estimatedHours}h
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification Preview */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-[var(--color-text)]">
            Gamification Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6 text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="font-bold mb-2 text-[var(--color-text)]">XP System</h4>
              <p className="text-sm text-[var(--color-text-muted)]">
                Earn XP for every topic completed. Bonus XP for streaks!
              </p>
            </div>
            <div className="card p-6 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="font-bold mb-2 text-[var(--color-text)]">Achievements</h4>
              <p className="text-sm text-[var(--color-text-muted)]">
                Unlock badges and achievements as you progress.
              </p>
            </div>
            <div className="card p-6 text-center">
              <div className="text-4xl mb-4">🔥</div>
              <h4 className="font-bold mb-2 text-[var(--color-text)]">Daily Streaks</h4>
              <p className="text-sm text-[var(--color-text-muted)]">
                Keep your streak alive with daily learning goals.
              </p>
            </div>
            <div className="card p-6 text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h4 className="font-bold mb-2 text-[var(--color-text)]">Leaderboards</h4>
              <p className="text-sm text-[var(--color-text-muted)]">
                Compete with other learners on the global leaderboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Progress (if logged in) */}
      {isAuthenticated && user && (
        <section className="py-16 px-4 bg-[var(--color-surface)]">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-8 text-center text-[var(--color-text)]">
              Your Progress
            </h3>
            <div className="card p-8">
              <div className="flex items-center gap-6 mb-8">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-20 h-20 rounded-full border-4 border-primary-500"
                />
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-[var(--color-text)]">{user.name}</h4>
                  <p className="text-[var(--color-text-muted)]">{user.email}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-sm">
                      <span className="font-bold text-primary-500">Level {user.level}</span>
                    </span>
                    <span className="text-sm">
                      <span className="font-bold text-accent-500">{formatXP(user.xp)}</span>
                    </span>
                    <span className="text-sm">
                      <span className="font-bold text-orange-500">🔥 {user.streakDays} day streak</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Level Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[var(--color-text-muted)]">Level {user.level}</span>
                  <span className="text-[var(--color-text-muted)]">Level {user.level + 1}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${levelProgress.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-center mt-2 text-[var(--color-text-muted)]">
                  {levelProgress.current} / {levelProgress.needed} XP to next level
                </p>
              </div>

              <Link
                href="/dashboard"
                className="block w-full py-3 bg-primary-600 text-white rounded-lg font-bold text-center hover:bg-primary-700 transition-colors"
              >
                View Full Dashboard
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto text-center text-[var(--color-text-muted)]">
          <p className="mb-2">DevOpsQuest - Open Source Gamified Learning Platform</p>
          <p className="text-sm">
            Powered by W3Schools tutorials • Built with Next.js & Cloudflare
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-text)] transition-colors"
            >
              GitHub
            </a>
            <span>•</span>
            <a
              href="/docs"
              className="hover:text-[var(--color-text)] transition-colors"
            >
              Documentation
            </a>
            <span>•</span>
            <a
              href="/privacy"
              className="hover:text-[var(--color-text)] transition-colors"
            >
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
