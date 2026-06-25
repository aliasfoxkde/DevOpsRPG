// DEPRECATED: This context is deprecated. Use GameContext instead.
// @deprecated since 2026-06-24 - Use useGame() hook and GameProvider instead
// This file re-exports from GameContext for backward compatibility during migration

import { type ReactNode } from 'react'
import { useGame } from './GameContext'

export interface TopicProgress {
  topicId: string
  technologyId: string
  completed: boolean
  xpEarned: number
  completedAt?: string
}

export interface UserProgress {
  xp: number
  level: number
  streakDays: number
  lastActive: string
  completedTopics: TopicProgress[]
}

interface ProgressContextType {
  progress: UserProgress
  completedCount: number
  totalTopics: number
  completeTopic: (topicId: string, technologyId: string, xpEarned: number) => void
  isTopicCompleted: (topicId: string) => boolean
}

// @deprecated - use useGame() from GameContext instead
/* eslint-disable react-refresh/only-export-components */
export function useProgress(): ProgressContextType {
  const { game, completeLearningTopic, isLearningTopicCompleted } = useGame()

  return {
    progress: {
      xp: game.character.xp,
      level: game.character.level,
      streakDays: game.character.streakDays,
      lastActive: game.character.lastActive,
      completedTopics: game.completedTopics,
    },
    completedCount: game.completedTopics.length,
    totalTopics: 500,
    completeTopic: completeLearningTopic,
    isTopicCompleted: isLearningTopicCompleted,
  }
}

// @deprecated - use GameProvider from GameContext instead
export function ProgressProvider({ children }: { children: ReactNode }) {
  // DEPRECATED: This provider is deprecated. Use GameProvider from GameContext instead.
  // It still works because useProgress() now delegates to useGame() internally.
  // This is only here to prevent breaking changes during the migration period.
  return <>{children}</>
}
