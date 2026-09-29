// Cross-module referential integrity for the static game data.
// technologies.ts is the source of truth; quests and quizzes derive from it.
// A break here silently produces unreachable quests or unwinnable quizzes.
import { describe, it, expect } from 'vitest'
import { technologies, categories } from './technologies'
import { allQuests, realms } from './quests'
import { quizzes } from './quizzes'
import { BADGES, RARITY_COLORS, HANDLED_REQUIREMENT_TYPES } from './badges'
import { MILESTONES } from './milestones'
import { DAILY_QUESTS_POOL, WEEKLY_QUESTS_POOL, SECRET_QUESTS_POOL } from './sidequests'
import { worldMapLocations } from './worldmap'
import { TITLES } from './titles'
import { SKILL_TREES } from './skills'
import { CAREER_PATHS } from './careerPaths'
import { COLLECTIBLES_POOL, DAILY_REWARDS } from './collectibles'
import { codePuzzles } from './minigames'
import { EQUIPMENT_ITEMS } from './equipment'
import { STORY_ARCS, DIFFICULTY_CONFIG as STORY_DIFFICULTY_CONFIG } from './storylines'
import {
  CERTIFICATIONS,
  DIFFICULTY_COLORS as CERT_DIFFICULTY_COLORS,
  DIFFICULTY_LABELS as CERT_DIFFICULTY_LABELS,
} from './certifications'
import { SEASONAL_EVENTS } from './seasonalEvents'
import { PVP_RANKS, PVP_QUESTIONS, getRankByPoints, getRankProgress } from './pvpArena'
import {
  MOCK_GUILD,
  MOCK_GUILD_MEMBERS,
  MOCK_GUILD_CHALLENGES,
  FEATURED_GUILDS,
  getGuildRankInfo,
} from './guilds'

const techList = Object.values(technologies)
const allTopics = techList.flatMap((t) => t.topics)
const topicIds = new Set(allTopics.map((t) => t.id))
const realmMapByPhase: Record<number, string> = {
  1: 'foundations',
  2: 'scripts',
  3: 'frameworks',
  4: 'cloud',
  5: 'devops',
  6: 'aiintelligence',
  7: 'aiintelligence',
}

function duplicates<T>(items: T[]): T[] {
  const seen = new Set<T>()
  const dupes = new Set<T>()
  for (const item of items) {
    if (seen.has(item)) dupes.add(item)
    seen.add(item)
  }
  return [...dupes]
}

describe('technologies', () => {
  it('has unique, key-consistent technology ids', () => {
    for (const [key, tech] of Object.entries(technologies)) {
      expect(tech.id, `key ${key} should match tech.id`).toBe(key)
    }
    expect(duplicates(techList.map((t) => t.id))).toEqual([])
  })

  it('has globally unique topic ids across all technologies', () => {
    expect(duplicates(allTopics.map((t) => t.id))).toEqual([])
  })

  it('has unique slugs for technologies and topics', () => {
    expect(duplicates(techList.map((t) => t.slug))).toEqual([])
    expect(duplicates(allTopics.map((t) => t.slug))).toEqual([])
  })

  it('numbers topics sequentially from 1 within each technology', () => {
    for (const tech of techList) {
      tech.topics.forEach((topic, index) => {
        expect(topic.order, `${tech.id}/${topic.id}`).toBe(index + 1)
      })
    }
  })

  it('only references prerequisites that exist (no self-references)', () => {
    for (const tech of techList) {
      for (const prereq of tech.prerequisites) {
        expect(technologies[prereq], `${tech.id} prerequisite`).toBeDefined()
        expect(prereq).not.toBe(tech.id)
      }
    }
  })

  it('has no prerequisite cycles', () => {
    const visiting = new Set<string>()
    const visited = new Set<string>()
    const visit = (id: string) => {
      if (visited.has(id)) return
      expect(visiting.has(id), `cycle through ${id}`).toBe(false)
      visiting.add(id)
      for (const prereq of technologies[id].prerequisites) visit(prereq)
      visiting.delete(id)
      visited.add(id)
    }
    for (const tech of techList) visit(tech.id)
  })

  it('keeps numeric fields positive', () => {
    for (const tech of techList) {
      expect(tech.xpPerTopic).toBeGreaterThan(0)
      expect(tech.estimatedHours).toBeGreaterThan(0)
      expect(tech.topics.length).toBeGreaterThan(0)
    }
  })

  it('maps every technology phase to a known category', () => {
    for (const tech of techList) {
      expect(Object.values(categories).map((c) => c.phase)).toContain(tech.phase)
    }
  })
})

