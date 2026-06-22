'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import { ALL_TECHNOLOGIES, CATEGORIES, CAREER_PATHS } from '@/data/technologies';
import type { CareerPath } from '@/types';

function LearnContent() {
  const searchParams = useSearchParams();
  const pathParam = searchParams.get('path') as CareerPath | null;
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { getTechnologyProgress } = useProgress();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTechnologies = selectedCategory
    ? ALL_TECHNOLOGIES.filter(t => t.category === selectedCategory)
    : pathParam
    ? ALL_TECHNOLOGIES.filter(t =>
        CAREER_PATHS[pathParam]?.technologies.includes(t.slug)
      )
    : ALL_TECHNOLOGIES;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">🎮</span>
              <span className="font-bold text-[var(--color-text)]">DevOpsQuest</span>
            </Link>

            {/* Category Filters */}
            <div className="hidden md:flex items-center gap-2 ml-8">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                All
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="hidden lg:inline">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? '🌙' : '☀️'}
            </button>

            {isAuthenticated && user && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--color-text-muted)]">
                  {user.xp} XP
                </span>
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-primary-500"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
            {pathParam ? CAREER_PATHS[pathParam]?.name : 'All Technologies'}
          </h1>
          <p className="text-[var(--color-text-muted)]">
            {pathParam
              ? CAREER_PATHS[pathParam]?.description
              : `Learn ${filteredTechnologies.length} technologies with hands-on tutorials`}
          </p>
        </div>

        {/* Career Path Selector */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-3 pb-2">
            {Object.entries(CAREER_PATHS).map(([key, path]) => (
              <Link
                key={key}
                href={`/learn?path=${key}`}
                className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all ${
                  pathParam === key
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-glow-primary'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-primary-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{path.icon}</span>
                  <span className="font-medium text-[var(--color-text)] whitespace-nowrap">
                    {path.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Technologies Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTechnologies.map(tech => {
            const progress = getTechnologyProgress(tech.id);
            const category = CATEGORIES.find(c => c.id === tech.category);

            return (
              <Link
                key={tech.id}
                href={`/learn/${tech.slug}`}
                className="card-hover group cursor-pointer overflow-hidden"
              >
                {/* Header with color */}
                <div
                  className="h-2"
                  style={{ backgroundColor: tech.color }}
                />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{tech.icon}</span>
                      <div>
                        <h3 className="font-bold text-[var(--color-text)] group-hover:text-primary-400 transition-colors">
                          {tech.name}
                        </h3>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          Phase {tech.phase}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2">
                    {tech.description}
                  </p>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--color-text-muted)]">Progress</span>
                      <span className="font-medium text-[var(--color-text)]">
                        {progress.completed}/{progress.total}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                    <span>{tech.topics.length} topics</span>
                    <span>~{tech.estimatedHours}h</span>
                    {category && (
                      <span className="flex items-center gap-1">
                        {category.icon}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredTechnologies.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-[var(--color-text-muted)] mb-4">
              No technologies found for this path.
            </p>
            <Link
              href="/learn"
              className="text-primary-500 hover:text-primary-400 font-medium"
            >
              View all technologies
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function LearnLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-[var(--color-text-muted)]">Loading...</p>
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<LearnLoading />}>
      <LearnContent />
    </Suspense>
  );
}
