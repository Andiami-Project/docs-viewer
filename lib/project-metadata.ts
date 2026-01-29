import fs from 'fs';
import path from 'path';

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
  keyDocs: Array<{
    title: string;
    path: string;
    type: 'api' | 'config' | 'guide' | 'example';
  }>;
}

export async function getProjectMetadata(projectName: string): Promise<ProjectMetadata | null> {
  try {
    // Path to documentation data
    const docsPath = path.join(process.cwd(), '.docs-viewer-data', projectName);

    if (!fs.existsSync(docsPath)) {
      return null;
    }

    // Read projects data to get display info
    const projectsFile = path.join(process.cwd(), '.docs-viewer-data', 'projects.json');
    let project = null;

    if (fs.existsSync(projectsFile)) {
      const projectsData = JSON.parse(fs.readFileSync(projectsFile, 'utf-8'));

      // Find project in the data structure
      if (Array.isArray(projectsData)) {
        project = projectsData.find((p: any) => p.name === projectName);
      } else {
        // Check each category
        for (const category of Object.values(projectsData)) {
          const found = (category as any).projects?.find((p: any) => p.name === projectName);
          if (found) {
            project = found;
            break;
          }
        }
      }
    }

    if (!project) {
      // Fallback to basic info if not found in projects.json
      project = {
        name: projectName,
        displayName: projectName,
        description: '',
        category: 'uncategorized'
      };
    }

    // Count markdown files
    const files = getAllMarkdownFiles(docsPath);
    const totalDocs = files.length;

    // Get last modified time
    const stats = fs.statSync(docsPath);
    const lastUpdated = stats.mtime.toISOString().split('T')[0];

    // Detect key documentation files
    const keyDocs = detectKeyDocs(files, docsPath);

    // Get README preview (first 300 chars)
    const readmePath = path.join(docsPath, 'README.md');
    let readmePreview = '';
    if (fs.existsSync(readmePath)) {
      const readme = fs.readFileSync(readmePath, 'utf-8');
      readmePreview = readme.substring(0, 300);
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
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
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

    // Only include top 5 key docs (README, API, Config, Getting Started, Examples)
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

  return keyDocs.slice(0, 5); // Top 5 key docs
}
