import { describe, it, expect } from 'vitest'
import {
  shuffleArray,
  formatTime,
  formatTimeAgo,
  calculatePercentage,
  calculateLevel,
  xpForNextLevel,
  TIME_MS,
  SCORING,
  GAME_BALANCE,
  GAME_DURATION,
  ANIMATION,
} from './gameUtils'

describe('gameUtils', () => {
  describe('shuffleArray', () => {
    it('should return array of same length', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = shuffleArray(arr)
      expect(result).toHaveLength(arr.length)
    })

    it('should contain all original elements', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = shuffleArray(arr)
      arr.forEach(item => {
        expect(result).toContain(item)
      })
    })

    it('should not mutate original array', () => {
      const arr = [1, 2, 3, 4, 5]
      const original = [...arr]
      shuffleArray(arr)
      expect(arr).toEqual(original)
    })

    it('should handle empty array', () => {
      expect(shuffleArray([])).toEqual([])
    })

    it('should handle single element', () => {
      expect(shuffleArray([1])).toEqual([1])
    })
  })

  describe('formatTime', () => {
    it('should format seconds correctly', () => {
      expect(formatTime(65)).toBe('1:05')
      expect(formatTime(0)).toBe('0:00')
      expect(formatTime(30)).toBe('0:30')
      expect(formatTime(120)).toBe('2:00')
      expect(formatTime(3661)).toBe('61:01')
    })

    it('should handle negative values', () => {
      expect(formatTime(-65)).toBe('1:05')
    })
  })

  describe('formatTimeAgo', () => {
    it('should return "Just now" for recent dates', () => {
      const now = new Date()
      expect(formatTimeAgo(now)).toBe('Just now')
    })

    it('should format minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * TIME_MS.MINUTE)
      expect(formatTimeAgo(fiveMinutesAgo)).toBe('5m ago')
    })

    it('should format hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * TIME_MS.HOUR)
      expect(formatTimeAgo(twoHoursAgo)).toBe('2h ago')
    })

    it('should format days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * TIME_MS.DAY)
      expect(formatTimeAgo(threeDaysAgo)).toBe('3d ago')
    })
  })

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(50, 100)).toBe(50)
      expect(calculatePercentage(75, 100)).toBe(75)
      expect(calculatePercentage(100, 100)).toBe(100)
    })

    it('should round to nearest integer', () => {
      expect(calculatePercentage(33, 100)).toBe(33)
      expect(calculatePercentage(33.3, 100)).toBe(33)
      expect(calculatePercentage(33.7, 100)).toBe(34)
    })

    it('should handle zero max', () => {
      expect(calculatePercentage(50, 0)).toBe(0)
    })
  })

  describe('calculateLevel', () => {
    it('should calculate level from XP based on XP_THRESHOLDS', () => {
      // XP_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250]
      expect(calculateLevel(0)).toBe(1)
      expect(calculateLevel(50)).toBe(1)
      expect(calculateLevel(100)).toBe(2)
      expect(calculateLevel(200)).toBe(2) // 200 < 250
      expect(calculateLevel(250)).toBe(3)
      expect(calculateLevel(449)).toBe(3) // 449 < 450
      expect(calculateLevel(450)).toBe(4)
      expect(calculateLevel(1000)).toBe(6)
    })

    it('should return 1 for negative XP', () => {
      expect(calculateLevel(-100)).toBe(1)
    })
  })

  describe('xpForNextLevel', () => {
    it('should calculate XP needed for next level', () => {
      expect(xpForNextLevel(0)).toBe(100) // Need 100 to reach level 2
      expect(xpForNextLevel(100)).toBe(150) // Need 150 more to reach level 3
      expect(xpForNextLevel(250)).toBe(200) // Need 200 more to reach level 4
    })

    it('should return Infinity at max level', () => {
      expect(xpForNextLevel(10000)).toBe(Infinity)
    })
  })

  describe('constants', () => {
    it('should have correct TIME_MS values', () => {
      expect(TIME_MS.SECOND).toBe(1000)
      expect(TIME_MS.MINUTE).toBe(60000)
      expect(TIME_MS.HOUR).toBe(3600000)
      expect(TIME_MS.DAY).toBe(86400000)
    })

    it('should have correct SCORING values', () => {
      expect(SCORING.PASS_THRESHOLD).toBe(60)
      expect(SCORING.TIME_BONUS_WEIGHT).toBe(0.3)
      expect(SCORING.ACCURACY_BONUS_WEIGHT).toBe(0.7)
      expect(SCORING.XP_PER_100_SCORE).toBe(50)
      expect(SCORING.GOLD_PER_100_SCORE).toBe(25)
    })

    it('should have correct GAME_BALANCE values', () => {
      expect(GAME_BALANCE.XP_PER_LEVEL).toBe(100)
      expect(GAME_BALANCE.MAX_HP).toBe(100)
      expect(GAME_BALANCE.MAX_MP).toBe(100)
      expect(GAME_BALANCE.COLLECTIBLE_DROP_RATE).toBe(0.15)
      expect(GAME_BALANCE.GOLD_XP_RATIO).toBe(0.1)
    })

    it('should have correct GAME_DURATION values', () => {
      expect(GAME_DURATION.COMMAND_TYPER).toBe(30)
      expect(GAME_DURATION.MATH_CHALLENGE).toBe(45)
      expect(GAME_DURATION.QUIZ_DASH).toBe(60)
    })

    it('should have correct ANIMATION values', () => {
      expect(ANIMATION.FAST).toBe(150)
      expect(ANIMATION.NORMAL).toBe(300)
      expect(ANIMATION.SLOW).toBe(500)
      expect(ANIMATION.TOAST_DURATION).toBe(3000)
    })
  })
})