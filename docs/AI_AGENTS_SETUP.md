# AI Agents Setup Guide

This guide explains how to set up and use different AI CLI tools for documentation review.

## Supported AI CLI Tools

The `doc-agent-check.sh` script supports multiple AI CLI tools with automatic command adaptation:

### 1. Gemini CLI

**Installation**:

```bash
# Install Gemini CLI (example - adjust based on actual tool)
npm install -g @google/gemini-cli
```

**Command Format**:

```bash
gemini -p "your prompt" -f file1.md -f file2.md
```

**Configuration** (`.agents/doc-review-config.yml`):

```yaml
agent: 'gemini-cli' # or just "gemini"

env:
  gemini_model: 'gemini-pro'
```

**Features**:

- Supports multiple context files via `-f` flag
- Prompt passed directly via `-p` flag
- Output to stdout

### 2. Codex CLI / OpenAI CLI

**Installation**:

```bash
# Install Codex CLI (example)
npm install -g @openai/codex-cli
```

**Command Format**:

```bash
codex --prompt-file prompt.txt --context file1.md,file2.md --output result.txt
```

**Configuration**:

```yaml
agent: 'codex-cli' # or "codex" or "openai-cli"

env:
  codex_model: 'gpt-4'
  openai_api_key: '${OPENAI_API_KEY}' # Set in environment
```

**Features**:

- Prompt from file via `--prompt-file`
- Context files as comma-separated list
- Output to file via `--output`

### 3. Claude CLI

**Installation**:

```bash
# Install Claude CLI (example)
npm install -g @anthropic/claude-cli
```

**Command Format**:

```bash
claude --prompt "your prompt" --files file1.md,file2.md
```

**Configuration**:

```yaml
agent: 'claude-cli' # or just "claude"

env:
  claude_model: 'claude-3-opus'
  anthropic_api_key: '${ANTHROPIC_API_KEY}'
```

**Features**:

- Prompt passed directly
- Context files as comma-separated list
- Output to stdout

## Usage

### Quick Check (Pre-commit)

```bash
# Uses agent configured in .agents/doc-review-config.yml
pnpm doc:check:quick

# Or directly
./scripts/doc-agent-check.sh quick
```

### Standard Check (Pre-push)

```bash
pnpm doc:check

# Or directly
./scripts/doc-agent-check.sh standard
```

### Deep Check (Manual/PR)

```bash
pnpm doc:check:full

# Or directly
./scripts/doc-agent-check.sh deep
```

## Environment Variables

### Required

Set these in your environment or `.env` file:

```bash
# For Gemini
export GEMINI_API_KEY="your-key"

# For OpenAI/Codex
export OPENAI_API_KEY="your-key"

# For Claude
export ANTHROPIC_API_KEY="your-key"
```

### Optional

```bash
# Disable AI checks
export DOC_AI_CHECK=false

# Enable verbose output
export DOC_CHECK_VERBOSE=true
```

## Switching Between Agents

Edit `.agents/doc-review-config.yml`:

```yaml
# Use Gemini
agent: "gemini-cli"

# Or use Codex
agent: "codex-cli"

# Or use Claude
agent: "claude-cli"
```

The script will automatically adapt the command format based on the agent type.

## Troubleshooting

### Agent Not Found

```
⚠️  Agent 'gemini-cli' not found in PATH
```

**Solution**: Install the agent or add it to your PATH:

```bash
# Check if installed
which gemini

# Add to PATH if needed
export PATH="$PATH:/path/to/agent"
```

### Timeout Issues

If checks are timing out, increase the timeout in `.agents/doc-review-config.yml`:

```yaml
checks:
  quick:
    timeout: 10 # Increase to 15 or 20
  standard:
    timeout: 30 # Increase to 45 or 60
```

### API Key Issues

```
Error: API key not found
```

**Solution**: Set the appropriate environment variable:

```bash
# Add to ~/.bashrc or ~/.zshrc
export GEMINI_API_KEY="your-key"
export OPENAI_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"
```

### Agent Returns Unexpected Format

The script expects output in this format:

```
✅ PASS: Check Name
⚠️ WARNING: Check Name - Issue description
❌ FAIL: Check Name - Detailed issue

RESULT: PASS/WARNING/FAIL
```

If your agent returns different format, you may need to add a custom adapter in the `run_agent()` function.

## Adding Custom Agents

To add support for a new AI CLI tool:

1. Edit `scripts/doc-agent-check.sh`
2. Add a new case in the `run_agent()` function:

```bash
your-agent-cli|your-agent)
    # Your agent's command format
    timeout "$timeout_duration" your-agent-cli \
        --your-prompt-flag="$(cat "$prompt_file")" \
        --your-context-flag="$context_files" \
        > "$result_file" 2>&1
    ;;
```

3. Update `.agents/doc-review-config.yml`:

```yaml
agent: 'your-agent-cli'

env:
  your_agent_model: 'model-name'
  your_agent_api_key: '${YOUR_API_KEY}'
```

## Testing

Test your agent configuration:

```bash
# Test quick check
DOC_AI_CHECK=true ./scripts/doc-agent-check.sh quick

# Test with verbose output
DOC_CHECK_VERBOSE=true ./scripts/doc-agent-check.sh standard
```

## Best Practices

1. **Start with Quick Checks**: Use `quick` level for pre-commit hooks to keep commits fast
2. **Use Standard for Pre-push**: More thorough checks before pushing
3. **Deep Checks for PRs**: Comprehensive audits for pull requests
4. **Disable When Needed**: Set `DOC_AI_CHECK=false` to skip AI checks temporarily
5. **Keep API Keys Secure**: Never commit API keys, use environment variables
6. **Monitor Costs**: AI API calls cost money, be mindful of usage

## See Also

- [AI Documentation Review Guide](AI_DOCUMENTATION_REVIEW.md)
- [Documentation Management](DOCUMENTATION_MANAGEMENT.md)
- [Agent Collaboration](../AGENTS.md)
