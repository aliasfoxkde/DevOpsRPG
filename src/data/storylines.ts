import { allQuests } from './quests'

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

// Story episodes reference real generated quest ids (`quest_<topicId>`), so
// progress on this page is driven by the same quest journal as everything
// else. The helper below guards the mapping: if a topic id ever changes, this
// fails loudly at import time instead of silently dangling.
function questIdsFor(topicIds: string[]): string[] {
  return topicIds.map((topicId) => {
    const quest = allQuests.find((q) => q.topicId === topicId)
    if (!quest) {
      throw new Error(`storylines: no quest for topic "${topicId}"`)
    }
    return quest.id
  })
}

export const STORY_ARCS: StoryArc[] = [
  {
    id: 'migration-chronicles',
    title: 'The Migration Chronicles',
    subtitle: 'A Tale of Two Data Centers',
    icon: '🏰',
    description:
      "The old data center is being deprecated. You've been tasked with migrating critical services to the cloud. Follow the journey from planning to production.",
    difficulty: 'intermediate',
    estimatedTime: '2-3 hours',
    episodes: [
      {
        id: 'migration-1',
        title: 'Chapter 1: The Inheritance',
        description:
          "You've just taken over the legacy data center. First, you need to understand the network you've inherited.",
        questIds: questIdsFor(['net_intro', 'net_tcpip', 'net_dns']),
        unlocksAt: 1,
      },
      {
        id: 'migration-2',
        title: 'Chapter 2: The Plan',
        description:
          "With the inventory complete, it's time to plan the landing zone in the cloud.",
        questIds: questIdsFor(['aws_intro', 'aws_getstarted', 'aws_rds']),
        unlocksAt: 2,
      },
      {
        id: 'migration-3',
        title: 'Chapter 3: The First Steps',
        description:
          'Begin the migration by containerizing the least critical services to test the waters.',
        questIds: questIdsFor(['docker_intro', 'docker_getstarted', 'docker_dockerfile']),
        unlocksAt: 3,
      },
      {
        id: 'migration-4',
        title: 'Chapter 4: The Hurdles',
        description:
          'Unexpected challenges arise. The containers need orchestration before they can run in production.',
        questIds: questIdsFor(['k8s_intro', 'k8s_pods', 'k8s_services']),
        unlocksAt: 4,
      },
      {
        id: 'migration-5',
        title: 'Chapter 5: The Cutover',
        description:
          'The moment of truth. Wire up the deployment pipeline and switch traffic to the new infrastructure.',
        questIds: questIdsFor(['cicd_pipeline', 'net_loadbalancers', 'tf_resources']),
        unlocksAt: 5,
      },
    ],
    rewards: {
      xpBonus: 2500,
      goldBonus: 1000,
      badgeId: 'cloud_complete',
    },
  },
  {
    id: 'security-breach',
    title: 'Operation: Zero Trust',
    subtitle: 'When the Walls Come Down',
    icon: '🛡️',
    description:
      'A security audit has revealed vulnerabilities. Work through the incident response and security hardening journey.',
    difficulty: 'advanced',
    estimatedTime: '3-4 hours',
    episodes: [
      {
        id: 'security-1',
        title: 'Part 1: The Alert',
        description: 'An unusual spike in network traffic triggers an investigation.',
        questIds: questIdsFor(['net_http', 'prom_intro', 'prom_alerts']),
        unlocksAt: 1,
      },
      {
        id: 'security-2',
        title: 'Part 2: The Forensics',
        description: 'Dig through logs and traces to see how the attackers moved.',
        questIds: questIdsFor(['obs_loki', 'obs_tracing', 'prom_metrics']),
        unlocksAt: 2,
      },
      {
        id: 'security-3',
        title: 'Part 3: The Recovery',
        description: 'Rotate the exposed secrets and restore systems to a known-good state.',
        questIds: questIdsFor(['sec_secrets', 'sec_best_practices', 'aws_rds']),
        unlocksAt: 3,
      },
      {
        id: 'security-4',
        title: 'Part 4: The Hardening',
        description: 'Lock down authentication, the firewall, and the alerting pipeline.',
        questIds: questIdsFor(['api_auth', 'net_firewall', 'obs_alerting']),
        unlocksAt: 4,
      },
      {
        id: 'security-5',
        title: 'Part 5: The New Fortress',
        description: 'Deploy a zero-trust service mesh in front of the cluster.',
        questIds: questIdsFor(['istio_intro', 'istio_security', 'k8s_architecture']),
        unlocksAt: 5,
      },
      {
        id: 'security-6',
        title: 'Epilogue: The Audit',
        description:
          'Scan everything, watch the dashboards, and prove the infrastructure is secure.',
        questIds: questIdsFor(['sec_scanning', 'istio_observability', 'obs_grafana']),
        unlocksAt: 6,
      },
    ],
    rewards: {
      xpBonus: 4000,
      goldBonus: 1500,
      badgeId: 'devops_champion',
    },
  },
  {
    id: 'automation-frontier',
    title: 'The Automation Frontier',
    subtitle: 'Rise of the Machines',
    icon: '🤖',
    description:
      'Manual processes are slowing everyone down. Embark on a journey to automate all the things.',
    difficulty: 'beginner',
    estimatedTime: '1-2 hours',
    episodes: [
      {
        id: 'automation-1',
        title: 'Episode 1: The Tedious Task',
        description: 'Start with shell basics and identify the most repetitive manual tasks.',
        questIds: questIdsFor(['bash_intro', 'bash_getstarted', 'bash_script']),
        unlocksAt: 1,
      },
      {
        id: 'automation-2',
        title: 'Episode 2: First Script',
        description: 'Write your first Python script to handle a simple task automatically.',
        questIds: questIdsFor(['py_intro', 'py_syntax', 'py_functions']),
        unlocksAt: 2,
      },
      {
        id: 'automation-3',
        title: 'Episode 3: The Pipeline',
        description: 'Create a CI/CD pipeline to automate builds and deployments.',
        questIds: questIdsFor(['cicd_intro', 'cicd_pipeline', 'cicd_github_actions']),
        unlocksAt: 3,
      },
      {
        id: 'automation-4',
        title: 'Episode 4: Infrastructure as Code',
        description: 'Define your infrastructure in code for reproducibility.',
        questIds: questIdsFor(['tf_intro', 'tf_resources', 'tf_variables']),
        unlocksAt: 4,
      },
      {
        id: 'automation-5',
        title: 'Episode 5: The Self-Healing System',
        description: 'Let configuration management and the cluster heal failures for you.',
        questIds: questIdsFor(['ans_intro', 'ans_playbooks', 'k8s_getstarted']),
        unlocksAt: 5,
      },
    ],
    rewards: {
      xpBonus: 2000,
      goldBonus: 800,
      badgeId: 'devops_master',
    },
  },
  {
    id: 'chaos-engineering',
    title: 'Chaos Engineering',
    subtitle: 'Breaking Things on Purpose',
    icon: '💥',
    description:
      'Learn to embrace failure by intentionally introducing chaos to test system resilience.',
    difficulty: 'advanced',
    estimatedTime: '2-3 hours',
    episodes: [
      {
        id: 'chaos-1',
        title: 'Act 1: The Philosophy',
        description:
          'Understand the principles of chaos engineering and pick your steady-state metrics.',
        questIds: questIdsFor(['obs_intro', 'prom_getstarted', 'prom_metrics']),
        unlocksAt: 1,
      },
      {
        id: 'chaos-2',
        title: 'Act 2: The First Blast',
        description: 'Conduct your first experiment by disrupting pods and shifting traffic.',
        questIds: questIdsFor(['k8s_pods', 'istio_traffic', 'net_loadbalancers']),
        unlocksAt: 2,
      },
      {
        id: 'chaos-3',
        title: 'Act 3: The Aftermath',
        description: 'Trace the blast radius, tighten alerting, and branch off the fixes.',
        questIds: questIdsFor(['obs_tracing', 'obs_alerting', 'git_branch']),
        unlocksAt: 3,
      },
      {
        id: 'chaos-4',
        title: 'Act 4: Game Days',
        description: 'Stress the event backbone end to end in a supervised game day.',
        questIds: questIdsFor(['kafka_intro', 'kafka_producers', 'rmq_intro']),
        unlocksAt: 4,
      },
    ],
    rewards: {
      xpBonus: 3000,
      goldBonus: 1200,
      badgeId: 'master',
    },
  },
  {
    id: 'observability-journey',
    title: 'The Observability Journey',
    subtitle: 'See Everything, Understand Anything',
    icon: '🔭',
    description:
      "You can't fix what you can't see. Build a comprehensive observability stack from scratch.",
    difficulty: 'intermediate',
    estimatedTime: '2 hours',
    episodes: [
      {
        id: 'observe-1',
        title: 'Chapter 1: The Black Box',
        description: 'Start with structured logging to understand system behavior.',
        questIds: questIdsFor(['obs_intro', 'obs_loki', 'nodejs_filesystem']),
        unlocksAt: 1,
      },
      {
        id: 'observe-2',
        title: 'Chapter 2: The Pulse',
        description: 'Add metrics to understand system health over time.',
        questIds: questIdsFor(['prom_intro', 'prom_getstarted', 'obs_grafana']),
        unlocksAt: 2,
      },
      {
        id: 'observe-3',
        title: 'Chapter 3: The Trace',
        description: 'Follow requests across services with traces over the API surface.',
        questIds: questIdsFor(['obs_tracing', 'istio_observability', 'api_rest']),
        unlocksAt: 3,
      },
      {
        id: 'observe-4',
        title: 'Chapter 4: The On-Call Handbook',
        description: 'Wire up alerting and document the runbooks your future self will need.',
        questIds: questIdsFor(['obs_alerting', 'prom_alerts', 'api_docs']),
        unlocksAt: 4,
      },
      {
        id: 'observe-5',
        title: 'Chapter 5: The Future',
        description: 'Instrument the app server and explore ML-assisted insight on top of it all.',
        questIds: questIdsFor(['nodejs_http', 'ml_intro', 'ml_mlops']),
        unlocksAt: 5,
      },
    ],
    rewards: {
      xpBonus: 2500,
      goldBonus: 1000,
      badgeId: 'expert',
    },
  },
]

export const DIFFICULTY_CONFIG = {
  beginner: { label: '🌱 Beginner', color: '#10b981', bg: 'bg-green-900/30' },
  intermediate: { label: '⚡ Intermediate', color: '#f59e0b', bg: 'bg-amber-900/30' },
  advanced: { label: '🔥 Advanced', color: '#ef4444', bg: 'bg-red-900/30' },
}
