export interface StoryArc {
  id: string
  title: string
  subtitle: string
  icon: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  episodes: StoryEpisode[]
  rewards: {
    xpBonus: number
    goldBonus: number
    badgeId?: string
  }
}

export interface StoryEpisode {
  id: string
  title: string
  description: string
  questIds: string[]
  unlocksAt: number // Episode number that unlocks this
  prerequisite?: string // Other arc id needed
}

export const STORY_ARCS: StoryArc[] = [
  {
    id: 'migration-chronicles',
    title: 'The Migration Chronicles',
    subtitle: 'A Tale of Two Data Centers',
    icon: '🏰',
    description: 'The old data center is being deprecated. You\'ve been tasked with migrating critical services to the cloud. Follow the journey from planning to production.',
    difficulty: 'intermediate',
    estimatedTime: '2-3 hours',
    episodes: [
      {
        id: 'migration-1',
        title: 'Chapter 1: The Inheritance',
        description: 'You\'ve just taken over the legacy data center. First, you need to understand what you\'ve inherited.',
        questIds: ['audit-server', 'document-services', 'map-dependencies'],
        unlocksAt: 1,
      },
      {
        id: 'migration-2',
        title: 'Chapter 2: The Plan',
        description: 'With the inventory complete, it\'s time to plan the migration strategy.',
        questIds: ['assess-workloads', 'choose-strategy', 'design-architecture'],
        unlocksAt: 2,
      },
      {
        id: 'migration-3',
        title: 'Chapter 3: The First Steps',
        description: 'Begin the migration with the least critical services to test the waters.',
        questIds: ['setup-environment', 'containerize-app', 'configure-networking'],
        unlocksAt: 3,
      },
      {
        id: 'migration-4',
        title: 'Chapter 4: The Hurdles',
        description: 'Unexpected challenges arise. Data sync issues and configuration conflicts threaten the timeline.',
        questIds: ['resolve-sync', 'fix-configs', 'optimize-performance'],
        unlocksAt: 4,
      },
      {
        id: 'migration-5',
        title: 'Chapter 5: The Cutover',
        description: 'The moment of truth. Switch traffic to the new infrastructure.',
        questIds: ['blue-green-deploy', 'validate-traffic', 'decommission-old'],
        unlocksAt: 5,
      },
    ],
    rewards: {
      xpBonus: 2500,
      goldBonus: 1000,
      badgeId: 'migration_master',
    },
  },
  {
    id: 'security-breach',
    title: 'Operation: Zero Trust',
    subtitle: 'When the Walls Come Down',
    icon: '🛡️',
    description: 'A security audit has revealed vulnerabilities. Work through the incident response and security hardening journey.',
    difficulty: 'advanced',
    estimatedTime: '3-4 hours',
    episodes: [
      {
        id: 'security-1',
        title: 'Part 1: The Alert',
        description: 'An unusual spike in network traffic triggers an investigation.',
        questIds: ['analyze-logs', 'identify-threat', 'contain-breach'],
        unlocksAt: 1,
      },
      {
        id: 'security-2',
        title: 'Part 2: The Forensics',
        description: 'Dig deep into what happened and how the attackers gained access.',
        questIds: ['trace-vectors', 'analyze-malware', 'document-timeline'],
        unlocksAt: 2,
      },
      {
        id: 'security-3',
        title: 'Part 3: The Recovery',
        description: 'Restore systems to a secure state and verify integrity.',
        questIds: ['reset-credentials', 'patch-vulnerabilities', 'verify-backups'],
        unlocksAt: 3,
      },
      {
        id: 'security-4',
        title: 'Part 4: The Hardening',
        description: 'Implement security best practices to prevent future incidents.',
        questIds: ['implement-mfa', 'setup-monitoring', 'configure-firewall'],
        unlocksAt: 4,
      },
      {
        id: 'security-5',
        title: 'Part 5: The New Fortress',
        description: 'Deploy a comprehensive zero-trust architecture.',
        questIds: ['deploy-vault', 'implement-spi', 'automate-alerts'],
        unlocksAt: 5,
      },
      {
        id: 'security-6',
        title: 'Epilogue: The Audit',
        description: 'Pass a security audit and prove the infrastructure is secure.',
        questIds: ['security-scan', 'penetration-test', 'certify-compliance'],
        unlocksAt: 6,
      },
    ],
    rewards: {
      xpBonus: 4000,
      goldBonus: 1500,
      badgeId: 'security_champion',
    },
  },
  {
    id: 'automation-frontier',
    title: 'The Automation Frontier',
    subtitle: 'Rise of the Machines',
    icon: '🤖',
    description: 'Manual processes are slowing everyone down. Embark on a journey to automate all the things.',
    difficulty: 'beginner',
    estimatedTime: '1-2 hours',
    episodes: [
      {
        id: 'automation-1',
        title: 'Episode 1: The Tedious Task',
        description: 'Start by identifying the most repetitive manual tasks.',
        questIds: ['identify-tasks', 'measure-time', 'prioritize-automation'],
        unlocksAt: 1,
      },
      {
        id: 'automation-2',
        title: 'Episode 2: First Script',
        description: 'Write your first automation script to handle a simple task.',
        questIds: ['write-script', 'add-logging', 'test-thoroughly'],
        unlocksAt: 2,
      },
      {
        id: 'automation-3',
        title: 'Episode 3: The Pipeline',
        description: 'Create a CI/CD pipeline to automate builds and deployments.',
        questIds: ['setup-pipeline', 'add-tests', 'configure-triggers'],
        unlocksAt: 3,
      },
      {
        id: 'automation-4',
        title: 'Episode 4: Infrastructure as Code',
        description: 'Define your infrastructure in code for reproducibility.',
        questIds: ['write-terraform', 'create-modules', 'setup-state'],
        unlocksAt: 4,
      },
      {
        id: 'automation-5',
        title: 'Episode 5: The Self-Healing System',
        description: 'Implement auto-remediation for common failure scenarios.',
        questIds: ['setup-watchdog', 'implement-rollback', 'automate-response'],
        unlocksAt: 5,
      },
    ],
    rewards: {
      xpBonus: 2000,
      goldBonus: 800,
      badgeId: 'automation_pioneer',
    },
  },
  {
    id: 'chaos-engineering',
    title: 'Chaos Engineering',
    subtitle: 'Breaking Things on Purpose',
    icon: '💥',
    description: 'Learn to embrace failure by intentionally introducing chaos to test system resilience.',
    difficulty: 'advanced',
    estimatedTime: '2-3 hours',
    episodes: [
      {
        id: 'chaos-1',
        title: 'Act 1: The Philosophy',
        description: 'Understand the principles of chaos engineering and why it matters.',
        questIds: ['study-principles', 'define-metrics', 'identify-experiments'],
        unlocksAt: 1,
      },
      {
        id: 'chaos-2',
        title: 'Act 2: The First Blast',
        description: 'Conduct your first controlled chaos experiment.',
        questIds: ['setup-tooling', 'define-hypothesis', 'inject-failure'],
        unlocksAt: 2,
      },
      {
        id: 'chaos-3',
        title: 'Act 3: The Aftermath',
        description: 'Analyze results and improve system based on findings.',
        questIds: ['analyze-results', 'implement-improvements', 'document-findings'],
        unlocksAt: 3,
      },
      {
        id: 'chaos-4',
        title: 'Act 4: Game Days',
        description: 'Run game day exercises with your team.',
        questIds: ['plan-game-day', 'prepare-scenarios', 'execute-drill'],
        unlocksAt: 4,
      },
    ],
    rewards: {
      xpBonus: 3000,
      goldBonus: 1200,
      badgeId: 'chaos_master',
    },
  },
  {
    id: 'observability-journey',
    title: 'The Observability Journey',
    subtitle: 'See Everything, Understand Anything',
    icon: '🔭',
    description: 'You can\'t fix what you can\'t see. Build a comprehensive observability stack from scratch.',
    difficulty: 'intermediate',
    estimatedTime: '2 hours',
    episodes: [
      {
        id: 'observe-1',
        title: 'Chapter 1: The Black Box',
        description: 'Start with basic logging to understand system behavior.',
        questIds: ['centralize-logs', 'structure-logging', 'setup-alerts'],
        unlocksAt: 1,
      },
      {
        id: 'observe-2',
        title: 'Chapter 2: The Pulse',
        description: 'Add metrics to understand system health over time.',
        questIds: ['expose-metrics', 'setup-prometheus', 'create-dashboards'],
        unlocksAt: 2,
      },
      {
        id: 'observe-3',
        title: 'Chapter 3: The Trace',
        description: 'Implement distributed tracing to follow requests through the system.',
        questIds: ['instrument-services', 'setup-jaeger', 'analyze-traces'],
        unlocksAt: 3,
      },
      {
        id: 'observe-4',
        title: 'Chapter 4: The Dashboard',
        description: 'Build comprehensive dashboards for different stakeholders.',
        questIds: ['build-slo-dashboard', 'create-runbook', 'setup-oncall'],
        unlocksAt: 4,
      },
      {
        id: 'observe-5',
        title: 'Chapter 5: The Future',
        description: 'Implement advanced observability patterns and AI-powered insights.',
        questIds: ['setup-apm', 'implement-slo', 'automate-insights'],
        unlocksAt: 5,
      },
    ],
    rewards: {
      xpBonus: 2500,
      goldBonus: 1000,
      badgeId: 'observability_expert',
    },
  },
]

export const DIFFICULTY_CONFIG = {
  beginner: { label: '🌱 Beginner', color: '#10b981', bg: 'bg-green-900/30' },
  intermediate: { label: '⚡ Intermediate', color: '#f59e0b', bg: 'bg-amber-900/30' },
  advanced: { label: '🔥 Advanced', color: '#ef4444', bg: 'bg-red-900/30' },
}
