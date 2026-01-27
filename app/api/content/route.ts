import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const PROJECT_ROOTS = {
  'wish-x': '/home/ubuntu/workspace/wish-x',
  'wish-backend-x': '/home/ubuntu/workspace/wish-backend-x',
  'doc-automation-hub': '/home/ubuntu/workspace/doc-automation-hub',
  'claude-agent-server': '/home/ubuntu/workspace/claude-agent-server',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');
    const filePath = searchParams.get('file');

    if (!project || !filePath) {
      return NextResponse.json(
        { error: 'Missing project or file parameter' },
        { status: 400 }
      );
    }

    const projectRoot = PROJECT_ROOTS[project as keyof typeof PROJECT_ROOTS];
    if (!projectRoot) {
      return NextResponse.json(
        { error: 'Invalid project' },
        { status: 400 }
      );
    }

    // Security: Ensure the file path is within the project directory
    const fullPath = path.join(projectRoot, filePath);
    const normalizedPath = path.normalize(fullPath);

    if (!normalizedPath.startsWith(projectRoot)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const content = await fs.readFile(normalizedPath, 'utf-8');

    return NextResponse.json({
      project,
      filePath,
      content,
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    );
  }
}
