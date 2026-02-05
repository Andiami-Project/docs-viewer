import { NextResponse } from 'next/server';
import { PROJECT_ROOTS, VALID_PROJECT_NAMES } from '@/lib/project-config';
import fs from 'fs';
import path from 'path';

/**
 * llms.txt - Standard file for LLM/AI tool access instructions
 * Similar to robots.txt but specifically for AI assistants
 * 
 * This helps AI tools like Claude, ChatGPT, and others understand:
 * - What this site is about
 * - How to access documentation
 * - Which endpoints to use
 * - What content is available
 */

export async function GET() {
  const baseUrl = 'https://y1.andiami.tech/docs-viewer';
  
  // Count total documents
  let totalDocs = 0;
  for (const projectName of VALID_PROJECT_NAMES) {
    const projectRoot = PROJECT_ROOTS[projectName];
    totalDocs += countMarkdownFiles(projectRoot);
  }

  const content = `# As You Wish Ecosystem Documentation
# llms.txt - Instructions for AI Tools

## About
This is the documentation hub for the As You Wish Ecosystem.
Total documentation pages: ${totalDocs}
Total projects: ${VALID_PROJECT_NAMES.size}

## Quick Access (Single Fetch Solutions)

### Get ALL Documentation Content
Fetch this URL to get every document's full content in one JSON response:
${baseUrl}/api/ai-all

### Get Documentation Summary Only
${baseUrl}/api/ai-all?summary=true

### Get Single Project's Documentation
${baseUrl}/api/ai-all?project=workspace-documentation

## Available Projects
${Array.from(VALID_PROJECT_NAMES).map(name => `- ${name}: ${baseUrl}/api/ai-all?project=${name}`).join('\n')}

## API Endpoints

### Bulk Access (Recommended for AI)
- All content: ${baseUrl}/api/ai-all
- Summary: ${baseUrl}/api/ai-all?summary=true
- Limited: ${baseUrl}/api/ai-all?limit=50

### Individual Access
- List projects: ${baseUrl}/api/ai-docs
- List files: ${baseUrl}/api/ai-docs?project={project-name}
- Get document: ${baseUrl}/api/ai-docs?project={project-name}&file={file-path}
- Search: ${baseUrl}/api/ai-docs?search={query}

### Simple/Fast API
- ${baseUrl}/api/ai-simple

### Sitemap
- All URLs: ${baseUrl}/sitemap.txt

## Instructions for AI Assistants

1. To get all documentation at once, fetch: ${baseUrl}/api/ai-all
2. The response includes full content of all markdown files
3. Each document has: project, file path, title, content, and URLs
4. Use the search endpoint to find specific topics: /api/ai-docs?search={query}

## Content Types
- Markdown documentation (.md files)
- Technical specifications
- Architecture documents
- API documentation
- Setup guides
- Troubleshooting guides

## Project Descriptions
- workspace-documentation: General workspace documentation and guides
- workspace-claude-files: Claude AI configuration files
- wish-x: Frontend application (Next.js 15 + React 19)
- wish-backend-x: Backend services (Trigger.dev v4)
- claude-agent-server: AI agent server (WebSocket + Agent SDK)
- doc-automation-hub: Documentation automation tools

## Response Format
All API responses are JSON with the following structure:
- message: Description of the response
- projects: Array of project information
- documents: Array of document content (if requested)
- Each document includes: project, file, title, content, size, lastModified, webUrl, apiUrl

## Rate Limiting
No rate limiting is applied to documentation APIs.
Cache headers are set for 5 minutes on bulk endpoints.

## Contact
For issues with AI accessibility, the documentation viewer is maintained at:
/docs-viewer

Generated: ${new Date().toISOString()}
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}

function countMarkdownFiles(dir: string): number {
  let count = 0;
  const skipDirs = new Set([
    'node_modules', '.git', '.next', 'dist', 'build',
    '.claude', '.omc', '.chat-analysis', '.playwright-mcp'
  ]);

  function traverse(currentPath: string) {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory() && !skipDirs.has(entry.name)) {
          traverse(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('.')) {
          count++;
        }
      }
    } catch {
      // Ignore errors
    }
  }

  traverse(dir);
  return count;
}
