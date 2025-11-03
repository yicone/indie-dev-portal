#!/usr/bin/env python3
"""
Unified Git Commit Message Checker
Integrates all previously used validation rules
"""

import subprocess
import json
import re
from typing import List, Dict, Tuple
from commit_validation_config import (
    MAX_SUBJECT_LENGTH,
    EMOJIS,
    CHINESE_RANGE,
    INCOMPLETE_LIST_THRESHOLD,
    INCOMPLETE_LIST_MARKERS,
)


class CommitChecker:
    """Commit message checker"""

    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.problems = []

    def get_all_commits(self) -> List[Dict]:
        """Get all commits"""
        # Use special separator to avoid newline issues in body
        separator = "<<<COMMIT_SEP>>>"
        result = subprocess.run(
            ["git", "log", f"--format=%H|||%s|||%b{separator}", "--all"],
            capture_output=True,
            text=True,
            cwd=self.repo_path,
        )

        commits = []
        # Split each commit by separator
        commit_blocks = result.stdout.strip().split(separator)

        for block in commit_blocks:
            if not block.strip():
                continue

            parts = block.split("|||", 2)  # Split into max 3 parts
            if len(parts) < 2:
                continue

            commits.append(
                {
                    "full_hash": parts[0].strip(),
                    "hash": parts[0].strip()[:7],
                    "subject": parts[1].strip() if len(parts) > 1 else "",
                    "body": parts[2].strip() if len(parts) > 2 else "",
                }
            )

        return commits

    def check_commit(self, commit: Dict) -> Tuple[bool, List[str]]:
        """Check single commit, returns (has_problem, issue_list)"""
        subject = commit["subject"]
        body = commit["body"]
        issues = []

        # Rule 1: Check **** placeholder
        if "****" in subject or "****" in body:
            issues.append("contains-****")

        # Rule 2: Check subject length
        if len(subject) > MAX_SUBJECT_LENGTH:
            issues.append(f"subject-too-long-{len(subject)}")

        # Rule 3: Check Chinese characters
        if any(
            CHINESE_RANGE[0] <= c <= CHINESE_RANGE[1] for c in subject + body
        ):
            issues.append("contains-Chinese")

        # Rule 4: Check emoji in subject
        if any(emoji in subject for emoji in EMOJIS):
            issues.append("emoji-in-subject")

        # Rule 5: Check markdown markers in subject
        if "##" in subject or "###" in subject:
            issues.append("markdown-in-subject")

        # Rule 6: Check subject format (should be type(scope): description)
        if not re.match(r"^[a-z]+(\([^)]+\))?:\s+.+", subject):
            issues.append("invalid-format")

        # Rule 7: Check if body starts with standalone emoji line
        body_lines = body.split("\n")
        if body_lines and body_lines[0].strip() in EMOJIS:
            issues.append("emoji-first-line")

        # Rule 8: Check incomplete list items
        incomplete_items = sum(
            1
            for line in body_lines
            if line.strip() in INCOMPLETE_LIST_MARKERS
        )
        if incomplete_items > INCOMPLETE_LIST_THRESHOLD:
            issues.append("incomplete-list-items")

        # Rule 9: Check too many empty lines
        empty_lines = sum(1 for line in body_lines if not line.strip())
        if empty_lines > len(body_lines) * 0.3 and len(body_lines) > 10:
            issues.append("too-many-empty-lines")

        # Rule 10: Check incomplete subject ending
        if re.search(r"\s+(proposal|tasks|\.\.\.)\s*$", subject):
            issues.append("incomplete-subject-ending")

        # Rule 11: Check multiple spaces in subject
        if "  " in subject:
            issues.append("multiple-spaces")

        # Rule 12: Check chaotic markdown markers in body
        if body:
            # Check for isolated ## or ### markers (no space after or in middle of line)
            markdown_chaos = 0
            for line in body_lines:
                # Isolated markdown marker
                if re.search(r"[^\s]##|##[^\s#]", line):
                    markdown_chaos += 1
                # Markdown marker in middle of line
                if re.search(r"\s##\s.*\S", line) and not line.strip().startswith("##"):
                    markdown_chaos += 1

            if markdown_chaos > 2:
                issues.append("markdown-chaos-in-body")

        # Rule 13: Check code block format
        if body:
            # Check for code block markers without line breaks
            inline_code_blocks = re.findall(r"```\w+[^`]{50,}```", body)
            if inline_code_blocks:
                issues.append("malformed-code-blocks")

        return len(issues) > 0, issues

    def check_all(self) -> List[Dict]:
        """Check all commits"""
        print("🔍 Starting check of all commits...")
        print()

        commits = self.get_all_commits()
        print(f"📊 Total {len(commits)}  commits")
        print()

        problems = []
        for commit in commits:
            has_problem, issues = self.check_commit(commit)
            if has_problem:
                problems.append(
                    {
                        "hash": commit["hash"],
                        "full_hash": commit["full_hash"],
                        "original_subject": commit["subject"],
                        "original_body": commit["body"],
                        "issues": issues,
                    }
                )

        self.problems = problems
        return problems

    def generate_fixes(self) -> List[Dict]:
        """Generate fix plan for all problematic commits (without auto-fix content)"""
        print(f"🔧 to {len(self.problems)}  problematic commits generating fix plan...")
        print()

        fixes = []
        for problem in self.problems:
            fixes.append(
                {
                    "hash": problem["hash"],
                    "full_hash": problem["full_hash"],
                    "original_subject": problem["original_subject"],
                    "original_body": problem["original_body"],  # Fully preserved, no truncation
                    "issues": problem["issues"],
                    "fixed_subject": "",  # Reserved field, populated by AI
                    "fixed_body": "",  # Reserved field, populated by AI
                }
            )

        return fixes

    def save_report(self, output_file: str):
        """Save check report"""
        fixes = self.generate_fixes()

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(fixes, f, indent=2, ensure_ascii=False)

        print(f"✅ Fix plan saved to: {output_file}")
        return fixes


