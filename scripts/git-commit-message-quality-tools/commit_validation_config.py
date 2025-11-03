"""
Shared configuration for commit message validation tools.

This module provides a single source of truth for validation rules,
constants, and configurations used across multiple validation tools.
"""

# Validation rule configuration
MAX_SUBJECT_LENGTH = 100
INCOMPLETE_LIST_THRESHOLD = 3

# Emoji list for detection
EMOJIS = [
    "📝", "✨", "🐛", "🔄", "⚡️", "🎨", "♻️", "🔧",
    "✅", "🔴", "⚠️", "❌", "⏳", "🚨", "🔍", "💡",
    "📊", "🎉", "🤖",
]

# Chinese character range (Unicode)
CHINESE_RANGE = ("\u4e00", "\u9fff")

# Issue type constants
ISSUE_CONTAINS_PLACEHOLDER = "contains-****"
ISSUE_SUBJECT_TOO_LONG = "subject-too-long"
ISSUE_CONTAINS_CHINESE = "contains-Chinese"
ISSUE_EMOJI_IN_SUBJECT = "emoji-in-subject"
ISSUE_MARKDOWN_IN_SUBJECT = "markdown-in-subject"
ISSUE_INVALID_FORMAT = "invalid-format"
ISSUE_EMOJI_FIRST_LINE = "emoji-first-line"
ISSUE_INCOMPLETE_LIST_ITEMS = "incomplete-list-items"
ISSUE_TOO_MANY_EMPTY_LINES = "too-many-empty-lines"
ISSUE_INCOMPLETE_SUBJECT_ENDING = "incomplete-subject-ending"
ISSUE_MULTIPLE_SPACES = "multiple-spaces"
ISSUE_MARKDOWN_CHAOS_IN_BODY = "markdown-chaos-in-body"
ISSUE_MALFORMED_CODE_BLOCKS = "malformed-code-blocks"

# Incomplete list markers
INCOMPLETE_LIST_MARKERS = [
    "-", "✅", "🔴", "⚠️",
    "1.", "2.", "3.", "4.", "5.", "6."
]
