import { NextResponse } from 'next/server';

/**
 * Minimal test endpoint to verify AI access works
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'AI API is working!',
    timestamp: new Date().toISOString(),
    nextSteps: [
      'Use /api/ai-simple?project=workspace-documentation&file=PM2-NATIVE-MEMORY-ARCHITECTURE.md',
      'Or browse projects at /api/projects',
    ],
  });
}
