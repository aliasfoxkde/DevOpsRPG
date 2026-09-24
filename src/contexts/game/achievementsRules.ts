// Unlock rules for the legacy ACHIEVEMENTS catalog (defaultState.ts),
// evaluated in GameContext.completeQuest. Pure: inputs in, boolean out.
import { allQuests } from '../../data/quests'

export interface LegacyAchievementContext {
  completedCount: number // Quests completed including the one just finished
  newStreak: number
  newLevel: number
  newXp: number
  completedQuestIds: string[] // Roster before the current quest is added
}

// `currentQuestId` counts toward foundation completion because the quest being
// completed is not yet part of the saved roster when this runs.
export function isLegacyAchievementUnlocked(
  achievementId: string,
  ctx: LegacyAchievementContext,
  currentQuestId: string,
): boolean {
  const { completedCount, newStreak, newLevel, newXp, completedQuestIds } = ctx
  switch (achievementId) {
    case 'first_steps':
      return completedCount >= 1
    case 'dedicated':
    case 'streak_7':
      return newStreak >= 7
    case 'level_5':
      return newLevel >= 5
    case 'level_10':
      return newLevel >= 10
    case 'level_15':
      return newLevel >= 15
    case 'xp_500':
      return newXp >= 500
    case 'xp_1000':
      return newXp >= 1000
    case 'topics_10':
      return completedCount >= 10
    case 'topics_25':
      return completedCount >= 25
    case 'all_foundations': {
      // Check if all foundations quests are complete
      const foundationsQuests = allQuests.filter((q) => q.realmId === 'foundations')
      return foundationsQuests.every(
        (fq) => completedQuestIds.includes(fq.id) || fq.id === currentQuestId,
      )
    }
    case 'streak_30':
      return newStreak >= 30
    default:
      return false
  }
}