describe('realms', () => {
  it('has key-consistent realm ids', () => {
    for (const [key, realm] of Object.entries(realms)) {
      expect(realm.id).toBe(key)
    }
  })

  it('only references existing technologies', () => {
    for (const realm of Object.values(realms)) {
      for (const techId of realm.technologies) {
        expect(technologies[techId], `${realm.id} tech ${techId}`).toBeDefined()
      }
    }
  })

  it('places every technology in the realm matching its phase', () => {
    for (const tech of techList) {
      const expectedRealm = realmMapByPhase[tech.phase]
      expect(expectedRealm, `no realm for phase ${tech.phase}`).toBeDefined()
      expect(realms[expectedRealm].technologies).toContain(tech.id)
    }
  })

  it('gates higher realms behind higher levels', () => {
    const levels = Object.values(realms).map((r) => r.requiredLevel)
    expect([...levels].sort((a, b) => a - b)).toEqual(levels)
    expect(levels[0]).toBe(1)
  })
})

describe('quests', () => {
  it('derives exactly one quest per topic', () => {
    expect(allQuests.length).toBe(allTopics.length)
  })

  it('has unique quest ids', () => {
    expect(duplicates(allQuests.map((q) => q.id))).toEqual([])
  })

  it('references valid technologies, topics and realms', () => {
    for (const quest of allQuests) {
      expect(technologies[quest.technologyId], quest.id).toBeDefined()
      expect(topicIds.has(quest.topicId), quest.id).toBe(true)
      expect(realms[quest.realmId], quest.id).toBeDefined()
      expect(quest.id).toBe(`quest_${quest.topicId}`)
    }
  })

  it('keeps difficulty, XP and time in valid ranges', () => {
    for (const quest of allQuests) {
      expect(quest.difficulty).toBeGreaterThanOrEqual(1)
      expect(quest.difficulty).toBeLessThanOrEqual(5)
      expect(quest.xpReward).toBeGreaterThan(0)
      expect(quest.estimatedMinutes).toBeGreaterThanOrEqual(3)
      expect(quest.estimatedMinutes).toBeLessThanOrEqual(15)
    }
  })

  it('only uses battle and boss quest types', () => {
    for (const quest of allQuests) {
      expect(['battle', 'boss']).toContain(quest.type)
    }
  })
})

describe('quizzes', () => {
  it('is keyed by existing topic ids', () => {
    for (const key of Object.keys(quizzes)) {
      expect(topicIds.has(key), `quiz key ${key} has no topic`).toBe(true)
    }
  })

  it('has question topicIds that match their quiz key', () => {
    for (const [key, questions] of Object.entries(quizzes)) {
      for (const question of questions) {
        expect(question.topicId, `${key}/${question.id}`).toBe(key)
      }
    }
  })

  it('has unique question ids', () => {
    const ids = Object.values(quizzes).flatMap((qs) => qs.map((q) => q.id))
    expect(duplicates(ids)).toEqual([])
  })

  it('keeps multiple-choice questions answerable', () => {
    for (const questions of Object.values(quizzes)) {
      for (const q of questions) {
        const type = q.type ?? 'multiple_choice'
        if (type === 'multiple_choice') {
          expect(q.options?.length, q.id).toBeGreaterThan(1)
          expect(q.correctIndex ?? -1, q.id).toBeGreaterThanOrEqual(0)
          expect(q.correctIndex ?? -1, q.id).toBeLessThan(q.options?.length ?? 0)
        }
        if (type === 'true_false') {
          expect(q.options?.length, q.id).toBe(2)
        }
      }
    }
  })

  it('gives every question an explanation', () => {
    for (const questions of Object.values(quizzes)) {
      for (const q of questions) {
        expect(q.explanation.trim().length, q.id).toBeGreaterThan(0)
      }
    }
  })

  it('covers the majority of topics with quiz questions', () => {
    const quizzedTopics = new Set(Object.keys(quizzes))
    const coverage = quizzedTopics.size / topicIds.size
    expect(coverage).toBeGreaterThan(0.5)
  })
})

