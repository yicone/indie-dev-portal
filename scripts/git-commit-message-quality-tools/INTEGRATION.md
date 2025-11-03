# Git Commit Message Validation Integration

## Overview

This project uses a **two-layer validation** approach for commit messages:

1. **commitlint** - Basic format validation (type, length, structure)
2. **commit_msg_validator.py** - Content quality validation (emojis, Chinese, markdown)

## Architecture

```
Git Commit
    ↓
.husky/commit-msg hook
    ↓
    ├─→ commitlint (Layer 1: Format)
    │   ├─ type-enum validation
    │   ├─ header-max-length (100 chars)
    │   ├─ subject-case validation
    │   └─ body structure validation
    │
    └─→ commit_msg_validator.py (Layer 2: Content Quality)
        ├─ Chinese character detection
        ├─ Emoji detection
        ├─ Markdown chaos detection
        ├─ Code block format validation
        └─ Incomplete content detection
```

## Validation Rules Comparison

### Layer 1: commitlint (.commitlintrc.json)

| Rule                   | Description                                                                               | Severity |
| ---------------------- | ----------------------------------------------------------------------------------------- | -------- |
| `type-enum`            | Valid types: feat, fix, docs, spec, refactor, test, chore, perf, ci, build, revert, style | Error    |
| `subject-case`         | No upper-case subjects                                                                    | Error    |
| `subject-empty`        | Subject cannot be empty                                                                   | Error    |
| `subject-full-stop`    | No period at end of subject                                                               | Error    |
| `header-max-length`    | Max 100 characters                                                                        | Error    |
| `body-leading-blank`   | Blank line before body                                                                    | Error    |
| `body-max-line-length` | Max 200 characters per line                                                               | Error    |
| `footer-leading-blank` | Blank line before footer                                                                  | Error    |

### Layer 2: commit_msg_validator.py

| Rule                        | Description                                  | Why commitlint can't do this        |
| --------------------------- | -------------------------------------------- | ----------------------------------- |
| `contains-****`             | Detects placeholder text                     | Custom pattern matching             |
| `contains-Chinese`          | Detects Chinese characters                   | Unicode range validation            |
| `emoji-in-subject`          | Detects emoji in subject                     | Emoji list matching                 |
| `markdown-in-subject`       | Detects ## or ### in subject                 | Custom pattern matching             |
| `emoji-first-line`          | Body starts with emoji                       | Body content analysis               |
| `incomplete-list-items`     | Too many standalone list markers             | Statistical analysis with threshold |
| `too-many-empty-lines`      | >30% empty lines in body                     | Percentage calculation              |
| `incomplete-subject-ending` | Subject ends with "proposal", "tasks", "..." | Regex pattern matching              |
| `multiple-spaces`           | Consecutive spaces in subject                | Custom pattern matching             |
| `markdown-chaos-in-body`    | Malformed markdown markers                   | Complex regex analysis              |
| `malformed-code-blocks`     | Inline code blocks >50 chars                 | Pattern matching with length check  |

## Usage

### During Commit

Both validators run automatically when you commit:

```bash
git commit -m "feat: add new feature"
```

**Success Output:**

```
✓ commitlint passed
(commit_msg_validator.py runs silently on success)
```

**Failure Output:**

```
✗ commitlint failed
  ✖ subject may not be empty

================================================================================
❌ COMMIT MESSAGE VALIDATION FAILED
================================================================================

The following issues were found:

  ❌ Contains Chinese characters - use English only
  ❌ Subject contains emoji - remove emoji from subject line

================================================================================
Please fix these issues and try again.
================================================================================
```

### Manual Validation

Test a commit message before committing:

```bash
# Test with commitlint
echo "feat: my commit" | pnpm exec commitlint

# Test with custom validator
echo "feat: my commit

Body text here" > /tmp/test-msg.txt
python3 scripts/git-commit-message-quality-tools/commit_msg_validator.py /tmp/test-msg.txt
```

### Batch Validation

Check all commits in history:

```bash
python3 scripts/git-commit-message-quality-tools/unified_commit_checker.py
```

