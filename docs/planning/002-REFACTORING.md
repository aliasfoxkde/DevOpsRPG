# DevOpsRPG - Refactoring Plan

**Last Updated**: 2026-06-27

---

## 🎯 Refactoring Goals

1. **Reduce Complexity** - Large files and contexts are hard to maintain
2. **Improve Testability** - Smaller, focused modules are easier to test
3. **Enhance Performance** - Better memoization and code splitting
4. **Increase Maintainability** - Clear patterns and conventions

---

## 🔴 HIGH PRIORITY REFACTORING

### 1. GameContext Split (900+ lines → ~200 lines each)

**Current State:**
- Single `GameContext.tsx` handles everything
- Quest completion, XP calculation, badges, milestones, companions, collectibles, etc.

**Proposed Split:**

```
src/contexts/
├── GameContext.tsx           # Core character state only
├── QuestContext.tsx         # Quest-related logic
├── CollectionContext.tsx     # Badges, collectibles, milestones
├── SocialContext.tsx         # Guild, friends, chat
└── UIContext.tsx            # Modals, toasts, UI state
```

**Migration Plan:**
1. Create `QuestContext` with `completeQuest`, `isQuestCompleted`, `getNextQuest`
2. Create `CollectionContext` with badge/milestone/collectible logic
3. Update components to use new contexts
4. Remove old logic from GameContext
5. Delete GameContext or keep minimal wrapper

### 2. Quiz Component Refactor

**Current Issues:**
- 550+ lines in Quiz.tsx
- Mixed concerns (UI, state, handlers)
- `finishHandledRef` state machine is confusing

**Proposed Structure:**
```
src/components/ui/quiz/
├── Quiz.tsx                 # Main container
├── QuizQuestion.tsx         # Single question rendering
├── QuizProgress.tsx         # Progress bar, stats
├── QuizResults.tsx           # Results screen
├── hooks/
│   ├── useQuizState.ts      # Quiz state machine
│   └── useQuizTimer.ts      # Timer logic
└── utils/
    └── quizHelpers.ts        # Pure utility functions
```

### 3. BattleArenaPage Simplification

**Current Issues:**
- 570+ lines
- Many inline timer refs
- Complex completion flow

**Proposed Structure:**
```
src/pages/BattleArenaPage/
├── BattleArenaPage.tsx      # Main container
├── BattleHeader.tsx         # Quest header
├── StudyMode.tsx             # Study content view
├── BattleActions.tsx        # Action buttons
├── VictoryOverlay.tsx       # Victory animations
└── hooks/
    └── useBattleCompletion.ts # Completion state machine
```

---

## 🟡 MEDIUM PRIORITY REFACTORING

### 4. Data Layer Consolidation

**Current:** 25+ data files with some duplication

**Proposed:** Organize by domain
```
src/data/
├── quests/
│   ├── index.ts              # Exports
│   ├── questData.ts          # Quest definitions
│   ├── questLogic.ts          # getNextQuest, etc.
│   └── realmData.ts          # Realm definitions
├── progression/
│   ├── badges.ts
│   ├── milestones.ts
│   ├── achievements.ts
│   └── rewards.ts
├── content/
│   ├── technologies.ts
│   ├── quizzes.ts
│   └── w3schools-content.ts
├── social/
│   ├── guilds.ts
│   ├── communityChallenges.ts
│   └── leaderboard.ts
└── [other domains]
```

### 5. Hooks Organization

**Current:** Mixed in `hooks/` directory

**Proposed:** Group related hooks
```
src/hooks/
├── useGame.ts               # useGame convenience hook
├── useQuest.ts              # useQuest convenience hook
├── useKeyboardShortcuts.ts
├── useSoundEffects.ts
├── useVoiceNarration.ts
└── [lib]
    ├── useLocalStorage.ts
    ├── useMediaQuery.ts
    └── useDebounce.ts
```

### 6. Component Library Cleanup

**Current:** Some components have similar patterns

**Create unified base components:**
```
src/components/ui/
├── Base/
│   ├── Button.tsx            # Standardized button
│   ├── Card.tsx              # Standardized card
│   ├── Modal.tsx             # Standardized modal
│   └── Toast.tsx             # Standardized toast
└── [specialized components]
```

---

## 🟢 LOW PRIORITY REFACTORING

### 7. CSS/Tailwind Organization

**Current:** Mix of Tailwind classes and some inline styles

**Proposed:**
- Establish Tailwind component patterns in `tailwind.config.js`
- Extract complex animations to CSS keyframes
- Document color palette usage

### 8. Constants Management

**Current:** Magic numbers scattered in code

**Proposed:** Centralize constants
```typescript
// src/constants/
export const QUIZ = {
  PASS_THRESHOLD: 0.6,
  PERFECT_THRESHOLD: 1.0,
  MIN_QUESTIONS: 3,
}

export const TIMING = {
  AUTO_NAVIGATION_DELAY: 2500,
  CONFETTI_DURATION: 3000,
  TOAST_DURATION: 5000,
}

export const GAME = {
  XP_PER_LEVEL: 100,
  BASE_QUEST_XP: 50,
  STREAK_BONUS_MULTIPLIER: 0.1,
}
```

### 9. Type Organization

**Current:** Types defined in various places

**Proposed:** Central type definitions
```typescript
// src/types/
export * from './quest.types'
export * from './character.types'
export * from './progression.types'
```

---

## 📋 REFACTORING EXECUTION PLAN

### Phase 1: Preparation (1-2 days)
1. Set up comprehensive test coverage
2. Create GitHub Actions CI/CD
3. Establish pre-commit hooks
4. Document current behavior

### Phase 2: Context Split (2-3 days)
1. Extract QuestContext
2. Extract CollectionContext
3. Update all consumers
4. Test thoroughly

### Phase 3: Quiz Refactor (2-3 days)
1. Split into smaller components
2. Extract hook for state machine
3. Simplify 'n' key handler
4. Add comprehensive tests

### Phase 4: Data Layer (1-2 days)
1. Reorganize data files
2. Create clear exports
3. Remove duplication
4. Add data validation

### Phase 5: Polish (1-2 days)
1. Constants organization
2. Component library cleanup
3. CSS/Tailwind improvements
4. Final documentation

---

## ⚠️ Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing functionality | Comprehensive test coverage before refactor |
| Too many changes at once | One refactor at a time, verify each |
| Performance regression | Benchmark before/after |
| Losing context during split | Frequent commits, small PRs |

---

## ✅ SUCCESS CRITERIA

After refactoring:
- [ ] No increase in bundle size
- [ ] All existing tests pass
- [ ] New test coverage > 70%
- [ ] TypeScript strict mode passes
- [ ] Bundlephobia报告显示 no regressions
- [ ] Developer experience improved (faster onboarding, clearer patterns)
