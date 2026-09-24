// Unlock rules for cosmetic titles and frames (data/titles.ts), evaluated in
// GameContext.checkAndUnlockTitlesFrames. Pure: a snapshot of progression in,
// lists of newly-earned ids out.
import { allQuests, realms } from '../../data/quests'
import { TITLES, FRAMES } from '../../data/titles'

export interface TitleFrameUnlockContext {
  unlockedTitles: string[]
  unlockedFrames: string[]
  completedQuestCount: number
  level: number
  streakDays: number
  techCounts: Record<string, number> // technologyId -> quests completed
  completedRealmCount: number
  badgesEarned: number
  fastestQuestTime: number
}

const TOTAL_REALMS = Object.keys(realms).length

// Per-technology quest completion counts, from the completed-quest roster.
export function countTechQuests(completedQuestIds: string[]): Record<string, number> {
  const techCounts: Record<string, number> = {}
  for (const questId of completedQuestIds) {
    const quest = allQuests.find((q) => q.id === questId)
    if (quest) {
      techCounts[quest.technologyId] = (techCounts[quest.technologyId] || 0) + 1
    }
  }
  return techCounts
}

export function getUnlockedTitleIds(ctx: TitleFrameUnlockContext): string[] {
  const unlocked: string[] = []
  for (const title of TITLES) {
    if (ctx.unlockedTitles.includes(title.id)) continue

    let earned = false
    switch (title.id) {
      case 'novice-devops':
        earned = ctx.completedQuestCount >= 5
        break
      case 'eager-learner':
        earned = ctx.completedQuestCount >= 10
        break
      case 'quest-seeker':
        earned = ctx.completedQuestCount >= 15
        break
      case 'code-crusader':
        earned = ctx.completedQuestCount >= 25
        break
      case 'cloud-hopeful':
        earned = (ctx.techCounts['aws'] || 0) >= 5
        break
      case 'container-captain':
        earned = (ctx.techCounts['docker'] || 0) >= 5
        break
      case 'git-guru':
        earned = (ctx.techCounts['git'] || 0) >= 5
        break
      case 'python-pro':
        earned = (ctx.techCounts['python'] || 0) >= 5
        break
      case 'ci-cd-champion':
        earned = (ctx.techCounts['cicd'] || 0) >= 10
        break
      case 'kubernetes-knight':
        earned = (ctx.techCounts['kubernetes'] || 0) >= 10
        break
      case 'infrastructure-inquisitor':
        earned = (ctx.techCounts['terraform'] || 0) >= 10
        break
      case 'monitoring-master':
        earned = (ctx.techCounts['monitoring'] || 0) >= 10
        break
      case 'streak-slayer':
        earned = ctx.streakDays >= 14
        break
      case 'devops-dragon':
        earned = ctx.completedQuestCount >= 100
        break
      case 'realm-ruler':
        earned = ctx.completedRealmCount >= TOTAL_REALMS
        break
      case 'almighty-architect':
        earned = ctx.level >= 50
        break
      case 'golden-gamer':
        earned = ctx.badgesEarned >= 50
        break
      case 'speed-demon':
        earned = ctx.fastestQuestTime < 30
        break
    }
    if (earned) unlocked.push(title.id)
  }
  return unlocked
}

export function getUnlockedFrameIds(ctx: TitleFrameUnlockContext): string[] {
  const unlocked: string[] = []
  for (const frame of FRAMES) {
    if (ctx.unlockedFrames.includes(frame.id)) continue

    let earned = false
    switch (frame.id) {
      case 'default':
        earned = true
        break
      case 'bronze':
        earned = ctx.completedQuestCount >= 10
        break
      case 'silver':
        earned = ctx.completedQuestCount >= 25
        break
      case 'gold':
        earned = ctx.completedQuestCount >= 50
        break
      case 'emerald':
        earned = (ctx.techCounts['python'] || 0) >= 10
        break
      case 'ruby':
        earned = (ctx.techCounts['git'] || 0) >= 10
        break
      case 'sapphire':
        earned = (ctx.techCounts['aws'] || 0) >= 10
        break
      case 'amethyst':
        earned = (ctx.techCounts['docker'] || 0) >= 10
        break
      case 'diamond':
        earned = ctx.completedQuestCount >= 100
        break
      case 'prismatic':
        earned = ctx.level >= 50
        break
    }
    if (earned) unlocked.push(frame.id)
  }
  return unlocked
}
