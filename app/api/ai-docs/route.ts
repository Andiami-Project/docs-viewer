import { NextResponse } from 'next/server';
import { PROJECT_ROOTS, VALID_PROJECT_NAMES } from '@/lib/project-config';
import { getProjectMetadata } from '@/lib/project-metadata';
import fs from 'fs';
import path from 'path';

/**
 * AI-Accessible Documentation API
 *
 * This endpoint provides documentation in a format optimized for AI consumption (Claude, ChatGPT, etc.)
 *
 * Usage:
 * 1. List all projects: /api/ai-docs
 * 2. List project files: /api/ai-docs?project=workspace-documentation
 * 3. Get document content: /api/ai-docs?project=workspace-documentation&file=PM2-NATIVE-MEMORY-ARCHITECTURE.md
 * 4. Search across projects: /api/ai-docs?search=authentication
 * 5. Get ALL content in bulk: /api/ai-docs?project=workspace-documentation&bulk=true
 * 6. Get files with content included: /api/ai-docs?project=workspace-documentation&include_content=true
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');
    const file = searchParams.get('file');
    const search = searchParams.get('search');
    const bulk = searchParams.get('bulk') === 'true';
    const includeContent = searchParams.get('include_content') === 'true';

    // Case 1: Search across all projects
    if (search) {
      return handleSearch(search);
    }

    // Case 2: No project specified - list all projects
    if (!project) {
      return handleListProjects();
    }

    // Validate project
    if (!VALID_PROJECT_NAMES.has(project)) {
      return NextResponse.json(
        {
          error: 'Invalid project',
          availableProjects: Array.from(VALID_PROJECT_NAMES)
        },
        { status: 400 }
      );
    }

    // Case 3: Bulk mode - return ALL files with content
    if (bulk || includeContent) {
      return handleBulkContent(project);
    }

    // Case 4: Project + file - return document content
    if (file) {
      return handleGetDocument(project, file);
    }

    // Case 5: Project only - list all files
    return handleListFiles(project);

  } catch (error) {
    console.error('AI Docs API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * List all available projects with metadata
 */
async function handleListProjects() {
  const projects = await Promise.all(
    Array.from(VALID_PROJECT_NAMES).map(async (name) => {
      const metadata = await getProjectMetadata(name);
      return {
        name,
        displayName: metadata?.displayName || name,
        description: metadata?.description || '',
        category: metadata?.category || 'uncategorized',
        totalDocs: metadata?.stats.totalDocs || 0,
        apiUrl: `/api/ai-docs?project=${name}`,
      };
    })
  );

  return NextResponse.json({
    message: 'Documentation Hub - AI-Accessible API',
    aiQuickAccess: {
      description: 'For AI tools - get ALL content in one request',
      allProjects: '/api/ai-all',
      singleProject: '/api/ai-all?project=<project-name>',
      llmsConfig: '/llms.txt',
    },
    usage: {
      listProjects: '/api/ai-docs',
      listFiles: '/api/ai-docs?project=<project-name>',
      getDocument: '/api/ai-docs?project=<project-name>&file=<file-path>',
      search: '/api/ai-docs?search=<query>',
      bulkContent: '/api/ai-docs?project=<project-name>&bulk=true',
    },
    projects,
  });
}

/**
 * List all markdown files in a project
 */
async function handleListFiles(projectName: string) {
  const projectRoot = PROJECT_ROOTS[projectName];
  const metadata = await getProjectMetadata(projectName);

  const files = getAllMarkdownFiles(projectRoot);

  const fileList = files.map(filePath => {
    const relativePath = path.relative(projectRoot, filePath);
    const fileName = path.basename(filePath);

    return {
      name: fileName,
      path: relativePath,
      apiUrl: `/api/ai-docs?project=${projectName}&file=${relativePath}`,
      webUrl: `https://y1.andiami.tech/docs-viewer/project/${projectName}/docs/${relativePath.replace('.md', '')}`,
    };
  });

  return NextResponse.json({
    project: projectName,
    displayName: metadata?.displayName || projectName,
    description: metadata?.description || '',
    totalFiles: fileList.length,
    files: fileList,
  });
}

