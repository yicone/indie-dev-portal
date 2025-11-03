#!/usr/bin/env python3
"""
AI Fix Helper
Displays commits that need fixing for AI to fill fixed_subject and fixed_body fields
"""

import json
import sys


def display_commit_for_fixing(commit: dict, index: int, total: int):
    """Display commit information for fixing"""
    print("=" * 80)
    print(f"Commit {index}/{total}: {commit['hash']}")
    print("=" * 80)
    print()
    print(f"📋 Original Subject:")
    print(f"  {commit['original_subject']}")
    print()
    print(f"📋 Original Body:")
    body_lines = commit["original_body"].split("\n")
    # Display complete body, no truncation
    for i, line in enumerate(body_lines, 1):
        print(f"  {i:2}| {line}")
    print()
    print(f"⚠️  Issues:")
    for issue in commit["issues"]:
        print(f"  - {issue}")
    print()
    print(f"💡 Fix Suggestions:")
    suggestions = get_fix_suggestions(commit["issues"], commit.get("original_body", ""))
    for suggestion in suggestions:
        print(f"  - {suggestion}")
    print()
    print("=" * 80)
    print()


def get_fix_suggestions(issues: list, body: str = "") -> list:
    """Generate fix suggestions based on issue types"""
    suggestions = []

    if "emoji-in-subject" in issues:
        suggestions.append("Remove emoji from subject")

    if "markdown-in-subject" in issues:
        suggestions.append("Remove markdown markers (##, ###) from subject")

    if "markdown-chaos-in-body" in issues:
        suggestions.append("Fix chaotic markdown markers in body")

    if "malformed-code-blocks" in issues:
        suggestions.append("Fix code block format, add line breaks")

    if any(i.startswith("subject-too-long") for i in issues):
        suggestions.append("Subject exceeds 100 characters, condense to core message")

    if "incomplete-subject-ending" in issues:
        suggestions.append("Remove incomplete ending (e.g., Setup:, UX improvements:)")

    if "multiple-spaces" in issues:
        suggestions.append("Clean up multiple consecutive spaces")

    if "contains-****" in issues:
        suggestions.append("Remove **** placeholders")

    if "contains-Chinese" in issues:
        suggestions.append("Remove or translate Chinese characters to English")

    if "incomplete-list-items" in issues:
        suggestions.append("Clean up incomplete list items (lines with only markers)")

    if "emoji-first-line" in issues:
        suggestions.append("Remove standalone emoji lines at the beginning of body")

    if "too-many-empty-lines" in issues:
        suggestions.append("Reduce excessive empty lines")

    if "invalid-format" in issues:
        suggestions.append("Ensure format follows: type(scope): description")

    # Check body length and add condensation suggestions
    if body:
        body_lines = len(body.split("\n"))
        body_chars = len(body)

        # Commitlint typically recommends body lines not exceed 100 characters, reasonable total length
        if body_lines > 50:
            suggestions.append(
                f"⚠️  Body is long ({body_lines} lines). Consider condensing to key points while preserving essential information"
            )
        elif body_chars > 2000:
            suggestions.append(
                f"⚠️  Body is lengthy ({body_chars} chars). Summarize verbose sections, keep technical details concise"
            )

    return suggestions


def main():
    """Main function"""
    input_file = "/tmp/unified_commit_fixes.json"

    print("=" * 80)
    print("AI Fix Helper")
    print("=" * 80)
    print()
    print("📝 Purpose:")
    print("  This tool displays commits that need fixing")
    print("  Provide this information to AI to fill fixed_subject and fixed_body")
    print()

    # Read file
    try:
        with open(input_file, "r", encoding="utf-8") as f:
            commits = json.load(f)
    except FileNotFoundError:
        print(f"❌ Error: File not found {input_file}")
        print()
        print("Please run the checker first:")
        print("  python3 /tmp/unified_commit_checker.py")
        print()
        return 1

    if not commits:
        print("✅ No commits need fixing!")
        return 0

    total = len(commits)
    print(f"📊 Total commits to fix: {total}")
    print()
    print("=" * 80)
    print()

    # Display all commits needing fixes
    for i, commit in enumerate(commits, 1):
        display_commit_for_fixing(commit, i, total)

    print("=" * 80)
    print("📝 Next Steps:")
    print("=" * 80)
    print()
    print("1. Provide the above information to AI")
    print()
    print("2. Request AI to generate for each commit:")
    print("   - fixed_subject: Fixed subject (≤100 characters)")
    print("   - fixed_body: Fixed body (preserve meaningful content)")
    print()
    print("3. After AI generates fixes, update JSON file:")
    print(f"   {input_file}")
    print()
    print("4. Execute fixes:")
    print("   /tmp/unified_commit_fixer.sh")
    print()
    print("📖 For detailed instructions, see:")
    print("   scripts/git-commit-message-quality-tools/ai_fix_helper_instructions.md")
    print()

    return 0


if __name__ == "__main__":
    exit(main())