describe('badges, milestones and titles', () => {
  it('has unique badge ids with valid rarity tiers', () => {
    expect(duplicates(BADGES.map((b) => b.id))).toEqual([])
    const rarities = Object.keys(RARITY_COLORS)
    for (const badge of BADGES) {
      expect(rarities, `${badge.id} rarity ${badge.rarity}`).toContain(badge.rarity)
      expect(badge.requirement.value, badge.id).toBeGreaterThan(0)
      expect(badge.xpReward, badge.id).toBeGreaterThanOrEqual(0)
      expect(badge.goldReward, badge.id).toBeGreaterThanOrEqual(0)
    }
  })

  it('only uses requirement types that shouldUnlockBadge handles', () => {
    // shouldUnlockBadge's default case returns false, so an unhandled type
    // would make the badge permanently unobtainable with no error anywhere.
    const handled = HANDLED_REQUIREMENT_TYPES as readonly string[]
    for (const badge of BADGES) {
      expect(handled, `${badge.id} type ${badge.requirement.type}`).toContain(
        badge.requirement.type,
      )
    }
  })

  it('has unique milestone ids with valid triggers and bonuses', () => {
    expect(duplicates(MILESTONES.map((m) => m.id))).toEqual([])
    for (const milestone of MILESTONES) {
      const { trigger, xpBonus } = milestone
      const numericTarget =
        trigger.type === 'quest_count'
          ? trigger.count
          : trigger.type === 'streak'
            ? trigger.days
            : trigger.type === 'level'
              ? trigger.level
              : trigger.type === 'quiz_streak'
                ? trigger.count
                : trigger.type === 'minigame_complete'
                  ? trigger.count
                  : trigger.type === 'speed_quest'
                    ? trigger.minutes
                    : undefined
      if (numericTarget !== undefined) {
        expect(numericTarget, milestone.id).toBeGreaterThan(0)
      }
      if (trigger.type === 'realm_complete') {
        expect(realms[trigger.realm], milestone.id).toBeDefined()
      }
      if (trigger.type === 'technology_complete') {
        expect(technologies[trigger.tech], milestone.id).toBeDefined()
      }
      expect(xpBonus, milestone.id).toBeGreaterThan(0)
      expect(milestone.unlocked).toBe(false)
    }
  })

  it('has unique title ids', () => {
    expect(duplicates(TITLES.map((t) => t.id))).toEqual([])
  })
})

describe('side quests and collectibles', () => {
  it('gives every side quest a unique id and positive reward', () => {
    const pools = [DAILY_QUESTS_POOL, WEEKLY_QUESTS_POOL, SECRET_QUESTS_POOL]
    const ids = pools.flatMap((pool) => pool.map((q) => q.id))
    expect(duplicates(ids)).toEqual([])
    for (const quest of pools.flat()) {
      expect(quest.rewards.xp, quest.id).toBeGreaterThan(0)
      expect(quest.rewards.gold, quest.id).toBeGreaterThanOrEqual(0)
      expect(quest.requirement.count, quest.id).toBeGreaterThan(0)
      if (quest.rewards.badge) {
        expect(
          BADGES.some((b) => b.id === quest.rewards.badge),
          `${quest.id} badge ${quest.rewards.badge}`,
        ).toBe(true)
      }
    }
  })

  it('has unique collectible ids', () => {
    expect(duplicates(COLLECTIBLES_POOL.map((c) => c.id))).toEqual([])
  })

  it('offers daily rewards for a 7-day cycle', () => {
    expect(DAILY_REWARDS.length).toBe(7)
  })
})

describe('world map', () => {
  it('only connects locations that exist', () => {
    const ids = new Set(worldMapLocations.map((l) => l.id))
    expect(duplicates(worldMapLocations.map((l) => l.id))).toEqual([])
    for (const location of worldMapLocations) {
      for (const connection of location.connectedTo) {
        expect(ids.has(connection), `${location.id} -> ${connection}`).toBe(true)
      }
    }
  })

  it('keeps map positions within the viewport', () => {
    for (const location of worldMapLocations) {
      expect(location.position.x).toBeGreaterThanOrEqual(0)
      expect(location.position.x).toBeLessThanOrEqual(100)
      expect(location.position.y).toBeGreaterThanOrEqual(0)
      expect(location.position.y).toBeLessThanOrEqual(100)
    }
  })

  it('references valid realms', () => {
    for (const location of worldMapLocations) {
      if (location.realmId) {
        expect(realms[location.realmId], location.id).toBeDefined()
      }
    }
  })
})

