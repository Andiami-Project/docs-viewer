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

# Directories to skip
SKIP_DIRS="node_modules .git .next dist build .claude .omc .chat-analysis .playwright-mcp"

for project in "${!SOURCES[@]}"; do
    src="${SOURCES[$project]}"
    dest="$PROJECT_DIR/projects/$project"
    
    echo "Syncing $project from $src..."
    
    # Create destination if not exists
    mkdir -p "$dest"
    
    # Find and copy markdown files, preserving directory structure
    if [ -d "$src" ]; then
        # Build exclude pattern
        excludes=""
        for skip in $SKIP_DIRS; do
            excludes="$excludes --exclude=$skip"
        done
        
        # Use rsync to sync markdown files
        rsync -av --delete \
            --include='*/' \
            --include='*.md' \
            --include='*.mdx' \
            --exclude='*' \
            $excludes \
            "$src/" "$dest/"
        
        echo "  ✓ Synced $project"
    else
        echo "  ⚠ Source not found: $src"
    fi
done

echo ""
echo "Sync complete! Now run: npm run build"