This generates `/tmp/unified_commit_fixes.json` with all issues found.

## Tool Comparison

### commit_msg_validator.py vs unified_commit_checker.py

| Feature         | commit_msg_validator.py      | unified_commit_checker.py    |
| --------------- | ---------------------------- | ---------------------------- |
| **Purpose**     | Pre-commit validation        | Historical analysis          |
| **Scope**       | Single commit message        | All commits in repo          |
| **Usage**       | Git hook (.husky/commit-msg) | Manual script                |
| **Output**      | Pass/fail with errors        | JSON report                  |
| **When to use** | Every commit (automatic)     | Periodic audits, batch fixes |

## Integration Points

### 1. Pre-commit Hook (.husky/commit-msg)

```bash
#!/bin/sh

# Layer 1: Basic format validation
pnpm exec commitlint --edit $1

# Layer 2: Content quality validation
python3 scripts/git-commit-message-quality-tools/commit_msg_validator.py $1
```

### 2. CI/CD Pipeline (Future)

```yaml
# .github/workflows/commit-lint.yml
- name: Validate commit messages
  run: |
    pnpm exec commitlint --from HEAD~1 --to HEAD
    python3 scripts/git-commit-message-quality-tools/commit_msg_validator.py .git/COMMIT_EDITMSG
```

### 3. Pre-push Hook (Optional)

```bash
# .husky/pre-push
python3 scripts/git-commit-message-quality-tools/unified_commit_checker.py
```

## Why Two Layers?

### commitlint Strengths

- ✅ Standard tool with wide adoption
- ✅ Configurable via JSON
- ✅ Integrates with conventional-changelog
- ✅ Fast and lightweight
- ✅ Good error messages

### commitlint Limitations

- ❌ Cannot validate Unicode/emoji
- ❌ Cannot analyze body content structure
- ❌ Cannot do statistical analysis (percentages, thresholds)
- ❌ Limited regex pattern matching
- ❌ No custom validation logic

### commit_msg_validator.py Strengths

- ✅ Custom validation logic
- ✅ Unicode/emoji detection
- ✅ Body content analysis
- ✅ Statistical analysis (thresholds, percentages)
- ✅ Complex regex patterns
- ✅ Project-specific rules

### Together They Provide

- ✅ Comprehensive validation
- ✅ Clear separation of concerns
- ✅ Fast feedback during commit
- ✅ Detailed error messages
- ✅ Flexibility for custom rules

## Configuration

### commitlint

Edit `.commitlintrc.json`:

```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [2, "always", 200]
  }
}
```

### commit_msg_validator.py

Edit `commit_msg_validator.py` constants:

```python
MAX_SUBJECT_LENGTH = 100
INCOMPLETE_LIST_THRESHOLD = 3
EMOJIS = ["📝", "✨", "🐛", ...]
CHINESE_RANGE = ("\u4e00", "\u9fff")
```

## Troubleshooting

### Hook Not Running

```bash
# Reinstall husky hooks
pnpm install
```

### Python Not Found

```bash
# Check Python installation
python3 --version

# Use absolute path in hook
/usr/bin/python3 scripts/git-commit-message-quality-tools/commit_msg_validator.py $1
```

### Validation Too Strict

Temporarily bypass validation:

```bash
# Skip hooks (not recommended)
git commit --no-verify -m "message"

# Or adjust thresholds in commit_msg_validator.py
```

## Best Practices

1. **Run validation locally** before pushing
2. **Keep rules consistent** between local and CI
3. **Update EMOJIS list** as needed
4. **Document custom rules** in this file
5. **Test changes** to validation logic

## Future Enhancements

- [ ] Add configuration file for commit_msg_validator.py
- [ ] Support for custom rule plugins
- [ ] Integration with IDE commit UI
- [ ] Auto-fix suggestions for common issues
- [ ] Metrics dashboard for commit quality

## Related Documentation

- [README.md](./README.md) - Tool overview and usage
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [ai_fix_helper_instructions.md](./ai_fix_helper_instructions.md) - AI fix instructions
