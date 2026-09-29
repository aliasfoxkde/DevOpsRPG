// Aggregates every XP/gold/quiz/streak bonus source — character class,
// skill allocations, equipped equipment, collectible multipliers — into one
// pure module, so the reward paths in GameContext and the display pages
// (CharacterSheet, Skills, Store) all quote the same numbers.
//
// Class specializations come from the design docs (RPG_DESIGN.md): each class
// grants +20% XP on its realm's technologies, while the DevOps Sage is the
// generalist at +10% everywhere.
import type { CharacterClass } from './types'
import { calculateEquipmentBonuses, getEquipmentById } from '../../data/equipment'
import { SKILL_TREES } from '../../data/skills'

export const CLASS_TECH_BONUS = 0.2
export const CLASS_ALL_TECH_BONUS = 0.1

export interface ClassBonus {
  /** Technologies the bonus applies to; null = every technology. */
  techs: string[] | null
  bonus: number
}

export const CLASS_BONUSES: Record<CharacterClass, ClassBonus> = {
  'Cloud Knight': { techs: ['aws', 'kubernetes', 'terraform'], bonus: CLASS_TECH_BONUS },
  'Script Warrior': { techs: ['python', 'bash', 'docker'], bonus: CLASS_TECH_BONUS },
  'Data Mage': { techs: ['sql', 'postgresql', 'mongodb', 'react'], bonus: CLASS_TECH_BONUS },
  'DevOps Sage': { techs: null, bonus: CLASS_ALL_TECH_BONUS },
}

// Tech-category skills grant XP bonuses on the technology they teach. Skill
// ids are tree concepts; this maps each to the matching technology id. Skills
// without a clear single technology (serverless functions run on Node.js in
// this catalog) map to their closest match.
export const SKILL_TECH_MAP: Record<string, string> = {
  containerization: 'docker',
  ci_cd: 'cicd',
  infrastructure: 'terraform',
  monitoring: 'prometheus',
  python: 'python',
  javascript: 'javascript',
  bash: 'bash',
  sql: 'sql',
  aws: 'aws',
  kubernetes: 'kubernetes',
  networking: 'networking',
  serverless: 'nodejs',
}

export interface BonusInput {
  characterClass: CharacterClass
  /** Collectible-driven multipliers already stored on the character. */
  xpMultiplier: number
  goldMultiplier: number
  skillAllocations: Record<string, number>
  equippedItemIds: string[]
}

export interface RewardBonuses {
  /** Global product applied to every XP award (collectibles + equipment). */
  xpMultiplier: number
  /** Global product applied to every gold award. */
  goldMultiplier: number
  /** Per-technology total XP multiplier, including class/skill/equipment bonuses. */
  techXpMultiplier: Record<string, number>
  /** Fraction added to mini-game/quiz XP awards (Wisdom skill + gear). */
  quizScoreBonus: number
  /**
   * Streak saves available from gear and Persistence on top of real shields.
   * Capacity, not consumables: real shields are spent first, then protection
   * from equipment/Persistence keeps the streak without being used up.
   */
  virtualStreakShields: number
  /** Per-source detail for display surfaces. */
  classBonus: ClassBonus
  skillTechBonuses: Record<string, number>
  equipment: ReturnType<typeof calculateEquipmentBonuses>
}

const TECH_SKILL_PCT_PER_LEVEL = 0.02 // getSkillBonuses grants +2% XP per level
const WISDOM_QUIZ_PCT_PER_LEVEL = 0.02
const PERSISTENCE_LEVELS_PER_SHIELD = 5

export function computeRewardBonuses(input: BonusInput): RewardBonuses {
  const equippedItems = input.equippedItemIds
    .map((id) => getEquipmentById(id))
    .filter((item): item is NonNullable<typeof item> => item !== undefined)
  const equipment = calculateEquipmentBonuses(equippedItems)

  const classBonus = CLASS_BONUSES[input.characterClass]

  // Global XP: collectibles, Sage class bonus (applies everywhere), equipment.
  const globalClassFactor = classBonus.techs === null ? 1 + classBonus.bonus : 1
  const xpMultiplier = input.xpMultiplier * globalClassFactor * (1 + equipment.xpBonus)

  const goldMultiplier = input.goldMultiplier * (1 + equipment.goldBonus)

  // Per-technology XP multipliers.
  const techXpMultiplier: Record<string, number> = {}
  const skillTechBonuses: Record<string, number> = {}
  for (const tree of SKILL_TREES) {
    for (const skill of tree.skills) {
      if (skill.category !== 'tech') continue
      const level = input.skillAllocations[skill.id] || 0
      if (level === 0) continue
      const techId = SKILL_TECH_MAP[skill.id]
      if (!techId) continue
      skillTechBonuses[techId] = (skillTechBonuses[techId] || 0) + level * TECH_SKILL_PCT_PER_LEVEL
    }
  }

  const classTechFactor =
    classBonus.techs === null
      ? {}
      : Object.fromEntries(classBonus.techs.map((t) => [t, 1 + classBonus.bonus]))

  const techIds = new Set([
    ...Object.keys(skillTechBonuses),
    ...Object.keys(classTechFactor),
    ...Object.keys(equipment.techBonuses),
  ])
  for (const techId of techIds) {
    // classTechFactor already carries the 1+bonus form — applying it through
    // another (1 + ...) turned the class's +20% into +120%.
    techXpMultiplier[techId] =
      xpMultiplier *
      (1 + (skillTechBonuses[techId] || 0)) *
      (classTechFactor[techId] || 1) *
      (1 + (equipment.techBonuses[techId] || 0))
  }

  const wisdomLevel = input.skillAllocations['wisdom'] || 0
  const persistenceLevel = input.skillAllocations['persistence'] || 0

  return {
    xpMultiplier,
    goldMultiplier,
    techXpMultiplier,
    quizScoreBonus: wisdomLevel * WISDOM_QUIZ_PCT_PER_LEVEL + equipment.quizScoreBonus,
    virtualStreakShields: Math.floor(
      equipment.streakProtection + persistenceLevel / PERSISTENCE_LEVELS_PER_SHIELD,
    ),
    classBonus,
    skillTechBonuses,
    equipment,
  }
}

/** Total XP multiplier for a technology: tech-specific when present, global otherwise. */
export function techMultiplierFor(bonuses: RewardBonuses, techId: string): number {
  return bonuses.techXpMultiplier[techId] ?? bonuses.xpMultiplier
}
