import type { Badge } from '../data/badges'

export interface AchievementCardConfig {
  type: 'badge' | 'realm_complete' | 'level_up' | 'streak' | 'title_unlock'
  title: string
  subtitle?: string
  icon: string
  iconBgColor: string
  borderColor: string
  achievementName: string
  achievementDescription?: string
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  stats?: {
    level?: number
    streak?: number
    quests?: number
    xp?: number
  }
  playerName?: string
  timestamp?: Date
}

const RARITY_COLORS = {
  common: { bg: '#374151', border: '#6b7280', text: '#9ca3af' },
  uncommon: { bg: '#064e3b', border: '#10b981', text: '#34d399' },
  rare: { bg: '#1e3a5f', border: '#3b82f6', text: '#60a5fa' },
  epic: { bg: '#581c87', border: '#8b5cf6', text: '#a78bfa' },
  legendary: { bg: '#78350f', border: '#f59e0b', text: '#fbbf24' },
}

export function generateAchievementCardSVG(config: AchievementCardConfig): string {
  const colors = RARITY_COLORS[config.rarity || 'rare']
  const timestamp = config.timestamp || new Date()
  const dateStr = timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const statsLines = config.stats
    ? Object.entries(config.stats)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => `        <text x="250" y="${620 + Object.keys(config.stats!).indexOf(k) * 35}" font-family="system-ui, sans-serif" font-size="18" fill="#94a3b8" text-anchor="middle">${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}</text>`)
        .join('\n')
    : ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="500" height="${config.stats ? 720 : 620}" viewBox="0 0 500 ${config.stats ? 720 : 620}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b"/>
      <stop offset="100%" style="stop-color:#0f172a"/>
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.border}40"/>
      <stop offset="100%" style="stop-color:${colors.border}10"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="500" height="${config.stats ? 720 : 620}" rx="24" fill="url(#bgGrad)"/>

  <!-- Glow border effect -->
  <rect x="4" y="4" width="492" height="${config.stats ? 712 : 612}" rx="22" fill="none" stroke="url(#glowGrad)" stroke-width="4"/>

  <!-- Border -->
  <rect x="8" y="8" width="484" height="${config.stats ? 704 : 604}" rx="20" fill="none" stroke="${colors.border}" stroke-width="2"/>

  <!-- Header -->
  <text x="250" y="50" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="${colors.text}" text-anchor="middle" letter-spacing="2">DEVOPSQUEST</text>

  <!-- Achievement Icon -->
  <circle cx="250" cy="130" r="60" fill="${colors.bg}" stroke="${colors.border}" stroke-width="3"/>
  <text x="250" y="150" font-family="system-ui, sans-serif" font-size="60" text-anchor="middle">${config.icon}</text>

  <!-- Title -->
  <text x="250" y="230" font-family="system-ui, sans-serif" font-size="28" font-weight="700" fill="white" text-anchor="middle">${config.achievementName}</text>

  <!-- Subtitle -->
  ${config.subtitle ? `<text x="250" y="265" font-family="system-ui, sans-serif" font-size="16" fill="${colors.text}" text-anchor="middle">${config.subtitle}</text>` : ''}

  <!-- Divider -->
  <line x1="50" y1="300" x2="450" y2="300" stroke="${colors.border}" stroke-width="1" opacity="0.5"/>

  <!-- Achievement Type Badge -->
  <rect x="150" y="320" width="200" height="40" rx="20" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1"/>
  <text x="250" y="347" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="${colors.text}" text-anchor="middle">${config.type.replace('_', ' ').toUpperCase()}</text>

  <!-- Stats -->
  ${statsLines}

  <!-- Player Name (if provided) -->
  ${config.playerName ? `
  <!-- Divider -->
  <line x1="50" y1="${config.stats ? 680 : 560}" x2="450" y2="${config.stats ? 680 : 560}" stroke="${colors.border}" stroke-width="1" opacity="0.5"/>

  <!-- Player info -->
  <text x="250" y="${config.stats ? 700 : 585}" font-family="system-ui, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">${config.playerName}</text>
  ` : ''}

  <!-- Date -->
  <text x="250" y="${config.stats ? 718 : 605}" font-family="system-ui, sans-serif" font-size="12" fill="#475569" text-anchor="middle">${dateStr}</text>

  <!-- Footer logo -->
  <text x="250" y="${config.stats ? 718 : 605}" font-family="system-ui, sans-serif" font-size="10" fill="#334155" text-anchor="middle" opacity="0.5">⚔️ DevOpsQuest</text>
</svg>`
}

export function downloadAchievementCard(config: AchievementCardConfig, filename?: string): void {
  const svg = generateAchievementCardSVG(config)
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `devopsquest-${config.type}-${Date.now()}.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Badge-specific card generator
export function generateBadgeCard(badge: Badge, playerName?: string): void {
  const config: AchievementCardConfig = {
    type: 'badge',
    title: 'Achievement Unlocked!',
    subtitle: 'Badge Earned',
    icon: badge.icon,
    iconBgColor: '',
    borderColor: badge.rarity === 'legendary' ? '#f59e0b' : badge.rarity === 'epic' ? '#8b5cf6' : '#3b82f6',
    achievementName: badge.name,
    achievementDescription: badge.description,
    rarity: badge.rarity as AchievementCardConfig['rarity'],
    playerName,
    timestamp: badge.unlockedAt ? new Date(badge.unlockedAt) : undefined,
  }
  downloadAchievementCard(config)
}

// Realm completion card generator
export function generateRealmCard(realmName: string, icon: string, playerName?: string): void {
  const config: AchievementCardConfig = {
    type: 'realm_complete',
    title: 'Realm Conquered!',
    subtitle: realmName,
    icon,
    iconBgColor: '#581c87',
    borderColor: '#8b5cf6',
    achievementName: 'Realm Master',
    achievementDescription: `Completed all quests in ${realmName}`,
    rarity: 'legendary',
    playerName,
    timestamp: new Date(),
  }
  downloadAchievementCard(config)
}

// Level up card generator
export function generateLevelUpCard(level: number, playerName?: string): void {
  const config: AchievementCardConfig = {
    type: 'level_up',
    title: 'Level Up!',
    icon: '⭐',
    iconBgColor: '#78350f',
    borderColor: '#f59e0b',
    achievementName: `Level ${level}`,
    achievementDescription: 'Reached a new level!',
    rarity: level >= 50 ? 'legendary' : level >= 30 ? 'epic' : level >= 10 ? 'rare' : 'uncommon',
    stats: { level },
    playerName,
    timestamp: new Date(),
  }
  downloadAchievementCard(config)
}

// Streak card generator
export function generateStreakCard(streakDays: number, playerName?: string): void {
  const config: AchievementCardConfig = {
    type: 'streak',
    title: 'Streak Milestone!',
    icon: '🔥',
    iconBgColor: '#7c2d12',
    borderColor: '#f97316',
    achievementName: `${streakDays} Day Streak`,
    achievementDescription: 'Incredible consistency!',
    rarity: streakDays >= 30 ? 'legendary' : streakDays >= 14 ? 'epic' : streakDays >= 7 ? 'rare' : 'uncommon',
    stats: { streak: streakDays },
    playerName,
    timestamp: new Date(),
  }
  downloadAchievementCard(config)
}
