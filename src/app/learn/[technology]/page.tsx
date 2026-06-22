'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import { getTechnologyBySlug } from '@/data/technologies';
import { cn } from '@/lib/auth';
import { formatTimeSpent } from '@/data/achievements';

interface W3Content {
  title: string;
  content: string;
  code?: string;
}

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
  const [content, setContent] = useState<W3Content | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const technology = getTechnologyBySlug(slug);
  const progress = technology ? getTechnologyProgress(technology.id) : null;

  // Fetch content when topic changes
  useEffect(() => {
    if (!technology) return;

    const topic = technology.topics[currentTopicIndex];
    setLoading(true);
    setError(null);

    // Use CORS proxy for client-side fetch (Cloudflare Pages doesn't support API routes)
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    fetch(`${corsProxy}${encodeURIComponent(topic.url)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load content');
        return res.text();
      })
      .then(html => {
        const parsed = parseW3HTML(html, topic.url);
        setContent(parsed);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [technology, currentTopicIndex]);

  // Parse W3Schools HTML content client-side
  function parseW3HTML(html: string, originalUrl: string): W3Content {
    // Extract title
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(' - W3Schools', '').trim() : 'Tutorial';

    // Extract main content sections
    let content = '';

    // Find all w3-panel sections (tutorial text)
    const panelRegex = /<div class="w3-panel(?:\s+[^"]*)?"[^>]*>([\s\S]*?)<\/div>\s*(?=<div|$)/gi;
    let panelMatch;
    const panels: string[] = [];

    while ((panelMatch = panelRegex.exec(html)) !== null) {
      const panelContent = panelMatch[1].trim();
      // Skip if it's too short or contains navigation
      if (panelContent.length > 100 && !panelContent.includes('w3-bar-item') && !panelContent.includes('w3-dropdown')) {
        panels.push(panelContent);
      }
    }

    // Extract meaningful text from panels
    if (panels.length > 0) {
      content = panels
        .map(p => extractTextFromHTML(p))
        .filter(t => t.length > 50)
        .join('\n\n');
    }

    // Extract code examples
    let code = '';
    const codeMatches: string[] = [];

    // Find w3-code blocks
    const codeRegex = /<div class="w3-code(?:[^"]*)?"[^>]*>([\s\S]*?)<\/div>/gi;
    let codeMatch;
    while ((codeMatch = codeRegex.exec(html)) !== null) {
      const codeContent = decodeHTMLEntities(codeMatch[1].trim());
      if (codeContent.length > 20) {
        codeMatches.push(stripTags(codeContent));
      }
    }

    // Find w3-example blocks
    const exampleRegex = /<div class="w3-example"[\s\S]*?<pre[^>]*>([\s\S]*?)<\/pre>/gi;
    while ((codeMatch = exampleRegex.exec(html)) !== null) {
      const codeContent = decodeHTMLEntities(codeMatch[1].trim());
      if (codeContent.length > 20 && !codeMatches.includes(codeContent)) {
        codeMatches.push(stripTags(codeContent));
      }
    }

    if (codeMatches.length > 0) {
      code = codeMatches.slice(0, 3).join('\n\n---\n\n');
    }

    return {
      title,
      content: content || 'Content could not be extracted. Please visit the W3Schools website directly.',
      code: code || undefined,
    };
  }

  function extractTextFromHTML(html: string): string {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/ Advertisement/gi, '')
      .replace(/<div class="w3-(?:bar|dropdown|nav)"[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<div class="w3-video[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h[1-6]>/gi, '\n## $2\n')
      .replace(/<\/(?:p|div)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/?(?:ul|ol|li)>/gi, '\n')
      .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '_${1}_')
      .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '_${1}_')
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
      .replace(/<span[^>]*class="w3-codespan"[^>]*>([\s\S]*?)<\/span>/gi, '`$1`')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^\s+|\s+$/g, '')
      .trim();
  }

  function stripTags(html: string): string {
    return html
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  function decodeHTMLEntities(text: string): string {
    return text
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
  }

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
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Topic Header */}
          <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
              {currentTopic.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
              <a
                href={currentTopic.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:text-primary-400 flex items-center gap-1"
              >
                📖 View on W3Schools
              </a>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span>{isCompleted ? '✅ Completed' : '📖 In Progress'}</span>
              </span>
            </div>
          </div>

          {/* Content Container */}
          <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-bg)]">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-4xl mb-4 animate-spin">⏳</div>
                  <p className="text-[var(--color-text-muted)]">Loading content...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-4xl mb-4">❌</div>
                  <p className="text-[var(--color-text-muted)] mb-4">Failed to load content</p>
                  <a
                    href={currentTopic.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:text-primary-400"
                  >
                    Open on W3Schools directly
                  </a>
                </div>
              </div>
            ) : content ? (
              <div className="max-w-4xl mx-auto">
                {/* Tutorial Content */}
                <article className="prose prose-lg dark:prose-invert max-w-none">
                  <h1 className="text-3xl font-bold text-[var(--color-text)] mb-6">
                    {content.title}
                  </h1>

                  {content.content && (
                    <div className="text-[var(--color-text)] leading-relaxed mb-8 whitespace-pre-wrap">
                      {content.content}
                    </div>
                  )}

                  {/* Code Example */}
                  {content.code && (
                    <div className="mt-8">
                      <h3 className="text-xl font-bold text-[var(--color-text)] mb-4">Code Example:</h3>
                      <pre className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 overflow-x-auto">
                        <code className="text-sm text-[var(--color-text)] font-mono">
                          {content.code}
                        </code>
                      </pre>
                    </div>
                  )}
                </article>

                {/* External Reference */}
                <div className="mt-8 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    📚 This content is sourced from{' '}
                    <a
                      href={currentTopic.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:text-primary-400"
                    >
                      W3Schools {technology.name} Tutorial
                    </a>
                  </p>
                </div>
              </div>
            ) : null}
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
