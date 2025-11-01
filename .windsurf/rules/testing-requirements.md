# Testing Requirements

## Before Committing

- ✅ TypeScript compilation passes (`pnpm exec tsc --noEmit`)
- ✅ No console errors
- ✅ Markdown linting passes (automatic via pre-commit hook)
- ✅ Documentation links valid (automatic via pre-commit hook)

## For OpenSpec Changes

- ✅ Validate with `openspec validate <change-id> --strict`
- ✅ All tasks in tasks.md marked as complete
- ✅ Spec deltas follow correct format (#### Scenario:)

## For Features

- ✅ Manual testing completed
- ✅ Testing checklist followed (if exists)
- ✅ No regressions in existing functionality
