import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface DocFile {
  name: string;
  path: string;
  relativePath: string;
  type: 'file' | 'directory';
  children?: DocFile[];
}

const PROJECT_ROOTS = {
  'wish-x': '/home/ubuntu/workspace/wish-x',
  'wish-backend-x': '/home/ubuntu/workspace/wish-backend-x',
  'doc-automation-hub': '/home/ubuntu/workspace/doc-automation-hub',
  'claude-agent-server': '/home/ubuntu/workspace/claude-agent-server',
};

async function isDocFile(filePath: string): Promise<boolean> {
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath).toUpperCase();

  return ext === '.md' || ext === '.txt' || basename.startsWith('README');
}

async function buildFileTree(dirPath: string, basePath: string, maxDepth = 5, currentDepth = 0): Promise<DocFile[]> {
  if (currentDepth > maxDepth) return [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files: DocFile[] = [];

    for (const entry of entries) {
      // Skip node_modules, .git, .next, and other common directories
      if (entry.name === 'node_modules' || entry.name === '.git' ||
          entry.name === '.next' || entry.name === 'dist' ||
          entry.name === 'build' || entry.name.startsWith('.')) {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(basePath, fullPath);

      if (entry.isDirectory()) {
        const children = await buildFileTree(fullPath, basePath, maxDepth, currentDepth + 1);
        if (children.length > 0) {
          files.push({
            name: entry.name,
            path: fullPath,
            relativePath,
            type: 'directory',
            children,
          });
        }
      } else if (await isDocFile(fullPath)) {
        files.push({
          name: entry.name,
          path: fullPath,
          relativePath,
          type: 'file',
        });
      }
    }

    return files.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'directory' ? -1 : 1;
    });
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');

    if (project && PROJECT_ROOTS[project as keyof typeof PROJECT_ROOTS]) {
      const projectPath = PROJECT_ROOTS[project as keyof typeof PROJECT_ROOTS];
      const files = await buildFileTree(projectPath, projectPath);

      return NextResponse.json({
        project,
        files,
      });
    }

    // Return all projects structure
    const allProjects: Record<string, DocFile[]> = {};

    for (const [projectName, projectPath] of Object.entries(PROJECT_ROOTS)) {
      allProjects[projectName] = await buildFileTree(projectPath, projectPath);
    }

    return NextResponse.json(allProjects);
  } catch (error) {
    console.error('Error fetching docs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documentation' },
      { status: 500 }
    );
  }
}
