import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateXPGain,
  getLevelProgress,
  calculateTechnologyProgress,
  calculateOverallProgress,
} from '@/lib/utils';
import { getLevelFromXP, getXPForLevel } from '@/data/achievements';

describe('XP Calculations', () => {
  describe('calculateXPGain', () => {
    it('should calculate base XP without streak bonus', () => {
      const result = calculateXPGain(100, 0, 0);
      expect(result.baseXP).toBe(100);
      expect(result.streakBonusXP).toBe(0);
      expect(result.totalXP).toBe(100);
    });

    it('should calculate streak bonus', () => {
      const result = calculateXPGain(100, 0, 5);
      expect(result.baseXP).toBe(100);
      expect(result.streakBonusXP).toBe(50); // 50% of 100
      expect(result.totalXP).toBe(150);
    });

    it('should cap streak bonus at 100%', () => {
      const result = calculateXPGain(100, 0, 20);
      expect(result.streakBonusXP).toBe(100); // capped
      expect(result.totalXP).toBe(200);
    });

    it('should detect level up', () => {
      // Starting with 90 XP, gaining 100 XP should level up to level 1
      const result = calculateXPGain(100, 90, 0);
      expect(result.previousLevel).toBe(0);
      expect(result.newLevel).toBe(1);
      expect(result.leveledUp).toBe(true);
    });

    it('should not detect level up when not crossed', () => {
      const result = calculateXPGain(10, 0, 0);
      expect(result.leveledUp).toBe(false);
    });
  });

  describe('getLevelProgress', () => {
    it('should return correct progress for level 0', () => {
      const progress = getLevelProgress(50);
      expect(progress.current).toBe(50);
      expect(progress.needed).toBe(100);
      expect(progress.percentage).toBe(50);
    });

    it('should return correct progress for level 1', () => {
      const progress = getLevelProgress(150);
      expect(progress.current).toBe(50);
      expect(progress.needed).toBe(300);
      expect(progress.percentage).toBe(17);
    });

    it('should return 100% at level threshold', () => {
      const progress = getLevelProgress(99);
      expect(progress.percentage).toBe(99);

      const progressAtLevel = getLevelProgress(100);
      expect(progressAtLevel.percentage).toBe(0);
    });
  });

  describe('calculateTechnologyProgress', () => {
    it('should calculate progress correctly', () => {
      const progress = calculateTechnologyProgress(5, 10);
      expect(progress.completed).toBe(5);
      expect(progress.total).toBe(10);
      expect(progress.percentage).toBe(50);
    });

    it('should handle zero topics', () => {
      const progress = calculateTechnologyProgress(0, 0);
      expect(progress.percentage).toBe(0);
    });

    it('should handle 100% completion', () => {
      const progress = calculateTechnologyProgress(10, 10);
      expect(progress.percentage).toBe(100);
    });
  });

  describe('calculateOverallProgress', () => {
    it('should calculate overall progress correctly', () => {
      const progress = calculateOverallProgress(50, 100);
      expect(progress.completed).toBe(50);
      expect(progress.total).toBe(100);
      expect(progress.percentage).toBe(50);
    });

    it('should calculate phase correctly', () => {
      // 0% = phase 1
      expect(calculateOverallProgress(0, 100).phase).toBe(1);

      // 1-20% = phase 1
      expect(calculateOverallProgress(10, 100).phase).toBe(1);

      // 21-40% = phase 2
      expect(calculateOverallProgress(25, 100).phase).toBe(2);

      // 41-60% = phase 3
      expect(calculateOverallProgress(50, 100).phase).toBe(3);

      // 61-80% = phase 4
      expect(calculateOverallProgress(70, 100).phase).toBe(4);

      // 81-100% = phase 5
      expect(calculateOverallProgress(90, 100).phase).toBe(5);

      // 100% = phase 5
      expect(calculateOverallProgress(100, 100).phase).toBe(5);
    });
  });
});
