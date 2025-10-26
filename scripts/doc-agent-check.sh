#!/bin/bash
# scripts/doc-agent-check.sh
# AI-powered documentation review using configured agents

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONFIG_FILE=".agents/doc-review-config.yml"
LEVEL="${1:-quick}"  # quick, standard, deep
RESULT_FILE=".doc-review-result.txt"

# Check if config exists
if [[ ! -f "$CONFIG_FILE" ]]; then
    echo -e "${RED}❌ Configuration file not found: $CONFIG_FILE${NC}"
    exit 1
fi

# Check if AI checks are enabled
if [[ "${DOC_AI_CHECK}" == "false" ]]; then
    echo -e "${YELLOW}ℹ️  AI documentation checks disabled (DOC_AI_CHECK=false)${NC}"
    exit 0
fi

# Get changed markdown files
if git rev-parse --git-dir > /dev/null 2>&1; then
    CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.md$' || true)
    
    if [[ -z "$CHANGED_FILES" ]]; then
        echo -e "${GREEN}✅ No documentation changes detected${NC}"
        exit 0
    fi
else
    echo -e "${YELLOW}⚠️  Not in git context, checking all docs${NC}"
    CHANGED_FILES=$(find docs -name "*.md" 2>/dev/null || echo "")
fi

echo -e "${BLUE}🤖 Running $LEVEL level documentation checks...${NC}"
echo -e "${BLUE}📝 Changed files:${NC}"
echo "$CHANGED_FILES" | sed 's/^/   - /'
echo ""

# Read agent from config (simplified - in production use yq or similar)
AGENT=$(grep "^agent:" "$CONFIG_FILE" | cut -d'"' -f2)

if [[ -z "$AGENT" ]]; then
    echo -e "${YELLOW}⚠️  No agent configured, using gemini-cli as default${NC}"
    AGENT="gemini-cli"
fi

# Check if agent is available
# For gemini-cli, also check for 'gemini' command
AGENT_CMD="$AGENT"
if [[ "$AGENT" == "gemini-cli" ]]; then
    if command -v gemini &> /dev/null; then
        AGENT_CMD="gemini"
    elif ! command -v "$AGENT" &> /dev/null; then
        echo -e "${YELLOW}⚠️  Agent '$AGENT' (or 'gemini') not found in PATH${NC}"
        echo -e "${YELLOW}   Skipping AI checks. Install $AGENT or set DOC_AI_CHECK=false${NC}"
        exit 0
    fi
elif ! command -v "$AGENT" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Agent '$AGENT' not found in PATH${NC}"
    echo -e "${YELLOW}   Skipping AI checks. Install $AGENT or set DOC_AI_CHECK=false${NC}"
    exit 0
fi

# Build context files list
CONTEXT_FILES="AGENTS.md,docs/DOCUMENTATION_MANAGEMENT.md,docs/NAMING_CONVENTIONS.md"

