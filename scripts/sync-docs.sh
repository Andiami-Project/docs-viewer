#!/bin/bash
# Sync documentation from source directories to docs/ folder
# Run this script on the server where docs are located

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DOCS_DIR="$PROJECT_DIR/docs"

echo "Syncing documentation to $DOCS_DIR/"

# Source directories (on the server)
declare -A SOURCES
SOURCES["workspace-claude-files"]="/home/ubuntu/workspace/.claude"
SOURCES["workspace-documentation"]="/home/ubuntu/workspace"
SOURCES["wish-x"]="/home/ubuntu/workspace/wish-x"
SOURCES["wish-backend-x"]="/home/ubuntu/workspace/wish-backend-x"
SOURCES["doc-automation-hub"]="/home/ubuntu/workspace/doc-automation-hub"
SOURCES["claude-agent-server"]="/home/ubuntu/workspace/claude-agent-server"

for project in "${!SOURCES[@]}"; do
    src="${SOURCES[$project]}"
    dest="$DOCS_DIR/$project"
    
    echo "Syncing $project from $src..."
    
    mkdir -p "$dest"
    
    if [ -d "$src" ]; then
        rsync -av --delete \
            --exclude='node_modules' \
            --exclude='.git' \
            --exclude='.next' \
            --exclude='dist' \
            --exclude='build' \
            --exclude='.omc' \
            --exclude='.chat-analysis' \
            --exclude='.playwright-mcp' \
            --exclude='docs-viewer' \
            --exclude='.claude' \
            --exclude='*.log' \
            --exclude='.env*' \
            --exclude='.turbo' \
            --exclude='coverage' \
            --exclude='.cache' \
            --include='*/' \
            --include='*.md' \
            --include='*.mdx' \
            --exclude='*' \
            "$src/" "$dest/"
        
        echo "  ✓ Synced $project"
    else
        echo "  ⚠ Source not found: $src"
    fi
done

# Clean up any node_modules that might have slipped through
find "$DOCS_DIR" -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
find "$DOCS_DIR" -type d -name ".git" -exec rm -rf {} + 2>/dev/null || true
find "$DOCS_DIR" -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true

echo ""
echo "Sync complete! Files: $(find "$DOCS_DIR" -name '*.md' | wc -l) markdown files"
