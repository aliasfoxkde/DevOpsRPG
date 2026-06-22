'use client';

import Link from 'next/link';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import { ALL_TECHNOLOGIES, CATEGORIES, CAREER_PATHS } from '@/data/technologies';
import { ACHIEVEMENTS, formatXP } from '@/data/achievements';
import { getLevelProgress } from '@/lib/utils';
import { cn } from '@/lib/auth';

export default function DashboardPage() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { progress, completedTopics, totalCompleted, totalTopics, getTechnologyProgress } = useProgress();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">
            Please sign in to view your dashboard
          </h1>
          <Link href="/" className="text-primary-500 hover:text-primary-400">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const levelProgress = getLevelProgress(user.xp);
  const overallPercentage = totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0;

  // Get recent achievements (last 3)
  const recentAchievements = ACHIEVEMENTS.slice(0, 3);

  // Get in-progress technologies
  const inProgressTechs = ALL_TECHNOLOGIES.filter(tech => {
    const p = getTechnologyProgress(tech.id);
    return p.completed > 0 && p.percentage < 100;
  }).slice(0, 4);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">🎮</span>
              <span className="font-bold text-[var(--color-text)]">DevOpsQuest</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              {resolvedTheme === 'dark' ? '🌙' : '☀️'}
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-[var(--color-surface-hover)] rounded-lg text-sm font-medium hover:bg-[var(--color-border)] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Keep up the great work! You're making fantastic progress.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* XP Card */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Total XP</p>
                <p className="text-2xl font-bold text-accent-500">{formatXP(user.xp)}</p>
              </div>
            </div>
            <div className="text-xs text-[var(--color-text-muted)]">
              Keep learning to earn more XP!
            </div>
          </div>

          {/* Level Card */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Level</p>
                <p className="text-2xl font-bold text-primary-500">{user.level}</p>
              </div>
            </div>
            <div className="progress-bar mb-2">
              <div
                className="progress-bar-fill"
                style={{ width: `${levelProgress.percentage}%` }}
              />
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              {levelProgress.current} / {levelProgress.needed} XP to level {user.level + 1}
            </p>
          </div>

          {/* Streak Card */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center streak-fire">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Current Streak</p>
                <p className="text-2xl font-bold text-orange-500">{user.streakDays} days</p>
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              {user.streakDays === 0 ? 'Start learning to build your streak!' : 'Keep it going!'}
            </p>
          </div>

          {/* Progress Card */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Topics Done</p>
                <p className="text-2xl font-bold text-success">{totalCompleted}</p>
              </div>
            </div>
            <div className="progress-bar mb-2">
              <div
                className="progress-bar-fill bg-success"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              {overallPercentage}% of all topics
            </p>
          </div>
        </div>

        {/* Continue Learning */}
        {inProgressTechs.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--color-text)]">Continue Learning</h2>
              <Link href="/learn" className="text-sm text-primary-500 hover:text-primary-400">
                View All →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {inProgressTechs.map(tech => {
                const p = getTechnologyProgress(tech.id);
                return (
                  <Link
                    key={tech.id}
                    href={`/learn/${tech.slug}`}
                    className="card-hover p-4 flex items-center gap-3"
                  >
                    <span className="text-2xl">{tech.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-[var(--color-text)] truncate">
                        {tech.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 progress-bar h-1.5">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${p.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {p.percentage}%
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Achievements */}
          <section className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--color-text)]">Achievements</h2>
              <span className="text-sm text-[var(--color-text-muted)]">
                {recentAchievements.length} shown
              </span>
            </div>
            <div className="space-y-3">
              {recentAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-[var(--color-surface-hover)]"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl">
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[var(--color-text)]">
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.xpReward > 0 && (
                    <span className="text-sm font-medium text-accent-500">
                      +{achievement.xpReward} XP
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Quick Stats */}
          <section className="card p-6">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">
              Learning Journey
            </h2>
            <div className="space-y-4">
              {/* Overall Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[var(--color-text-muted)]">Overall Progress</span>
                  <span className="font-medium text-[var(--color-text)]">{overallPercentage}%</span>
                </div>
                <div className="progress-bar h-3">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${overallPercentage}%` }}
                  />
                </div>
              </div>

              {/* Category Progress */}
              {CATEGORIES.map(category => {
                const categoryTechs = ALL_TECHNOLOGIES.filter(t => t.category === category.id);
                const completedInCategory = categoryTechs.filter(tech => {
                  const p = getTechnologyProgress(tech.id);
                  return p.percentage === 100;
                }).length;
                const totalInCategory = categoryTechs.length;
                const categoryPercentage = totalInCategory > 0
                  ? Math.round((completedInCategory / totalInCategory) * 100)
                  : 0;

                return (
                  <div key={category.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2 text-[var(--color-text-muted)]">
                        <span>{category.icon}</span>
                        <span>Phase {category.phase}</span>
                      </span>
                      <span className="font-medium text-[var(--color-text)]">
                        {completedInCategory}/{totalInCategory}
                      </span>
                    </div>
                    <div className="progress-bar h-2">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${categoryPercentage}%`, backgroundColor: category.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Career Path */}
            {user.theme && (
              <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                <p className="text-sm text-[var(--color-text-muted)] mb-2">Current Path</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CAREER_PATHS[user.theme]?.icon}</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {CAREER_PATHS[user.theme]?.name}
                  </span>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* CTA */}
        <section className="mt-8 card p-8 text-center bg-gradient-to-r from-primary-600 to-secondary-600 border-0">
          <h2 className="text-2xl font-bold text-white mb-2">
            Ready to continue your journey?
          </h2>
          <p className="text-white/80 mb-6">
            Pick up where you left off and keep building your skills.
          </p>
          <Link
            href="/learn"
            className="inline-block px-8 py-3 bg-white text-primary-600 rounded-xl font-bold hover:bg-white/90 transition-colors"
          >
            🚀 Continue Learning
          </Link>
        </section>
      </main>
    </div>
  );
}
