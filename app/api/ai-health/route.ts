import { NextResponse } from 'next/server';
import { VALID_PROJECT_NAMES } from '@/lib/project-config';

/**
 * Health check endpoint for AI access
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'AI Documentation API is accessible',
    timestamp: new Date().toISOString(),
    availableProjects: Array.from(VALID_PROJECT_NAMES),
    endpoints: {
      listProjects: '/api/ai-docs',
      listFiles: '/api/ai-docs?project=<project-name>',
      getDocument: '/api/ai-docs?project=<project-name>&file=<file-path>',
      search: '/api/ai-docs?search=<query>',
    },
    documentation: 'https://y1.andiami.tech/docs-viewer/api/ai-docs/page',
  });
}
