// Progression derivations shared by the badge and milestone checkers.
import { allQuests } from '../../data/quests'
import { technologies } from '../../data/technologies'

// Technologies whose every quest topic is completed.
//
// Deliberately distinct from completeQuest's inline completed-tech list,
// which tracks techs *touched* (>= 1 completed quest) plus the quest just
// finished — badge requirements read that broader list from the
// quest-completion path, while checkAndUnlockBadges/checkAndUnlockMilestones
// both use this strict full-computation form.
export function computeFullyCompletedTechnologies(completedTopicIds: Set<string>): string[] {
  const completedTechnologies: string[] = []
  for (const tech of Object.values(technologies)) {
    const techQuests = allQuests.filter((q) => q.technologyId === tech.id)
    if (techQuests.length > 0 && techQuests.every((q) => completedTopicIds.has(q.topicId))) {
      completedTechnologies.push(tech.id)
    }
  }
  return completedTechnologies
}
