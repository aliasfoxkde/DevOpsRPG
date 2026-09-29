// Certification Collection - Endgame milestones per BRAINSTORM.md
// "Certification Collection: AWS Practitioner, AWS Associate, Terraform Associate, CKA, Security+"
// "These become endgame milestones."

import { allQuests } from './quests'

type CertificationProvider =
  | 'aws'
  | 'terraform'
  | 'kubernetes'
  | 'security'
  | 'docker'
  | 'linux'

export interface Certification {
  id: string
  name: string
  fullName: string
  provider: CertificationProvider
  icon: string
  description: string
  // Requirements
  requiredQuests: number // Min quests to complete
  requiredTechnologies: string[] // Technologies that must be at certain completion
  level: number // Player level required
  // Rewards
  xpReward: number
  goldReward: number
  // Display
  difficulty: 'foundation' | 'associate' | 'professional' | 'expert'
  flavorText: string
}

export const CERTIFICATIONS: Certification[] = [
  // AWS Certifications
  {
    id: 'aws_cloud_practitioner',
    name: 'Cloud Practitioner',
    fullName: 'AWS Cloud Practitioner',
    provider: 'aws',
    icon: '🎓',
    description: 'Foundational cloud computing knowledge with AWS.',
    requiredQuests: 10,
    requiredTechnologies: ['aws'],
    level: 5,
    xpReward: 500,
    goldReward: 250,
    difficulty: 'foundation',
    flavorText: '"Your first step into the AWS cloud."',
  },
  {
    id: 'aws_solutions_architect',
    name: 'Solutions Architect',
    fullName: 'AWS Solutions Architect Associate',
    provider: 'aws',
    icon: '🏗️',
    description: 'Design distributed systems on AWS.',
    requiredQuests: 15,
    requiredTechnologies: ['aws', 'networking'],
    level: 10,
    xpReward: 1000,
    goldReward: 500,
    difficulty: 'associate',
    flavorText: '"Architecting resilient solutions on AWS."',
  },
  {
    id: 'aws_developer',
    name: 'Developer',
    fullName: 'AWS Developer Associate',
    provider: 'aws',
    icon: '💻',
    description: 'Build and deploy cloud-native applications on AWS.',
    requiredQuests: 15,
    requiredTechnologies: ['aws', 'cicd'],
    level: 12,
    xpReward: 1000,
    goldReward: 500,
    difficulty: 'associate',
    flavorText: '"Code, build, and deploy on AWS."',
  },
  {
    id: 'aws_sysops',
    name: 'SysOps Admin',
    fullName: 'AWS SysOps Administrator Associate',
    provider: 'aws',
    icon: '⚙️',
    description: 'Deploy, manage, and operate on AWS.',
    requiredQuests: 15,
    requiredTechnologies: ['aws', 'observability'],
    level: 12,
    xpReward: 1000,
    goldReward: 500,
    difficulty: 'associate',
    flavorText: '"Keep the cloud running smoothly."',
  },

  // Terraform Certifications
  {
    id: 'terraform_associate',
    name: 'Terraform Associate',
    fullName: 'HashiCorp Terraform Associate',
    provider: 'terraform',
    icon: '🏗️',
    description: 'Infrastructure as Code with Terraform.',
    requiredQuests: 8,
    requiredTechnologies: ['terraform'],
    level: 8,
    xpReward: 750,
    goldReward: 400,
    difficulty: 'associate',
    flavorText: '"IaC is the future of infrastructure."',
  },

  // Kubernetes Certifications
  {
    id: 'cka',
    name: 'CKA',
    fullName: 'Certified Kubernetes Administrator',
    provider: 'kubernetes',
    icon: '☸️',
    description: 'Kubernetes administration and cluster management.',
    requiredQuests: 12,
    requiredTechnologies: ['kubernetes', 'docker'],
    level: 15,
    xpReward: 1500,
    goldReward: 750,
    difficulty: 'professional',
    flavorText: '"Master of Kubernetes clusters."',
  },
  {
    id: 'cks',
    name: 'CKS',
    fullName: 'Certified Kubernetes Security Specialist',
    provider: 'kubernetes',
    icon: '🔒',
    description: 'Secure Kubernetes clusters and cloud-native applications.',
    requiredQuests: 10,
    requiredTechnologies: ['kubernetes', 'security'],
    level: 18,
    xpReward: 2000,
    goldReward: 1000,
    difficulty: 'expert',
    flavorText: '"Security in the container world."',
  },

  // Docker Certifications
  {
    id: 'docker_certified',
    name: 'Docker Certified',
    fullName: 'Docker Certified Associate',
    provider: 'docker',
    icon: '🐳',
    description: 'Container technology mastery.',
    requiredQuests: 8,
    requiredTechnologies: ['docker'],
    level: 8,
    xpReward: 750,
    goldReward: 400,
    difficulty: 'associate',
    flavorText: '"Container expertise certified."',
  },

  // Security Certifications
  {
    id: 'security_plus',
    name: 'Security+',
    fullName: 'CompTIA Security+',
    provider: 'security',
    icon: '🔒',
    description: 'Foundational cybersecurity knowledge and skills.',
    requiredQuests: 10,
    requiredTechnologies: ['security', 'networking'],
    level: 10,
    xpReward: 800,
    goldReward: 400,
    difficulty: 'associate',
    flavorText: '"Security fundamentals certified."',
  },

  // Linux Certification
  {
    id: 'linux_foundation',
    name: 'Linux Foundation',
    fullName: 'Linux Foundation Certified System Administrator',
    provider: 'linux',
    icon: '🐧',
    description: 'Linux system administration mastery.',
    requiredQuests: 10,
    requiredTechnologies: ['bash', 'networking'],
    level: 10,
    xpReward: 800,
    goldReward: 400,
    difficulty: 'associate',
    flavorText: '"Master the command line."',
  },

  // Multi-Cloud
  {
    id: 'multi_cloud_architect',
    name: 'Multi-Cloud Architect',
    fullName: 'Multi-Cloud Architecture Professional',
    provider: 'aws',
    icon: '☁️',
    description: 'Design and operate workloads across cloud providers.',
    requiredQuests: 15,
    requiredTechnologies: ['aws', 'networking', 'terraform'],
    level: 15,
    xpReward: 1500,
    goldReward: 750,
    difficulty: 'professional',
    flavorText: '"Architecture expertise that spans clouds."',
  },

  // DevOps
  {
    id: 'devops_master',
    name: 'DevOps Master',
    fullName: 'DevOps Engineering Foundation',
    provider: 'aws',
    icon: '⚡',
    description: 'Master DevOps practices and culture.',
    requiredQuests: 20,
    requiredTechnologies: ['cicd', 'docker', 'kubernetes'],
    level: 15,
    xpReward: 1500,
    goldReward: 750,
    difficulty: 'professional',
    flavorText: '"Bridging development and operations."',
  },
]

