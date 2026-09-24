// Tests for the shared fully-completed-technologies derivation used by the
// badge and milestone checkers.
import { describe, it, expect } from 'vitest'
import { computeFullyCompletedTechnologies } from './progression'
import { allQuests } from '../../data/quests'
import { technologies } from '../../data/technologies'

function techWithQuests() {
  for (const tech of Object.values(technologies)) {
    const quests = allQuests.filter((q) => q.technologyId === tech.id)
    if (quests.length >= 2) return { tech, quests }
  }
  throw new Error('no technology with two or more quests found')
}

describe('computeFullyCompletedTechnologies', () => {
  it('includes a technology only when every quest topic is completed', () => {
    const { tech, quests } = techWithQuests()

    const partial = new Set(quests.slice(0, -1).map((q) => q.topicId))
    expect(computeFullyCompletedTechnologies(partial)).not.toContain(tech.id)

    const full = new Set(quests.map((q) => q.topicId))
    expect(computeFullyCompletedTechnologies(full)).toContain(tech.id)
  })

  it('excludes technologies with no quests', () => {
    const noQuestTech = Object.values(technologies).find(
      (tech) => !allQuests.some((q) => q.technologyId === tech.id),
    )
    if (!noQuestTech) return // every technology has quests; nothing to assert

    const everything = new Set(allQuests.map((q) => q.topicId))
    expect(computeFullyCompletedTechnologies(everything)).not.toContain(noQuestTech.id)
  })

  it('returns nothing for an empty roster', () => {
    expect(computeFullyCompletedTechnologies(new Set())).toEqual([])
  })
})
