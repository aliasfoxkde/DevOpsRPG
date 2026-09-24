// Behavior tests for quest generation and progression gating. integrity.test.ts
// owns the "one quest per topic / ids resolve" invariants; these tests pin the
// *generated values* (time/difficulty/XP ladder, boss placement) and the
// getNextQuest / isRealmUnlocked decisions players actually experience.
import { describe, it, expect } from 'vitest'
import { technologies } from './technologies'
import {
  allQuests,
  generateQuests,
  getNextQuest,
  isRealmUnlocked,
  realms,
  realmStories,
} from './quests'
import type { Quest, Realm } from './quests'

const techList = Object.values(technologies)

function questFor(topicId: string): Quest {
  const quest = allQuests.find((q) => q.topicId === topicId)
  if (!quest) throw new Error(`no quest generated for topic ${topicId}`)
  return quest
}

/** Every topic id of a technology, in catalog order. */
function topicIds(techId: string): string[] {
  return technologies[techId].topics.map((t) => t.id)
}

/** Set of topic ids for every quest of the given technologies. */
function completedSet(...techIds: string[]): Set<string> {
  const set = new Set<string>()
  for (const techId of techIds) {
    for (const quest of allQuests.filter((q) => q.technologyId === techId)) {
      set.add(quest.topicId)
    }
  }
  return set
}