// Difficulty colors
export const DIFFICULTY_COLORS: Record<Certification['difficulty'], string> = {
  foundation: '#22c55e', // Green
  associate: '#3b82f6', // Blue
  professional: '#a855f7', // Purple
  expert: '#f59e0b', // Gold
}

// Difficulty labels
export const DIFFICULTY_LABELS: Record<Certification['difficulty'], string> = {
  foundation: 'Foundation',
  associate: 'Associate',
  professional: 'Professional',
  expert: 'Expert',
}

// Quests the player must complete within each of the certification's
// technologies for that technology requirement to count as met.
export const MIN_TECH_QUESTS = 3

export interface CertificationRequirements {
  met: boolean
  levelMet: boolean
  questMet: boolean
  techsMet: boolean
  techProgress: Record<string, { completed: number; total: number }>
}

// Shared earnability check so the Certifications page and the claim action in
// GameContext can never disagree about what "requirements met" means.
export function checkCertificationRequirements(
  cert: Certification,
  level: number,
  completedQuestIds: readonly string[],
): CertificationRequirements {
  const done = new Set(completedQuestIds)
  const levelMet = level >= cert.level
  const questMet = done.size >= cert.requiredQuests
  const techProgress: Record<string, { completed: number; total: number }> = {}
  let techsMet = true
  for (const techId of cert.requiredTechnologies) {
    const techQuestIds = allQuests
      .filter((q) => q.technologyId === techId)
      .map((q) => q.id)
    const completed = techQuestIds.filter((id) => done.has(id)).length
    techProgress[techId] = { completed, total: techQuestIds.length }
    if (completed < MIN_TECH_QUESTS) techsMet = false
  }
  return { met: levelMet && questMet && techsMet, levelMet, questMet, techsMet, techProgress }
}