# Build prompt based on level
case "$LEVEL" in
    quick)
        PROMPT=$(cat <<'EOF'
You are a documentation reviewer for this project.

Read these context files to understand the project documentation standards:
- AGENTS.md (agent collaboration protocol)
- docs/DOCUMENTATION_MANAGEMENT.md (documentation rules)
- docs/NAMING_CONVENTIONS.md (naming standards)

Changed files to review:
CHANGED_FILES_PLACEHOLDER

Perform QUICK checks:
1. File Naming Convention - Verify files follow naming conventions
2. Basic Structure - Check if files have proper markdown structure

Output format (one line per check):
✅ PASS: [check name]
⚠️ WARNING: [check name] - [brief issue]
❌ FAIL: [check name] - [detailed issue]

Keep it brief. Exit with summary line: "RESULT: PASS/WARNING/FAIL"
EOF
)
        PROMPT="${PROMPT//CHANGED_FILES_PLACEHOLDER/$CHANGED_FILES}"
        TIMEOUT=10
        ;;
    
    standard)
        PROMPT=$(cat <<'EOF'
You are a documentation reviewer for this project.

Read these context files to understand the project documentation standards:
- AGENTS.md (agent collaboration protocol)
- docs/DOCUMENTATION_MANAGEMENT.md (complete documentation rules and SSOT mapping)
- docs/NAMING_CONVENTIONS.md (naming standards)

Changed files to review:
CHANGED_FILES_PLACEHOLDER

Perform STANDARD checks:
1. SSOT Violations - Check for duplicate content without proper cross-referencing
2. Content Duplication - Flag >30% overlap without summary+link pattern
3. Documentation Structure - Verify files follow structure guidelines
4. Link Integrity - Check internal links (if not already done)

For each check, output:
✅ PASS: [check name]
⚠️ WARNING: [check name] - [issue with file reference]
❌ FAIL: [check name] - [detailed issue with file reference and line numbers if possible]

End with summary: "RESULT: PASS/WARNING/FAIL - [count] issues found"
EOF
)
        PROMPT="${PROMPT//CHANGED_FILES_PLACEHOLDER/$CHANGED_FILES}"
        TIMEOUT=30
        ;;
    
    deep)
        PROMPT=$(cat <<'EOF'
You are a documentation reviewer performing a comprehensive audit.

Read these context files:
- AGENTS.md
- docs/DOCUMENTATION_MANAGEMENT.md (use the quality checklist)
- docs/NAMING_CONVENTIONS.md
- docs/DOCUMENTATION_SYSTEM_SUMMARY.md

Changed files to review:
CHANGED_FILES_PLACEHOLDER

Perform COMPREHENSIVE audit:
1. SSOT compliance across all files
2. Link integrity and cross-references
3. Naming conventions adherence
4. Audience appropriateness
5. Index updates needed
6. CHANGELOG updates needed
7. Content quality and clarity

Provide detailed report with:
- Overall score (1-10)
- Issues categorized by severity (Critical/Warning/Info)
- Specific recommendations for each issue
- Files that need updates

Format:
=== DOCUMENTATION AUDIT REPORT ===
Score: [X/10]

Critical Issues:
- [issue]

Warnings:
- [issue]

Recommendations:
- [recommendation]

RESULT: PASS/WARNING/FAIL
EOF
)
        PROMPT="${PROMPT//CHANGED_FILES_PLACEHOLDER/$CHANGED_FILES}"
        TIMEOUT=60
        ;;
    
    *)
        echo -e "${RED}❌ Unknown level: $LEVEL${NC}"
        echo "   Valid levels: quick, standard, deep"
        exit 1
        ;;
esac

# Run the agent check
echo -e "${BLUE}🔍 Running $AGENT...${NC}"

# Create a temporary file for the prompt
PROMPT_FILE=$(mktemp)
echo "$PROMPT" > "$PROMPT_FILE"

# Function to run agent based on type (with timeout)
run_agent() {
    local agent="$1"
    local prompt_file="$2"
    local context_files="$3"
    local result_file="$4"
    local timeout_duration="$5"
    
    case "$agent" in
        gemini-cli|gemini)
            # Gemini CLI format: gemini -p "prompt with @file references"
            # Build prompt with @file references
            local prompt_with_context="Context files to read:"$'\n'
            IFS=',' read -ra FILES <<< "$context_files"
            for file in "${FILES[@]}"; do
                if [[ -f "$file" ]]; then
                    prompt_with_context+="@$file"$'\n'
                fi
            done
            prompt_with_context+=$'\n'
            local prompt_content
            prompt_content=$(<"$prompt_file")
            prompt_with_context+="$prompt_content"
            
            # Use the actual gemini command (not gemini-cli)
            $TIMEOUT_CMD "$timeout_duration" gemini \
                -p "$prompt_with_context" \
                > "$result_file" 2>&1
            ;;
            
        codex-cli|codex|openai-cli)
            # Codex/OpenAI CLI format: codex --prompt-file prompt.txt --context file1,file2
            $TIMEOUT_CMD "$timeout_duration" codex \
                --prompt-file="$prompt_file" \
                --context="$context_files" \
                --output="$result_file" \
                2>&1
            ;;
            
        claude-cli|claude)
            # Claude CLI format: claude --prompt "$(cat prompt.txt)" --files file1,file2
            $TIMEOUT_CMD "$timeout_duration" claude \
                --prompt "$(cat "$prompt_file")" \
                --files "$context_files" \
                > "$result_file" 2>&1
            ;;
            
        *)
            # Generic fallback - try common format
            echo -e "${YELLOW}⚠️  Unknown agent type: $agent, using generic format${NC}"
            $TIMEOUT_CMD "$timeout_duration" "$agent" \
                --prompt-file="$prompt_file" \
                --context="$context_files" \
                > "$result_file" 2>&1
            ;;
    esac
}

