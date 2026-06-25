// Quest data derived from technologies - each topic becomes a quest
import { technologies } from './technologies'
import type { Technology, Topic } from './technologies'

export interface Quest {
  id: string
  technologyId: string
  topicId: string
  realmId: string
  title: string
  description: string
  type: 'battle' | 'boss'
  xpReward: number
  difficulty: 1 | 2 | 3 | 4 | 5
  estimatedMinutes: number
  order: number
}

export interface Realm {
  id: string
  name: string
  icon: string
  color: string
  description: string
  requiredLevel: number
  technologies: string[]
}

// Realms based on phases - these are the "areas" on the world map
export const realms: Record<string, Realm> = {
  foundations: {
    id: 'foundations',
    name: 'Village of Foundations',
    icon: '🏘️',
    color: '#6366f1',
    description: 'Every hero begins here. Master the ancient arts of markup and style.',
    requiredLevel: 1,
    technologies: ['html', 'css', 'javascript', 'git', 'sql'],
  },
  scripts: {
    id: 'scripts',
    name: 'Forest of Scripts',
    icon: '🌲',
    color: '#0891b2',
    description: 'The forest hums with automation. Bash through the undergrowth and conjure Python spirits.',
    requiredLevel: 5,
    technologies: ['python', 'bash', 'docker'],
  },
  frameworks: {
    id: 'frameworks',
    name: 'Castle of Frameworks',
    icon: '🏰',
    color: '#22c55e',
    description: 'Towering halls filled with powerful frameworks and data vaults.',
    requiredLevel: 10,
    technologies: ['react', 'nodejs', 'postgresql', 'mongodb'],
  },
  cloud: {
    id: 'cloud',
    name: 'Mountains of Cloud',
    icon: '⛰️',
    color: '#f59e0b',
    description: 'Scale the treacherous peaks where AWS storms rage and Kubernetes eagles soar.',
    requiredLevel: 15,
    technologies: ['aws', 'kubernetes', 'terraform'],
  },
  devops: {
    id: 'devops',
    name: 'Citadel of DevOps',
    icon: '🏛️',
    color: '#ef4444',
    description: 'The final bastion. Only true DevOps Masters may enter these sacred halls.',
    requiredLevel: 20,
    technologies: ['cicd', 'prometheus', 'security'],
  },
  aiintelligence: {
    id: 'aiintelligence',
    name: 'AI Nexus',
    icon: '🧠',
    color: '#7c3aed',
    description: 'The realm of machine learning, neural networks, and artificial intelligence.',
    requiredLevel: 25,
    technologies: ['machine_learning', 'networking', 'api_design', 'observability'],
  },
}

