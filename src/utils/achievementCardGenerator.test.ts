import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  generateAchievementCardSVG,
  generateBadgeCard,
  type AchievementCardConfig,
} from './achievementCardGenerator'
import type { Badge } from '../data/badges'

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

    it('stacks one stat line per stat and shifts the player block down', () => {
      const config: AchievementCardConfig = {
        type: 'level_up',
        title: 'Level Up',
        icon: '⭐',
        iconBgColor: '#fff',
        borderColor: '#f59e0b',
        achievementName: 'Level 10',
        stats: { level: 10, quests: 42, xp: 5000 },
        playerName: 'mkinney',
      }
      const result = generateAchievementCardSVG(config)

      // Each stat sits 35px below the previous one.
      expect(result).toContain('<text x="250" y="620"')
      expect(result).toContain('<text x="250" y="655"')
      expect(result).toContain('<text x="250" y="690"')
      expect(result).toContain('Level: 10')
      expect(result).toContain('Quests: 42')
      expect(result).toContain('Xp: 5000')

      // The player divider moves from y=560 to y=680 when stats are present.
      expect(result).toContain('<line x1="50" y1="680"')
      expect(result).toContain('<text x="250" y="700"')
      expect(result).not.toContain('<line x1="50" y1="560"')
    })

    it('places the player block above the date when there are no stats', () => {
      const config: AchievementCardConfig = {
        type: 'badge',
        title: 'Badge',
        icon: '🏅',
        iconBgColor: '#fff',
        borderColor: '#3b82f6',
        achievementName: 'Simple Badge',
        playerName: 'mkinney',
      }
      const result = generateAchievementCardSVG(config)

      expect(result).toContain('<line x1="50" y1="560"')
      expect(result).toContain('<text x="250" y="585"')
      expect(result).toContain('height="620"')
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

  describe('generateBadgeCard', () => {
    /** The blob URLs handed out instead of touching the real registry. */
    const createdUrls: Array<{ blob: Blob; url: string }> = []
    const revokedUrls: string[] = []
    /** Captures the anchor the download helper clicks, with its attributes. */
    const clicks: Array<{ href: string; filename: string; attachedToBody: boolean }> = []

    /** Recording stand-ins for the blob URL registry, installed as `URL`. */
    const fakeUrlRegistry = {
      createObjectURL(blob: Blob): string {
        const url = `blob:achievement-card-${createdUrls.length + 1}`
        createdUrls.push({ blob, url })
        return url
      },
      revokeObjectURL(url: string): void {
        revokedUrls.push(url)
      },
    }

    function badge(overrides: Partial<Badge> = {}): Badge {
      return {
        id: 'pipeline_paladin',
        name: 'Pipeline Paladin',
        description: 'Ship a pipeline end to end',
        icon: '🛡️',
        category: 'quest',
        rarity: 'rare',
        requirement: { type: 'quest_count', value: 10 },
        xpReward: 50,
        goldReward: 25,
        ...overrides,
      }
    }

    /** The single download triggered by the current test. */
    function onlyDownload(): { blob: Blob; url: string; click: (typeof clicks)[number] } {
      if (createdUrls.length === 0 || clicks.length === 0) {
        throw new Error('no achievement card was downloaded')
      }
      return { ...createdUrls[0], click: clicks[0] }
    }

    beforeEach(() => {
      // The filename embeds Date.now(), so the clock is pinned for the
      // assertion. Local noon keeps the rendered calendar day stable in any
      // timezone.
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 2, 4, 12, 0, 0))
      createdUrls.length = 0
      revokedUrls.length = 0
      clicks.length = 0
      vi.stubGlobal('URL', fakeUrlRegistry)
      vi.spyOn(HTMLElement.prototype, 'click').mockImplementation(function recordClick(
        this: HTMLElement,
      ) {
        if (!(this instanceof HTMLAnchorElement)) {
          throw new Error('expected the download click to come from an anchor element')
        }
        clicks.push({
          href: this.href,
          filename: this.download,
          attachedToBody: this.parentElement === document.body,
        })
      })
    })

    afterEach(() => {
      vi.restoreAllMocks()
      vi.unstubAllGlobals()
      vi.useRealTimers()
    })

    it('downloads an SVG blob under a timestamped badge filename', () => {
      generateBadgeCard(badge())

      const download = onlyDownload()
      expect(download.click.filename).toBe(
        `devopsquest-badge-${new Date(2026, 2, 4, 12, 0, 0).getTime()}.svg`,
      )
      expect(download.url).toBe('blob:achievement-card-1')
      expect(download.click.href).toBe('blob:achievement-card-1')
      expect(download.blob.type).toBe('image/svg+xml')
    })

    it('releases the blob URL and removes the link after clicking it', () => {
      generateBadgeCard(badge())
      const download = onlyDownload()

      expect(download.click.attachedToBody).toBe(true)
      expect(revokedUrls).toEqual(['blob:achievement-card-1'])
      expect(document.querySelector('a')).toBeNull()
    })

    it('renders the badge name, icon, subtitle and card type', async () => {
      generateBadgeCard(badge({ name: 'Pipeline Paladin', icon: '🛡️' }))
      const svg = await onlyDownload().blob.text()

      expect(svg).toContain('DEVOPSQUEST')
      expect(svg).toContain('Pipeline Paladin')
      expect(svg).toContain('🛡️')
      expect(svg).toContain('Badge Earned')
      expect(svg).toContain('BADGE')
      // The config `title` and `achievementDescription` are metadata only and
      // never reach the SVG markup.
      expect(svg).not.toContain('Achievement Unlocked!')
      expect(svg).not.toContain('Ship a pipeline end to end')
    })

    it.each([
      ['common', ['#374151', '#6b7280', '#9ca3af']],
      ['uncommon', ['#064e3b', '#10b981', '#34d399']],
      ['rare', ['#1e3a5f', '#3b82f6', '#60a5fa']],
      ['epic', ['#581c87', '#8b5cf6', '#a78bfa']],
      ['legendary', ['#78350f', '#f59e0b', '#fbbf24']],
    ] as const)('colours every element from the %s rarity palette', async (rarity, palette) => {
      generateBadgeCard(badge({ rarity }))
      const svg = await onlyDownload().blob.text()

      for (const color of palette) expect(svg).toContain(color)
    })

    it('stamps the unlock date onto the card', async () => {
      generateBadgeCard(badge({ unlockedAt: '2025-11-02T12:00:00' }))

      expect(await onlyDownload().blob.text()).toContain('Nov 2, 2025')
    })

    it('uses today for a badge that has never been unlocked', async () => {
      generateBadgeCard(badge({ unlockedAt: undefined }))

      expect(await onlyDownload().blob.text()).toContain('Mar 4, 2026')
    })

    it('credits the player when a name is passed', async () => {
      generateBadgeCard(badge(), 'mkinney')

      expect(await onlyDownload().blob.text()).toContain('mkinney')
    })

    it('omits the player block when no name is passed', async () => {
      generateBadgeCard(badge())

      expect(await onlyDownload().blob.text()).not.toContain('mkinney')
    })
  })
})
