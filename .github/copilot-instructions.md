# AI Agent Instructions - DevOpsRPG

## Project Context

DevOpsRPG is a gamified DevOps learning platform built with React 19 + TypeScript + Vite + TailwindCSS. It helps users learn DevOps concepts through quests, mini-games, and interactive challenges.

## Important Principles for AI Agents

1. **Minimal Changes**: Only change what needs to be changed. Don't refactor for the sake of refactoring.
2. **Test Before Claiming**: Run `npm run test` before claiming completion.
3. **Lint Compliance**: All code must pass ESLint without errors.
4. **Type Safety**: Maintain full TypeScript type safety.
5. **Backward Compatibility**: Don't break existing functionality.

## Code Quality Standards

### Required Validation Commands
```bash
npm run lint      # ESLint must pass
npm run typecheck # TypeScript must compile
npm run test      # All tests must pass
npm run build     # Production build must succeed
```

### Pre-commit Hook
The project uses pre-commit hooks that run:
1. ESLint on staged files
2. TypeScript check
3. Vitest tests

## Issue Handling Workflow

### When Processing GitHub Issues:
1. **Triage**: Label with appropriate labels (`bug`, `enhancement`, `needs-triage`, etc.)
2. **Analyze**: Understand the problem, check if it's reproducible
3. **Implement**: Create a fix or feature branch
4. **Test**: Ensure all tests pass
5. **PR**: Create a draft PR with implementation notes

### Issue Priority
- `priority-high`: Critical bugs, security issues
- `priority-medium`: Important features, usability issues
- `priority-low`: Nice-to-have improvements

### Issue Categories
- `bug`: Something isn't working
- `enhancement`: New feature or improvement
- `change-request`: Change to existing functionality
- `documentation`: Docs improvements
- `good-first-issue`: Good for new contributors

## Architecture Overview

### Key Directories
- `src/components/` - React UI components
- `src/contexts/` - React Context providers (GameContext, ThemeContext)
- `src/data/` - Game data (quests, badges, equipment)
- `src/hooks/` - Custom React hooks
- `src/pages/` - Page components
- `src/utils/` - Utility functions

### State Management
- **GameContext**: Central game state (character, quests, progress)
- **ThemeContext**: Dark/light theme
- **ProgressContext**: Learning progress tracking

### Key Files
- `src/contexts/GameContext.tsx` - Main game state (2000+ lines, needs refactoring)
- `src/utils/gameUtils.ts` - Shared utilities and constants
- `src/utils/dataExport.ts` - Import/export game data

## Common Patterns

### Adding a New Feature
1. Create feature branch: `git checkout -b feature/description`
2. Implement in appropriate directory
3. Add tests if applicable
4. Run validation commands
5. Create PR to `stable` branch

### Fixing a Bug
1. Create fix branch: `git checkout -b fix/description`
2. Write failing test first (TDD)
3. Implement fix
4. Ensure test passes
5. Run full validation
6. Create PR

### Making UI Changes
1. Check existing component patterns
2. Use consistent Tailwind classes
3. Ensure accessibility (aria-labels, focus states)
4. Test on both light and dark themes

## Security Considerations

- **No hardcoded secrets**: Use environment variables
- **Input sanitization**: Always escape user input
- **XSS prevention**: React handles this by default, but be careful with `dangerouslySetInnerHTML`
- **Data validation**: Validate all imported data

## Performance Guidelines

- Use `React.memo` for list items that re-render frequently
- Use `useMemo` and `useCallback` appropriately
- Lazy load page components
- Keep bundle size reasonable

## Testing Strategy

- **Unit tests**: Utility functions, hooks
- **Component tests**: UI components
- **Integration tests**: Critical user flows
- **Test location**: Co-located with components (`*.test.ts` or `*.test.tsx`)

## Commit Conventions

Follow Conventional Commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

Example: `feat(quests): add daily quest refresh feature`

## Getting Help

- Check existing issues before creating new ones
- Review the quest journal page for user-facing docs
- Check the contributing guide for setup instructions