describe('code puzzles', () => {
  it('gives every puzzle a unique id and non-empty options containing the answer', () => {
    expect(duplicates(codePuzzles.map((p) => p.id))).toEqual([])
    for (const puzzle of codePuzzles) {
      // Puzzles are answered by clicking an option; without options (or with
      // the answer missing from them) the round can never be solved.
      expect(puzzle.options?.length, `${puzzle.id} options`).toBeGreaterThan(1)
      expect(puzzle.options, `${puzzle.id} answer "${puzzle.answer}"`).toContain(puzzle.answer)
    }
  })
})

describe('skill trees and career paths', () => {
  it('has unique skill tree and skill ids', () => {
    expect(duplicates(SKILL_TREES.map((t) => t.id))).toEqual([])
    const skillIds = SKILL_TREES.flatMap((t) => t.skills.map((s) => s.id))
    expect(duplicates(skillIds)).toEqual([])
  })

  it('only references existing skills in dependencies and paths', () => {
    const skillIds = new Set(SKILL_TREES.flatMap((t) => t.skills.map((s) => s.id)))
    for (const tree of SKILL_TREES) {
      for (const skill of tree.skills) {
        expect(skill.maxLevel, skill.id).toBeGreaterThan(0)
        expect(skill.currentLevel, skill.id).toBe(0)
        for (const dep of skill.requires ?? []) {
          expect(skillIds.has(dep), `${skill.id} requires ${dep}`).toBe(true)
        }
      }
      for (const step of tree.recommendedPath ?? []) {
        expect(skillIds.has(step), `${tree.id} path step ${step}`).toBe(true)
      }
    }
  })

  it('has unique career path ids', () => {
    expect(duplicates(CAREER_PATHS.map((p) => p.id))).toEqual([])
  })

  it('builds each path from real technologies and their generated quests', () => {
    const questIds = new Set(allQuests.map((q) => q.id))
    for (const path of CAREER_PATHS) {
      expect(path.estimatedMonths, path.id).toBeGreaterThan(0)
      expect(['high', 'medium', 'growing'], path.id).toContain(path.demandLevel)
      expect(path.technologies.length, path.id).toBeGreaterThan(0)
      expect(duplicates(path.technologies.map((t) => t.id)), `${path.id} tech ids`).toEqual([])
      for (const tech of path.technologies) {
        expect(technologies[tech.id], `${path.id} tech ${tech.id}`).toBeDefined()
        // tech() throws at import when a technology has no quests; this keeps
        // the guarantee visible and checks the ids against the live catalog.
        expect(tech.questIds.length, `${path.id}/${tech.id}`).toBeGreaterThan(0)
        for (const questId of tech.questIds) {
          expect(questIds.has(questId), `${path.id}/${tech.id} quest ${questId}`).toBe(true)
        }
      }
    }
  })

  it('only gates milestones on technologies the path itself tracks', () => {
    // careerMilestoneIsComplete looks the requirement up in the path's own
    // technologies; a milestone naming any other tech could never be claimed,
    // even while the page's global progress view showed it complete.
    for (const path of CAREER_PATHS) {
      const pathTechIds = new Set(path.technologies.map((t) => t.id))
      expect(duplicates(path.milestones.map((m) => m.id)), `${path.id} milestone ids`).toEqual([])
      for (const milestone of path.milestones) {
        expect(milestone.requiredTechnologies.length, milestone.id).toBeGreaterThan(0)
        for (const techId of milestone.requiredTechnologies) {
          expect(
            pathTechIds.has(techId),
            `${path.id}/${milestone.id} requires off-path tech ${techId}`,
          ).toBe(true)
        }
        expect(milestone.rewards.xpBonus, milestone.id).toBeGreaterThan(0)
        expect(milestone.rewards.goldBonus, milestone.id).toBeGreaterThanOrEqual(0)
      }
    }
  })
})

