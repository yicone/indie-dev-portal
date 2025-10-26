#!/bin/bash
# scripts/check-links.sh
# Quick link checker for documentation files

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔗 Checking documentation links..."

# Get changed markdown files (if in git context)
if git rev-parse --git-dir > /dev/null 2>&1; then
    CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.md$' || true)
    if [[ -z "$CHANGED_FILES" ]]; then
        echo -e "${GREEN}✅ No markdown files changed${NC}"
        exit 0
    fi
    FILES_TO_CHECK="$CHANGED_FILES"
else
    # Not in git context, check all docs
    FILES_TO_CHECK=$(find . -name "*.md" -not -path "*/node_modules/*" -not -path "*/.git/*")
fi

ERRORS=0
WARNINGS=0

# Check for broken internal links
for file in $FILES_TO_CHECK; do
    echo "  Checking: $file"
    
    # Extract markdown links [text](path)
    while IFS= read -r link; do
        # Skip external links (http/https)
        if [[ "$link" =~ ^https?:// ]]; then
            continue
        fi
        
        # Skip anchors only (#section)
        if [[ "$link" =~ ^# ]]; then
            continue
        fi
        
        # Get the file path (remove anchor if present)
        link_path="${link%%#*}"
        
        # Resolve relative path
        dir=$(dirname "$file")
        if [[ "$link_path" == /* ]]; then
            # Absolute path from repo root
            target_file="${link_path#/}"
        else
            # Relative path
            target_file="$dir/$link_path"
        fi
        
        # Normalize path
        target_file=$(realpath -m "$target_file" 2>/dev/null || echo "$target_file")
        
        # Check if file exists
        if [[ ! -f "$target_file" && ! -d "$target_file" ]]; then
            echo -e "  ${RED}❌ Broken link in $file: $link${NC}"
            echo -e "     Target not found: $target_file"
            ((ERRORS++))
        fi
        
    done < <(grep -oP '\]\(\K[^)]+' "$file" 2>/dev/null || true)
    
    # Check for common issues
    # 1. cci:// style links (prohibited by global rules)
    if grep -q 'cci://' "$file" 2>/dev/null; then
        echo -e "  ${RED}❌ Prohibited 'cci://' style link found in $file${NC}"
        grep -n 'cci://' "$file"
        ((ERRORS++))
    fi
    
    # 2. Trailing spaces in links
    if grep -E '\]\([^)]*\s+\)' "$file" >/dev/null 2>&1; then
        echo -e "  ${YELLOW}⚠️  Warning: Link with trailing space in $file${NC}"
        ((WARNINGS++))
    fi
done

echo ""
if [[ $ERRORS -gt 0 ]]; then
    echo -e "${RED}❌ Found $ERRORS broken link(s)${NC}"
    exit 1
elif [[ $WARNINGS -gt 0 ]]; then
    echo -e "${YELLOW}⚠️  Found $WARNINGS warning(s)${NC}"
    echo -e "${GREEN}✅ No critical errors, proceeding...${NC}"
    exit 0
else
    echo -e "${GREEN}✅ All links are valid${NC}"
    exit 0
fi
