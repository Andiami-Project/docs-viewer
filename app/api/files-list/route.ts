import { NextResponse } from 'next/server';
import { PROJECT_ROOTS, VALID_PROJECT_NAMES } from '@/lib/project-config';
import fs from 'fs';
import path from 'path';

/**
 * Simplified file list API - returns flat array of all files
 * Optimized for AI tools that may have issues with large nested JSON
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');

    // Validate project
    if (!project || !VALID_PROJECT_NAMES.has(project)) {
      return NextResponse.json(
        {
          error: 'Invalid or missing project parameter',
          availableProjects: Array.from(VALID_PROJECT_NAMES),
          usage: '/api/files-list?project=<project-name>'
        },
        { status: 400 }
      );
    }

    const projectRoot = PROJECT_ROOTS[project];
    const files = getAllMarkdownFiles(projectRoot);

    // Convert to simple flat list with relative paths
    const fileList = files.map(filePath => {
      const relativePath = path.relative(projectRoot, filePath);
      const fileName = path.basename(filePath);

      return {
        name: fileName,
        path: relativePath,
        fullPath: filePath,
        url: `/api/content?project=${project}&file=${encodeURIComponent(relativePath)}`
      };
    });

    return NextResponse.json({
      project,
      totalFiles: fileList.length,
      files: fileList,
      note: 'Use the "url" field to fetch individual file content'
    });

  } catch (error) {
    console.error('Files List API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get all markdown files recursively
 */
function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  const skipDirs = new Set([
    'node_modules', '.git', '.next', 'dist', 'build',
    '.claude', '.omc', '.chat-analysis', '.playwright-mcp'
  ]);
  const isWorkspaceRoot = dir === '/home/ubuntu/workspace';

  function traverse(currentPath: string, depth: number = 0) {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory() && !skipDirs.has(entry.name)) {
          traverse(fullPath, depth + 1);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          // Skip dotfiles in workspace root
          if (isWorkspaceRoot && depth === 0 && entry.name.startsWith('.')) {
            continue;
          }
          files.push(fullPath);
        }
      }
    } catch (err) {
      console.error(`Cannot read ${currentPath}:`, err);
    }
  }

  traverse(dir);
  return files;
}
