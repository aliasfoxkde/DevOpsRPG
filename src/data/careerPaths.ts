export interface CareerPath {
  id: string
  name: string
  icon: string
  description: string
  averageSalary: string
  demandLevel: 'high' | 'medium' | 'growing'
  estimatedMonths: number
  prerequisites: string[]
  technologies: CareerTechnology[]
  milestones: CareerMilestone[]
}

export interface CareerTechnology {
  id: string
  name: string
  icon: string
  category: 'fundamentals' | 'version-control' | 'containers' | 'cloud' | 'orchestration' | 'infrastructure' | 'monitoring' | 'security'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  questIds: string[]
}

export interface CareerMilestone {
  id: string
  name: string
  description: string
  icon: string
  requiredTechnologies: string[]
  rewards: {
    xpBonus: number
    goldBonus: number
    badgeId?: string
  }
}

export const CAREER_PATHS: CareerPath[] = [
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    icon: '⚙️',
    description: 'Master the art of bridging development and operations. Automate pipelines, manage infrastructure, and ensure reliable deployments.',
    averageSalary: '$120,000 - $180,000',
    demandLevel: 'high',
    estimatedMonths: 6,
    prerequisites: ['Git basics', 'Command line proficiency'],
    technologies: [
      { id: 'git', name: 'Git', icon: '🌿', category: 'version-control', difficulty: 'beginner', questIds: [] },
      { id: 'linux', name: 'Linux', icon: '🐧', category: 'fundamentals', difficulty: 'beginner', questIds: [] },
      { id: 'docker', name: 'Docker', icon: '🐳', category: 'containers', difficulty: 'intermediate', questIds: [] },
      { id: 'kubernetes', name: 'Kubernetes', icon: '☸️', category: 'orchestration', difficulty: 'advanced', questIds: [] },
      { id: 'aws', name: 'AWS', icon: '☁️', category: 'cloud', difficulty: 'intermediate', questIds: [] },
      { id: 'terraform', name: 'Terraform', icon: '🏗️', category: 'infrastructure', difficulty: 'intermediate', questIds: [] },
      { id: 'cicd', name: 'CI/CD', icon: '🔄', category: 'infrastructure', difficulty: 'intermediate', questIds: [] },
      { id: 'monitoring', name: 'Monitoring', icon: '📊', category: 'monitoring', difficulty: 'intermediate', questIds: [] },
    ],
    milestones: [
      {
        id: 'devops-associate',
        name: 'DevOps Associate',
        description: 'Complete foundations and first CI/CD pipeline',
        icon: '📜',
        requiredTechnologies: ['git', 'linux', 'cicd'],
        rewards: { xpBonus: 500, goldBonus: 200, badgeId: 'devops_associate' },
      },
      {
        id: 'container-expert',
        name: 'Container Expert',
        description: 'Master Docker and basic orchestration',
        icon: '🐳',
        requiredTechnologies: ['docker', 'kubernetes'],
        rewards: { xpBonus: 1000, goldBonus: 500, badgeId: 'container_expert' },
      },
    ],
  },
  {
    id: 'sre',
    name: 'Site Reliability Engineer',
    icon: '🛡️',
    description: 'Ensure systems are reliable, available, and performant. Focus on monitoring, incident response, and automation.',
    averageSalary: '$130,000 - $200,000',
    demandLevel: 'high',
    estimatedMonths: 8,
    prerequisites: ['Linux administration', 'Networking basics', 'Scripting'],
    technologies: [
      { id: 'linux', name: 'Linux', icon: '🐧', category: 'fundamentals', difficulty: 'beginner', questIds: [] },
      { id: 'bash', name: 'Bash Scripting', icon: '📟', category: 'fundamentals', difficulty: 'intermediate', questIds: [] },
      { id: 'docker', name: 'Docker', icon: '🐳', category: 'containers', difficulty: 'intermediate', questIds: [] },
      { id: 'kubernetes', name: 'Kubernetes', icon: '☸️', category: 'orchestration', difficulty: 'advanced', questIds: [] },
      { id: 'monitoring', name: 'Monitoring', icon: '📊', category: 'monitoring', difficulty: 'advanced', questIds: [] },
      { id: 'prometheus', name: 'Prometheus', icon: '🔥', category: 'monitoring', difficulty: 'advanced', questIds: [] },
      { id: 'grafana', name: 'Grafana', icon: '📈', category: 'monitoring', difficulty: 'intermediate', questIds: [] },
      { id: 'incident', name: 'Incident Response', icon: '🚨', category: 'monitoring', difficulty: 'advanced', questIds: [] },
    ],
    milestones: [
      {
        id: 'sre-fundamentals',
        name: 'SRE Fundamentals',
        description: 'Complete Linux, Docker, and Monitoring basics',
        icon: '📜',
        requiredTechnologies: ['linux', 'docker', 'monitoring'],
        rewards: { xpBonus: 750, goldBonus: 300, badgeId: 'sre_fundamentals' },
      },
      {
        id: 'incident-master',
        name: 'Incident Master',
        description: 'Master incident response and on-call practices',
        icon: '🚨',
        requiredTechnologies: ['incident', 'prometheus', 'grafana'],
        rewards: { xpBonus: 1500, goldBonus: 750, badgeId: 'incident_master' },
      },
    ],
  },
  {
    id: 'cloud-architect',
    name: 'Cloud Architect',
    icon: '🏗️',
    description: 'Design scalable, reliable cloud infrastructure. Make architectural decisions and optimize for cost and performance.',
    averageSalary: '$150,000 - $220,000',
    demandLevel: 'medium',
    estimatedMonths: 10,
    prerequisites: ['Networking knowledge', 'Linux basics', 'Security fundamentals'],
    technologies: [
      { id: 'aws', name: 'AWS', icon: '☁️', category: 'cloud', difficulty: 'intermediate', questIds: [] },
      { id: 'terraform', name: 'Terraform', icon: '🏗️', category: 'infrastructure', difficulty: 'intermediate', questIds: [] },
      { id: 'docker', name: 'Docker', icon: '🐳', category: 'containers', difficulty: 'intermediate', questIds: [] },
      { id: 'kubernetes', name: 'Kubernetes', icon: '☸️', category: 'orchestration', difficulty: 'advanced', questIds: [] },
      { id: 'networking', name: 'Networking', icon: '🌐', category: 'fundamentals', difficulty: 'advanced', questIds: [] },
      { id: 'security', name: 'Security', icon: '🔒', category: 'security', difficulty: 'advanced', questIds: [] },
      { id: 'cost', name: 'FinOps', icon: '💰', category: 'cloud', difficulty: 'intermediate', questIds: [] },
      { id: 'iac', name: 'Infrastructure as Code', icon: '📝', category: 'infrastructure', difficulty: 'advanced', questIds: [] },
    ],
    milestones: [
      {
        id: 'cloud-associate',
        name: 'Cloud Associate',
        description: 'Complete AWS fundamentals and IaC basics',
        icon: '☁️',
        requiredTechnologies: ['aws', 'terraform', 'iac'],
        rewards: { xpBonus: 1000, goldBonus: 500, badgeId: 'cloud_associate' },
      },
    ],
  },
  {
    id: 'platform-engineer',
    name: 'Platform Engineer',
    icon: '🔧',
    description: 'Build internal developer platforms and self-service tools. Enable developers to ship faster with golden paths.',
    averageSalary: '$140,000 - $190,000',
    demandLevel: 'growing',
    estimatedMonths: 7,
    prerequisites: ['Software development basics', 'Git', 'Linux'],
    technologies: [
      { id: 'git', name: 'Git', icon: '🌿', category: 'version-control', difficulty: 'beginner', questIds: [] },
      { id: 'docker', name: 'Docker', icon: '🐳', category: 'containers', difficulty: 'intermediate', questIds: [] },
      { id: 'kubernetes', name: 'Kubernetes', icon: '☸️', category: 'orchestration', difficulty: 'advanced', questIds: [] },
      { id: 'helm', name: 'Helm', icon: '⎈', category: 'orchestration', difficulty: 'advanced', questIds: [] },
      { id: 'gitops', name: 'GitOps', icon: '🔀', category: 'infrastructure', difficulty: 'advanced', questIds: [] },
      { id: 'argocd', name: 'ArgoCD', icon: '⚓', category: 'orchestration', difficulty: 'advanced', questIds: [] },
      { id: 'cicd', name: 'CI/CD', icon: '🔄', category: 'infrastructure', difficulty: 'intermediate', questIds: [] },
    ],
    milestones: [
      {
        id: 'platform-basics',
        name: 'Platform Basics',
        description: 'Master container fundamentals and Kubernetes',
        icon: '📜',
        requiredTechnologies: ['docker', 'kubernetes', 'cicd'],
        rewards: { xpBonus: 800, goldBonus: 400, badgeId: 'platform_basics' },
      },
    ],
  },
]

export function getTechnologyCompletion(_techId: string, _completedQuestIds: Set<string>): number {
  // This would be calculated from actual quest data
  // For now, return a placeholder
  return 0
}

export const CATEGORY_COLORS: Record<CareerTechnology['category'], string> = {
  fundamentals: '#10b981',
  'version-control': '#f59e0b',
  containers: '#2496ed',
  cloud: '#ff9900',
  orchestration: '#326ce5',
  infrastructure: '#7b42bc',
  monitoring: '#e6522c',
  security: '#dc2626',
}

export const DIFFICULTY_CONFIG: Record<CareerTechnology['difficulty'], { label: string; color: string }> = {
  beginner: { label: '🌱 Beginner', color: '#10b981' },
  intermediate: { label: '⚡ Intermediate', color: '#f59e0b' },
  advanced: { label: '🔥 Advanced', color: '#ef4444' },
}