// Generate quests from technologies
export function generateQuests(): Quest[] {
  const quests: Quest[] = []
  const realmMap: Record<number, string> = {
    1: 'foundations',
    2: 'scripts',
    3: 'frameworks',
    4: 'cloud',
    5: 'devops',
    6: 'aiintelligence',
  }

  Object.values(technologies).forEach((tech: Omit<Technology, 'category'>) => {
    const realmId = realmMap[tech.phase] || 'foundations'

    tech.topics.forEach((topic: Topic, index: number) => {
      // Difficulty: based on technology phase + position within tech
      // Phase 1-2 = beginner realms, Phase 3-4 = intermediate, Phase 5-6 = advanced
      const positionInTech = index + 1
      const totalTopics = tech.topics.length
      const positionRatio = positionInTech / totalTopics // 0 to 1

      // Calculate difficulty: 1-5 scale
      // Base difficulty from phase (1-6), adjusted by position in topic list
      // Phase 1-2 topics start at difficulty 1-2, phase 3-4 at 2-3, phase 5-6 at 4-5
      let baseDifficulty: number
      if (tech.phase <= 2) {
        baseDifficulty = 1 + (tech.phase - 1) * 0.5 // Phase 1→1, Phase 2→1.5
      } else if (tech.phase <= 4) {
        baseDifficulty = 2 + (tech.phase - 3) * 0.5 // Phase 3→2, Phase 4→2.5
      } else {
        baseDifficulty = 3.5 + (tech.phase - 5) * 0.75 // Phase 5→3.5, Phase 6→4.25
      }

      // Position multiplier: first 30% of topics are easier, last 20% are harder
      let positionBonus = 0
      if (positionRatio > 0.8) {
        positionBonus = 1 // Last 20% = hardest
      } else if (positionRatio > 0.6) {
        positionBonus = 0.5 // Next 20% = medium-hard
      } else if (positionRatio > 0.3) {
        positionBonus = 0 // Middle 30% = baseline
      } else if (positionInTech > 1) {
        positionBonus = -0.5 // First 30% (except first) = easier
      }
      // First topic always difficulty 1

      let difficulty: 1 | 2 | 3 | 4 | 5
      if (positionInTech === 1) {
        difficulty = 1
      } else {
        difficulty = Math.round(Math.min(5, Math.max(1, baseDifficulty + positionBonus))) as 1 | 2 | 3 | 4 | 5
      }

      // Time estimates: intro topics are quick (~3-5 min), scale up realistically
      // Scale from 3 min (easy/intro) to 15 min (hard/expert)
      let estimatedMinutes: number
      if (positionInTech === 1) {
        estimatedMinutes = 3 // Quick intro
      } else if (positionRatio <= 0.3) {
        estimatedMinutes = 5 // Early topics
      } else if (positionRatio <= 0.6) {
        estimatedMinutes = 8 // Middle topics
      } else if (positionRatio <= 0.8) {
        estimatedMinutes = 12 // Advanced topics
      } else {
        estimatedMinutes = 15 // Expert topics
      }

      quests.push({
        id: `quest_${topic.id}`,
        technologyId: tech.id,
        topicId: topic.id,
        realmId,
        title: topic.name,
        description: `Learn ${topic.name} - ${tech.name}`,
        type: positionInTech === 1 && totalTopics > 3 ? 'boss' : 'battle',
        // XP scales with difficulty: base * difficulty multiplier
        xpReward: Math.round(tech.xpPerTopic * (0.7 + difficulty * 0.15)),
        difficulty,
        estimatedMinutes,
        order: positionInTech,
      })
    })
  })

  return quests
}

export const allQuests = generateQuests()

// Get the next available quest for a player
export function getNextQuest(completedTopicIds: Set<string>): Quest | null {
  for (const quest of allQuests) {
    if (!completedTopicIds.has(quest.topicId)) {
      return quest
    }
  }
  return null // All completed!
}

// Check if a realm is unlocked
export function isRealmUnlocked(realm: Realm, playerLevel: number, completedTopicIds: Set<string>): boolean {
  // First realm always unlocked
  if (realm.requiredLevel === 1) return true

  // Check if player meets level requirement
  if (playerLevel < realm.requiredLevel) return false

  // Check if previous realm is completed
  const realmOrder = Object.keys(realms).indexOf(realm.id)
  if (realmOrder === 0) return true

  const prevRealm = Object.values(realms)[realmOrder - 1]
  const prevRealmCompleted = prevRealm.technologies.every(techId => {
    const techQuests = allQuests.filter(q => q.technologyId === techId)
    return techQuests.every(q => completedTopicIds.has(q.topicId))
  })

  return prevRealmCompleted
}

// Story text for realm introductions
export const realmStories: Record<string, string> = {
  foundations: `Welcome, young apprentice, to the Village of Foundations.

Before you can wield the powers of the cloud and automate the world, you must master the ancient ways:
• HTML - The structure of all web documents
• CSS - The art of visual styling
• JavaScript - The magic that brings pages to life
• Git - The scroll that records all changes
• SQL - The language of data

Begin your journey here, and may the code be with you.`,
  scripts: `You've proven yourself in the Foundations! The Forest of Scripts awaits.

Here you'll learn:
• Python - A serpent's wisdom for automation
• Bash - The voice of the command line
• Docker - Summon containers from the ether

The forest is dark and full of terrors (and sysadmins), but a skilled scripter need not fear.`,
  frameworks: `The Castle of Frameworks rises before you, banners waving.

Within these walls:
• React - A shield that deflects UI complexity
• Node.js - JavaScript beyond the browser
• PostgreSQL & MongoDB - Twin data vaults

Many have entered. Few have mastered all.`,
  cloud: `The Mountains of Cloud pierce the heavens themselves.

• AWS - The colossal trading post in the sky
• Kubernetes - Command the container fleets
• Terraform - Shape the cloud with code

Only the most dedicated shall reach the summit.`,
  devops: `The Citadel of DevOps - final home of the true Masters.

• CI/CD - The endless cycle of creation
• Prometheus - Watchmen of the infrastructure
• Security - Protect all that you've built

Your journey nears its end. Become what you were always meant to be: A DevOps Master.`,
}
