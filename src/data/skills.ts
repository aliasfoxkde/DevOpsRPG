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
}

export interface SkillTree {
  id: string
  name: string
  icon: string
  description: string
  skills: Skill[]
}

export const SKILL_TREES: SkillTree[] = [
  {
    id: 'devops_fundamentals',
    name: 'DevOps Fundamentals',
    icon: '🏗️',
    description: 'Core DevOps principles and practices',
    skills: [
      { id: 'ci_cd', name: 'CI/CD Pipeline', description: 'Build and deploy automatically', icon: '🔄', category: 'tech', maxLevel: 10, currentLevel: 0, xpInvested: 0 },
      { id: 'containerization', name: 'Containerization', description: 'Docker and container tech', icon: '🐳', category: 'tech', maxLevel: 10, currentLevel: 0, xpInvested: 0 },
      { id: 'infrastructure', name: 'Infrastructure as Code', description: 'Terraform, CloudFormation', icon: '🏗️', category: 'tech', maxLevel: 10, currentLevel: 0, xpInvested: 0 },
      { id: 'monitoring', name: 'Monitoring', description: 'Observe and respond', icon: '📊', category: 'tech', maxLevel: 10, currentLevel: 0, xpInvested: 0 },
    ],
  },
  {
    id: 'coding_mastery',
    name: 'Coding Mastery',
    icon: '💻',
    description: 'Programming languages and paradigms',
    skills: [
      { id: 'python', name: 'Python', description: 'Scripting and automation', icon: '🐍', category: 'tech', maxLevel: 10, currentLevel: 0, xpInvested: 0 },
      { id: 'javascript', name: 'JavaScript', description: 'Web and Node.js', icon: '⚡', category: 'tech', maxLevel: 10, currentLevel: 0, xpInvested: 0 },
      { id: 'bash', name: 'Bash/Shell', description: 'Command line mastery', icon: '💻', category: 'tech', maxLevel: 10, currentLevel: 0, xpInvested: 0 },
      { id: 'sql', name: 'SQL/Databases', description: 'Data manipulation', icon: '🗄️', category: 'tech', maxLevel: 10, currentLevel: 0, xpInvested: 0 },
    ],
  },
  {
    id: 'cloud_adventure',
    name: 'Cloud Adventure',
    icon: '☁️',
    description: 'Cloud platforms and services',
    skills: [
      { id: 'aws', name: 'AWS', description: 'Amazon Web Services', icon: '☁️', category: 'tech', maxLevel: 10, currentLevel: 0, xpInvested: 0 },
      { id: 'kubernetes', name: 'Kubernetes', description: 'Container orchestration', icon: '☸️', category: 'tech', maxLevel: 10, currentLevel: 0, xpInvested: 0 },
      { id: 'serverless', name: 'Serverless', description: 'Lambda, Functions', icon: '⚡', category: 'tech', maxLevel: 10, currentLevel: 0, xpInvested: 0 },
      { id: 'networking', name: 'Cloud Networking', description: 'VPCs, DNS, CDN', icon: '🌐', category: 'tech', maxLevel: 10, currentLevel: 0, xpInvested: 0 },
    ],
  },
  {
    id: 'hero_traits',
    name: 'Hero Traits',
    icon: '🦸',
    description: 'Personal attributes that aid your journey',
    skills: [
      { id: 'persistence', name: 'Persistence', description: 'Never give up', icon: '💪', category: 'meta', maxLevel: 5, currentLevel: 0, xpInvested: 0 },
      { id: 'curiosity', name: 'Curiosity', description: 'Always learning', icon: '🔍', category: 'meta', maxLevel: 5, currentLevel: 0, xpInvested: 0 },
      { id: 'speed', name: 'Speed Learning', description: 'Learn faster', icon: '⚡', category: 'meta', maxLevel: 5, currentLevel: 0, xpInvested: 0 },
      { id: 'wisdom', name: 'Wisdom', description: 'Better decisions', icon: '🧙', category: 'meta', maxLevel: 5, currentLevel: 0, xpInvested: 0 },
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
