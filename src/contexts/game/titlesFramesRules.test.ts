// Threshold tests for the cosmetic title/frame unlock rules extracted from
// GameContext.checkAndUnlockTitlesFrames.
import { describe, it, expect } from 'vitest'
import {
  countTechQuests,
  getUnlockedFrameIds,
  getUnlockedTitleIds,
  type TitleFrameUnlockContext,
} from './titlesFramesRules'
import { TITLES, FRAMES } from '../../data/titles'
import { allQuests } from '../../data/quests'

function ctx(overrides: Partial<TitleFrameUnlockContext> = {}): TitleFrameUnlockContext {
  return {
    unlockedTitles: [],
    unlockedFrames: [],
    completedQuestCount: 0,
    level: 1,
    streakDays: 0,
    techCounts: {},
    completedRealmCount: 0,
    badgesEarned: 0,
    fastestQuestTime: Infinity,
    ...overrides,
  }
}

const FRAME_IDS = FRAMES.map((f) => f.id)
const TITLE_IDS = TITLES.map((t) => t.id)

describe('getUnlockedTitleIds', () => {
  it('follows the quest-count ladder at exact boundaries', () => {
    expect(getUnlockedTitleIds(ctx({ completedQuestCount: 5 }))).toContain('novice-devops')
    expect(getUnlockedTitleIds(ctx({ completedQuestCount: 4 }))).not.toContain('novice-devops')
    expect(getUnlockedTitleIds(ctx({ completedQuestCount: 10 }))).toContain('eager-learner')
    expect(getUnlockedTitleIds(ctx({ completedQuestCount: 15 }))).toContain('quest-seeker')
    expect(getUnlockedTitleIds(ctx({ completedQuestCount: 25 }))).toContain('code-crusader')
    expect(getUnlockedTitleIds(ctx({ completedQuestCount: 100 }))).toContain('devops-dragon')
  })

  it('requires 5 completions of a technology for tech titles', () => {
    const earned = getUnlockedTitleIds(ctx({ techCounts: { aws: 5, git: 4 } }))
    expect(earned).toContain('cloud-hopeful')
    expect(earned).not.toContain('git-guru')
  })

  it('requires 10 completions for the advanced tech titles', () => {
    const earned = getUnlockedTitleIds(
      ctx({ techCounts: { cicd: 10, kubernetes: 9, terraform: 11, monitoring: 10 } }),
    )
    expect(earned).toContain('ci-cd-champion')
    expect(earned).not.toContain('kubernetes-knight')
    expect(earned).toContain('infrastructure-inquisitor')
    expect(earned).toContain('monitoring-master')
  })

  it('unlocks streak, level, badge, and speed titles at their gates', () => {
    const earned = getUnlockedTitleIds(
      ctx({ streakDays: 14, level: 50, badgesEarned: 50, fastestQuestTime: 29.9 }),
    )
    expect(earned).toContain('streak-slayer')
    expect(earned).toContain('almighty-architect')
    expect(earned).toContain('golden-gamer')
    expect(earned).toContain('speed-demon')
  })

  it('speed-demon requires strictly under 30 seconds', () => {
    expect(getUnlockedTitleIds(ctx({ fastestQuestTime: 30 }))).not.toContain('speed-demon')
  })

  it('skips already-unlocked titles', () => {
    const earned = getUnlockedTitleIds(
      ctx({ completedQuestCount: 100, unlockedTitles: ['novice-devops'] }),
    )
    expect(earned).not.toContain('novice-devops')
    expect(earned).toContain('eager-learner')
  })

  it('only ever returns ids from the TITLES catalog', () => {
    for (const id of getUnlockedTitleIds(ctx({ completedQuestCount: 500, level: 99 }))) {
      expect(TITLE_IDS).toContain(id)
    }
  })
})

describe('getUnlockedFrameIds', () => {
  it('follows the quest-count ladder at exact boundaries', () => {
    expect(getUnlockedFrameIds(ctx({ completedQuestCount: 10 }))).toContain('bronze')
    expect(getUnlockedFrameIds(ctx({ completedQuestCount: 9 }))).not.toContain('bronze')
    expect(getUnlockedFrameIds(ctx({ completedQuestCount: 25 }))).toContain('silver')
    expect(getUnlockedFrameIds(ctx({ completedQuestCount: 50 }))).toContain('gold')
    expect(getUnlockedFrameIds(ctx({ completedQuestCount: 100 }))).toContain('diamond')
  })

  it('unlocks default unconditionally', () => {
    expect(getUnlockedFrameIds(ctx())).toContain('default')
  })

  it('requires 10 completions of a technology for elemental frames', () => {
    const earned = getUnlockedFrameIds(ctx({ techCounts: { python: 10, git: 9 } }))
    expect(earned).toContain('emerald')
    expect(earned).not.toContain('ruby')
  })

  it('unlocks prismatic at level 50 only', () => {
    expect(getUnlockedFrameIds(ctx({ level: 50 }))).toContain('prismatic')
    expect(getUnlockedFrameIds(ctx({ level: 49 }))).not.toContain('prismatic')
  })

  it('skips already-unlocked frames', () => {
    const earned = getUnlockedFrameIds(
      ctx({ completedQuestCount: 100, unlockedFrames: ['bronze'] }),
    )
    expect(earned).not.toContain('bronze')
    expect(earned).toContain('silver')
  })

  it('only ever returns ids from the FRAMES catalog', () => {
    for (const id of getUnlockedFrameIds(ctx({ completedQuestCount: 500, level: 99 }))) {
      expect(FRAME_IDS).toContain(id)
    }
  })
})

describe('countTechQuests', () => {
  it('counts only quests that exist in the catalog, per technology', () => {
    const known = allQuests[0]
    const counts = countTechQuests([known.id, known.id, 'not-a-real-quest'])
    expect(counts[known.technologyId]).toBe(2)
    expect(counts['unknown']).toBeUndefined()
  })
})
