export interface Friend {
  id: string
  name: string
  avatar: string
  level: number
  title: string
  isOnline: boolean
  lastActive: string
  totalXP: number
  streakDays: number
}

export interface Gift {
  id: string
  type: 'xp' | 'gold' | 'streak_shield' | 'collectible'
  name: string
  icon: string
  description: string
  value?: number
  cooldownDays: number
}

export interface SentGift {
  id: string
  friendId: string
  giftId: string
  sentAt: string
}

export interface ReceivedGift {
  id: string
  fromFriendId: string
  giftId: string
  receivedAt: string
  claimed: boolean
}

// Mock friends data
export const MOCK_FRIENDS: Friend[] = [
  {
    id: 'friend_1',
    name: 'DevOpsNinja',
    avatar: '🥷',
    level: 15,
    title: 'DevOps Expert',
    isOnline: true,
    lastActive: new Date().toISOString(),
    totalXP: 4500,
    streakDays: 12,
  },
  {
    id: 'friend_2',
    name: 'CloudMaster',
    avatar: '☁️',
    level: 22,
    title: 'DevOps Master',
    isOnline: false,
    lastActive: new Date(Date.now() - 3600000 * 3).toISOString(),
    totalXP: 8200,
    streakDays: 28,
  },
  {
    id: 'friend_3',
    name: 'GitGuru99',
    avatar: '🧙',
    level: 18,
    title: 'DevOps Sage',
    isOnline: true,
    lastActive: new Date().toISOString(),
    totalXP: 6100,
    streakDays: 7,
  },
  {
    id: 'friend_4',
    name: 'DockerDiva',
    avatar: '🐳',
    level: 12,
    title: 'DevOps Journeyman',
    isOnline: false,
    lastActive: new Date(Date.now() - 3600000 * 24).toISOString(),
    totalXP: 3200,
    streakDays: 3,
  },
  {
    id: 'friend_5',
    name: 'K8sKnight',
    avatar: '🏰',
    level: 25,
    title: 'DevOps Sage',
    isOnline: false,
    lastActive: new Date(Date.now() - 3600000 * 48).toISOString(),
    totalXP: 10500,
    streakDays: 45,
  },
]

// Available gifts to send
export const AVAILABLE_GIFTS: Gift[] = [
  {
    id: 'gift_xp_small',
    type: 'xp',
    name: 'XP Boost',
    icon: '⚡',
    description: 'Send 50 XP to a friend',
    value: 50,
    cooldownDays: 1,
  },
  {
    id: 'gift_xp_large',
    type: 'xp',
    name: 'XP Surge',
    icon: '✨',
    description: 'Send 200 XP to a friend',
    value: 200,
    cooldownDays: 3,
  },
  {
    id: 'gift_gold_small',
    type: 'gold',
    name: 'Gold Coins',
    icon: '🪙',
    description: 'Send 100 gold to a friend',
    value: 100,
    cooldownDays: 1,
  },
  {
    id: 'gift_gold_large',
    type: 'gold',
    name: 'Gold Chest',
    icon: '💰',
    description: 'Send 500 gold to a friend',
    value: 500,
    cooldownDays: 7,
  },
  {
    id: 'gift_streak_shield',
    type: 'streak_shield',
    name: 'Streak Shield',
    icon: '🛡️',
    description: 'Protect a friend\'s streak for one day',
    cooldownDays: 14,
  },
  {
    id: 'gift_lucky_charm',
    type: 'collectible',
    name: 'Lucky Charm',
    icon: '🍀',
    description: 'A special collectible for good luck!',
    cooldownDays: 30,
  },
]

// Leaderboard entries (for comparing with friends)
export interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  avatar: string
  level: number
  totalXP: number
  streakDays: number
  isFriend?: boolean
}

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, id: 'lb_1', name: 'DevOpsLegend', avatar: '🐉', level: 50, totalXP: 25000, streakDays: 90 },
  { rank: 2, id: 'lb_2', name: 'CloudMaster', avatar: '☁️', level: 35, totalXP: 15000, streakDays: 45 },
  { rank: 3, id: 'lb_3', name: 'K8sKnight', avatar: '🏰', level: 25, totalXP: 10500, streakDays: 45, isFriend: true },
  { rank: 4, id: 'lb_4', name: 'GitGuru99', avatar: '🧙', level: 18, totalXP: 6100, streakDays: 7, isFriend: true },
  { rank: 5, id: 'lb_5', name: 'DockerDiva', avatar: '🐳', level: 12, totalXP: 3200, streakDays: 3, isFriend: true },
  { rank: 6, id: 'lb_6', name: 'TerraformTitan', avatar: '🗿', level: 28, totalXP: 12000, streakDays: 21 },
  { rank: 7, id: 'lb_7', name: 'PipelinePro', avatar: '⚙️', level: 20, totalXP: 7800, streakDays: 14 },
  { rank: 8, id: 'lb_8', name: 'AnsibleAce', avatar: '🎯', level: 16, totalXP: 5200, streakDays: 5 },
  { rank: 9, id: 'lb_9', name: 'LinuxLegend', avatar: '🦁', level: 30, totalXP: 14000, streakDays: 30 },
  { rank: 10, id: 'lb_10', name: 'SecuritySage', avatar: '🦊', level: 22, totalXP: 9000, streakDays: 18 },
]

export function formatLastActive(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}
