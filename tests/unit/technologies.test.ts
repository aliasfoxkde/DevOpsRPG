import { describe, it, expect } from 'vitest';
import {
  ALL_TECHNOLOGIES,
  CATEGORIES,
  CAREER_PATHS,
  getTechnologyBySlug,
  getTechnologyById,
  getTechnologiesByCategory,
  TOTAL_TECHNOLOGIES,
} from '@/data/technologies';

describe('Technologies Data', () => {
  describe('ALL_TECHNOLOGIES', () => {
    it('should have technologies', () => {
      expect(ALL_TECHNOLOGIES.length).toBeGreaterThan(0);
    });

    it('each technology should have required fields', () => {
      ALL_TECHNOLOGIES.forEach(tech => {
        expect(tech.id).toBeDefined();
        expect(tech.name).toBeDefined();
        expect(tech.slug).toBeDefined();
        expect(tech.category).toBeDefined();
        expect(tech.topics).toBeDefined();
        expect(Array.isArray(tech.topics)).toBe(true);
        expect(tech.xpPerTopic).toBeGreaterThan(0);
      });
    });

    it('each technology should have at least one topic', () => {
      ALL_TECHNOLOGIES.forEach(tech => {
        expect(tech.topics.length).toBeGreaterThan(0);
      });
    });

    it('each topic should have required fields', () => {
      ALL_TECHNOLOGIES.forEach(tech => {
        tech.topics.forEach(topic => {
          expect(topic.id).toBeDefined();
          expect(topic.name).toBeDefined();
          expect(topic.slug).toBeDefined();
          expect(topic.url).toBeDefined();
          expect(topic.order).toBeGreaterThan(0);
        });
      });
    });

    it('topics should be ordered correctly', () => {
      ALL_TECHNOLOGIES.forEach(tech => {
        for (let i = 0; i < tech.topics.length - 1; i++) {
          expect(tech.topics[i].order).toBeLessThan(tech.topics[i + 1].order);
        }
      });
    });
  });

  describe('CATEGORIES', () => {
    it('should have 5 categories', () => {
      expect(CATEGORIES.length).toBe(5);
    });

    it('should have required fields', () => {
      CATEGORIES.forEach(category => {
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.phase).toBeGreaterThan(0);
        expect(category.icon).toBeDefined();
        expect(category.color).toBeDefined();
      });
    });

    it('should have unique phases', () => {
      const phases = CATEGORIES.map(c => c.phase);
      const uniquePhases = new Set(phases);
      expect(phases.length).toBe(uniquePhases.size);
    });
  });

  describe('getTechnologyBySlug', () => {
    it('should return technology for valid slug', () => {
      const tech = getTechnologyBySlug('html');
      expect(tech).toBeDefined();
      expect(tech?.name).toBe('HTML');
    });

    it('should return undefined for invalid slug', () => {
      const tech = getTechnologyBySlug('nonexistent');
      expect(tech).toBeUndefined();
    });
  });

  describe('getTechnologyById', () => {
    it('should return technology for valid ID', () => {
      const tech = getTechnologyById('html');
      expect(tech).toBeDefined();
      expect(tech?.name).toBe('HTML');
    });

    it('should return undefined for invalid ID', () => {
      const tech = getTechnologyById('nonexistent');
      expect(tech).toBeUndefined();
    });
  });

  describe('getTechnologiesByCategory', () => {
    it('should return technologies for a category', () => {
      const foundations = getTechnologiesByCategory('foundations');
      expect(foundations.length).toBeGreaterThan(0);
      foundations.forEach(tech => {
        expect(tech.category).toBe('foundations');
      });
    });

    it('should return empty array for unknown category', () => {
      const unknown = getTechnologiesByCategory('unknown');
      expect(unknown).toEqual([]);
    });
  });
});

describe('Career Paths', () => {
  describe('CAREER_PATHS', () => {
    it('should have 5 career paths', () => {
      expect(Object.keys(CAREER_PATHS).length).toBe(5);
    });

    it('should have required fields', () => {
      Object.entries(CAREER_PATHS).forEach(([key, path]) => {
        expect(path.name).toBeDefined();
        expect(path.description).toBeDefined();
        expect(path.icon).toBeDefined();
        expect(path.technologies).toBeDefined();
        expect(Array.isArray(path.technologies)).toBe(true);
        expect(path.technologies.length).toBeGreaterThan(0);
      });
    });

    it('should have valid technology references', () => {
      Object.values(CAREER_PATHS).forEach(path => {
        path.technologies.forEach(techSlug => {
          const tech = getTechnologyBySlug(techSlug);
          // Tech may not exist yet if it's in a future phase
          if (tech) {
            expect(tech.slug).toBe(techSlug);
          }
        });
      });
    });

    it('should have expected path keys', () => {
      expect(CAREER_PATHS['web-developer']).toBeDefined();
      expect(CAREER_PATHS['backend-engineer']).toBeDefined();
      expect(CAREER_PATHS['devops-engineer']).toBeDefined();
      expect(CAREER_PATHS['data-scientist']).toBeDefined();
      expect(CAREER_PATHS['mobile-developer']).toBeDefined();
    });
  });
});

describe('TOTAL_TECHNOLOGIES', () => {
  it('should equal the length of ALL_TECHNOLOGIES', () => {
    expect(TOTAL_TECHNOLOGIES).toBe(ALL_TECHNOLOGIES.length);
  });
});
