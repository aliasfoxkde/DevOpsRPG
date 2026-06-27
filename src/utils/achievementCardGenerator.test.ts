import { describe, it, expect } from 'vitest'
import {
  generateAchievementCardSVG,
  type AchievementCardConfig
} from './achievementCardGenerator'

describe('achievementCardGenerator', () => {
  describe('generateAchievementCardSVG', () => {
    it('should generate valid SVG string', () => {
      const config: AchievementCardConfig = {
        type: 'badge',
        title: 'Test Achievement',
        icon: '🏆',
        iconBgColor: '#ffffff',
        borderColor: '#f59e0b',
        achievementName: 'Test Badge',
      }
      const result = generateAchievementCardSVG(config)
      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(result).toContain('<svg')
      expect(result).toContain('</svg>')
    })

    it('should use correct rarity colors for common', () => {
      const config: AchievementCardConfig = {
        type: 'badge',
        title: 'Common Badge',
        icon: '📄',
        iconBgColor: '#fff',
        borderColor: '#ccc',
        achievementName: 'Common',
        rarity: 'common',
      }
      const result = generateAchievementCardSVG(config)
      expect(result).toContain('#374151') // common bg
      expect(result).toContain('#6b7280') // common border
    })

    it('should use correct rarity colors for legendary', () => {
      const config: AchievementCardConfig = {
        type: 'badge',
        title: 'Legendary Badge',
        icon: '👑',
        iconBgColor: '#fff',
        borderColor: '#f59e0b',
        achievementName: 'Legendary',
        rarity: 'legendary',
      }
      const result = generateAchievementCardSVG(config)
      expect(result).toContain('#78350f') // legendary bg
      expect(result).toContain('#f59e0b') // legendary border
    })

    it('should include stats when provided', () => {
      const config: AchievementCardConfig = {
        type: 'level_up',
        title: 'Level Up',
        icon: '⭐',
        iconBgColor: '#fff',
        borderColor: '#f59e0b',
        achievementName: 'Level 10',
        stats: { level: 10, xp: 500 },
      }
      const result = generateAchievementCardSVG(config)
      expect(result).toContain('Level: 10')
      expect(result).toContain('Xp: 500')
    })

    it('should not include stats section when stats not provided', () => {
      const config: AchievementCardConfig = {
        type: 'badge',
        title: 'Badge',
        icon: '🏅',
        iconBgColor: '#fff',
        borderColor: '#3b82f6',
        achievementName: 'Simple Badge',
      }
      const result = generateAchievementCardSVG(config)
      expect(result).not.toContain('Level:')
      expect(result).not.toContain('Xp:')
    })

    it('should include player name when provided', () => {
      const config: AchievementCardConfig = {
        type: 'badge',
        title: 'Badge',
        icon: '🏅',
        iconBgColor: '#fff',
        borderColor: '#3b82f6',
        achievementName: 'Badge',
        playerName: 'TestPlayer',
      }
      const result = generateAchievementCardSVG(config)
      expect(result).toContain('TestPlayer')
    })

    it('should include subtitle when provided', () => {
      const config: AchievementCardConfig = {
        type: 'badge',
        title: 'Badge',
        icon: '🏅',
        iconBgColor: '#fff',
        borderColor: '#3b82f6',
        achievementName: 'Badge',
        subtitle: 'Achievement Unlocked',
      }
      const result = generateAchievementCardSVG(config)
      expect(result).toContain('Achievement Unlocked')
    })

    it('should format type as uppercase with underscores replaced', () => {
      const config: AchievementCardConfig = {
        type: 'level_up',
        title: 'Level Up',
        icon: '⭐',
        iconBgColor: '#fff',
        borderColor: '#f59e0b',
        achievementName: 'Level 5',
      }
      const result = generateAchievementCardSVG(config)
      expect(result).toContain('LEVEL UP')
    })

    it('should use provided timestamp', () => {
      const config: AchievementCardConfig = {
        type: 'badge',
        title: 'Badge',
        icon: '🏅',
        iconBgColor: '#fff',
        borderColor: '#3b82f6',
        achievementName: 'Badge',
        timestamp: new Date('2024-06-15T12:00:00Z'),
      }
      const result = generateAchievementCardSVG(config)
      // Check that the date string contains the year
      expect(result).toContain('2024')
    })

    it('should calculate correct SVG height with stats', () => {
      const config: AchievementCardConfig = {
        type: 'streak',
        title: 'Streak',
        icon: '🔥',
        iconBgColor: '#fff',
        borderColor: '#f97316',
        achievementName: '7 Day Streak',
        stats: { streak: 7 },
      }
      const result = generateAchievementCardSVG(config)
      expect(result).toContain('height="720"')
    })

    it('should calculate correct SVG height without stats', () => {
      const config: AchievementCardConfig = {
        type: 'badge',
        title: 'Badge',
        icon: '🏅',
        iconBgColor: '#fff',
        borderColor: '#3b82f6',
        achievementName: 'Badge',
      }
      const result = generateAchievementCardSVG(config)
      expect(result).toContain('height="620"')
    })
  })
})
