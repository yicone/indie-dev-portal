# AI Fix Helper - Instructions for AI

## Purpose

This tool displays commits that need fixing and provides suggestions for AI to generate proper fixes.

## Usage

```bash
python3 .windsurf/tools/ai_fix_helper.py
```

## Output Format

For each commit, the tool displays:

1. **Original Subject**: The current commit subject (may contain issues)
2. **Original Body**: The complete commit body (not truncated)
3. **Issues**: List of detected problems
4. **Fix Suggestions**: Recommendations for fixing

## AI Instructions

When you see this output, please:

### 1. Generate Fixed Subject

Requirements:

- Maximum 100 characters
- Remove all emoji
- Remove markdown markers (##, ###)
- Remove incomplete endings
- Follow format: `type(scope): description`
- Keep core message clear and concise

### 2. Generate Fixed Body

Requirements:

- Remove incomplete list items (lines with only markers like `-`, `✅`, `1.`)
- Remove standalone emoji lines
- Clean up excessive empty lines
- Remove `****` placeholders
- Preserve all meaningful information
- Structure content clearly with proper sections
- If body is very long (>50 lines or >2000 chars), condense while keeping:
  - Problem description
  - Root cause
  - Solution
  - Key technical details
  - Test results

### 3. Body Length Guidelines

**Commitlint Best Practices**:

- Each line should be ≤100 characters (wrap long lines)
- Total body length: reasonable (typically <50 lines)
- Be concise but complete
- Use bullet points for lists
- Use sections for organization

**When body is too long**:

- Summarize verbose sections
- Keep technical details concise
- Remove redundant information
- Preserve essential context

### 4. Update JSON File

After generating fixes for all commits, update `/tmp/unified_commit_fixes.json`:

```json
{
  "hash": "abc1234",
  "full_hash": "abc1234...",
  "original_subject": "...",
  "original_body": "...",
  "issues": ["..."],
  "fixed_subject": "YOUR FIXED SUBJECT HERE",
  "fixed_body": "YOUR FIXED BODY HERE"
}
```

## Example

### Input

```
Original Subject: feat(phase2): implement session rename functionality✨  (MVP )##  session
Original Body:
  1| Implementation details...
  2| -
  3| ✅
  4| - Feature 1
  ...
Issues: emoji-in-subject, markdown-in-subject, incomplete-list-items
```

### Output

```json
{
  "fixed_subject": "feat(phase2): implement session rename functionality",
  "fixed_body": "Implemented session rename feature.\n\nFeatures:\n- API endpoint\n- UI validation\n- Real-time updates\n\nTesting: Unit tests completed"
}
```

## Notes

- Complete body is shown (not truncated) to provide full context
- Body length warnings help identify commits that need condensing
- All suggestions are in English for consistency
- Preserve technical accuracy while improving clarity
