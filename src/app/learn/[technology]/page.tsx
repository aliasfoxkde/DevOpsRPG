'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import { getTechnologyBySlug } from '@/data/technologies';
import { cn } from '@/lib/auth';
import { formatTimeSpent } from '@/data/achievements';

export default function TechnologyPage() {
  const params = useParams();
  const slug = params.technology as string;
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, isAuthenticated, updateUser } = useAuth();
  const { completeTopic, isTopicCompleted, getTechnologyProgress } = useProgress();

  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showXPGain, setShowXPGain] = useState<{ amount: number; isStreak: boolean } | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);

  const technology = getTechnologyBySlug(slug);
  const progress = technology ? getTechnologyProgress(technology.id) : null;

  // Timer for time spent
  useEffect(() => {
    if (!technology) return;
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [technology]);

  if (!technology) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">
            Technology not found
          </h1>
          <Link href="/learn" className="text-primary-500 hover:text-primary-400">
            Back to Learn
          </Link>
        </div>
      </div>
    );
  }

  const currentTopic = technology.topics[currentTopicIndex];
  const isCompleted = isTopicCompleted(technology.slug, currentTopic.slug);

  const handleComplete = async () => {
    if (isCompleted || isCompleting) return;

    setIsCompleting(true);
    const result = completeTopic(technology.slug, currentTopic.slug, timeSpent);

    // Show XP gain animation
    setShowXPGain({ amount: result.xpGained, isStreak: result.leveledUp });
    setTimeout(() => {
      setShowXPGain(null);
      setIsCompleting(false);
      setTimeSpent(0);
    }, 2000);

    // If leveled up, update user
    if (result.leveledUp && user) {
      updateUser({ level: result.newLevel });
    }
  };

  const goToNextTopic = () => {
    if (currentTopicIndex < technology.topics.length - 1) {
      setCurrentTopicIndex(prev => prev + 1);
      setTimeSpent(0);
    }
  };

  const goToPrevTopic = () => {
    if (currentTopicIndex > 0) {
      setCurrentTopicIndex(prev => prev - 1);
      setTimeSpent(0);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/learn"
              className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
            >
              ←
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{technology.icon}</span>
              <div>
                <h1 className="font-bold text-[var(--color-text)]">{technology.name}</h1>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {currentTopicIndex + 1} of {technology.topics.length}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className="hidden sm:flex items-center gap-2 text-[var(--color-text-muted)]">
              <span>⏱️</span>
              <span className="font-mono text-sm">{formatTimeSpent(timeSpent)}</span>
            </div>

            {/* XP per topic */}
            <div className="hidden sm:block px-3 py-1 bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-300 rounded-full text-sm font-medium">
              +{technology.xpPerTopic} XP
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
            >
              {resolvedTheme === 'dark' ? '🌙' : '☀️'}
            </button>

            {isAuthenticated && user && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-accent-500">{user.xp} XP</span>
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-primary-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-[var(--color-border)]">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
            style={{ width: `${((currentTopicIndex + 1) / technology.topics.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Topic List Sidebar */}
        <aside className="hidden lg:block w-80 border-r border-[var(--color-border)] bg-[var(--color-surface)] overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-bold text-[var(--color-text-muted)] mb-3 uppercase tracking-wide">
              Topics
            </h2>
            <ul className="space-y-1">
              {technology.topics.map((topic, index) => {
                const topicCompleted = isTopicCompleted(technology.slug, topic.slug);
                const isActive = index === currentTopicIndex;

                return (
                  <li key={topic.id}>
                    <button
                      onClick={() => {
                        setCurrentTopicIndex(index);
                        setTimeSpent(0);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-3',
                        isActive
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 font-medium'
                          : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]'
                      )}
                    >
                      <span className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center text-xs',
                        topicCompleted
                          ? 'bg-success text-white'
                          : 'bg-[var(--color-border)] text-[var(--color-text-muted)]'
                      )}>
                        {topicCompleted ? '✓' : index + 1}
                      </span>
                      <span className="truncate">{topic.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Progress Summary */}
          {progress && (
            <div className="p-4 border-t border-[var(--color-border)]">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--color-text-muted)]">Progress</span>
                <span className="font-bold text-[var(--color-text)]">
                  {progress.percentage}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col">
          {/* Topic Header */}
          <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
              {currentTopic.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
              <span>W3Schools Tutorial</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span>{isCompleted ? '✅ Completed' : '📖 In Progress'}</span>
              </span>
            </div>
          </div>

          {/* iframe Container */}
          <div className="flex-1 relative bg-[var(--color-surface)]">
            <iframe
              src={currentTopic.url}
              className="w-full h-full absolute inset-0 border-0"
              title={currentTopic.name}
              sandbox="allow-scripts allow-same-origin allow-popups"
              loading="lazy"
            />
          </div>

          {/* Bottom Action Bar */}
          <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="flex items-center justify-between gap-4">
              {/* Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevTopic}
                  disabled={currentTopicIndex === 0}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium transition-colors',
                    currentTopicIndex === 0
                      ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] cursor-not-allowed'
                      : 'bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] text-[var(--color-text)]'
                  )}
                >
                  ← Previous
                </button>
                <button
                  onClick={goToNextTopic}
                  disabled={currentTopicIndex === technology.topics.length - 1}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium transition-colors',
                    currentTopicIndex === technology.topics.length - 1
                      ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] cursor-not-allowed'
                      : 'bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] text-[var(--color-text)]'
                  )}
                >
                  Next →
                </button>
              </div>

              {/* Complete Button */}
              <button
                onClick={handleComplete}
                disabled={isCompleted || isCompleting}
                className={cn(
                  'px-6 py-2 rounded-lg font-bold transition-all',
                  isCompleted
                    ? 'bg-success text-white cursor-default'
                    : isCompleting
                    ? 'bg-primary-400 text-white cursor-wait animate-pulse'
                    : 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-105 shadow-lg glow-primary'
                )}
              >
                {isCompleted ? (
                  <span className="flex items-center gap-2">
                    ✓ Completed
                  </span>
                ) : isCompleting ? (
                  'Processing...'
                ) : (
                  <span className="flex items-center gap-2">
                    Mark Complete (+{technology.xpPerTopic} XP)
                  </span>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* XP Gain Animation */}
      {showXPGain && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="xp-pop text-center">
            <div className="text-6xl font-bold text-accent-400 drop-shadow-lg">
              +{showXPGain.amount} XP
            </div>
            {showXPGain.isStreak && (
              <div className="text-2xl text-primary-400 mt-2 streak-fire">
                🔥 LEVEL UP!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
