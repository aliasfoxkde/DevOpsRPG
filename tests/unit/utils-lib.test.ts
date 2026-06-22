import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cn, getSystemTheme, clamp, formatDate, formatRelativeTime, daysBetween, isToday, isYesterday } from '@/lib/auth';

describe('Utility Functions', () => {
  describe('cn', () => {
    it('should combine class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should filter out falsy values', () => {
      expect(cn('foo', false, 'bar', undefined, 'baz', null)).toBe('foo bar baz');
    });

    it('should handle empty strings', () => {
      expect(cn('', 'foo', '')).toBe('foo');
    });

    it('should handle booleans', () => {
      expect(cn('foo', true && 'bar')).toBe('foo bar');
      expect(cn('foo', false && 'bar')).toBe('foo');
    });
  });

  describe('clamp', () => {
    it('should clamp value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('should return min when value is below', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('should return max when value is above', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle edge cases', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = '2024-01-15T12:00:00.000Z';
      const formatted = formatDate(date);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
    });
  });

  describe('daysBetween', () => {
    it('should return 0 for same day', () => {
      const date = '2024-01-15';
      expect(daysBetween(date, date)).toBe(0);
    });

    it('should return correct days between', () => {
      const date1 = '2024-01-01';
      const date2 = '2024-01-10';
      expect(daysBetween(date1, date2)).toBe(9);
    });

    it('should handle date order', () => {
      const date1 = '2024-01-10';
      const date2 = '2024-01-01';
      expect(daysBetween(date1, date2)).toBe(9);
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date().toISOString();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday.toISOString())).toBe(false);
    });
  });

  describe('isYesterday', () => {
    it('should return true for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isYesterday(yesterday.toISOString())).toBe(true);
    });

    it('should return false for today', () => {
      const today = new Date().toISOString();
      expect(isYesterday(today)).toBe(false);
    });
  });
});
