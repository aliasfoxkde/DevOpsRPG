// Behavior tests for the claim actions: story arcs, career-path milestones,
// certifications, and seasonal event login bonuses. Each action must refuse to
// pay (zero rewards, unchanged state) unless its earnability check passes, pay
// the advertised amounts through the player's bonus multipliers exactly once,
// and record the claim so it can never pay again.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { allQuests } from '@/data/quests'
import { STORY_ARCS } from '@/data/storylines'
import { CAREER_PATHS } from '@/data/careerPaths'
import { CERTIFICATIONS } from '@/data/certifications'
import { SEASONAL_EVENTS } from '@/data/seasonalEvents'
import { computeRewardBonuses } from '@/contexts/game/bonusEngine'
import type { GameState } from '@/contexts/GameContext'
import { actOn, renderGame, seedGame } from './test-utils'

/** A quest-completion record shaped like the provider's own `TopicProgress`. */
function completedQuest(questId: string): GameState['completedQuests'][number] {
  const quest = allQuests.find((q) => q.id === questId)
  if (!quest) throw new Error(`no quest "${questId}" in the catalog`)
  return {
    topicId: quest.topicId,
    technologyId: quest.technologyId,
    questId,
    completed: true,
    xpEarned: quest.xpReward,
    completedAt: '2026-01-01T00:00:00.000Z',
  }
}

function completedQuests(questIds: string[]): GameState['completedQuests'] {
  return questIds.map(completedQuest)
}

/** The multipliers `bonusesFor` computes for a state snapshot. */
function bonusesFor(game: GameState) {
  return computeRewardBonuses({
    characterClass: game.character.class,
    xpMultiplier: game.character.xpMultiplier,
    goldMultiplier: game.character.goldMultiplier,
    skillAllocations: game.character.skillAllocations,
    equippedItemIds: game.character.equippedItems,
  })
}

/** The (path, milestone) pair with the least quest work to finish. */
function cheapestMilestone(): {
  pathId: string
  milestoneId: string
  questIds: string[]
  xpBonus: number
  goldBonus: number
} {
  let best: ReturnType<typeof cheapestMilestone> | null = null
  for (const path of CAREER_PATHS) {
    for (const milestone of path.milestones) {
      const questIds = milestone.requiredTechnologies.flatMap((techId) => {
        const tech = path.technologies.find((entry) => entry.id === techId)
        if (!tech) {
          throw new Error(`path ${path.id} milestone ${milestone.id}: unknown tech ${techId}`)
        }
        return tech.questIds
      })
      const candidate = {
        pathId: path.id,
        milestoneId: milestone.id,
        questIds,
        xpBonus: milestone.rewards.xpBonus,
        goldBonus: milestone.rewards.goldBonus,
      }
      if (!best || candidate.questIds.length < best.questIds.length) best = candidate
    }
  }
  if (!best) throw new Error('CAREER_PATHS has no milestones')
  return best
}

