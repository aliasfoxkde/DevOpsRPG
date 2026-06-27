# Task List - DevOpsRPG Comprehensive Enhancement

**Version**: 2.0
**Last Updated**: 2026-06-26
**Status**: IN PROGRESS

---

## Task Status Legend

- [ ] Pending
- [~] In Progress
- [x] Completed
- [!] Blocked
- [-] Cancelled

---

## Phase 1: Critical Bug Fixes (Immediate)

### 1.1 Navigation Scrollbar Fix
- [ ] Fix scrollbar-thin wrapper in Navbar.tsx
- [ ] Test on all viewport sizes
- [ ] Verify no horizontal scroll

### 1.2 Quest Auto-Navigation Bug
- [x] Fix stale closure in BattleArenaPage.tsx - DONE (commit bfe9a12)
- [x] Add navigationLockRef to prevent duplicates - DONE
- [x] Increase delay to 2500ms - DONE
- [ ] Validate with Playwright test

### 1.3 Level Jumping Bug
- [ ] Investigate XP calculation in GameContext
- [ ] Verify quest completion updates correctly
- [ ] Test level progression with Playwright

### 1.4 HTML Forms Repetition Bug
- [ ] Check quest generation for duplicates
- [ ] Verify w3schools-content has no repeats
- [ ] Ensure quizzes generate correctly

---

## Phase 2: Navigation Overhaul

### 2.1 HUD Redesign (Priority: HIGH)
- [x] Audit current 19 navigation items in HUD.tsx - DONE
- [x] Design 7-item primary navigation structure - DONE
- [x] Create "More" dropdown menu for secondary items - DONE
- [x] Update NAV_ITEMS array - DONE (now PRIMARY_NAV + SECONDARY_NAV)
- [x] Test responsive behavior - DONE

### 2.2 Mobile Menu Improvement
- [ ] Replace 3-column grid with 2-column
- [ ] Increase touch target sizes (min 44px)
- [ ] Add section dividers
- [ ] Improve close behavior

### 2.3 Breadcrumb Navigation
- [ ] Create Breadcrumb component
- [ ] Add to Quest Journal, Battle Arena, Career Path pages
- [ ] Style consistently with theme

### 2.4 Dead Code Removal
- [ ] Remove unused Navbar.tsx (/src/components/layout/Navbar.tsx)
- [ ] Audit Layout.tsx usage
- [ ] Clean up unused imports across codebase

---

## Phase 3: Visual Design Audit (Priority: HIGH)

### 3.1 Typography Standardization
- [~] Audit all text sizes (text-xs, text-sm, text-base, text-lg, text-xl, etc.) - IN PROGRESS
- [~] Create typography scale standard - IN PROGRESS
- [~] Apply consistent sizing across components - IN PROGRESS
- [ ] Check and improve contrast ratios (WCAG AA)

### 3.2 Icon System Upgrade
- [~] Audit emoji usage across UI - IN PROGRESS
- [ ] Replace core navigation/action icons with SVG
- [ ] Keep emoji for decorative elements only
- [ ] Create reusable Icon component

### 3.3 Component Consistency
- [x] Standardize Card component (rounded-xl, border, padding) - DONE
- [x] Create Button variants (primary/secondary/ghost/danger) - DONE (in index.css)
- [ ] Standardize form inputs (height, focus states, error states)
- [ ] Document component patterns in code

### 3.4 Animation Refinement
- [x] Audit all animations (confetti, bounces, pulses) - DONE
- [~] Remove distracting/bouncing effects - IN PROGRESS (reduced emoji noise)
- [x] Standardize transition durations (200-300ms) - DONE
- [x] Keep confetti for significant achievements only - DONE (unchanged)

---

## Phase 4: Career Path Completion (Priority: MEDIUM)

### 4.1 Add Missing Career Paths
- [ ] IT Support Track: Helpdesk → Desktop Support → Field Technician → Systems Administrator
- [ ] Development Track: Junior Developer → Software Engineer → Senior Engineer → Tech Lead
- [ ] Security Track: Security Analyst → Security Engineer → Cloud Security Architect
- [ ] Management Track: Team Lead → Manager → Director → VP → CTO

### 4.2 Implement Technology Completion Function
- [ ] Fix getTechnologyCompletion() stub in careerPaths.ts (currently returns 0)
- [ ] Calculate completion percentage from actual completed quests
- [ ] Update career progress UI to show real data