describe('equipment', () => {
  it('has unique ids with positive prices', () => {
    expect(duplicates(EQUIPMENT_ITEMS.map((e) => e.id))).toEqual([])
    for (const item of EQUIPMENT_ITEMS) {
      expect(item.price, item.id).toBeGreaterThan(0)
      expect(item.name.trim().length, item.id).toBeGreaterThan(0)
    }
  })

  it('advertises bonuses the game can actually pay', () => {
    // A techBonus on a non-catalog id renders in the store ("+8% XP from …")
    // but never applies — the bonus engine drops unknown technology ids.
    for (const item of EQUIPMENT_ITEMS) {
      if (item.techBonus) {
        expect(
          technologies[item.techBonus.technologyId],
          `${item.id} techBonus ${item.techBonus.technologyId}`,
        ).toBeDefined()
        expect(item.techBonus.bonus, item.id).toBeGreaterThan(0)
      }
      for (const [key, value] of Object.entries(item.bonuses)) {
        expect(value, `${item.id} bonus ${key}`).toBeGreaterThan(0)
      }
    }
  })
})

describe('storylines', () => {
  it('has unique arc and episode ids', () => {
    expect(duplicates(STORY_ARCS.map((a) => a.id))).toEqual([])
    expect(duplicates(STORY_ARCS.flatMap((a) => a.episodes.map((e) => e.id)))).toEqual([])
  })

  it('sends every episode to quests that exist', () => {
    const questIds = new Set(allQuests.map((q) => q.id))
    for (const arc of STORY_ARCS) {
      expect(arc.episodes.length, `${arc.id} has episodes`).toBeGreaterThan(0)
      for (const episode of arc.episodes) {
        expect(episode.questIds.length, `${arc.id}/${episode.id}`).toBeGreaterThan(0)
        for (const questId of episode.questIds) {
          expect(questIds.has(questId), `${arc.id}/${episode.id} quest ${questId}`).toBe(true)
        }
      }
    }
  })

  it('unlocks episodes in ascending episode order', () => {
    for (const arc of STORY_ARCS) {
      const unlocksAt = arc.episodes.map((e) => e.unlocksAt)
      expect(unlocksAt, arc.id).toEqual([...unlocksAt].sort((a, b) => a - b))
      for (const episode of arc.episodes) {
        expect(episode.unlocksAt, `${arc.id}/${episode.id}`).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('references prerequisites that exist (never the arc itself)', () => {
    const arcIds = new Set(STORY_ARCS.map((a) => a.id))
    for (const arc of STORY_ARCS) {
      for (const episode of arc.episodes) {
        if (episode.prerequisite) {
          expect(arcIds.has(episode.prerequisite), `${arc.id}/${episode.id} prerequisite`).toBe(
            true,
          )
          expect(episode.prerequisite, `${arc.id}/${episode.id}`).not.toBe(arc.id)
        }
      }
    }
  })

  it('uses a displayable difficulty and pays only real rewards', () => {
    for (const arc of STORY_ARCS) {
      expect(Object.keys(STORY_DIFFICULTY_CONFIG), arc.id).toContain(arc.difficulty)
      expect(arc.estimatedTime.trim().length, arc.id).toBeGreaterThan(0)
      expect(arc.rewards.xpBonus, arc.id).toBeGreaterThanOrEqual(0)
      expect(arc.rewards.goldBonus, arc.id).toBeGreaterThanOrEqual(0)
      if (arc.rewards.badgeId) {
        expect(
          BADGES.some((b) => b.id === arc.rewards.badgeId),
          `${arc.id} badge ${arc.rewards.badgeId}`,
        ).toBe(true)
      }
    }
  })
})

describe('certifications', () => {
  it('has unique ids with positive requirements and rewards', () => {
    expect(duplicates(CERTIFICATIONS.map((c) => c.id))).toEqual([])
    for (const cert of CERTIFICATIONS) {
      expect(cert.level, cert.id).toBeGreaterThanOrEqual(1)
      expect(cert.requiredQuests, cert.id).toBeGreaterThan(0)
      expect(cert.requiredTechnologies.length, cert.id).toBeGreaterThan(0)
      expect(cert.xpReward, cert.id).toBeGreaterThan(0)
      expect(cert.goldReward, cert.id).toBeGreaterThan(0)
      expect(cert.fullName.trim().length, cert.id).toBeGreaterThan(0)
    }
  })

  it('requires technologies that exist', () => {
    for (const cert of CERTIFICATIONS) {
      expect(duplicates(cert.requiredTechnologies), `${cert.id} required techs`).toEqual([])
      for (const techId of cert.requiredTechnologies) {
        expect(technologies[techId], `${cert.id} requires ${techId}`).toBeDefined()
      }
    }
  })

  it('has color and label entries for every difficulty tier, all in use', () => {
    const tiers = new Set<string>(CERTIFICATIONS.map((c) => c.difficulty))
    for (const cert of CERTIFICATIONS) {
      expect(CERT_DIFFICULTY_COLORS[cert.difficulty], cert.id).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(CERT_DIFFICULTY_LABELS[cert.difficulty], cert.id).toBeTruthy()
    }
    // A tier with no certification would be dead display data.
    for (const tier of Object.keys(CERT_DIFFICULTY_COLORS)) {
      expect(tiers.has(tier), `certification tier ${tier} is unused`).toBe(true)
    }
  })
})

describe('seasonal events', () => {
  it('has unique ids that start before they end', () => {
    expect(duplicates(SEASONAL_EVENTS.map((e) => e.id))).toEqual([])
    for (const event of SEASONAL_EVENTS) {
      expect(new Date(event.startDate).getTime(), `${event.id} start`).not.toBeNaN()
      expect(new Date(event.endDate).getTime(), `${event.id} end`).not.toBeNaN()
      expect(new Date(event.endDate).getTime(), event.id).toBeGreaterThan(
        new Date(event.startDate).getTime(),
      )
    }
  })

  it('multiplies rewards by at least 1 within a known event type', () => {
    for (const event of SEASONAL_EVENTS) {
      expect(event.bonusMultiplier, event.id).toBeGreaterThanOrEqual(1)
      expect(['holiday', 'challenge', 'limited', 'special'], event.id).toContain(event.type)
      expect(event.description.trim().length, event.id).toBeGreaterThan(0)
    }
  })

  it('grants only currency the game can pay out', () => {
    for (const event of SEASONAL_EVENTS) {
      if (event.rewards) {
        for (const key of Object.keys(event.rewards)) {
          expect(['bonusXP', 'bonusGold'], `${event.id} reward ${key}`).toContain(key)
        }
        if (event.rewards.bonusXP !== undefined) {
          expect(event.rewards.bonusXP, event.id).toBeGreaterThan(0)
        }
        if (event.rewards.bonusGold !== undefined) {
          expect(event.rewards.bonusGold, event.id).toBeGreaterThan(0)
        }
      }
      if (event.requirements?.minLevel !== undefined) {
        expect(event.requirements.minLevel, event.id).toBeGreaterThanOrEqual(1)
      }
      if (event.requirements?.minQuests !== undefined) {
        expect(event.requirements.minQuests, event.id).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('lists event quests that exist', () => {
    const questIds = new Set(allQuests.map((q) => q.id))
    for (const event of SEASONAL_EVENTS) {
      for (const questId of event.quests ?? []) {
        expect(questIds.has(questId), `${event.id} quest ${questId}`).toBe(true)
      }
    }
  })
})

describe('pvp arena', () => {
  it('covers points from 0 upward with contiguous, ascending rank bands', () => {
    const byMinPoints = [...PVP_RANKS].sort((a, b) => a.minPoints - b.minPoints)
    expect(PVP_RANKS.map((r) => r.id)).toEqual(byMinPoints.map((r) => r.id))
    expect(PVP_RANKS[0].minPoints).toBe(0)
    for (let i = 0; i < PVP_RANKS.length; i++) {
      const rank = PVP_RANKS[i]
      expect(rank.maxPoints, rank.id).toBeGreaterThanOrEqual(rank.minPoints)
      if (i > 0) {
        // No gap and no overlap: the previous band ends exactly where this
        // one begins, so no point total falls between ranks.
        expect(rank.minPoints, rank.id).toBe(PVP_RANKS[i - 1].maxPoints + 1)
      }
    }
  })

  it('resolves rank boundaries and progress consistently', () => {
    for (const rank of PVP_RANKS) {
      expect(getRankByPoints(rank.minPoints).id, `${rank.id} min`).toBe(rank.id)
      expect(getRankByPoints(rank.maxPoints).id, `${rank.id} max`).toBe(rank.id)
      const { current, next, progress } = getRankProgress(rank.minPoints)
      expect(current.id).toBe(rank.id)
      if (next) {
        expect(PVP_RANKS.map((r) => r.id)).toContain(next.id)
        expect(progress).toBe(0)
      } else {
        // The top rank has no next rung, so progress reads as complete.
        expect(rank.id).toBe(PVP_RANKS[PVP_RANKS.length - 1].id)
        expect(progress).toBe(100)
      }
    }
    expect(getRankProgress(PVP_RANKS[PVP_RANKS.length - 1].maxPoints).progress).toBe(100)
  })

  it('keeps rank multipliers at or above 1', () => {
    for (const rank of PVP_RANKS) {
      if (rank.rewards?.bonusXP !== undefined) {
        expect(rank.rewards.bonusXP, rank.id).toBeGreaterThanOrEqual(1)
      }
      if (rank.rewards?.bonusGold !== undefined) {
        expect(rank.rewards.bonusGold, rank.id).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('has answerable questions — every topic can field a full match', () => {
    // generatePVPMatch takes 2 questions from each of 3 random topics, so a
    // topic with fewer than 2 questions silently short-changes the match.
    for (const [topic, questions] of Object.entries(PVP_QUESTIONS)) {
      expect(questions.length, `pvp topic ${topic}`).toBeGreaterThanOrEqual(2)
      for (const question of questions) {
        expect(question.options.length, question.question).toBeGreaterThan(1)
        expect(duplicates(question.options), question.question).toEqual([])
        expect(question.correctIndex, question.question).toBeGreaterThanOrEqual(0)
        expect(question.correctIndex, question.question).toBeLessThan(question.options.length)
        expect(question.topic.trim().length, `pvp topic ${topic}`).toBeGreaterThan(0)
      }
    }
  })
})

describe('guilds', () => {
  const guilds = [MOCK_GUILD, ...FEATURED_GUILDS]
  const memberIds = new Set(MOCK_GUILD_MEMBERS.map((m) => m.id))

  it('has unique guild and member ids', () => {
    expect(duplicates(guilds.map((g) => g.id))).toEqual([])
    expect(duplicates(MOCK_GUILD_MEMBERS.map((m) => m.id))).toEqual([])
  })

  it('matches the roster to what the guild page advertises', () => {
    // The page renders "{memberCount}/{maxMembers} members" beside this exact
    // roster, so the count must agree with the members actually listed.
    expect(MOCK_GUILD.memberCount).toBe(MOCK_GUILD_MEMBERS.length)
    const leader = MOCK_GUILD_MEMBERS.find((m) => m.id === MOCK_GUILD.leaderId)
    expect(leader, 'guild leader sits in the roster').toBeDefined()
    expect(leader?.role).toBe('leader')
    expect(leader?.name).toBe(MOCK_GUILD.leaderName)
  })

  it('resolves every member role to a real guild rank', () => {
    for (const member of MOCK_GUILD_MEMBERS) {
      expect(getGuildRankInfo(member.role).id, member.id).toBe(member.role)
      expect(member.level, member.id).toBeGreaterThanOrEqual(1)
      expect(member.weeklyXP, member.id).toBeGreaterThanOrEqual(0)
      expect(member.totalXP, member.id).toBeGreaterThanOrEqual(member.weeklyXP)
    }
  })

  it('points active challenges and participants at real records', () => {
    const challengeIds = new Set(MOCK_GUILD_CHALLENGES.map((c) => c.id))
    for (const guild of guilds) {
      expect(guild.memberCount, guild.id).toBeLessThanOrEqual(guild.maxMembers)
      expect(guild.xp, guild.id).toBeLessThan(guild.xpToNextLevel)
      for (const challengeId of guild.activeChallenges) {
        expect(challengeIds.has(challengeId), `${guild.id} challenge ${challengeId}`).toBe(true)
      }
    }
    for (const challenge of MOCK_GUILD_CHALLENGES) {
      expect(challenge.target, challenge.id).toBeGreaterThan(0)
      expect(challenge.progress, challenge.id).toBeGreaterThanOrEqual(0)
      expect(challenge.rewardXP, challenge.id).toBeGreaterThanOrEqual(0)
      expect(challenge.rewardGold, challenge.id).toBeGreaterThanOrEqual(0)
      for (const participant of challenge.participants) {
        expect(memberIds.has(participant), `${challenge.id} participant ${participant}`).toBe(true)
      }
    }
  })
})