describe('claimStoryArcRewards', () => {
  it('refuses to pay while chapters of the arc are still unfinished', () => {
    const arc = STORY_ARCS[0]
    seedGame({ completedQuests: completedQuests(arc.episodes[0].questIds) })
    const getGame = renderGame()

    const rewards = actOn(() => getGame().claimStoryArcRewards(arc.id))

    expect(rewards).toEqual({ xp: 0, gold: 0 })
    expect(getGame().game.claimedStoryArcs).toEqual([])
    expect(getGame().game.character.xp).toBe(0)
  })

  it('pays the advertised rewards and unlocks the arc badge once finished', () => {
    const arc = STORY_ARCS.find((candidate) => candidate.rewards.badgeId)
    if (!arc) throw new Error('no story arc grants a badge')
    seedGame({ completedQuests: completedQuests(arc.episodes.flatMap((e) => e.questIds)) })
    const getGame = renderGame()
    const bonuses = bonusesFor(getGame().game)

    const rewards = actOn(() => getGame().claimStoryArcRewards(arc.id))

    expect(rewards.xp).toBe(Math.floor(arc.rewards.xpBonus * bonuses.xpMultiplier))
    expect(rewards.gold).toBe(Math.floor(arc.rewards.goldBonus * bonuses.goldMultiplier))
    expect(getGame().game.claimedStoryArcs).toEqual([arc.id])
    expect(getGame().game.badges.map((badge) => badge.id)).toContain(arc.rewards.badgeId)
    expect(getGame().game.recentBadgeUnlocks.map((badge) => badge.id)).toContain(
      arc.rewards.badgeId,
    )
    expect(getGame().game.character.xp).toBe(rewards.xp)
    expect(getGame().game.character.gold).toBe(rewards.gold)
  })

  it('pays nothing when the arc was already claimed', () => {
    const arc = STORY_ARCS[0]
    seedGame({
      completedQuests: completedQuests(arc.episodes.flatMap((e) => e.questIds)),
      claimedStoryArcs: [arc.id],
    })
    const getGame = renderGame()
    const xpBefore = getGame().game.character.xp

    const rewards = actOn(() => getGame().claimStoryArcRewards(arc.id))

    expect(rewards).toEqual({ xp: 0, gold: 0 })
    expect(getGame().game.character.xp).toBe(xpBefore)
  })
})

describe('claimCareerMilestone', () => {
  it('refuses to pay while a required technology is incomplete', () => {
    const { pathId, milestoneId, questIds } = cheapestMilestone()
    // Finish all but the last quest of the milestone's cheapest technology
    seedGame({ completedQuests: completedQuests(questIds.slice(0, -1)) })
    const getGame = renderGame()

    const rewards = actOn(() => getGame().claimCareerMilestone(pathId, milestoneId))

    expect(rewards).toEqual({ xp: 0, gold: 0 })
    expect(getGame().game.claimedCareerMilestones).toEqual([])
  })

  it('pays the advertised rewards and records the claim once finished', () => {
    const { pathId, milestoneId, questIds, xpBonus, goldBonus } = cheapestMilestone()
    seedGame({ completedQuests: completedQuests(questIds) })
    const getGame = renderGame()
    const bonuses = bonusesFor(getGame().game)

    const rewards = actOn(() => getGame().claimCareerMilestone(pathId, milestoneId))

    expect(rewards.xp).toBe(Math.floor(xpBonus * bonuses.xpMultiplier))
    expect(rewards.gold).toBe(Math.floor(goldBonus * bonuses.goldMultiplier))
    expect(getGame().game.claimedCareerMilestones).toEqual([`${pathId}:${milestoneId}`])
    expect(getGame().game.character.xp).toBe(rewards.xp)
  })

  it('pays nothing when the milestone was already claimed', () => {
    const { pathId, milestoneId, questIds } = cheapestMilestone()
    seedGame({
      completedQuests: completedQuests(questIds),
      claimedCareerMilestones: [`${pathId}:${milestoneId}`],
    })
    const getGame = renderGame()
    const xpBefore = getGame().game.character.xp

    const rewards = actOn(() => getGame().claimCareerMilestone(pathId, milestoneId))

    expect(rewards).toEqual({ xp: 0, gold: 0 })
    expect(getGame().game.character.xp).toBe(xpBefore)
  })
})

