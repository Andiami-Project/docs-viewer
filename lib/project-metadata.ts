import fs from 'fs';
import path from 'path';
import { parseMarkdownStructure, extractReadmePreview } from './markdown-parser';

// Map project names to their actual root directories
const PROJECT_ROOTS: Record<string, string> = {
  'workspace-docs': '/home/ubuntu/workspace/.docs-viewer-data/workspace-docs',
  'wish-x': '/home/ubuntu/workspace/wish-x',
  'wish-backend-x': '/home/ubuntu/workspace/wish-backend-x',
  'doc-automation-hub': '/home/ubuntu/workspace/doc-automation-hub',
  'claude-agent-server': '/home/ubuntu/workspace/claude-agent-server',
};

// Valid project names for path traversal protection
const VALID_PROJECT_NAMES = new Set(Object.keys(PROJECT_ROOTS));

// Interfaces for API response data
interface ProjectData {
  name: string;
  displayName?: string;
  description?: string;
  category?: string;
}

interface CategoryData {
  projects?: ProjectData[];
}

export interface ProjectMetadata {
  name: string;
  displayName: string;
  description: string;
  category: string;
  stats: {
    totalDocs: number;
    lastUpdated: string;
    components: number;
  };
  readmePreview: string;
  readmeStructure?: {
    headings: Array<{ level: number; text: string; id: string }>;
    sections: Array<{ title: string; content: string }>;
    installCommands: string[];
  };
  keyDocs: Array<{
    title: string;
    path: string;
    type: 'api' | 'config' | 'guide' | 'example';
  }>;
}

export async function getProjectMetadata(projectName: string): Promise<ProjectMetadata | null> {
  try {
    // Validate project name to prevent path traversal
    if (!VALID_PROJECT_NAMES.has(projectName)) {
      return null;
    }

    // Get actual project root path
    const projectRoot = PROJECT_ROOTS[projectName];

    if (!projectRoot || !fs.existsSync(projectRoot)) {
      return null;
    }

    // Fetch project basic info from API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/docs-viewer/api/projects`);
    const data = await response.json();

    // Find project in the data structure
    let project = null;
    if (Array.isArray(data)) {
      project = data.find((p: ProjectData) => p.name === projectName);
    } else {
      for (const category of Object.values(data)) {
        const found = (category as CategoryData).projects?.find((p: ProjectData) => p.name === projectName);
        if (found) {
          project = found;
          break;
        }
      }
    }

    if (!project) {
      return null;
    }

    // Count markdown files
    const files = getAllMarkdownFiles(projectRoot);
    const totalDocs = files.length;

    // Get last modified time
    const stats = fs.statSync(projectRoot);
    const lastUpdated = stats.mtime.toISOString().split('T')[0];

    // Detect key documentation files
    const keyDocs = detectKeyDocs(files, projectRoot);

    // Get README preview and structure
    const readmePath = path.join(projectRoot, 'README.md');
    let readmePreview = '';
    let readmeStructure;

    if (fs.existsSync(readmePath)) {
      const readme = fs.readFileSync(readmePath, 'utf-8');
      readmePreview = extractReadmePreview(readme);

      const parsed = parseMarkdownStructure(readme);
      readmeStructure = {
        headings: parsed.headings,
        sections: parsed.sections,
        installCommands: parsed.installCommands,
      };
    }

    return {
      name: project.name,
      displayName: project.displayName || project.name,
      description: project.description || '',
      category: project.category || 'uncategorized',
      stats: {
        totalDocs,
        lastUpdated,
        components: keyDocs.filter(d => d.type === 'api' || d.type === 'config').length,
      },
      readmePreview,
      readmeStructure,
      keyDocs,
    };
  } catch (error) {
    console.error('Error fetching project metadata:', error);
    return null;
  }
}

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  function traverse(currentPath: string) {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        // Skip node_modules, .git, and other build directories
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next' || entry.name === 'dist') {
          continue;
        }

        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          traverse(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (err) {
      // Skip directories we don't have permission to read
      console.error(`Error reading directory ${currentPath}:`, err);
    }
  }

  traverse(dir);
  return files;
}

function detectKeyDocs(files: string[], basePath: string): ProjectMetadata['keyDocs'] {
  const keyDocs: ProjectMetadata['keyDocs'] = [];

  for (const file of files) {
    const relativePath = path.relative(basePath, file);
    const fileName = path.basename(file, '.md');
    const lowerName = fileName.toLowerCase();

    // Detect documentation type by file name
    let type: 'api' | 'config' | 'guide' | 'example' = 'guide';
    if (lowerName.includes('api') || lowerName.includes('endpoint')) {
      type = 'api';
    } else if (lowerName.includes('config') || lowerName.includes('setup')) {
      type = 'config';
    } else if (lowerName.includes('example') || lowerName.includes('demo')) {
      type = 'example';
    }

    // Only include top key docs
    if (
      lowerName === 'readme' ||
      lowerName === 'api' ||
      lowerName === 'config' ||
      lowerName.includes('getting-started') ||
      lowerName.includes('example')
    ) {
      keyDocs.push({
        title: fileName.replace(/-/g, ' ').replace(/_/g, ' '),
        path: `/${relativePath.replace(/\\/g, '/')}`,
        type,
      });
    }
  }

  return keyDocs.slice(0, 5);
}
