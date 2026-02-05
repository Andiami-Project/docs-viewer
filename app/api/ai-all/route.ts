import { NextResponse } from 'next/server';
import { PROJECT_ROOTS, VALID_PROJECT_NAMES } from '@/lib/project-config';
import { getProjectMetadata } from '@/lib/project-metadata';
import fs from 'fs';
import path from 'path';

/**
 * AI-Accessible Bulk Documentation API
 * 
 * Returns ALL documentation content in a single JSON response.
 * This solves the "inner page access" problem for AI tools like Claude and ChatGPT.
 * 
 * Usage:
 * - Get all docs from all projects: /api/ai-all
 * - Get all docs from specific project: /api/ai-all?project=workspace-documentation
 * - Limit documents: /api/ai-all?limit=50
 * - Get summary only (no content): /api/ai-all?summary=true
 */

interface DocumentContent {
  project: string;
  file: string;
  title: string;
  content: string;
  size: number;
  lastModified: string;
  webUrl: string;
  apiUrl: string;
}

interface ProjectSummary {
  name: string;
  displayName: string;
  description: string;
  category: string;
  totalDocs: number;
  apiUrl: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectFilter = searchParams.get('project');
    const limitParam = searchParams.get('limit');
    const summaryOnly = searchParams.get('summary') === 'true';
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    // Validate project filter if provided
    if (projectFilter && !VALID_PROJECT_NAMES.has(projectFilter)) {
      return NextResponse.json(
        {
          error: 'Invalid project',
          availableProjects: Array.from(VALID_PROJECT_NAMES),
          usage: {
            allProjects: '/api/ai-all',
            singleProject: '/api/ai-all?project=<project-name>',
            withLimit: '/api/ai-all?limit=50',
            summaryOnly: '/api/ai-all?summary=true',
          }
        },
        { status: 400 }
      );
    }

    const baseUrl = 'https://y1.andiami.tech/docs-viewer';
    const projectsToProcess = projectFilter 
      ? [projectFilter] 
      : Array.from(VALID_PROJECT_NAMES);

    // Collect project summaries
    const projectSummaries: ProjectSummary[] = [];
    
    // Collect all documents
    const allDocuments: DocumentContent[] = [];
    let totalDocCount = 0;

    for (const projectName of projectsToProcess) {
      const projectRoot = PROJECT_ROOTS[projectName];
      const metadata = await getProjectMetadata(projectName);
      const files = getAllMarkdownFiles(projectRoot);

      projectSummaries.push({
        name: projectName,
        displayName: metadata?.displayName || projectName,
        description: metadata?.description || '',
        category: metadata?.category || 'uncategorized',
        totalDocs: files.length,
        apiUrl: `/api/ai-all?project=${projectName}`,
      });

      if (!summaryOnly) {
        for (const filePath of files) {
          // Apply limit if specified
          if (limit && allDocuments.length >= limit) {
            break;
          }

          const relativePath = path.relative(projectRoot, filePath);
          const content = fs.readFileSync(filePath, 'utf-8');
          const stats = fs.statSync(filePath);
          
          // Extract title from first heading
          const titleMatch = content.match(/^#\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.md');

          allDocuments.push({
            project: projectName,
            file: relativePath,
            title,
            content,
            size: stats.size,
            lastModified: stats.mtime.toISOString(),
            webUrl: `${baseUrl}/project/${projectName}/docs/${relativePath.replace('.md', '')}`,
            apiUrl: `/api/ai-docs?project=${projectName}&file=${relativePath}`,
          });

          totalDocCount++;
        }
      } else {
        totalDocCount += files.length;
      }

      // Break if limit reached
      if (limit && allDocuments.length >= limit) {
        break;
      }
    }

    // Build response
    const response: Record<string, unknown> = {
      message: 'AI-Accessible Bulk Documentation API',
      description: 'All documentation content in a single response for AI tools',
      generated: new Date().toISOString(),
      usage: {
        allProjects: '/api/ai-all',
        singleProject: '/api/ai-all?project=<project-name>',
        withLimit: '/api/ai-all?limit=50',
        summaryOnly: '/api/ai-all?summary=true',
        otherEndpoints: {
          search: '/api/ai-docs?search=<query>',
          singleDoc: '/api/ai-docs?project=<name>&file=<path>',
          sitemap: '/sitemap.txt',
          llmsConfig: '/llms.txt',
        }
      },
      summary: {
        totalProjects: projectSummaries.length,
        totalDocuments: summaryOnly ? totalDocCount : allDocuments.length,
        ...(limit && { limitApplied: limit }),
        ...(limit && allDocuments.length >= limit && { hasMore: true }),
      },
      projects: projectSummaries,
    };

    // Add documents if not summary only
    if (!summaryOnly) {
      response.documents = allDocuments;
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      }
    });

  } catch (error) {
    console.error('AI All API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Recursively get all markdown files in a directory
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
        } else if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('.')) {
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