describe('claimCertification', () => {
  const cert =
    CERTIFICATIONS.find((candidate) => candidate.id === 'terraform_associate') ??
    (() => {
      throw new Error('terraform_associate missing from CERTIFICATIONS')
    })()

  function seedCertified(): void {
    const terraformQuests = allQuests.filter((quest) => quest.technologyId === 'terraform')
    expect(terraformQuests.length).toBeGreaterThanOrEqual(3)
    const filler = allQuests.filter((quest) => quest.technologyId !== 'terraform')
    seedGame({
      character: { level: cert.level },
      completedQuests: completedQuests([
        ...terraformQuests.map((quest) => quest.id),
        ...filler.slice(0, cert.requiredQuests - terraformQuests.length).map((quest) => quest.id),
      ]),
    })
  }

  it('refuses to pay while the requirements are unmet', () => {
    seedGame({ completedQuests: completedQuests([allQuests[0].id]) })
    const getGame = renderGame()

    const rewards = actOn(() => getGame().claimCertification(cert.id))

    expect(rewards).toEqual({ xp: 0, gold: 0 })
    expect(getGame().game.claimedCertifications).toEqual([])
  })

  it('pays the advertised rewards and records the claim once earned', () => {
    seedCertified()
    const getGame = renderGame()
    const bonuses = bonusesFor(getGame().game)

    const rewards = actOn(() => getGame().claimCertification(cert.id))

    expect(rewards.xp).toBe(Math.floor(cert.xpReward * bonuses.xpMultiplier))
    expect(rewards.gold).toBe(Math.floor(cert.goldReward * bonuses.goldMultiplier))
    expect(getGame().game.claimedCertifications).toEqual([cert.id])
    expect(getGame().game.character.gold).toBe(rewards.gold)
  })

  it('pays nothing when the certification was already claimed', () => {
    seedGame({
      character: { level: cert.level },
      completedQuests: completedQuests(
        allQuests.slice(0, cert.requiredQuests).map((quest) => quest.id),
      ),
      claimedCertifications: [cert.id],
    })
    const getGame = renderGame()
    const xpBefore = getGame().game.character.xp

    const rewards = actOn(() => getGame().claimCertification(cert.id))

    expect(rewards).toEqual({ xp: 0, gold: 0 })
    expect(getGame().game.character.xp).toBe(xpBefore)
  })
})

describe('claimEventReward', () => {
  const halloween = SEASONAL_EVENTS.find((event) => event.id === 'halloween-2026')
  if (!halloween?.rewards) throw new Error('halloween-2026 missing from SEASONAL_EVENTS')

  beforeEach(() => {
    // Pin the clock to a night the event is live (October 2026)
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-10T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('refuses to pay once the event window has passed', () => {
    vi.setSystemTime(new Date('2027-02-10T12:00:00Z'))
    seedGame({ character: { level: halloween.requirements?.minLevel ?? 1 } })
    const getGame = renderGame()

    const rewards = actOn(() => getGame().claimEventReward(halloween.id))

    expect(rewards).toEqual({ xp: 0, gold: 0 })
    expect(getGame().game.claimedEvents).toEqual([])
  })

  it('refuses to pay while the requirements are unmet', () => {
    seedGame({ character: { level: 1 } })
    const getGame = renderGame()

    const rewards = actOn(() => getGame().claimEventReward(halloween.id))

    expect(rewards).toEqual({ xp: 0, gold: 0 })
    expect(getGame().game.claimedEvents).toEqual([])
  })

  it('pays the advertised rewards and records the claim while live', () => {
    seedGame({ character: { level: halloween.requirements?.minLevel ?? 1 } })
    const getGame = renderGame()
    const bonuses = bonusesFor(getGame().game)
    if (!halloween.rewards?.bonusXP || !halloween.rewards.bonusGold) {
      throw new Error('halloween must advertise both bonus XP and gold')
    }

    const rewards = actOn(() => getGame().claimEventReward(halloween.id))

    expect(rewards.xp).toBe(Math.floor(halloween.rewards.bonusXP * bonuses.xpMultiplier))
    expect(rewards.gold).toBe(Math.floor(halloween.rewards.bonusGold * bonuses.goldMultiplier))
    expect(getGame().game.claimedEvents).toEqual([halloween.id])
    expect(getGame().game.character.xp).toBe(rewards.xp)
    expect(getGame().game.character.gold).toBe(rewards.gold)
  })

  it('pays nothing when the bonus was already claimed', () => {
    seedGame({
      character: { level: halloween.requirements?.minLevel ?? 1 },
      claimedEvents: [halloween.id],
    })
    const getGame = renderGame()
    const xpBefore = getGame().game.character.xp

    const rewards = actOn(() => getGame().claimEventReward(halloween.id))

    expect(rewards).toEqual({ xp: 0, gold: 0 })
    expect(getGame().game.character.xp).toBe(xpBefore)
  })
})
