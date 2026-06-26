export interface Guild {
  id: string
  name: string
  icon: string
  description: string
  level: number
  xp: number
  xpToNextLevel: number
  memberCount: number
  maxMembers: number
  leaderId: string
  leaderName: string
  createdAt: string
  totalQuests: number
  weeklyQuests: number
  rank: number
  achievements: string[]
  activeChallenges: string[]
  requirements: {
    minLevel: number
    minQuests: number
  }
}

export interface GuildMember {
  id: string
  name: string
  avatar: string
  level: number
  title: string
  role: 'leader' | 'officer' | 'member'
  joinedAt: string
  weeklyXP: number
  totalXP: number
  questsThisWeek: number
  streakDays: number
  contributionPoints: number
}

export interface GuildChallenge {
  id: string
  title: string
  description: string
  type: 'quest_marathon' | 'quiz_master' | 'streak_champion' | 'xp_grind' | 'tech_specific'
  target: number
  progress: number
  rewardXP: number
  rewardGold: number
  expiresAt: string
  participants: string[] // member IDs
}

export interface GuildRank {
  id: string
  name: string
  icon: string
  color: string
  permissions: {
    canInvite: boolean
    canKick: boolean
    canManageChallenges: boolean
    canEditGuild: boolean
    canPromote: boolean
  }
}

// Available guild ranks
export const GUILD_RANKS: GuildRank[] = [
  {
    id: 'leader',
    name: 'Guild Master',
    icon: '👑',
    color: '#ffd700',
    permissions: { canInvite: true, canKick: true, canManageChallenges: true, canEditGuild: true, canPromote: true },
  },
  {
    id: 'officer',
    name: 'Officer',
    icon: '⚔️',
    color: '#ff6b6b',
    permissions: { canInvite: true, canKick: false, canManageChallenges: true, canEditGuild: false, canPromote: true },
  },
  {
    id: 'member',
    name: 'Member',
    icon: '🛡️',
    color: '#60a5fa',
    permissions: { canInvite: false, canKick: false, canManageChallenges: false, canEditGuild: false, canPromote: false },
  },
]

// Mock guild data
export const MOCK_GUILD: Guild = {
  id: 'guild_1',
  name: 'DevOps Masters',
  icon: '🐉',
  description: 'A elite guild for DevOps enthusiasts! We master CI/CD, Cloud, and Container technologies together.',
  level: 15,
  xp: 8500,
  xpToNextLevel: 10000,
  memberCount: 8,
  maxMembers: 20,
  leaderId: 'member_1',
  leaderName: 'CloudMaster',
  createdAt: '2025-01-15',
  totalQuests: 1250,
  weeklyQuests: 145,
  rank: 3,
  achievements: ['first_guild', 'streak_30', 'quest_1000', 'weekly_champion'],
  activeChallenges: ['challenge_1', 'challenge_2'],
  requirements: { minLevel: 10, minQuests: 50 },
}

export const MOCK_GUILD_MEMBERS: GuildMember[] = [
  {
    id: 'member_1',
    name: 'CloudMaster',
    avatar: '☁️',
    level: 35,
    title: 'DevOps Master',
    role: 'leader',
    joinedAt: '2025-01-15',
    weeklyXP: 1250,
    totalXP: 15000,
    questsThisWeek: 45,
    streakDays: 28,
    contributionPoints: 2500,
  },
  {
    id: 'member_2',
    name: 'K8sKnight',
    avatar: '🏰',
    level: 25,
    title: 'DevOps Sage',
    role: 'officer',
    joinedAt: '2025-02-01',
    weeklyXP: 980,
    totalXP: 10500,
    questsThisWeek: 38,
    streakDays: 45,
    contributionPoints: 1800,
  },
  {
    id: 'member_3',
    name: 'GitGuru99',
    avatar: '🧙',
    level: 18,
    title: 'DevOps Expert',
    role: 'officer',
    joinedAt: '2025-02-10',
    weeklyXP: 750,
    totalXP: 6100,
    questsThisWeek: 28,
    streakDays: 7,
    contributionPoints: 950,
  },
  {
    id: 'member_4',
    name: 'DockerDiva',
    avatar: '🐳',
    level: 12,
    title: 'DevOps Journeyman',
    role: 'member',
    joinedAt: '2025-03-01',
    weeklyXP: 420,
    totalXP: 3200,
    questsThisWeek: 18,
    streakDays: 3,
    contributionPoints: 420,
  },
  {
    id: 'member_5',
    name: 'TerraformTitan',
    avatar: '🗿',
    level: 28,
    title: 'DevOps Master',
    role: 'member',
    joinedAt: '2025-02-15',
    weeklyXP: 1100,
    totalXP: 12000,
    questsThisWeek: 42,
    streakDays: 21,
    contributionPoints: 1600,
  },
  {
    id: 'member_6',
    name: 'PipelinePro',
    avatar: '⚙️',
    level: 20,
    title: 'DevOps Expert',
    role: 'member',
    joinedAt: '2025-03-05',
    weeklyXP: 680,
    totalXP: 7800,
    questsThisWeek: 25,
    streakDays: 14,
    contributionPoints: 780,
  },
]

