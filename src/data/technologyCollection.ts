// Technology Collection - Each technology becomes a collectible card
// Per BRAINSTORM.md: "Unlock: Linux, Docker, Kubernetes, AWS, Azure, Terraform, GitHub Actions, Jenkins, Ansible"
// Each becomes a collectible card

export type TechRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface TechnologyCard {
  id: string
  name: string
  icon: string
  description: string
  rarity: TechRarity
  // Unlock requirements
  requiredQuests: number // Number of quests in this tech to complete
  // Stats
  totalQuests: number
  completedQuests: number
  // Card flavor text
  flavorText: string
  // Category
  category: 'fundamentals' | 'containers' | 'cloud' | 'orchestration' | 'infrastructure' | 'security' | 'programming' | 'databases'
}

export const TECHNOLOGY_COLLECTION: TechnologyCard[] = [
  // Fundamentals
  {
    id: 'linux',
    name: 'Linux',
    icon: '🐧',
    description: 'The open-source operating system powering most servers in the cloud.',
    rarity: 'common',
    requiredQuests: 5,
    totalQuests: 8,
    completedQuests: 0,
    flavorText: '"Linux is everywhere. From Android phones to servers, Linux runs the world."',
    category: 'fundamentals'
  },
  {
    id: 'git',
    name: 'Git',
    icon: '📚',
    description: 'Distributed version control for tracking changes in source code.',
    rarity: 'common',
    requiredQuests: 5,
    totalQuests: 6,
    completedQuests: 0,
    flavorText: '"Git is the backbone of modern software development."',
    category: 'fundamentals'
  },
  {
    id: 'networking',
    name: 'Networking',
    icon: '🌐',
    description: 'Understanding TCP/IP, DNS, HTTP, and network architecture.',
    rarity: 'uncommon',
    requiredQuests: 6,
    totalQuests: 8,
    completedQuests: 0,
    flavorText: '"In the world of DevOps, networking is the circulatory system."',
    category: 'fundamentals'
  },
  {
    id: 'security',
    name: 'Security',
    icon: '🔒',
    description: 'Security best practices, secrets management, and compliance.',
    rarity: 'uncommon',
    requiredQuests: 6,
    totalQuests: 8,
    completedQuests: 0,
    flavorText: '"Security is not a product, but a process."',
    category: 'security'
  },

  // Containers
  {
    id: 'docker',
    name: 'Docker',
    icon: '🐳',
    description: 'Platform for containerizing applications with consistent environments.',
    rarity: 'uncommon',
    requiredQuests: 6,
    totalQuests: 8,
    completedQuests: 0,
    flavorText: '"Build once, run anywhere - the container revolution."',
    category: 'containers'
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    icon: '☸️',
    description: 'Container orchestration for automating deployment, scaling, and management.',
    rarity: 'rare',
    requiredQuests: 8,
    totalQuests: 10,
    completedQuests: 0,
    flavorText: '"The operating system of the cloud."',
    category: 'orchestration'
  },

  // Cloud
  {
    id: 'aws',
    name: 'AWS',
    icon: '☁️',
    description: 'Amazon Web Services - comprehensive cloud computing platform.',
    rarity: 'rare',
    requiredQuests: 8,
    totalQuests: 10,
    completedQuests: 0,
    flavorText: '"The cloud that started it all."',
    category: 'cloud'
  },
  {
    id: 'azure',
    name: 'Azure',
    icon: '🔷',
    description: 'Microsoft\'s cloud platform for building, deploying, and managing applications.',
    rarity: 'rare',
    requiredQuests: 6,
    totalQuests: 8,
    completedQuests: 0,
    flavorText: '"Microsoft\'s enterprise cloud solution."',
    category: 'cloud'
  },

  // Infrastructure as Code
  {
    id: 'terraform',
    name: 'Terraform',
    icon: '🏗️',
    description: 'Infrastructure as Code for provisioning and managing cloud resources.',
    rarity: 'rare',
    requiredQuests: 6,
    totalQuests: 8,
    completedQuests: 0,
    flavorText: '"Infrastructure as code, version controlled and repeatable."',
    category: 'infrastructure'
  },
  {
    id: 'ansible',
    name: 'Ansible',
    icon: '⚙️',
    description: 'Automation tool for configuration management and application deployment.',
    rarity: 'uncommon',
    requiredQuests: 5,
    totalQuests: 6,
    completedQuests: 0,
    flavorText: '"Agentless automation for the masses."',
    category: 'infrastructure'
  },

  // CI/CD
  {
    id: 'cicd',
    name: 'CI/CD',
    icon: '🔄',
    description: 'Continuous Integration and Continuous Deployment pipelines.',
    rarity: 'uncommon',
    requiredQuests: 6,
    totalQuests: 8,
    completedQuests: 0,
    flavorText: '"Automate everything. Ship with confidence."',
    category: 'infrastructure'
  },
  {
    id: 'github_actions',
    name: 'GitHub Actions',
    icon: '🐙',
    description: 'CI/CD built into GitHub for automating workflows.',
    rarity: 'uncommon',
    requiredQuests: 5,
    totalQuests: 6,
    completedQuests: 0,
    flavorText: '"GitHub\'s powerful automation engine."',
    category: 'infrastructure'
  },
  {
    id: 'jenkins',
    name: 'Jenkins',
    icon: '👷',
    description: 'Open-source automation server for building and deploying.',
    rarity: 'common',
    requiredQuests: 4,
    totalQuests: 5,
    completedQuests: 0,
    flavorText: '"The old faithful of CI/CD servers."',
    category: 'infrastructure'
  },

  // Programming
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    description: 'Versatile programming language for scripting, automation, and ML.',
    rarity: 'common',
    requiredQuests: 5,
    totalQuests: 6,
    completedQuests: 0,
    flavorText: '"The Swiss Army knife of programming languages."',
    category: 'programming'
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: '⚡',
    description: 'The language of the web, powering Node.js and modern frontend.',
    rarity: 'common',
    requiredQuests: 5,
    totalQuests: 6,
    completedQuests: 0,
    flavorText: '"JavaScript: The only language that runs everywhere."',
    category: 'programming'
  },
  {
    id: 'bash',
    name: 'Bash',
    icon: '💻',
    description: 'Unix shell scripting for automation and system administration.',
    rarity: 'common',
    requiredQuests: 4,
    totalQuests: 5,
    completedQuests: 0,
    flavorText: '"The command line is your best friend."',
    category: 'programming'
  },
  {
    id: 'sql',
    name: 'SQL',
    icon: '🗄️',
    description: 'Structured Query Language for managing relational databases.',
    rarity: 'common',
    requiredQuests: 5,
    totalQuests: 6,
    completedQuests: 0,
    flavorText: '"Data is the new oil, SQL is the pipeline."',
    category: 'databases'
  },

  // Monitoring
  {
    id: 'monitoring',
    name: 'Monitoring',
    icon: '📊',
    description: 'Systems monitoring, alerting, and observability.',
    rarity: 'uncommon',
    requiredQuests: 5,
    totalQuests: 6,
    completedQuests: 0,
    flavorText: '"You can\'t fix what you can\'t see."',
    category: 'infrastructure'
  },
  {
    id: 'prometheus',
    name: 'Prometheus',
    icon: '🔥',
    description: 'Open-source systems monitoring and alerting toolkit.',
    rarity: 'rare',
    requiredQuests: 5,
    totalQuests: 6,
    completedQuests: 0,
    flavorText: '"The metrics-based monitoring solution."',
    category: 'infrastructure'
  },
  {
    id: 'grafana',
    name: 'Grafana',
    icon: '📈',
    description: 'Open-source analytics and interactive visualization.',
    rarity: 'uncommon',
    requiredQuests: 4,
    totalQuests: 5,
    completedQuests: 0,
    flavorText: '"Beautiful dashboards for your metrics."',
    category: 'infrastructure'
  },

  // Advanced
  {
    id: 'helm',
    name: 'Helm',
    icon: '⎈',
    description: 'Package manager for Kubernetes applications.',
    rarity: 'rare',
    requiredQuests: 5,
    totalQuests: 6,
    completedQuests: 0,
    flavorText: '"Kubernetes packaging made easy."',
    category: 'orchestration'
  },
  {
    id: 'gitops',
    name: 'GitOps',
    icon: '🔀',
    description: 'Git-based deployment workflow using Git as single source of truth.',
    rarity: 'epic',
    requiredQuests: 6,
    totalQuests: 7,
    completedQuests: 0,
    flavorText: '"GitOps: Infrastructure as Code meets Version Control."',
    category: 'infrastructure'
  },
  {
    id: 'argocd',
    name: 'ArgoCD',
    icon: '⚓',
    description: 'Declarative, GitOps continuous delivery tool for Kubernetes.',
    rarity: 'epic',
    requiredQuests: 5,
    totalQuests: 6,
    completedQuests: 0,
    flavorText: '"GitOps at its finest on Kubernetes."',
    category: 'orchestration'
  },
  {
    id: 'vault',
    name: 'HashiCorp Vault',
    icon: '🔐',
    description: 'Secrets management and secure data storage.',
    rarity: 'epic',
    requiredQuests: 5,
    totalQuests: 6,
    completedQuests: 0,
    flavorText: '"Security starts with proper secrets management."',
    category: 'security'
  },
  {
    id: 'docker_swarm',
    name: 'Docker Swarm',
    icon: '🐠',
    description: 'Container orchestration native to Docker.',
    rarity: 'uncommon',
    requiredQuests: 4,
    totalQuests: 5,
    completedQuests: 0,
    flavorText: '"Simpler container orchestration."',
    category: 'containers'
  },
  {
    id: 'vagrant',
    name: 'Vagrant',
    icon: '📦',
    description: 'Development environment creation tool.',
    rarity: 'common',
    requiredQuests: 3,
    totalQuests: 4,
    completedQuests: 0,
    flavorText: '"Create consistent development environments."',
    category: 'infrastructure'
  },
  {
    id: 'packer',
    name: 'Packer',
    icon: '📦',
    description: 'Tool for creating identical machine images for multiple platforms.',
    rarity: 'rare',
    requiredQuests: 4,
    totalQuests: 5,
    completedQuests: 0,
    flavorText: '"One config, multiple platforms."',
    category: 'infrastructure'
  },
]

// Rarity colors for display
export const RARITY_COLORS: Record<TechRarity, string> = {
  common: '#9ca3af',      // Gray
  uncommon: '#22c55e',     // Green
  rare: '#3b82f6',         // Blue
  epic: '#a855f7',         // Purple
  legendary: '#f59e0b',    // Gold
}

// Get all cards by category
export function getCardsByCategory(category: TechnologyCard['category']): TechnologyCard[] {
  return TECHNOLOGY_COLLECTION.filter(card => card.category === category)
}

// Get card by ID
export function getCardById(id: string): TechnologyCard | undefined {
  return TECHNOLOGY_COLLECTION.find(card => card.id === id)
}

// Get total collection count
export function getTotalCards(): number {
  return TECHNOLOGY_COLLECTION.length
}

// Category display names
export const CATEGORY_NAMES: Record<TechnologyCard['category'], string> = {
  fundamentals: 'Fundamentals',
  containers: 'Containers',
  cloud: 'Cloud Platforms',
  orchestration: 'Orchestration',
  infrastructure: 'Infrastructure',
  security: 'Security',
  programming: 'Programming',
  databases: 'Databases',
}
