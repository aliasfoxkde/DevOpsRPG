import { allQuests } from './quests'

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
  // A technology id from technologies.ts; questIds are derived from the
  // generated quest catalog so progress always matches the quest journal.
  id: string
  name: string
  icon: string
  category:
    | 'fundamentals'
    | 'version-control'
    | 'containers'
    | 'cloud'
    | 'orchestration'
    | 'infrastructure'
    | 'monitoring'
    | 'security'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  questIds: string[]
}

interface CareerMilestone {
  id: string
  name: string
  description: string
  icon: string
  requiredTechnologies: string[]
  rewards: {
    xpBonus: number
    goldBonus: number
  }
}

// A path technology with no quests is a data bug — fail at import time rather
// than showing a permanently-0% skill tree.
function tech(
  id: string,
  name: string,
  icon: string,
  category: CareerTechnology['category'],
  difficulty: CareerTechnology['difficulty'],
): CareerTechnology {
  const questIds = allQuests.filter((q) => q.technologyId === id).map((q) => q.id)
  if (questIds.length === 0) {
    throw new Error(`careerPaths: no quests found for technology "${id}"`)
  }
  return { id, name, icon, category, difficulty, questIds }
}

export const CAREER_PATHS: CareerPath[] = [
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    icon: '⚙️',
    description:
      'Master the art of bridging development and operations. Automate pipelines, manage infrastructure, and ensure reliable deployments.',
    averageSalary: '$120,000 - $180,000',
    demandLevel: 'high',
    estimatedMonths: 6,
    prerequisites: ['Git basics', 'Command line proficiency'],
    technologies: [
      tech('git', 'Git', '🌿', 'version-control', 'beginner'),
      tech('bash', 'Bash Scripting', '📟', 'fundamentals', 'beginner'),
      tech('docker', 'Docker', '🐳', 'containers', 'intermediate'),
      tech('kubernetes', 'Kubernetes', '☸️', 'orchestration', 'advanced'),
      tech('aws', 'AWS', '☁️', 'cloud', 'intermediate'),
      tech('terraform', 'Terraform', '🏗️', 'infrastructure', 'intermediate'),
      tech('cicd', 'CI/CD', '🔄', 'infrastructure', 'intermediate'),
      tech('observability', 'Observability', '🔭', 'monitoring', 'intermediate'),
    ],
    milestones: [
      {
        id: 'devops-associate',
        name: 'DevOps Associate',
        description: 'Complete foundations and first CI/CD pipeline',
        icon: '📜',
        requiredTechnologies: ['git', 'bash', 'cicd'],
        rewards: { xpBonus: 500, goldBonus: 200 },
      },
      {
        id: 'container-expert',
        name: 'Container Expert',
        description: 'Master Docker and basic orchestration',
        icon: '🐳',
        requiredTechnologies: ['docker', 'kubernetes'],
        rewards: { xpBonus: 1000, goldBonus: 500 },
      },
    ],
  },
  {
    id: 'sre',
    name: 'Site Reliability Engineer',
    icon: '🛡️',
    description:
      'Ensure systems are reliable, available, and performant. Focus on monitoring, incident response, and automation.',
    averageSalary: '$130,000 - $200,000',
    demandLevel: 'high',
    estimatedMonths: 8,
    prerequisites: ['Linux administration', 'Networking basics', 'Scripting'],
    technologies: [
      tech('bash', 'Bash Scripting', '📟', 'fundamentals', 'beginner'),
      tech('docker', 'Docker', '🐳', 'containers', 'intermediate'),
      tech('kubernetes', 'Kubernetes', '☸️', 'orchestration', 'advanced'),
      tech('prometheus', 'Prometheus', '🔥', 'monitoring', 'advanced'),
      tech('observability', 'Observability', '🔭', 'monitoring', 'advanced'),
      tech('networking', 'Networking', '🌐', 'fundamentals', 'intermediate'),
    ],
    milestones: [
      {
        id: 'sre-fundamentals',
        name: 'SRE Fundamentals',
        description: 'Complete scripting, containers, and monitoring basics',
        icon: '📜',
        requiredTechnologies: ['bash', 'docker', 'prometheus'],
        rewards: { xpBonus: 750, goldBonus: 300 },
      },
      {
        id: 'incident-master',
        name: 'Incident Master',
        description: 'Master observability and on-call practices',
        icon: '🚨',
        requiredTechnologies: ['observability', 'prometheus', 'networking'],
        rewards: { xpBonus: 1500, goldBonus: 750 },
      },
    ],
  },
  {
    id: 'cloud-architect',
    name: 'Cloud Architect',
    icon: '🏗️',
    description:
      'Design scalable, reliable cloud infrastructure. Make architectural decisions and optimize for cost and performance.',
    averageSalary: '$150,000 - $220,000',
    demandLevel: 'medium',
    estimatedMonths: 10,
    prerequisites: ['Networking knowledge', 'Linux basics', 'Security fundamentals'],
    technologies: [
      tech('aws', 'AWS', '☁️', 'cloud', 'intermediate'),
      tech('terraform', 'Terraform', '🏗️', 'infrastructure', 'intermediate'),
      tech('docker', 'Docker', '🐳', 'containers', 'intermediate'),
      tech('kubernetes', 'Kubernetes', '☸️', 'orchestration', 'advanced'),
      tech('networking', 'Networking', '🌐', 'fundamentals', 'advanced'),
      tech('security', 'Security', '🔒', 'security', 'advanced'),
    ],
    milestones: [
      {
        id: 'cloud-associate',
        name: 'Cloud Associate',
        description: 'Complete AWS fundamentals and infrastructure as code',
        icon: '☁️',
        requiredTechnologies: ['aws', 'terraform', 'networking'],
        rewards: { xpBonus: 1000, goldBonus: 500 },
      },
    ],
  },
  {
    id: 'platform-engineer',
    name: 'Platform Engineer',
    icon: '🔧',
    description:
      'Build internal developer platforms and self-service tools. Enable developers to ship faster with golden paths.',
    averageSalary: '$140,000 - $190,000',
    demandLevel: 'growing',
    estimatedMonths: 7,
    prerequisites: ['Software development basics', 'Git', 'Linux'],
    technologies: [
      tech('git', 'Git', '🌿', 'version-control', 'beginner'),
      tech('docker', 'Docker', '🐳', 'containers', 'intermediate'),
      tech('kubernetes', 'Kubernetes', '☸️', 'orchestration', 'advanced'),
      tech('cicd', 'CI/CD', '🔄', 'infrastructure', 'intermediate'),
      tech('terraform', 'Terraform', '🏗️', 'infrastructure', 'advanced'),
      tech('ansible', 'Ansible', '⚙️', 'infrastructure', 'advanced'),
    ],
    milestones: [
      {
        id: 'platform-basics',
        name: 'Platform Basics',
        description: 'Master container fundamentals and Kubernetes',
        icon: '📜',
        requiredTechnologies: ['docker', 'kubernetes', 'cicd'],
        rewards: { xpBonus: 800, goldBonus: 400 },
      },
    ],
  },
  {
    id: 'ai-engineer',
    name: 'AI Engineer',
    icon: '🤖',
    description:
      'Build and deploy machine learning models, create AI-powered applications, and work with LLMs and generative AI systems.',
    averageSalary: '$140,000 - $220,000',
    demandLevel: 'high',
    estimatedMonths: 9,
    prerequisites: ['Python programming', 'Basic mathematics', 'Machine learning fundamentals'],
    technologies: [
      tech('python', 'Python', '🐍', 'fundamentals', 'beginner'),
      tech('sql', 'SQL', '🗄️', 'fundamentals', 'beginner'),
      tech('machine_learning', 'Machine Learning', '🧠', 'fundamentals', 'intermediate'),
      tech('mongodb', 'MongoDB', '🍃', 'fundamentals', 'intermediate'),
      tech('api_design', 'API Design', '🔌', 'fundamentals', 'advanced'),
    ],
    milestones: [
      {
        id: 'ai-associate',
        name: 'AI Associate',
        description: 'Complete Python, SQL, and ML fundamentals',
        icon: '📜',
        requiredTechnologies: ['python', 'sql', 'machine_learning'],
        rewards: { xpBonus: 800, goldBonus: 400 },
      },
      {
        id: 'ml-engineer',
        name: 'ML Engineer',
        description: 'Master the ML curriculum and serve models behind APIs',
        icon: '🚀',
        requiredTechnologies: ['mongodb', 'api_design'],
        rewards: { xpBonus: 1500, goldBonus: 750 },
      },
    ],
  },
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    icon: '💻',
    description:
      'Design, develop, and maintain software applications. Master full-stack development and software architecture principles.',
    averageSalary: '$100,000 - $180,000',
    demandLevel: 'high',
    estimatedMonths: 8,
    prerequisites: ['Basic programming concepts', 'Problem solving'],
    technologies: [
      tech('html', 'HTML', '📄', 'fundamentals', 'beginner'),
      tech('css', 'CSS', '🎨', 'fundamentals', 'beginner'),
      tech('javascript', 'JavaScript', '⚡', 'fundamentals', 'intermediate'),
      tech('react', 'React', '⚛️', 'fundamentals', 'intermediate'),
      tech('nodejs', 'Node.js', '🟢', 'fundamentals', 'intermediate'),
      tech('git', 'Git', '🌿', 'version-control', 'beginner'),
      tech('sql', 'SQL', '🗄️', 'fundamentals', 'intermediate'),
      tech('api_design', 'API Design', '🔌', 'fundamentals', 'advanced'),
    ],
    milestones: [
      {
        id: 'frontend-dev',
        name: 'Frontend Developer',
        description: 'Complete HTML, CSS, JavaScript and React',
        icon: '🎨',
        requiredTechnologies: ['html', 'css', 'javascript', 'react'],
        rewards: { xpBonus: 700, goldBonus: 350 },
      },
      {
        id: 'fullstack-dev',
        name: 'Full Stack Developer',
        description: 'Master backend with Node.js and API design',
        icon: '🚀',
        requiredTechnologies: ['nodejs', 'sql', 'api_design'],
        rewards: { xpBonus: 1200, goldBonus: 600 },
      },
    ],
  },
  {
    id: 'ai-architect',
    name: 'AI Architect',
    icon: '🏛️',
    description:
      'Design enterprise AI systems and infrastructure. Make architectural decisions for scalable ML platforms and AI-powered products.',
    averageSalary: '$180,000 - $280,000',
    demandLevel: 'medium',
    estimatedMonths: 12,
    prerequisites: [
      'Software architecture',
      'Machine learning',
      'System design',
      'Cloud platforms',
    ],
    technologies: [
      tech('python', 'Python', '🐍', 'fundamentals', 'intermediate'),
      tech('machine_learning', 'Machine Learning', '🧠', 'fundamentals', 'advanced'),
      tech('kubernetes', 'Kubernetes', '☸️', 'orchestration', 'advanced'),
      tech('aws', 'AWS', '☁️', 'cloud', 'advanced'),
      tech('kafka', 'Apache Kafka', '📨', 'infrastructure', 'advanced'),
      tech('mongodb', 'MongoDB', '🍃', 'fundamentals', 'advanced'),
    ],
    milestones: [
      {
        id: 'ai-platform-lead',
        name: 'AI Platform Lead',
        description: 'Design and build scalable ML infrastructure',
        icon: '🏗️',
        requiredTechnologies: ['kubernetes', 'aws', 'kafka'],
        rewards: { xpBonus: 2000, goldBonus: 1000 },
      },
      {
        id: 'ai-architect-master',
        name: 'AI Architect Master',
        description: 'Master the ML curriculum and event streaming',
        icon: '👑',
        requiredTechnologies: ['machine_learning', 'mongodb'],
        rewards: { xpBonus: 3000, goldBonus: 1500 },
      },
    ],
  },
  // IT Support Track
  {
    id: 'it-support',
    name: 'IT Support Specialist',
    icon: '🎧',
    description:
      'Start your tech career providing technical support, troubleshooting systems, and helping users resolve their technology challenges.',
    averageSalary: '$45,000 - $75,000',
    demandLevel: 'medium',
    estimatedMonths: 4,
    prerequisites: ['Basic computer skills', 'Problem-solving mindset', 'Communication skills'],
    technologies: [
      tech('networking', 'Networking Basics', '🌐', 'fundamentals', 'beginner'),
      tech('security', 'Security Basics', '🔒', 'security', 'beginner'),
      tech('bash', 'Basic Scripting', '📟', 'fundamentals', 'beginner'),
      tech('sql', 'Data Basics', '🗄️', 'fundamentals', 'intermediate'),
    ],
    milestones: [
      {
        id: 'helpdesk-hero',
        name: 'Helpdesk Hero',
        description: 'Complete networking and security fundamentals',
        icon: '🎧',
        requiredTechnologies: ['networking', 'security'],
        rewards: { xpBonus: 400, goldBonus: 150 },
      },
      {
        id: 'support-pro',
        name: 'Support Professional',
        description: 'Master scripting and data basics',
        icon: '⭐',
        requiredTechnologies: ['bash', 'sql'],
        rewards: { xpBonus: 600, goldBonus: 250 },
      },
    ],
  },
  // Security Track
  {
    id: 'security-engineer',
    name: 'Security Engineer',
    icon: '🔐',
    description:
      'Protect systems and data from cyber threats. Master vulnerability assessment, security automation, and incident response.',
    averageSalary: '$110,000 - $170,000',
    demandLevel: 'high',
    estimatedMonths: 8,
    prerequisites: ['Networking knowledge', 'Linux basics', 'Security fundamentals'],
    technologies: [
      tech('security', 'Security Fundamentals', '🔒', 'security', 'beginner'),
      tech('networking', 'Networking', '🌐', 'fundamentals', 'intermediate'),
      tech('bash', 'Bash Scripting', '📟', 'fundamentals', 'intermediate'),
      tech('python', 'Python', '🐍', 'fundamentals', 'intermediate'),
      tech('aws', 'AWS Security', '☁️', 'cloud', 'advanced'),
      tech('docker', 'Container Security', '🐳', 'security', 'advanced'),
    ],
    milestones: [
      {
        id: 'security-analyst',
        name: 'Security Analyst',
        description: 'Complete security fundamentals and networking',
        icon: '🔍',
        requiredTechnologies: ['security', 'networking'],
        rewards: { xpBonus: 700, goldBonus: 300 },
      },
      {
        id: 'security-specialist',
        name: 'Security Specialist',
        description: 'Master Python, AWS security, and container security',
        icon: '🛡️',
        requiredTechnologies: ['python', 'aws', 'docker'],
        rewards: { xpBonus: 1200, goldBonus: 600 },
      },
    ],
  },
  // Management Track
  {
    id: 'tech-lead',
    name: 'Tech Lead / Manager',
    icon: '👔',
    description:
      'Lead engineering teams, make technical decisions, and grow into management roles while staying connected to technology.',
    averageSalary: '$130,000 - $220,000',
    demandLevel: 'medium',
    estimatedMonths: 10,
    prerequisites: ['Software development experience', 'Leadership skills', 'Technical depth'],
    technologies: [
      tech('git', 'Git', '🌿', 'version-control', 'intermediate'),
      tech('docker', 'Docker', '🐳', 'containers', 'intermediate'),
      tech('kubernetes', 'Kubernetes', '☸️', 'orchestration', 'intermediate'),
      tech('aws', 'AWS', '☁️', 'cloud', 'intermediate'),
      tech('cicd', 'CI/CD', '🔄', 'infrastructure', 'intermediate'),
      tech('api_design', 'API Design', '🔌', 'infrastructure', 'advanced'),
    ],
    milestones: [
      {
        id: 'tech-lead',
        name: 'Tech Lead',
        description: 'Master Docker, Kubernetes, and AWS foundations',
        icon: '👔',
        requiredTechnologies: ['docker', 'kubernetes', 'aws'],
        rewards: { xpBonus: 900, goldBonus: 450 },
      },
      {
        id: 'engineering-manager',
        name: 'Engineering Manager',
        description: 'Complete CI/CD and API architecture',
        icon: '🎯',
        requiredTechnologies: ['cicd', 'api_design'],
        rewards: { xpBonus: 1500, goldBonus: 750 },
      },
    ],
  },
]

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

export const DIFFICULTY_CONFIG: Record<
  CareerTechnology['difficulty'],
  { label: string; color: string }
> = {
  beginner: { label: '🌱 Beginner', color: '#10b981' },
  intermediate: { label: '⚡ Intermediate', color: '#f59e0b' },
  advanced: { label: '🔥 Advanced', color: '#ef4444' },
}
