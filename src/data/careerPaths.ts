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

// Import quests for technology completion calculation
import { allQuests } from './quests'

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
  {
    id: 'ai-engineer',
    name: 'AI Engineer',
    icon: '🤖',
    description: 'Build and deploy machine learning models, create AI-powered applications, and work with LLMs and generative AI systems.',
    averageSalary: '$140,000 - $220,000',
    demandLevel: 'high',
    estimatedMonths: 9,
    prerequisites: ['Python programming', 'Basic mathematics', 'Machine learning fundamentals'],
    technologies: [
      { id: 'python', name: 'Python', icon: '🐍', category: 'fundamentals', difficulty: 'beginner', questIds: [] },
      { id: 'sql', name: 'SQL', icon: '🗄️', category: 'fundamentals', difficulty: 'beginner', questIds: [] },
      { id: 'ml', name: 'Machine Learning', icon: '🧠', category: 'fundamentals', difficulty: 'intermediate', questIds: [] },
      { id: 'tensorflow', name: 'TensorFlow', icon: '📊', category: 'fundamentals', difficulty: 'advanced', questIds: [] },
      { id: 'pytorch', name: 'PyTorch', icon: '🔥', category: 'fundamentals', difficulty: 'advanced', questIds: [] },
      { id: 'llm', name: 'LLM & GenAI', icon: '✨', category: 'fundamentals', difficulty: 'advanced', questIds: [] },
      { id: 'vector_db', name: 'Vector Databases', icon: '🔢', category: 'fundamentals', difficulty: 'advanced', questIds: [] },
      { id: 'mlops', name: 'MLOps', icon: '🔄', category: 'monitoring', difficulty: 'advanced', questIds: [] },
    ],
    milestones: [
      {
        id: 'ai-associate',
        name: 'AI Associate',
        description: 'Complete Python, SQL, and ML fundamentals',
        icon: '📜',
        requiredTechnologies: ['python', 'sql', 'ml'],
        rewards: { xpBonus: 800, goldBonus: 400, badgeId: 'ai_associate' },
      },
      {
        id: 'ml-engineer',
        name: 'ML Engineer',
        description: 'Master TensorFlow/PyTorch and deploy first model',
        icon: '🚀',
        requiredTechnologies: ['tensorflow', 'pytorch', 'mlops'],
        rewards: { xpBonus: 1500, goldBonus: 750, badgeId: 'ml_engineer' },
      },
    ],
  },
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    icon: '💻',
    description: 'Design, develop, and maintain software applications. Master full-stack development and software architecture principles.',
    averageSalary: '$100,000 - $180,000',
    demandLevel: 'high',
    estimatedMonths: 8,
    prerequisites: ['Basic programming concepts', 'Problem solving'],
    technologies: [
      { id: 'html', name: 'HTML', icon: '📄', category: 'fundamentals', difficulty: 'beginner', questIds: [] },
      { id: 'css', name: 'CSS', icon: '🎨', category: 'fundamentals', difficulty: 'beginner', questIds: [] },
      { id: 'javascript', name: 'JavaScript', icon: '⚡', category: 'fundamentals', difficulty: 'intermediate', questIds: [] },
      { id: 'react', name: 'React', icon: '⚛️', category: 'fundamentals', difficulty: 'intermediate', questIds: [] },
      { id: 'nodejs', name: 'Node.js', icon: '🟢', category: 'fundamentals', difficulty: 'intermediate', questIds: [] },
      { id: 'git', name: 'Git', icon: '🌿', category: 'version-control', difficulty: 'beginner', questIds: [] },
      { id: 'sql', name: 'SQL', icon: '🗄️', category: 'fundamentals', difficulty: 'intermediate', questIds: [] },
      { id: 'api_design', name: 'API Design', icon: '🔌', category: 'fundamentals', difficulty: 'advanced', questIds: [] },
    ],
    milestones: [
      {
        id: 'frontend-dev',
        name: 'Frontend Developer',
        description: 'Complete HTML, CSS, JavaScript and React',
        icon: '🎨',
        requiredTechnologies: ['html', 'css', 'javascript', 'react'],
        rewards: { xpBonus: 700, goldBonus: 350, badgeId: 'frontend_dev' },
      },
      {
        id: 'fullstack-dev',
        name: 'Full Stack Developer',
        description: 'Master backend with Node.js and API design',
        icon: '🚀',
        requiredTechnologies: ['nodejs', 'sql', 'api_design'],
        rewards: { xpBonus: 1200, goldBonus: 600, badgeId: 'fullstack_dev' },
      },
    ],
  },
  {
    id: 'ai-architect',
    name: 'AI Architect',
    icon: '🏛️',
    description: 'Design enterprise AI systems and infrastructure. Make architectural decisions for scalable ML platforms and AI-powered products.',
    averageSalary: '$180,000 - $280,000',
    demandLevel: 'medium',
    estimatedMonths: 12,
    prerequisites: ['Software architecture', 'Machine learning', 'System design', 'Cloud platforms'],
    technologies: [
      { id: 'python', name: 'Python', icon: '🐍', category: 'fundamentals', difficulty: 'intermediate', questIds: [] },
      { id: 'ml', name: 'Machine Learning', icon: '🧠', category: 'fundamentals', difficulty: 'advanced', questIds: [] },
      { id: 'llm', name: 'LLM & GenAI', icon: '✨', category: 'fundamentals', difficulty: 'advanced', questIds: [] },
      { id: 'kubernetes', name: 'Kubernetes', icon: '☸️', category: 'orchestration', difficulty: 'advanced', questIds: [] },
      { id: 'aws', name: 'AWS', icon: '☁️', category: 'cloud', difficulty: 'advanced', questIds: [] },
      { id: 'mlops', name: 'MLOps', icon: '🔄', category: 'monitoring', difficulty: 'advanced', questIds: [] },
      { id: 'vector_db', name: 'Vector Databases', icon: '🔢', category: 'fundamentals', difficulty: 'advanced', questIds: [] },
      { id: 'kafka', name: 'Apache Kafka', icon: '📨', category: 'infrastructure', difficulty: 'advanced', questIds: [] },
    ],
    milestones: [
      {
        id: 'ai-platform-lead',
        name: 'AI Platform Lead',
        description: 'Design and build scalable ML infrastructure',
        icon: '🏗️',
        requiredTechnologies: ['kubernetes', 'aws', 'mlops'],
        rewards: { xpBonus: 2000, goldBonus: 1000, badgeId: 'ai_platform_lead' },
      },
      {
        id: 'ai-architect-master',
        name: 'AI Architect Master',
        description: 'Master LLM systems, vector databases, and event streaming',
        icon: '👑',
        requiredTechnologies: ['llm', 'vector_db', 'kafka'],
        rewards: { xpBonus: 3000, goldBonus: 1500, badgeId: 'ai_architect_master' },
      },
    ],
  },
  // IT Support Track
  {
    id: 'it-support',
    name: 'IT Support Specialist',
    icon: '🎧',
    description: 'Start your tech career providing technical support, troubleshooting systems, and helping users resolve their technology challenges.',
    averageSalary: '$45,000 - $75,000',
    demandLevel: 'medium',
    estimatedMonths: 4,
    prerequisites: ['Basic computer skills', 'Problem-solving mindset', 'Communication skills'],
    technologies: [
      { id: 'hardware', name: 'Hardware Fundamentals', icon: '🖥️', category: 'fundamentals', difficulty: 'beginner', questIds: [] },
      { id: 'networking', name: 'Networking Basics', icon: '🌐', category: 'fundamentals', difficulty: 'beginner', questIds: [] },
      { id: 'os', name: 'Operating Systems', icon: '💿', category: 'fundamentals', difficulty: 'beginner', questIds: [] },
      { id: 'security', name: 'Security Basics', icon: '🔒', category: 'security', difficulty: 'beginner', questIds: [] },
      { id: 'troubleshooting', name: 'IT Troubleshooting', icon: '🔧', category: 'fundamentals', difficulty: 'beginner', questIds: [] },
      { id: 'scripting', name: 'Basic Scripting', icon: '📟', category: 'fundamentals', difficulty: 'intermediate', questIds: [] },
    ],
    milestones: [
      {
        id: 'helpdesk-hero',
        name: 'Helpdesk Hero',
        description: 'Complete hardware, OS, and networking fundamentals',
        icon: '🎧',
        requiredTechnologies: ['hardware', 'os', 'networking'],
        rewards: { xpBonus: 400, goldBonus: 150, badgeId: 'helpdesk_hero' },
      },
      {
        id: 'support-pro',
        name: 'Support Professional',
        description: 'Master troubleshooting and security basics',
        icon: '⭐',
        requiredTechnologies: ['troubleshooting', 'security', 'scripting'],
        rewards: { xpBonus: 600, goldBonus: 250, badgeId: 'support_pro' },
      },
    ],
  },
  // Security Track
  {
    id: 'security-engineer',
    name: 'Security Engineer',
    icon: '🔐',
    description: 'Protect systems and data from cyber threats. Master vulnerability assessment, security automation, and incident response.',
    averageSalary: '$110,000 - $170,000',
    demandLevel: 'high',
    estimatedMonths: 8,
    prerequisites: ['Networking knowledge', 'Linux basics', 'Security fundamentals'],
    technologies: [
      { id: 'security', name: 'Security Fundamentals', icon: '🔒', category: 'security', difficulty: 'beginner', questIds: [] },
      { id: 'networking', name: 'Networking', icon: '🌐', category: 'fundamentals', difficulty: 'intermediate', questIds: [] },
      { id: 'linux', name: 'Linux', icon: '🐧', category: 'fundamentals', difficulty: 'intermediate', questIds: [] },
      { id: 'python', name: 'Python', icon: '🐍', category: 'fundamentals', difficulty: 'intermediate', questIds: [] },
      { id: 'aws', name: 'AWS Security', icon: '☁️', category: 'cloud', difficulty: 'advanced', questIds: [] },
      { id: 'containersecurity', name: 'Container Security', icon: '🐳', category: 'security', difficulty: 'advanced', questIds: [] },
      { id: 'threatmodeling', name: 'Threat Modeling', icon: '🎯', category: 'security', difficulty: 'advanced', questIds: [] },
      { id: 'incident', name: 'Incident Response', icon: '🚨', category: 'monitoring', difficulty: 'advanced', questIds: [] },
    ],
    milestones: [
      {
        id: 'security-analyst',
        name: 'Security Analyst',
        description: 'Complete security fundamentals and networking',
        icon: '🔍',
        requiredTechnologies: ['security', 'networking', 'linux'],
        rewards: { xpBonus: 700, goldBonus: 300, badgeId: 'security_analyst' },
      },
      {
        id: 'security-specialist',
        name: 'Security Specialist',
        description: 'Master Python, AWS security, and container security',
        icon: '🛡️',
        requiredTechnologies: ['python', 'aws', 'containersecurity'],
        rewards: { xpBonus: 1200, goldBonus: 600, badgeId: 'security_specialist' },
      },
    ],
  },
  // Management Track
  {
    id: 'tech-lead',
    name: 'Tech Lead / Manager',
    icon: '👔',
    description: 'Lead engineering teams, make technical decisions, and grow into management roles while staying connected to technology.',
    averageSalary: '$130,000 - $220,000',
    demandLevel: 'medium',
    estimatedMonths: 10,
    prerequisites: ['Software development experience', 'Leadership skills', 'Technical depth'],
    technologies: [
      { id: 'git', name: 'Git', icon: '🌿', category: 'version-control', difficulty: 'intermediate', questIds: [] },
      { id: 'docker', name: 'Docker', icon: '🐳', category: 'containers', difficulty: 'intermediate', questIds: [] },
      { id: 'kubernetes', name: 'Kubernetes', icon: '☸️', category: 'orchestration', difficulty: 'intermediate', questIds: [] },
      { id: 'aws', name: 'AWS', icon: '☁️', category: 'cloud', difficulty: 'intermediate', questIds: [] },
      { id: 'agile', name: 'Agile/Scrum', icon: '📋', category: 'infrastructure', difficulty: 'intermediate', questIds: [] },
      { id: 'leadership', name: 'Engineering Leadership', icon: '👥', category: 'infrastructure', difficulty: 'advanced', questIds: [] },
      { id: 'architecture', name: 'System Architecture', icon: '🏗️', category: 'infrastructure', difficulty: 'advanced', questIds: [] },
      { id: 'communication', name: 'Technical Communication', icon: '💬', category: 'infrastructure', difficulty: 'advanced', questIds: [] },
    ],
    milestones: [
      {
        id: 'tech-lead',
        name: 'Tech Lead',
        description: 'Master Docker, Kubernetes, and AWS foundations',
        icon: '👔',
        requiredTechnologies: ['docker', 'kubernetes', 'aws'],
        rewards: { xpBonus: 900, goldBonus: 450, badgeId: 'tech_lead' },
      },
      {
        id: 'engineering-manager',
        name: 'Engineering Manager',
        description: 'Complete Agile, leadership, and architecture',
        icon: '🎯',
        requiredTechnologies: ['agile', 'leadership', 'architecture'],
        rewards: { xpBonus: 1500, goldBonus: 750, badgeId: 'eng_manager' },
      },
    ],
  },
]

export function getTechnologyCompletion(techId: string, completedQuestIds: Set<string>): number {
  // Find all quests for this technology
  const techQuests = allQuests.filter((q) =>
    q.technologyId.toLowerCase() === techId.toLowerCase() ||
    q.topicId.toLowerCase().includes(techId.toLowerCase())
  )

  if (techQuests.length === 0) {
    return 0
  }

  // Count completed quests for this technology
  const completedForTech = techQuests.filter((q) => completedQuestIds.has(q.id)).length

  // Return percentage completion
  return Math.round((completedForTech / techQuests.length) * 100)
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
