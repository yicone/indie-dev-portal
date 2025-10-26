# AI-Powered Documentation Review

> Automated documentation quality checks using AI agents in pre-commit hooks

## 🎯 Overview

This project uses AI agents to automatically review documentation changes before commits. The system provides:

- **Fast traditional checks** (link validation, markdown linting)
- **Optional AI-powered checks** (SSOT violations, content duplication)
- **Configurable review levels** (quick, standard, deep)
- **Graceful degradation** (continues if AI unavailable)

## 🚀 Quick Start

### Prerequisites

1. **Install an AI agent CLI** (one of the following):
   - [Gemini CLI](https://github.com/google/generative-ai-cli) (recommended for speed)
   - [Codex CLI](https://github.com/openai/codex-cli) (recommended for depth)
   - Or any CLI agent that follows the [AGENTS.md](../AGENTS.md) protocol

2. **Verify installation**:

   ```bash
   # Check if agent is available
   gemini-cli --version
   # or
   codex-cli --version
   ```

### Basic Usage

The documentation checks run automatically on `git commit`:

```bash
# Normal commit - runs all checks including AI
git commit -m "docs: update README"

# Skip AI checks (faster)
DOC_AI_CHECK=false git commit -m "docs: quick fix"

# Skip all checks (emergency only)
git commit --no-verify -m "docs: emergency fix"
```

## 📋 Available Commands

### Manual Checks

```bash
# Quick check (5-10 seconds)
pnpm doc:check:quick

# Standard check (15-30 seconds) - recommended
pnpm doc:check

# Full audit (30-60 seconds)
pnpm doc:check:full

# Link check only (fast)
pnpm doc:links

# Markdown linting only
pnpm lint:md
```

### Check Levels

| Level        | Time   | Checks                          | When to Use              |
| ------------ | ------ | ------------------------------- | ------------------------ |
| **quick**    | <10s   | File naming, basic structure    | Pre-commit (default)     |
| **standard** | 15-30s | SSOT, duplication, structure    | Manual review, pre-push  |
| **deep**     | 30-60s | Full audit with recommendations | PR review, major changes |

## ⚙️ Configuration

### Agent Selection

Edit `.agents/doc-review-config.yml`:

```yaml
# Choose your agent
agent: 'gemini-cli' # or "codex-cli"

# Agent-specific settings
env:
  gemini_model: 'gemini-pro'
  codex_model: 'gpt-4'
```

### Enable/Disable AI Checks

**Globally** (in your shell profile):

```bash
# Disable AI checks for all commits
export DOC_AI_CHECK=false

# Enable AI checks (default)
export DOC_AI_CHECK=true
```

**Per-commit**:

```bash
# This commit only
DOC_AI_CHECK=false git commit -m "docs: update"
```

**Per-repository** (in `.env` or `.env.local`):

```bash
# Add to .env.local (not committed)
DOC_AI_CHECK=false
```

### Customize Check Levels

Edit `.agents/doc-review-config.yml` to customize what each level checks:

```yaml
checks:
  quick:
    - name: 'File Naming Convention'
      blocking: true
      timeout: 5

  standard:
    - name: 'SSOT Violations'
      blocking: false
      timeout: 15
```

## 🔍 What Gets Checked

### Traditional Checks (Always Run)

1. **Markdown Linting**
   - Prettier formatting
   - Consistent style

2. **Link Validation**
   - Broken internal links
   - Prohibited `cci:` style links
   - Trailing spaces in links

### AI Checks (Optional)

#### Quick Level

- File naming conventions
- Basic markdown structure

#### Standard Level

- SSOT violations (duplicate content without cross-references)
- Content duplication (>30% overlap)
- Documentation structure compliance
- Cross-reference integrity

#### Deep Level

- Comprehensive audit using quality checklist
- Authority mapping verification
- Index update requirements
- CHANGELOG update requirements
- Content quality and clarity assessment

## 📊 Understanding Results

### Output Format

```
✅ PASS: [check name]
⚠️ WARNING: [check name] - [issue description]
❌ FAIL: [check name] - [detailed issue]
```

### Exit Codes

- `0` - All checks passed
- `1` - Critical issues found (blocks commit)
- `0` (with warnings) - Non-critical issues (allows commit)

### Example Output

```bash
🤖 Running quick level documentation checks...
📝 Changed files:
   - docs/README.md
   - docs/QUICKSTART.md

🔍 Running gemini-cli...

✅ PASS: File Naming Convention
✅ PASS: Basic Structure
⚠️ WARNING: Link Integrity - docs/README.md references non-existent anchor

✅ Documentation check passed with warnings
```

## 🛠️ Troubleshooting

### AI Agent Not Found

```
⚠️ Agent 'gemini-cli' not found in PATH
   Skipping AI checks. Install gemini-cli or set DOC_AI_CHECK=false
```

**Solution**: Install the agent or disable AI checks:

```bash
DOC_AI_CHECK=false git commit -m "docs: update"
```

### Check Timeout

```
⚠️ Agent check timed out after 30s
   Proceeding without AI validation
```

**Solution**: This is normal for large changes. The commit proceeds without AI validation. Run manual check later:

```bash
pnpm doc:check
```

### False Positives

If AI reports incorrect issues:

1. **Skip for this commit**:

   ```bash
   DOC_AI_CHECK=false git commit -m "docs: update"
   ```

2. **Report the issue**: Add to `.agents/doc-review-config.yml` to refine prompts

3. **Adjust sensitivity**: Modify check thresholds in config

## 🎓 Best Practices

### When to Use Each Level

- **quick**: Every commit (default in pre-commit hook)
- **standard**: Before pushing, after significant changes
- **deep**: Before PRs, after major documentation restructures

### Workflow Recommendations

```bash
# 1. Make documentation changes
vim docs/README.md

# 2. Quick local check
pnpm doc:check:quick

# 3. Commit (runs quick check automatically)
git commit -m "docs: update README"

# 4. Before pushing, run standard check
pnpm doc:check

# 5. Push
git push
```

### Emergency Commits

If you need to commit urgently and AI checks are blocking:

```bash
# Option 1: Skip AI checks only
DOC_AI_CHECK=false git commit -m "docs: emergency fix"

# Option 2: Skip all checks (use sparingly)
git commit --no-verify -m "docs: emergency fix"

# Remember to run checks later!
pnpm doc:check
```

## 📚 Integration with CI/CD

For PR reviews, add to `.github/workflows/doc-review.yml`:

```yaml
name: Documentation Review

on:
  pull_request:
    paths:
      - 'docs/**'
      - '*.md'

jobs:
  doc-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Install AI agent
        run: npm install -g gemini-cli

      - name: Run documentation review
        run: pnpm doc:check:full
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

## 🔗 Related Documentation

- [AGENTS.md](../AGENTS.md) - Agent collaboration protocol
- [DOCUMENTATION_MANAGEMENT.md](DOCUMENTATION_MANAGEMENT.md) - Documentation rules
- [NAMING_CONVENTIONS.md](NAMING_CONVENTIONS.md) - Naming standards
- [.agents/doc-review-config.yml](../.agents/doc-review-config.yml) - Configuration file

## 🤝 Contributing

To improve the AI review system:

1. **Refine prompts**: Edit `.agents/doc-review-config.yml`
2. **Add new checks**: Follow the existing check structure
3. **Report issues**: Open an issue with examples of false positives/negatives
4. **Share configurations**: Submit PRs with improved prompts

## 📝 FAQ

### Q: Do I need an API key?

**A**: Depends on your agent. Some agents (like Gemini CLI) may require API keys. Set them in your environment:

```bash
export GEMINI_API_KEY="your-key"
# or
export OPENAI_API_KEY="your-key"
```

### Q: Will this slow down my commits?

**A**: Quick checks add 5-10 seconds. You can disable AI checks with `DOC_AI_CHECK=false` for faster commits.

### Q: What if I don't have an AI agent installed?

**A**: The system gracefully degrades. Traditional checks (links, linting) still run. AI checks are skipped with a warning.

### Q: Can I use a different AI agent?

**A**: Yes! As long as it follows the [AGENTS.md](../AGENTS.md) protocol. Update the `agent` field in `.agents/doc-review-config.yml`.

### Q: How much does this cost?

**A**: Depends on your agent and usage:

- Gemini: ~$0.001-0.01 per check
- OpenAI: ~$0.01-0.05 per check
- Local models: Free but slower

Typical monthly cost: $5-20 for active development.

---

**Last Updated**: October 26, 2025  
**Maintainer**: Project team  
**Status**: ✅ Active (Phase 1 - Traditional + Optional AI)