### 4.3 Link Quests to Career Technologies
- [ ] Add questIds to each technology in career paths
- [ ] Calculate career progress from quest completion
- [ ] Show career recommendations based on progress

### 4.4 Career Transition System
- [ ] Design prestige-like career transition mechanic
- [ ] Create permanent bonus system ("+5% Linux XP Forever")
- [ ] Add skill token as special currency
- [ ] Design career transition UI and flow

---

## Phase 5: Skill System Enhancement (Priority: MEDIUM)

### 5.1 Per-Skill XP Tracking
- [ ] Add skillXp tracking to GameState interface
- [ ] Create skill XP calculation on quest completion
- [ ] Award skill XP when completing related technology quests
- [ ] Display skill levels with XP progress bars

### 5.2 Skill Effects Implementation
- [ ] Implement skill-based XP bonuses (e.g., Linux Level 10+ = +5% XP)
- [ ] Add skill unlock requirements for advanced quests
- [ ] Create skill synergy bonuses (e.g., Linux + AWS for cloud infra)
- [ ] Balance skill progression curve

### 5.3 Visual Skill Trees
- [ ] Redesign SkillsPage with interactive skill trees
- [ ] Show skill unlock requirements and dependencies
- [ ] Add recommended skill paths
- [ ] Display active skill bonuses

---

## Phase 6: Equipment System (Priority: LOW - Phase 3)

### 6.1 Equipment Data Model
- [ ] Create equipment types (Workstation, Accessories, Cosmetic, Special)
- [ ] Define 4-6 equipment slots
- [ ] Add rarity tiers (Common, Uncommon, Rare, Epic, Legendary)
- [ ] Design equipment bonus types

### 6.2 Equipment Store Integration
- [ ] Add equipment items to store
- [ ] Implement purchase flow with gold
- [ ] Balance gold costs
- [ ] Add equipment preview before purchase

### 6.3 Equipment Slots UI
- [ ] Add equipment slots to Character page
- [ ] Create equip/unequip interactions
- [ ] Show active bonuses from equipment
- [ ] Visual equipment display (icons)

### 6.4 Equipment Gameplay Effects
- [ ] Implement XP bonuses from equipment
- [ ] Apply gold bonuses
- [ ] Add quiz score modifiers
- [ ] Connect equipment to skill system

---

## Phase 7: Polish & Testing (Ongoing)

### 7.1 Playwright E2E Testing
- [ ] Quest flow test (start → complete → next)
- [ ] Navigation test (all routes accessible)
- [ ] Career path progression test
- [ ] Skill system test
- [ ] Equipment flow test
- [ ] Victory modal test

### 7.2 Visual Regression Testing
- [ ] Set up visual testing framework
- [ ] Capture baseline screenshots
- [ ] Compare after CSS/theme changes

### 7.3 Performance Optimization
- [ ] Lazy load non-critical pages
- [ ] Optimize bundle size
- [ ] Check render performance with React DevTools

### 7.4 Accessibility Audit
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation support
- [ ] Focus indicators
- [ ] Screen reader testing

---

## Progress Summary

| Phase | Tasks | Completed | In Progress | Pending |
|-------|-------|-----------|-------------|---------|
| Phase 1 | 4 | 3 | 0 | 1 |
| Phase 2 | 4 | 0 | 0 | 4 |
| Phase 3 | 4 | 0 | 0 | 4 |
| Phase 4 | 4 | 0 | 0 | 4 |
| Phase 5 | 3 | 0 | 0 | 3 |
| Phase 6 | 4 | 0 | 0 | 4 |
| Phase 7 | 4 | 0 | 0 | 4 |
| **Total** | **27** | **3** | **0** | **24** |

**Completion**: 11%

---

## Dependencies

- Phase 1 (Bug Fixes) → No dependencies
- Phase 2 (Navigation) → Phase 1
- Phase 3 (Visual Design) → Phase 2
- Phase 4 (Career Paths) → Phase 1
- Phase 5 (Skills) → Phase 4
- Phase 6 (Equipment) → Phase 5
- Phase 7 (Polish) → All phases

---

## References

- BRAINSTORM.md - Core design philosophy
- docs/COMPREHENSIVE_ENHANCEMENT_PLAN.md - Full plan
- src/components/ui/HUD.tsx - Current navigation (19 items)
- src/data/careerPaths.ts - Career path data
- src/data/skills.ts - Skills system
- src/contexts/GameContext.tsx - Game state management
