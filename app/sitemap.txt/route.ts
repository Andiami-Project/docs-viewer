import { NextResponse } from 'next/server';
import { PROJECT_ROOTS, VALID_PROJECT_NAMES } from '@/lib/project-config';
import fs from 'fs';
import path from 'path';

/**
 * Generate a plain text sitemap of all documentation pages
 * This makes the docs-viewer fully crawlable by AI tools
 */
export async function GET() {
  const baseUrl = 'https://y1.andiami.tech/docs-viewer';
  const urls: string[] = [];

  // Add homepage
  urls.push(baseUrl);

  // Add each project page
  for (const projectName of VALID_PROJECT_NAMES) {
    urls.push(`${baseUrl}/project/${projectName}`);

    // Get all markdown files for this project
    const projectRoot = PROJECT_ROOTS[projectName];
    const files = getAllMarkdownFiles(projectRoot);

    for (const filePath of files) {
      const relativePath = path.relative(projectRoot, filePath);
      // Convert file path to URL path (remove .md extension)
      const urlPath = relativePath.replace(/\.md$/, '').replace(/\\/g, '/');
      urls.push(`${baseUrl}/project/${projectName}/docs/${urlPath}`);
    }
  }

  // Return as plain text, one URL per line
  return new NextResponse(urls.join('\n'), {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

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
