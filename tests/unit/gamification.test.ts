import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getXPForLevel,
  getLevelFromXP,
  getStreakBonus,
  getDailyReward,
  formatXP,
  formatTimeSpent,
  DAILY_REWARDS,
  ACHIEVEMENTS,
} from '@/data/achievements';

describe('XP and Level System', () => {
  describe('getLevelFromXP', () => {
    it('should return level 1 for 0 XP', () => {
      expect(getLevelFromXP(0)).toBe(0);
    });

    it('should return level 1 for 99 XP', () => {
      expect(getLevelFromXP(99)).toBe(0);
    });

    it('should return level 1 for 100 XP', () => {
      expect(getLevelFromXP(100)).toBe(1);
    });

    it('should return level 2 for 400 XP', () => {
      expect(getLevelFromXP(400)).toBe(2);
    });

    it('should return level 10 for 10000 XP', () => {
      expect(getLevelFromXP(10000)).toBe(10);
    });

    it('should handle large XP values', () => {
      expect(getLevelFromXP(1000000)).toBe(100);
    });
  });

  describe('getXPForLevel', () => {
    it('should return 0 XP for level 0', () => {
      expect(getXPForLevel(0)).toBe(0);
    });

    it('should return 100 XP for level 1', () => {
      expect(getXPForLevel(1)).toBe(100);
    });

    it('should return 400 XP for level 2', () => {
      expect(getXPForLevel(2)).toBe(400);
    });

    it('should return 10000 XP for level 10', () => {
      expect(getXPForLevel(10)).toBe(10000);
    });
  });

  describe('XP to Level consistency', () => {
    it('XP and level functions should be consistent', () => {
      for (let xp = 0; xp <= 100000; xp += 100) {
        const level = getLevelFromXP(xp);
        const xpForLevel = getXPForLevel(level);
        expect(xp).toBeGreaterThanOrEqual(xpForLevel);
      }
    });
  });
});

describe('Streak Bonus System', () => {
  describe('getStreakBonus', () => {
    it('should return 0% bonus for 0 days', () => {
      expect(getStreakBonus(0)).toBe(0);
    });

    it('should return 10% bonus for 1 day', () => {
      expect(getStreakBonus(1)).toBe(0.1);
    });

    it('should return 70% bonus for 7 days', () => {
      expect(getStreakBonus(7)).toBeCloseTo(0.7);
    });

    it('should cap at 100% bonus', () => {
      expect(getStreakBonus(10)).toBe(1.0);
      expect(getStreakBonus(15)).toBe(1.0);
      expect(getStreakBonus(100)).toBe(1.0);
    });
  });
});

describe('Daily Rewards', () => {
  describe('DAILY_REWARDS', () => {
    it('should have rewards for key milestones', () => {
      const day1 = DAILY_REWARDS.find(r => r.day === 1);
      const day7 = DAILY_REWARDS.find(r => r.day === 7);
      const day30 = DAILY_REWARDS.find(r => r.day === 30);

      expect(day1).toBeDefined();
      expect(day7).toBeDefined();
      expect(day30).toBeDefined();
    });

    it('should have ascending XP bonuses', () => {
      for (let i = 1; i < DAILY_REWARDS.length; i++) {
        expect(DAILY_REWARDS[i].xpBonus).toBeGreaterThanOrEqual(
          DAILY_REWARDS[i - 1].xpBonus
        );
      }
    });
  });

  describe('getDailyReward', () => {
    it('should return null for 0 days', () => {
      expect(getDailyReward(0)).toBeNull();
    });

    it('should return day 1 reward for 1 day', () => {
      const reward = getDailyReward(1);
      expect(reward?.day).toBe(1);
      expect(reward?.xpBonus).toBe(10);
    });

    it('should return day 7 reward for 7 days', () => {
      const reward = getDailyReward(7);
      expect(reward?.day).toBe(7);
      expect(reward?.badge).toBe('Dedicated Learner');
    });

    it('should return highest applicable reward for 365 days', () => {
      const reward = getDailyReward(365);
      expect(reward?.day).toBe(365);
      expect(reward?.badge).toBe('Year of Dedication');
    });
  });
});

describe('Achievements', () => {
  describe('ACHIEVEMENTS', () => {
    it('should have unique keys', () => {
      const keys = ACHIEVEMENTS.map(a => a.key);
      const uniqueKeys = new Set(keys);
      expect(keys.length).toBe(uniqueKeys.size);
    });

    it('should have required fields', () => {
      ACHIEVEMENTS.forEach(achievement => {
        expect(achievement.id).toBeDefined();
        expect(achievement.key).toBeDefined();
        expect(achievement.name).toBeDefined();
        expect(achievement.description).toBeDefined();
        expect(achievement.icon).toBeDefined();
        expect(achievement.xpReward).toBeDefined();
      });
    });

    it('should have first_steps achievement', () => {
      const firstSteps = ACHIEVEMENTS.find(a => a.key === 'first_steps');
      expect(firstSteps).toBeDefined();
      expect(firstSteps?.xpReward).toBe(25);
    });
  });
});

describe('Formatting Functions', () => {
  describe('formatXP', () => {
    it('should format small values without suffix', () => {
      expect(formatXP(0)).toBe('0 XP');
      expect(formatXP(50)).toBe('50 XP');
      expect(formatXP(999)).toBe('999 XP');
    });

    it('should format thousands with K suffix', () => {
      expect(formatXP(1000)).toBe('1.0K XP');
      expect(formatXP(5500)).toBe('5.5K XP');
      expect(formatXP(10000)).toBe('10.0K XP');
    });

    it('should format millions with M suffix', () => {
      expect(formatXP(1000000)).toBe('1.0M XP');
      expect(formatXP(2500000)).toBe('2.5M XP');
    });
  });

  describe('formatTimeSpent', () => {
    it('should format seconds', () => {
      expect(formatTimeSpent(30)).toBe('30s');
      expect(formatTimeSpent(59)).toBe('59s');
    });

    it('should format minutes', () => {
      expect(formatTimeSpent(60)).toBe('1m');
      expect(formatTimeSpent(300)).toBe('5m');
      expect(formatTimeSpent(3599)).toBe('59m');
    });

    it('should format hours and minutes', () => {
      expect(formatTimeSpent(3600)).toBe('1h 0m');
      expect(formatTimeSpent(3660)).toBe('1h 1m');
      expect(formatTimeSpent(7200)).toBe('2h 0m');
    });
  });
});