/**
 * Get document content with metadata
 */
async function handleGetDocument(projectName: string, filePath: string) {
  const projectRoot = PROJECT_ROOTS[projectName];
  const fullPath = path.join(projectRoot, filePath);

  // Security: Ensure file is within project directory
  const normalizedPath = path.normalize(fullPath);
  if (!normalizedPath.startsWith(projectRoot)) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }

  // Check if file exists
  if (!fs.existsSync(normalizedPath)) {
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }

  // Read content
  const content = fs.readFileSync(normalizedPath, 'utf-8');
  const stats = fs.statSync(normalizedPath);

  // Extract title from first heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.md');

  return NextResponse.json({
    project: projectName,
    file: filePath,
    title,
    content,
    metadata: {
      size: stats.size,
      lastModified: stats.mtime.toISOString(),
    },
    webUrl: `https://y1.andiami.tech/docs-viewer/project/${projectName}/docs/${filePath.replace('.md', '')}`,
  });
}

/**
 * Get all documents with full content for a project (bulk mode)
 */
async function handleBulkContent(projectName: string) {
  const projectRoot = PROJECT_ROOTS[projectName];
  const metadata = await getProjectMetadata(projectName);
  const files = getAllMarkdownFiles(projectRoot);

  const documents = files.map(filePath => {
    const relativePath = path.relative(projectRoot, filePath);
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const stats = fs.statSync(filePath);
    
    // Extract title from first heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : fileName.replace('.md', '');

    return {
      name: fileName,
      path: relativePath,
      title,
      content,
      size: stats.size,
      lastModified: stats.mtime.toISOString(),
      apiUrl: `/api/ai-docs?project=${projectName}&file=${relativePath}`,
      webUrl: `https://y1.andiami.tech/docs-viewer/project/${projectName}/docs/${relativePath.replace('.md', '')}`,
    };
  });

  return NextResponse.json({
    project: projectName,
    displayName: metadata?.displayName || projectName,
    description: metadata?.description || '',
    totalFiles: documents.length,
    message: 'Bulk content mode - all documents with full content included',
    usage: {
      singleFile: `/api/ai-docs?project=${projectName}&file=<filename>`,
      listOnly: `/api/ai-docs?project=${projectName}`,
      search: `/api/ai-docs?search=<query>`,
      allProjects: `/api/ai-all`,
    },
    documents,
  }, {
    headers: {
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    }
  });
}

/**
 * Search across all projects
 */
async function handleSearch(query: string) {
  const results: any[] = [];
  const lowerQuery = query.toLowerCase();

  for (const projectName of VALID_PROJECT_NAMES) {
    const projectRoot = PROJECT_ROOTS[projectName];
    const files = getAllMarkdownFiles(projectRoot);

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lowerContent = content.toLowerCase();

      if (lowerContent.includes(lowerQuery)) {
        const relativePath = path.relative(projectRoot, filePath);
        const fileName = path.basename(filePath);

        // Extract context (50 chars before and after match)
        const matchIndex = lowerContent.indexOf(lowerQuery);
        const contextStart = Math.max(0, matchIndex - 50);
        const contextEnd = Math.min(content.length, matchIndex + query.length + 50);
        const context = content.slice(contextStart, contextEnd);

        results.push({
          project: projectName,
          file: relativePath,
          fileName,
          context: '...' + context + '...',
          apiUrl: `/api/ai-docs?project=${projectName}&file=${relativePath}`,
          webUrl: `https://y1.andiami.tech/docs-viewer/project/${projectName}/docs/${relativePath.replace('.md', '')}`,
        });
      }
    }
  }

  return NextResponse.json({
    query,
    totalResults: results.length,
    results: results.slice(0, 50), // Limit to 50 results
  });
}

/**
 * Recursively get all markdown files in a directory
 */
function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  const skipDirs = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.claude', '.omc']);

  function traverse(currentPath: string) {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory() && !skipDirs.has(entry.name)) {
          traverse(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('.')) {
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
