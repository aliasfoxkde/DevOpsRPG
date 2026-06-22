'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Progress } from '@/types';
import { storage, generateId } from '@/lib/auth';
import { ALL_TECHNOLOGIES } from '@/data/technologies';
import { calculateXPGain, getLevelProgress } from '@/lib/utils';
import { getLevelFromXP, getXPForLevel } from '@/data/achievements';

interface ProgressContextType {
  progress: Progress[];
  completedTopics: Set<string>;
  totalCompleted: number;
  totalTopics: number;
  xpForTopic: (technology: string) => number;
  completeTopic: (technology: string, topic: string, timeSpent: number) => { xpGained: number; leveledUp: boolean; newLevel: number };
  isTopicCompleted: (technology: string, topic: string) => boolean;
  getTechnologyProgress: (technologyId: string) => { completed: number; total: number; percentage: number };
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress[]>(() => {
    return storage.get<Progress[]>('progress', []);
  });

  const completedTopics = new Set(
    progress.filter(p => p.completed).map(p => `${p.technology}:${p.topic}`)
  );

  const totalCompleted = completedTopics.size;
  const totalTopics = ALL_TECHNOLOGIES.reduce((acc, t) => acc + t.topics.length, 0);

  const xpForTopic = useCallback((technology: string): number => {
    const tech = ALL_TECHNOLOGIES.find(t => t.id === technology || t.slug === technology);
    return tech?.xpPerTopic ?? 75;
  }, []);

  const completeTopic = useCallback((
    technology: string,
    topic: string,
    timeSpent: number
  ): { xpGained: number; leveledUp: boolean; newLevel: number } => {
    const tech = ALL_TECHNOLOGIES.find(t => t.id === technology || t.slug === technology);
    const baseXP = tech?.xpPerTopic ?? 75;

    // Get current user XP from storage
    const user = storage.get<{ xp: number; level: number; streakDays: number } | null>('user', null);
    const currentXP = user?.xp ?? 0;
    const streakDays = user?.streakDays ?? 0;

    // Calculate XP gain
    const xpResult = calculateXPGain(baseXP, currentXP, streakDays);

    // Create new progress entry
    const newProgress: Progress = {
      id: generateId(),
      userId: user?.xp.toString() ?? 'anonymous',
      technology,
      topic,
      completed: true,
      xpEarned: xpResult.totalXP,
      timeSpent,
      completedAt: new Date().toISOString(),
    };

    // Update progress
    setProgress(prev => {
      const updated = [...prev, newProgress];
      storage.set('progress', updated);
      return updated;
    });

    // Update user XP and level
    const newXP = currentXP + xpResult.totalXP;
    const newLevel = getLevelFromXP(newXP);

    if (user) {
      storage.set('user', {
        ...user,
        xp: newXP,
        level: newLevel,
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      xpGained: xpResult.totalXP,
      leveledUp: xpResult.leveledUp,
      newLevel,
    };
  }, []);

  const isTopicCompleted = useCallback((technology: string, topic: string): boolean => {
    return completedTopics.has(`${technology}:${topic}`);
  }, [completedTopics]);

  const getTechnologyProgress = useCallback((technologyId: string): { completed: number; total: number; percentage: number } => {
    const tech = ALL_TECHNOLOGIES.find(t => t.id === technologyId);
    if (!tech) return { completed: 0, total: 0, percentage: 0 };

    const completed = tech.topics.filter(t =>
      completedTopics.has(`${tech.slug}:${t.slug}`)
    ).length;

    return {
      completed,
      total: tech.topics.length,
      percentage: tech.topics.length > 0 ? Math.round((completed / tech.topics.length) * 100) : 0,
    };
  }, [completedTopics]);

  const resetProgress = useCallback(() => {
    setProgress([]);
    storage.remove('progress');
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        completedTopics,
        totalCompleted,
        totalTopics,
        xpForTopic,
        completeTopic,
        isTopicCompleted,
        getTechnologyProgress,
        resetProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
