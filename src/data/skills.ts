// Skill system - XP can be allocated to different skill trees
export interface Skill {
  id: string
  name: string
  description: string
  icon: string
  category: 'combat' | 'tech' | 'social' | 'meta'
  maxLevel: number
  currentLevel: number
  xpInvested: number
  // Skill dependencies
  requires?: string[] // Array of skill IDs that must be leveled first
  // Benefits at each level
  benefits?: string[] // Description of benefits at max level
}

export interface SkillTree {
  id: string
  name: string
  icon: string
  description: string
  skills: Skill[]
  // Recommended skill order for beginners
  recommendedPath?: string[] // Array of skill IDs in suggested order
}

// Active bonuses from skill allocations
export interface SkillBonus {
  skillId: string
  skillName: string
  bonusType: 'xp' | 'gold' | 'quiz' | 'streak'
  bonusValue: number
  description: string
}

export const SKILL_TREES: SkillTree[] = [
  {
    id: 'devops_fundamentals',
    name: 'DevOps Fundamentals',
    icon: '🏗️',
    description: 'Core DevOps principles and practices',
    recommendedPath: ['containerization', 'ci_cd', 'infrastructure', 'monitoring'],
    skills: [
      {
        id: 'ci_cd',
        name: 'CI/CD Pipeline',
        description: 'Build and deploy automatically',
        icon: '🔄',
        category: 'tech',
        maxLevel: 10,
        currentLevel: 0,
        xpInvested: 0,
        requires: ['containerization'],
        benefits: ['+5% XP on quiz completion', '+10% faster builds', 'Unlock deploy quests']
      },
      {
        id: 'containerization',
        name: 'Containerization',
        description: 'Docker and container tech',
        icon: '🐳',
        category: 'tech',
        maxLevel: 10,
        currentLevel: 0,
        xpInvested: 0,
        benefits: ['+3% XP on all quests', '+5% Gold on container quests', 'Unlock Docker-specific content']
      },
      {
        id: 'infrastructure',
        name: 'Infrastructure as Code',
        description: 'Terraform, CloudFormation',
        icon: '🏗️',
        category: 'tech',
        maxLevel: 10,
        currentLevel: 0,
        xpInvested: 0,
        requires: ['ci_cd'],
        benefits: ['+5% XP on IaC quests', '+10% efficiency on deployments', 'Unlock Terraform content']
      },
      {
        id: 'monitoring',
        name: 'Monitoring',
        description: 'Observe and respond',
        icon: '📊',
        category: 'tech',
        maxLevel: 10,
        currentLevel: 0,
        xpInvested: 0,
        requires: ['infrastructure'],
        benefits: ['+5% XP on monitoring quests', '+3% streak protection', 'Unlock alerting content']
      },
    ],
  },
  {
    id: 'coding_mastery',
    name: 'Coding Mastery',
    icon: '💻',
    description: 'Programming languages and paradigms',
    recommendedPath: ['bash', 'python', 'javascript', 'sql'],
    skills: [
      {
        id: 'python',
        name: 'Python',
        description: 'Scripting and automation',
        icon: '🐍',
        category: 'tech',
        maxLevel: 10,
        currentLevel: 0,
        xpInvested: 0,
        benefits: ['+3% XP on Python quests', '+5% faster script completion', 'Unlock ML/AI content']
      },
      {
        id: 'javascript',
        name: 'JavaScript',
        description: 'Web and Node.js',
        icon: '⚡',
        category: 'tech',
        maxLevel: 10,
        currentLevel: 0,
        xpInvested: 0,
        requires: ['bash'],
        benefits: ['+3% XP on JS quests', '+5% faster Node quests', 'Unlock React content']
      },
      {
        id: 'bash',
        name: 'Bash/Shell',
        description: 'Command line mastery',
        icon: '💻',
        category: 'tech',
        maxLevel: 10,
        currentLevel: 0,
        xpInvested: 0,
        benefits: ['+2% XP on all quests', '+10% faster command completion', 'Unlock server quests']
      },
      {
        id: 'sql',
        name: 'SQL/Databases',
        description: 'Data manipulation',
        icon: '🗄️',
        category: 'tech',
        maxLevel: 10,
        currentLevel: 0,
        xpInvested: 0,
        benefits: ['+3% XP on database quests', '+5% faster queries', 'Unlock data engineering content']
      },
    ],
  },
  {
    id: 'cloud_adventure',
    name: 'Cloud Adventure',
    icon: '☁️',
    description: 'Cloud platforms and services',
    recommendedPath: ['networking', 'aws', 'serverless', 'kubernetes'],
    skills: [
      {
        id: 'aws',
        name: 'AWS',
        description: 'Amazon Web Services',
        icon: '☁️',
        category: 'tech',
        maxLevel: 10,
        currentLevel: 0,
        xpInvested: 0,
        requires: ['networking'],
        benefits: ['+5% XP on AWS quests', '+10% faster deployments', 'Unlock S3/EC2 content']
      },
      {
        id: 'kubernetes',
        name: 'Kubernetes',
        description: 'Container orchestration',
        icon: '☸️',
        category: 'tech',
        maxLevel: 10,
        currentLevel: 0,
        xpInvested: 0,
        requires: ['aws', 'serverless'],
        benefits: ['+5% XP on K8s quests', '+10% faster scaling', 'Unlock Helm content']
      },
      {
        id: 'serverless',
        name: 'Serverless',
        description: 'Lambda, Functions',
        icon: '⚡',
        category: 'tech',
        maxLevel: 10,
        currentLevel: 0,
        xpInvested: 0,
        requires: ['aws'],
        benefits: ['+4% XP on serverless quests', '+15% cost savings awareness', 'Unlock Lambda content']
      },
      {
        id: 'networking',
        name: 'Cloud Networking',
        description: 'VPCs, DNS, CDN',
        icon: '🌐',
        category: 'tech',
        maxLevel: 10,
        currentLevel: 0,
        xpInvested: 0,
        benefits: ['+3% XP on networking quests', '+5% faster troubleshooting', 'Unlock VPC content']
      },
    ],
  },
  {
    id: 'hero_traits',
    name: 'Hero Traits',
    icon: '🦸',
    description: 'Personal attributes that aid your journey',
    recommendedPath: ['persistence', 'curiosity', 'speed', 'wisdom'],
    skills: [
      {
        id: 'persistence',
        name: 'Persistence',
        description: 'Never give up',
        icon: '💪',
        category: 'meta',
        maxLevel: 5,
        currentLevel: 0,
        xpInvested: 0,
        benefits: ['+1% streak protection per level', '+2% quiz score at low health', 'Reduce wrong answer penalties']
      },
      {
        id: 'curiosity',
        name: 'Curiosity',
        description: 'Always learning',
        icon: '🔍',
        category: 'meta',
        maxLevel: 5,
        currentLevel: 0,
        xpInvested: 0,
        requires: ['persistence'],
        benefits: ['+5% bonus XP on first attempt', '+2% chance for bonus gold', 'Unlock hidden quests']
      },
      {
        id: 'speed',
        name: 'Speed Learning',
        description: 'Learn faster',
        icon: '⚡',
        category: 'meta',
        maxLevel: 5,
        currentLevel: 0,
        xpInvested: 0,
        requires: ['curiosity'],
        benefits: ['+3% XP on timed challenges', '+5% faster quiz completion', 'Reduce daily quest timers']
      },
      {
        id: 'wisdom',
        name: 'Wisdom',
        description: 'Better decisions',
        icon: '🧙',
        category: 'meta',
        maxLevel: 5,
        currentLevel: 0,
        xpInvested: 0,
        requires: ['speed'],
        benefits: ['+5% quiz accuracy bonus', '+10% hint quality', 'Unlock mentor quests']
      },
    ],
  },
]