# Function to run agent without timeout
run_agent_no_timeout() {
    local agent="$1"
    local prompt_file="$2"
    local context_files="$3"
    local result_file="$4"
    
    case "$agent" in
        gemini-cli|gemini)
            # Gemini CLI format: gemini -p "prompt with @file references"
            local prompt_with_context="Context files to read:"$'\n'
            IFS=',' read -ra FILES <<< "$context_files"
            for file in "${FILES[@]}"; do
                if [[ -f "$file" ]]; then
                    prompt_with_context+="@$file"$'\n'
                fi
            done
            prompt_with_context+=$'\n'
            local prompt_content
            prompt_content=$(<"$prompt_file")
            prompt_with_context+="$prompt_content"
            
            gemini -p "$prompt_with_context" > "$result_file" 2>&1
            ;;
            
        codex-cli|codex|openai-cli)
            codex \
                --prompt-file="$prompt_file" \
                --context="$context_files" \
                --output="$result_file" \
                2>&1
            ;;
            
        claude-cli|claude)
            claude \
                --prompt "$(cat "$prompt_file")" \
                --files "$context_files" \
                > "$result_file" 2>&1
            ;;
            
        *)
            echo -e "${YELLOW}⚠️  Unknown agent type: $agent, using generic format${NC}"
            "$agent" \
                --prompt-file="$prompt_file" \
                --context="$context_files" \
                > "$result_file" 2>&1
            ;;
    esac
}

# Check if timeout command is available (not available on macOS by default)
TIMEOUT_CMD=""
if command -v timeout &> /dev/null; then
    TIMEOUT_CMD="timeout"
elif command -v gtimeout &> /dev/null; then
    TIMEOUT_CMD="gtimeout"
fi

# Run agent with timeout (if available)
set +e
if [[ -n "$TIMEOUT_CMD" ]]; then
    run_agent "$AGENT" "$PROMPT_FILE" "$CONTEXT_FILES" "$RESULT_FILE" "$TIMEOUT"
    AGENT_EXIT_CODE=$?
else
    echo -e "${YELLOW}⚠️  timeout command not available, running without timeout${NC}"
    echo -e "${YELLOW}   Install coreutils (brew install coreutils) for timeout support${NC}"
    # Run without timeout - modify run_agent to handle this
    run_agent_no_timeout "$AGENT" "$PROMPT_FILE" "$CONTEXT_FILES" "$RESULT_FILE"
    AGENT_EXIT_CODE=$?
fi
set -e

# Clean up
rm -f "$PROMPT_FILE"

# Check if timeout occurred
if [[ $AGENT_EXIT_CODE -eq 124 ]]; then
    echo -e "${YELLOW}⚠️  Agent check timed out after ${TIMEOUT}s${NC}"
    echo -e "${YELLOW}   Proceeding without AI validation${NC}"
    rm -f "$RESULT_FILE"
    exit 0
fi

# Check if agent failed
if [[ $AGENT_EXIT_CODE -ne 0 ]]; then
    echo -e "${YELLOW}⚠️  Agent check failed (exit code: $AGENT_EXIT_CODE)${NC}"
    if [[ -f "$RESULT_FILE" ]]; then
        echo -e "${YELLOW}   Error output:${NC}"
        cat "$RESULT_FILE" | head -20
    fi
    echo -e "${YELLOW}   Proceeding without AI validation${NC}"
    rm -f "$RESULT_FILE"
    exit 0
fi

# Display results
if [[ -f "$RESULT_FILE" ]]; then
    cat "$RESULT_FILE"
    echo ""
    
    # Check for failures
    if grep -q "❌ FAIL" "$RESULT_FILE"; then
        echo -e "${RED}❌ Documentation check failed${NC}"
        rm -f "$RESULT_FILE"
        exit 1
    elif grep -q "⚠️ WARNING" "$RESULT_FILE"; then
        echo -e "${YELLOW}⚠️  Documentation check passed with warnings${NC}"
        rm -f "$RESULT_FILE"
        exit 0
    else
        echo -e "${GREEN}✅ Documentation check passed${NC}"
        rm -f "$RESULT_FILE"
        exit 0
    fi
else
    echo -e "${YELLOW}⚠️  No result file generated${NC}"
    exit 0
fi
