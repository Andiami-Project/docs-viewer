import { NextResponse } from 'next/server';
import { PROJECT_ROOTS, VALID_PROJECT_NAMES } from '@/lib/project-config';
import fs from 'fs';
import path from 'path';

/**
 * Simplified AI-Accessible Documentation API (No metadata scanning)
 *
 * This is a lightweight version that doesn't scan all files upfront.
 * Much faster for AI tools that need quick responses.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');
    const file = searchParams.get('file');

    // Case 1: List projects (no scanning)
    if (!project) {
      const projects = Array.from(VALID_PROJECT_NAMES).map(name => ({
        name,
        path: PROJECT_ROOTS[name],
        apiUrl: `/api/ai-simple?project=${name}`,
      }));

      return NextResponse.json({
        message: 'AI Documentation API - Simple/Fast Version',
        usage: {
          listProjects: '/api/ai-simple',
          getDocument: '/api/ai-simple?project=<name>&file=<path>',
        },
        projects,
      });
    }

    // Validate project
    if (!VALID_PROJECT_NAMES.has(project)) {
      return NextResponse.json(
        { error: 'Invalid project', available: Array.from(VALID_PROJECT_NAMES) },
        { status: 400 }
      );
    }

    // Case 2: Get document
    if (file) {
      const projectRoot = PROJECT_ROOTS[project];
      const fullPath = path.join(projectRoot, file);
      const normalizedPath = path.normalize(fullPath);

      // Security check
      if (!normalizedPath.startsWith(projectRoot)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // Check exists
      if (!fs.existsSync(normalizedPath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

      // Read content
      const content = fs.readFileSync(normalizedPath, 'utf-8');
      const stats = fs.statSync(normalizedPath);
      const titleMatch = content.match(/^#\s+(.+)$/m);

      return NextResponse.json({
        project,
        file,
        title: titleMatch ? titleMatch[1] : path.basename(file, '.md'),
        content,
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
      });
    }

    // Case 3: Project specified but no file - return instructions
    return NextResponse.json({
      project,
      message: 'Specify a file parameter to retrieve document content',
      example: `/api/ai-simple?project=${project}&file=README.md`,
    });

  } catch (error) {
    console.error('AI Simple API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