// XP cost per skill level (exponential scaling)
export function getXpForLevel(currentLevel: number): number {
  return Math.floor(50 * Math.pow(1.5, currentLevel))
}

// Total XP needed to reach a level
export function getTotalXpForLevel(targetLevel: number): number {
  let total = 0
  for (let i = 0; i < targetLevel; i++) {
    total += getXpForLevel(i)
  }
  return total
}

// Available skill points from XP spent
export function getAvailableSkillPoints(totalXpSpent: number): number {
  return Math.floor(totalXpSpent / 100)
}

// Check if a skill can be upgraded
export function canUpgradeSkill(skill: Skill, availablePoints: number): boolean {
  if (skill.currentLevel >= skill.maxLevel) return false
  if (availablePoints < 1) return false
  return true
}

// Calculate active bonuses from allocated skill points
export function getSkillBonuses(skillAllocations: Record<string, number>): SkillBonus[] {
  const bonuses: SkillBonus[] = []

  for (const tree of SKILL_TREES) {
    for (const skill of tree.skills) {
      const level = skillAllocations[skill.id] || 0
      if (level === 0) continue

      // XP bonus per level
      if (skill.category === 'tech') {
        bonuses.push({
          skillId: skill.id,
          skillName: skill.name,
          bonusType: 'xp',
          bonusValue: level * 2, // +2% per level
          description: `+${level * 2}% XP on ${skill.name} quests`
        })
      }

      // Meta skills provide special bonuses
      if (skill.id === 'persistence' && level > 0) {
        bonuses.push({
          skillId: skill.id,
          skillName: skill.name,
          bonusType: 'streak',
          bonusValue: level,
          description: `+${level}% streak protection`
        })
      }

      if (skill.id === 'wisdom' && level > 0) {
        bonuses.push({
          skillId: skill.id,
          skillName: skill.name,
          bonusType: 'quiz',
          bonusValue: level * 2,
          description: `+${level * 2}% quiz accuracy`
        })
      }
    }
  }

  return bonuses
}

// Check if a skill's requirements are met
export function meetsRequirements(skill: Skill, skillAllocations: Record<string, number>): boolean {
  if (!skill.requires || skill.requires.length === 0) return true
  return skill.requires.every(reqId => (skillAllocations[reqId] || 0) > 0)
}

// Get the next recommended skill to unlock
export function getRecommendedSkill(
  tree: SkillTree,
  skillAllocations: Record<string, number>,
  availablePoints: number
): Skill | null {
  if (availablePoints <= 0) return null
  if (!tree.recommendedPath) return null

  for (const skillId of tree.recommendedPath) {
    const skill = tree.skills.find(s => s.id === skillId)
    if (!skill) continue
    const currentLevel = skillAllocations[skillId] || 0
    if (currentLevel >= skill.maxLevel) continue
    if (!meetsRequirements(skill, skillAllocations)) continue
    return skill
  }

  return null
}
