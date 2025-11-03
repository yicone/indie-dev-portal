#!/usr/bin/env python3
"""
Commit Message Validator for Git Hooks
Validates a single commit message file (used by .husky/commit-msg)
"""

import sys
import re
from typing import List, Tuple
from commit_validation_config import (
    MAX_SUBJECT_LENGTH,
    EMOJIS,
    CHINESE_RANGE,
    INCOMPLETE_LIST_THRESHOLD,
    INCOMPLETE_LIST_MARKERS,
)


class CommitMessageValidator:
    """Validates a single commit message"""

    def __init__(self, message: str):
        self.message = message
        lines = message.strip().split("\n")
        self.subject = lines[0] if lines else ""
        self.body = "\n".join(lines[2:]) if len(lines) > 2 else ""

    def validate(self) -> Tuple[bool, List[str]]:
        """Validate commit message, returns (is_valid, error_messages)"""
        errors = []

        # Rule 1: Check **** placeholder
        if "****" in self.subject or "****" in self.body:
            errors.append("❌ Contains **** placeholder - please replace with actual content")

        # Rule 3: Check Chinese characters
        if any(CHINESE_RANGE[0] <= c <= CHINESE_RANGE[1] 
               for c in self.subject + self.body):
            errors.append("❌ Contains Chinese characters - use English only")

        # Rule 4: Check emoji in subject
        if any(emoji in self.subject for emoji in EMOJIS):
            errors.append("❌ Subject contains emoji - remove emoji from subject line")

        # Rule 5: Check markdown markers in subject
        if "##" in self.subject or "###" in self.subject:
            errors.append("❌ Subject contains markdown markers (## or ###)")

        # Rule 7: Check if body starts with standalone emoji line
        body_lines = self.body.split("\n")
        if body_lines and body_lines[0].strip() in EMOJIS:
            errors.append("❌ Body starts with standalone emoji line")

        # Rule 8: Check incomplete list items
        incomplete_items = sum(
            1 for line in body_lines
            if line.strip() in INCOMPLETE_LIST_MARKERS
        )
        if incomplete_items > INCOMPLETE_LIST_THRESHOLD:
            errors.append(
                f"❌ Too many incomplete list items ({incomplete_items}) - "
                f"threshold is {INCOMPLETE_LIST_THRESHOLD}"
            )

        # Rule 9: Check too many empty lines
        if body_lines:
            empty_lines = sum(1 for line in body_lines if not line.strip())
            if empty_lines > len(body_lines) * 0.3 and len(body_lines) > 10:
                errors.append(
                    f"❌ Too many empty lines ({empty_lines}/{len(body_lines)}) - "
                    f"exceeds 30% threshold"
                )

        # Rule 10: Check incomplete subject ending
        if re.search(r"\s+(proposal|tasks|\.\.\.)\s*$", self.subject):
            errors.append("❌ Subject has incomplete ending (proposal/tasks/...)")

        # Rule 11: Check multiple spaces in subject
        if "  " in self.subject:
            errors.append("❌ Subject contains multiple consecutive spaces")

        # Rule 12: Check chaotic markdown markers in body
        if self.body:
            markdown_chaos = 0
            for line in body_lines:
                # Isolated markdown marker
                if re.search(r"[^\s]##|##[^\s#]", line):
                    markdown_chaos += 1
                # Markdown marker in middle of line
                if re.search(r"\s##\s.*\S", line) and not line.strip().startswith("##"):
                    markdown_chaos += 1

            if markdown_chaos > 2:
                errors.append(
                    f"❌ Chaotic markdown markers in body ({markdown_chaos} issues) - "
                    "use proper markdown formatting"
                )

        # Rule 13: Check malformed code blocks
        if self.body:
            inline_code_blocks = re.findall(r"```\w+[^`]{50,}```", self.body)
            if inline_code_blocks:
                errors.append(
                    "❌ Malformed code blocks detected - "
                    "code blocks should have line breaks, not inline"
                )

        return len(errors) == 0, errors


def main():
    """Main function for commit-msg hook"""
    if len(sys.argv) < 2:
        print("Usage: commit_msg_validator.py <commit-msg-file>")
        sys.exit(1)

    commit_msg_file = sys.argv[1]

    try:
        with open(commit_msg_file, "r", encoding="utf-8") as f:
            message = f.read()
    except Exception as e:
        print(f"❌ Error reading commit message file: {e}")
        sys.exit(1)

    # Skip validation for merge commits, revert commits, etc.
    if message.startswith("Merge ") or message.startswith("Revert "):
        sys.exit(0)

    validator = CommitMessageValidator(message)
    is_valid, errors = validator.validate()

    if not is_valid:
        print()
        print("=" * 80)
        print("❌ COMMIT MESSAGE VALIDATION FAILED")
        print("=" * 80)
        print()
        print("The following issues were found:")
        print()
        for error in errors:
            print(f"  {error}")
        print()
        print("=" * 80)
        print("Please fix these issues and try again.")
        print("=" * 80)
        print()
        sys.exit(1)

    # Success - silent exit
    sys.exit(0)


if __name__ == "__main__":
    main()