describe('generateQuests', () => {
  it('is a pure function: regenerating produces the same catalog as the import', () => {
    expect(generateQuests()).toEqual(allQuests)
    // ...and it must not hand back a shared, mutable array.
    expect(generateQuests()).not.toBe(allQuests)
  })

  it('scales the XP reward with difficulty as base * (0.5 + 0.2 * difficulty)', () => {
    for (const quest of allQuests) {
      const base = technologies[quest.technologyId].xpPerTopic
      expect(quest.xpReward, quest.id).toBe(Math.round(base * (0.5 + quest.difficulty * 0.2)))
    }
  })

  it('keeps time estimates on the five shipped tiers, in ascending difficulty order', () => {
    const tiers = new Set(allQuests.map((q) => q.estimatedMinutes))
    expect([...tiers].sort((a, b) => a - b)).toEqual([3, 5, 8, 12, 15])
  })

  it('maps each time tier to the difficulty it promises (before the phase bump)', () => {
    const TIER_DIFFICULTY: Record<number, number> = { 3: 1, 5: 2, 8: 3, 12: 4, 15: 5 }
    for (const quest of allQuests) {
      if (technologies[quest.technologyId].phase >= 5) continue // +1 phase bump
      expect(quest.difficulty, quest.id).toBe(TIER_DIFFICULTY[quest.estimatedMinutes])
    }
  })

  it('opens every technology with a 3-minute intro quest', () => {
    for (const tech of techList) {
      const ids = topicIds(tech.id)
      expect(ids.length, `${tech.id} topic count`).toBeGreaterThan(0)
      const intro = questFor(ids[0])
      expect(intro.order, intro.id).toBe(1)
      expect(intro.estimatedMinutes, intro.id).toBe(3)
    }
  })

  it('makes the first topic of a long technology the boss', () => {
    for (const tech of techList) {
      const ids = topicIds(tech.id)
      const bosses = allQuests.filter((q) => q.technologyId === tech.id && q.type === 'boss')
      const expectBoss = ids.length > 3
      expect(
        bosses.map((b) => b.topicId),
        `${tech.id} boss placement`,
      ).toEqual(expectBoss ? [ids[0]] : [])
    }
  })

  it('numbers quests 1..n in topic order within each technology', () => {
    for (const tech of techList) {
      const ids = topicIds(tech.id)
      ids.forEach((topicId, index) => {
        expect(questFor(topicId).order, `${tech.id}/${topicId}`).toBe(index + 1)
      })
      expect(
        allQuests.filter((q) => q.technologyId === tech.id),
        `${tech.id} quest count`,
      ).toHaveLength(ids.length)
    }
  })

  it('describes each quest after its topic and technology', () => {
    for (const quest of allQuests) {
      const tech = technologies[quest.technologyId]
      const topic = tech.topics.find((t) => t.id === quest.topicId)
      expect(quest.title, quest.id).toBe(topic?.name)
      expect(quest.description, quest.id).toBe(`Learn ${quest.title} - ${tech.name}`)
    }
  })

  it('walks the html ladder across every time/difficulty tier', () => {
    // Hand-computed from the generator rules for html (phase 1, 75 XP/topic,
    // 15 topics). Position 1 is the 3-minute intro; the rest split by position
    // ratio: <=0.3 -> 5min, <=0.6 -> 8min, <=0.8 -> 12min, else 15min.
    expect(questFor('html_intro')).toEqual({
      id: 'quest_html_intro',
      technologyId: 'html',
      topicId: 'html_intro',
      realmId: 'foundations',
      title: 'HTML Introduction',
      description: 'Learn HTML Introduction - HTML',
      type: 'boss',
      xpReward: 53, // round(75 * 0.7)
      difficulty: 1,
      estimatedMinutes: 3,
      order: 1,
    })
    // Last topic inside the <=0.3 ratio band.
    expect(questFor('html_elements')).toMatchObject({
      estimatedMinutes: 5,
      difficulty: 2,
      xpReward: 68, // round(75 * 0.9)
      type: 'battle',
      order: 4,
    })
    // Last topic inside the <=0.6 band.
    expect(questFor('html_formatting')).toMatchObject({
      estimatedMinutes: 8,
      difficulty: 3,
      xpReward: 83, // round(75 * 1.1)
      order: 9,
    })
    // Last topic inside the <=0.8 band.
    expect(questFor('html_lists')).toMatchObject({
      estimatedMinutes: 12,
      difficulty: 4,
      xpReward: 98, // round(75 * 1.3)
      order: 12,
    })
    // Expert tail.
    expect(questFor('html_forms')).toMatchObject({
      estimatedMinutes: 15,
      difficulty: 5,
      xpReward: 113, // round(75 * 1.5)
      order: 15,
    })
  })

  it('bumps advanced-phase difficulty by one but never past 5', () => {
    // istio is phase 7: a 3-minute intro would be difficulty 1 without the bump.
    expect(questFor('istio_intro')).toMatchObject({
      realmId: 'aiintelligence',
      estimatedMinutes: 3,
      difficulty: 2,
      xpReward: 180, // round(200 * 0.9)
    })
    // security is phase 5, same bump.
    expect(questFor('sec_intro')).toMatchObject({ difficulty: 2, xpReward: 135 })
    // A topic already at difficulty 5 stays there (capped, not wrapped).
    expect(questFor('istio_observability')).toMatchObject({
      estimatedMinutes: 15,
      difficulty: 5,
      xpReward: 300, // round(200 * 1.5)
    })
  })

  it('spreads every technology across at least two difficulty tiers', () => {
    for (const tech of techList) {
      const difficulties = new Set(
        allQuests.filter((q) => q.technologyId === tech.id).map((q) => q.difficulty),
      )
      expect(difficulties.size, `${tech.id} tiers`).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('getNextQuest', () => {
  it('starts a new player on the very first generated quest', () => {
    expect(getNextQuest(new Set())).toBe(allQuests[0])
  })

  it('skips completed topics in generation order', () => {
    expect(getNextQuest(new Set(['html_intro']))?.topicId).toBe('html_editors')
  })

  it('jumps realms once a technology is finished', () => {
    const afterHtml = getNextQuest(completedSet('html'))
    expect(afterHtml?.technologyId).toBe('css')
  })

  it('is stable and never repeats a quest', () => {
    const completed = new Set<string>()
    const seen: string[] = []
    for (let step = 0; step < 25; step += 1) {
      const next = getNextQuest(completed)
      if (!next) throw new Error('ran out of quests after 25 steps')
      expect(seen).not.toContain(next.id)
      seen.push(next.id)
      expect(getNextQuest(completed)?.id, `step ${step}`).toBe(next.id)
      completed.add(next.topicId)
    }
    expect(seen).toHaveLength(25)
  })

  it('reports completion (null) once every topic is done', () => {
    const everything = new Set(techList.flatMap((t) => t.topics.map((topic) => topic.id)))
    expect(getNextQuest(everything)).toBeNull()
  })
})

describe('isRealmUnlocked', () => {
  const allTopics = new Set(techList.flatMap((t) => t.topics.map((topic) => topic.id)))

  function realm(id: string): Realm {
    return realms[id]
  }

  it('always unlocks the first realm, whatever the player state', () => {
    expect(isRealmUnlocked(realm('foundations'), 1, new Set())).toBe(true)
    expect(isRealmUnlocked(realm('foundations'), 0, new Set())).toBe(true)
    expect(isRealmUnlocked(realm('foundations'), 99, allTopics)).toBe(true)
  })

  it('gates a realm on level before looking at progress', () => {
    expect(
      isRealmUnlocked(realm('scripts'), 4, completedSet('html', 'css', 'javascript', 'git', 'sql')),
    ).toBe(false)
    expect(isRealmUnlocked(realm('aiintelligence'), 24, new Set<string>())).toBe(false)
  })

  it('keeps a realm locked while the previous realm has unfinished technology', () => {
    // Level 5 is enough for the Forest of Scripts, but Foundations is untouched.
    expect(isRealmUnlocked(realm('scripts'), 5, new Set())).toBe(false)
    // One unfinished html topic is enough to keep the gate shut.
    const nearlyDone = completedSet('html', 'css', 'javascript', 'git', 'sql')
    nearlyDone.delete('html_forms')
    expect(isRealmUnlocked(realm('scripts'), 25, nearlyDone)).toBe(false)
    expect(
      isRealmUnlocked(
        realm('scripts'),
        25,
        completedSet('html', 'css', 'javascript', 'git', 'sql'),
      ),
    ).toBe(true)
  })

  it('checks only the immediately preceding realm', () => {
    // Cloud's gate looks at the Castle of Frameworks, not at Foundations.
    const foundationsAndScripts = completedSet(
      'html',
      'css',
      'javascript',
      'git',
      'sql',
      'python',
      'bash',
      'docker',
    )
    expect(isRealmUnlocked(realm('cloud'), 15, foundationsAndScripts)).toBe(false)
  })

  it('unlocks every realm for a max-level player who cleared everything', () => {
    for (const entry of Object.values(realms)) {
      expect(isRealmUnlocked(entry, 25, allTopics), entry.id).toBe(true)
    }
  })

  it('treats a level-gated first realm as unlocked by position alone', () => {
    // Synthetic: foundations with a level requirement. The position check makes
    // it pass regardless of progress, documenting the ordering of the guards.
    const gatedFirst: Realm = { ...realm('foundations'), requiredLevel: 3 }
    expect(isRealmUnlocked(gatedFirst, 3, new Set())).toBe(true)
  })
})

describe('realmStories', () => {
  it('has a story for every realm that ships one', () => {
    const storyIds = Object.keys(realmStories)
    expect(storyIds).toEqual(['foundations', 'scripts', 'frameworks', 'cloud', 'devops'])
    for (const id of storyIds) {
      expect(realms[id], `${id} story has no realm`).toBeDefined()
      // The completion modal renders this verbatim; empty text is a broken modal.
      expect(realmStories[id].length, id).toBeGreaterThan(80)
      expect(realmStories[id], id).toContain('•')
    }
  })

  it('leaves exactly one realm without a story (the AI Nexus)', () => {
    const missing = Object.keys(realms).filter((id) => !(id in realmStories))
    expect(missing).toEqual(['aiintelligence'])
  })
})
