import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

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
  completeTopic: (topicId: string, technologyId: string, xp: number) => void
  isTopicCompleted: (topicId: string) => boolean
}

const STORAGE_KEY = 'devopsquest_progress'

const XP_PER_LEVEL = 100

function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

const defaultProgress: UserProgress = {
  xp: 0,
  level: 1,
  streakDays: 0,
  lastActive: new Date().toISOString().split('T')[0],
  completedTopics: [],
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function ProgressProvider({ children, totalTopics = 500 }: { children: ReactNode; totalTopics?: number }) {
  const [progress, setProgress] = useState<UserProgress>(() => {
    /* istanbul ignore if */
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          return defaultProgress
        }
      }
    }
    return defaultProgress
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const completeTopic = useCallback((topicId: string, technologyId: string, xpEarned: number) => {
    setProgress((prev) => {
      const alreadyCompleted = prev.completedTopics.some(
        (t) => t.topicId === topicId
      )
      if (alreadyCompleted) return prev

      const newXp = prev.xp + xpEarned
      const newLevel = calculateLevel(newXp)
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      let newStreak = prev.streakDays
      if (prev.lastActive === yesterday) {
        newStreak += 1
      } else if (prev.lastActive !== today) {
        newStreak = 1
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        streakDays: newStreak,
        lastActive: today,
        completedTopics: [
          ...prev.completedTopics,
          {
            topicId,
            technologyId,
            completed: true,
            xpEarned,
            completedAt: new Date().toISOString(),
          },
        ],
      }
    })
  }, [])

  const isTopicCompleted = useCallback(
    (topicId: string) => {
      return progress.completedTopics.some((t) => t.topicId === topicId)
    },
    [progress.completedTopics]
  )

  return (
    <ProgressContext.Provider
      value={{
        progress,
        completedCount: progress.completedTopics.length,
        totalTopics,
        completeTopic,
        isTopicCompleted,
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}
