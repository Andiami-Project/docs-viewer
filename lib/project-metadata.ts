import fs from 'fs';
import path from 'path';
import { parseMarkdownStructure, extractReadmePreview } from './markdown-parser';
import { PROJECT_ROOTS, VALID_PROJECT_NAMES } from './project-config';

// Static project metadata (no API dependency)
const PROJECT_INFO: Record<string, { displayName: string; description: string; category: string }> = {
  'workspace-docs': {
    displayName: 'Workspace Documentation',
    description: 'Comprehensive documentation for the entire workspace',
    category: 'infrastructure',
  },
  'wish-x': {
    displayName: 'Wish X',
    description: 'Main frontend application with Next.js and React',
    category: 'frontend',
  },
  'wish-backend-x': {
    displayName: 'Wish Backend X',
    description: 'Backend services powered by Trigger.dev',
    category: 'backend',
  },
  'doc-automation-hub': {
    displayName: 'Doc Automation Hub',
    description: 'Automated documentation generation and management',
    category: 'infrastructure',
  },
  'claude-agent-server': {
    displayName: 'Claude Agent Server',
    description: 'Claude AI agent server and utilities',
    category: 'tools',
  },
};

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

    // Get project info from static metadata
    const projectInfo = PROJECT_INFO[projectName];
    if (!projectInfo) {
      return null;
    }

    // Get actual project root path
    const projectRoot = PROJECT_ROOTS[projectName];

    if (!projectRoot || !fs.existsSync(projectRoot)) {
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
      name: projectName,
      displayName: projectInfo.displayName,
      description: projectInfo.description,
      category: projectInfo.category,
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
