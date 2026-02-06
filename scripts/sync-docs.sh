#!/bin/bash
set -e
DOCS_DIR="$(dirname "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)")/docs"
echo "Syncing to $DOCS_DIR/"

declare -A SOURCES
SOURCES["wish-x"]="/home/ubuntu/workspace/wish-x"
SOURCES["wish-backend-x"]="/home/ubuntu/workspace/wish-backend-x"
SOURCES["claude-agent-server"]="/home/ubuntu/workspace/claude-agent-server"
SOURCES["workspace-claude-documentation"]="/home/ubuntu/workspace/.claude"

for project in "${!SOURCES[@]}"; do
    src="${SOURCES[$project]}"
    dest="$DOCS_DIR/$project"
    echo "Syncing $project..."
    mkdir -p "$dest"
    [ -d "$src" ] && rsync -av --delete \
        --exclude='node_modules' --exclude='.git' --exclude='.next' \
        --exclude='dist' --exclude='build' --exclude='.trigger' \
        --exclude='.omc' --exclude='.chat-analysis' \
        --include='*/' --include='*.md' --exclude='*' \
        "$src/" "$dest/"
done

find "$DOCS_DIR" -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
echo "Done! $(find "$DOCS_DIR" -name '*.md' | wc -l) files"