export const MOCK_GUILD_CHALLENGES: GuildChallenge[] = [
  {
    id: 'challenge_1',
    title: 'Weekly Quest Marathon',
    description: 'Complete 500 quests as a guild this week!',
    type: 'quest_marathon',
    target: 500,
    progress: 145,
    rewardXP: 5000,
    rewardGold: 2000,
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    participants: ['member_1', 'member_2', 'member_3', 'member_4', 'member_5', 'member_6'],
  },
  {
    id: 'challenge_2',
    title: 'Streak Champions',
    description: 'Maintain a combined 100-day streak!',
    type: 'streak_champion',
    target: 100,
    progress: 67,
    rewardXP: 3000,
    rewardGold: 1000,
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    participants: ['member_1', 'member_2', 'member_5'],
  },
  {
    id: 'challenge_3',
    title: 'XP Grind Week',
    description: 'Earn 10000 combined XP this week!',
    type: 'xp_grind',
    target: 10000,
    progress: 5180,
    rewardXP: 4000,
    rewardGold: 1500,
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    participants: ['member_1', 'member_2', 'member_3', 'member_5', 'member_6'],
  },
  {
    id: 'challenge_4',
    title: 'Kubernetes Week',
    description: 'Complete 50 Kubernetes-related quests!',
    type: 'tech_specific',
    target: 50,
    progress: 23,
    rewardXP: 2500,
    rewardGold: 800,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    participants: ['member_2', 'member_5'],
  },
]

// Featured guilds for discovery
export const FEATURED_GUILDS: Guild[] = [
  {
    id: 'guild_2',
    name: 'Cloud Architects',
    icon: '🏗️',
    description: 'Building the future of cloud infrastructure',
    level: 22,
    xp: 18000,
    xpToNextLevel: 20000,
    memberCount: 18,
    maxMembers: 25,
    leaderId: 'leader_2',
    leaderName: 'CloudArchitect',
    createdAt: '2024-08-20',
    totalQuests: 2100,
    weeklyQuests: 180,
    rank: 1,
    achievements: ['first_guild', 'streak_100', 'quest_2000', 'champion_10'],
    activeChallenges: ['challenge_1'],
    requirements: { minLevel: 15, minQuests: 100 },
  },
  {
    id: 'guild_3',
    name: 'CI/CD Champions',
    icon: '🔄',
    description: 'Masters of continuous integration and deployment',
    level: 18,
    xp: 12000,
    xpToNextLevel: 15000,
    memberCount: 12,
    maxMembers: 20,
    leaderId: 'leader_3',
    leaderName: 'CIPioneer',
    createdAt: '2024-11-05',
    totalQuests: 1600,
    weeklyQuests: 120,
    rank: 2,
    achievements: ['first_guild', 'streak_60', 'quest_1500'],
    activeChallenges: ['challenge_2'],
    requirements: { minLevel: 12, minQuests: 75 },
  },
  {
    id: 'guild_4',
    name: 'Container Crew',
    icon: '📦',
    description: 'Docker, Kubernetes, and containerization specialists',
    level: 12,
    xp: 6000,
    xpToNextLevel: 8000,
    memberCount: 6,
    maxMembers: 15,
    leaderId: 'leader_4',
    leaderName: 'ContainerCaptain',
    createdAt: '2025-01-10',
    totalQuests: 800,
    weeklyQuests: 65,
    rank: 5,
    achievements: ['first_guild', 'streak_20'],
    activeChallenges: [],
    requirements: { minLevel: 8, minQuests: 30 },
  },
]

export function getGuildRankInfo(role: GuildMember['role']): GuildRank {
  return GUILD_RANKS.find(r => r.id === role) || GUILD_RANKS[2]
}

export function formatDaysRemaining(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000))
  return `${days} day${days > 1 ? 's' : ''} left`
}
