#!/bin/bash
# Sync documentation from source directories
# Run this script on the server where docs are located

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Syncing documentation to $PROJECT_DIR/projects/"

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
    dest="$PROJECT_DIR/projects/$project"
    
    echo "Syncing $project from $src..."
    
    mkdir -p "$dest"
    
    if [ -d "$src" ]; then
        # Excludes MUST come before includes in rsync
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

echo ""
echo "Sync complete!"