def main():
    """Main function"""
    import os

    # Auto-detect repository path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_path = os.path.abspath(os.path.join(script_dir, "../.."))
    output_file = "/tmp/unified_commit_fixes.json"

    print("=" * 60)
    print("Git Commit Message Unified Checker")
    print("=" * 60)
    print()

    # Create checker
    checker = CommitChecker(repo_path)

    # Check all commits
    problems = checker.check_all()

    if not problems:
        print("🎉 Excellent\! All commits comply with standards\!")
        print()
        return 0

    # Display issue statistics
    print(f"⚠️  Found {len(problems)}  problematic commits")
    print()

    # Count issue types
    issue_types = {}
    for problem in problems:
        for issue in problem["issues"]:
            # Categorize subject-too-long
            issue_key = issue
            if issue.startswith("subject-too-long-"):
                issue_key = "subject-too-long"

            if issue_key not in issue_types:
                issue_types[issue_key] = 0
            issue_types[issue_key] += 1

    print("Issue type statistics:")
    for issue_type, count in sorted(
        issue_types.items(), key=lambda x: x[1], reverse=True
    ):
        print(f"  {issue_type}: {count} commits")
    print()

    # Display first 10 problematic commits
    print("First 10  problematic commits:")
    for i, problem in enumerate(problems[:10], 1):
        print(f"{i}. {problem['hash']} - {problem['original_subject'][:60]}...")
        print(f"   Issues: {', '.join(problem['issues'])}")

    if len(problems) > 10:
        print(f"... ... and {len(problems) - 10} ")
    print()

    # Generate and save fix plan
    fixes = checker.save_report(output_file)

    print()
    print("=" * 60)
    print("Check complete\!")
    print("=" * 60)
    print()
    print("📊 Statistics:")
    print(f"  - Total commits: {len(checker.get_all_commits())}")
    print(f"  - Problematic commits: {len(problems)}")
    print(f"  - Fix plans: {len(fixes)}")
    print()
    print("⚠️  Note:")
    print("  - fixed_subject and fixed_body fields are empty")
    print("  - Need AI to populate fix content based on context")
    print()
    print("📝 Next steps:")
    print(f"  1. View issue list: cat {output_file}")
    print("  2. Use AI to populate fix content: python3 /tmp/ai_fix_helper.py")
    print("  3. Execute fixes: /tmp/unified_commit_fixer.sh")
    print()

    return 0


if __name__ == "__main__":
    exit(main())
