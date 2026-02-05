// Server-side only - uses Node.js fs API
import fs from 'fs';
import path from 'path';
import { PROJECT_ROOTS } from './project-config';
import { DocMetadata } from './doc-utils';
import { detectCategories, type ProjectDocsConfig } from './category-detection';

// Cache per project (cleared on each build, persists during dev)
const projectConfigCache = new Map<string, ProjectDocsConfig>();

/**
 * Get or load project documentation configuration.
 * Uses caching to avoid repeated file system operations.
 */
async function getProjectConfig(projectRoot: string): Promise<ProjectDocsConfig> {
  if (!projectConfigCache.has(projectRoot)) {
    const config = await detectCategories(projectRoot);
    projectConfigCache.set(projectRoot, config);
  }
  return projectConfigCache.get(projectRoot)!;
}

/**
 * Categorize a document based on its location in the directory structure.
 *
 * Strategy:
 * 1. Extract directory from relativePath (e.g., "docs/01-setup/plugins.md" → "01-setup")
 * 2. Look up directory in project's detected categories
 * 3. Fall back to "other" for root-level files
 *
 * @param filename - Name of the file
 * @param content - File content (unused but kept for compatibility)
 * @param relativePath - Relative path from project root
 * @param projectRoot - Absolute path to project root
 * @returns Category key (directory name) or 'other'
 */
export async function categorizeDoc(
  filename: string,
  content: string,
  relativePath: string,
  projectRoot: string
): Promise<string> {
  const config = await getProjectConfig(projectRoot);

  // Extract directory from relativePath
  // Examples:
  // - "docs/01-setup/plugins.md" → "01-setup"
  // - ".claude/docs/02-planning/requirements.md" → "02-planning"
  // - "api-reference/endpoints.md" → "api-reference"
  const pathMatch = relativePath.match(/(?:docs|\.claude\/docs)[\/\\]([^\/\\]+)[\/\\]/);

  if (pathMatch) {
    const dirName = pathMatch[1];

    // Check if we have a category config for this directory
    if (config.categories?.[dirName]) {
      return dirName; // Return directory name as category key
    }
  }

  // Fallback to "other" for root-level files
  return config.defaultCategory || 'other';
}

export function getIconForCategory(category: DocMetadata['category']): string {
  const icons: Record<DocMetadata['category'], string> = {
    setup: 'Settings',
    guide: 'BookOpen',
    api: 'Code',
    config: 'Wrench',
    troubleshooting: 'AlertCircle',
    other: 'FileText',
  };
  return icons[category];
}

export function extractDescription(content: string): string {
  // Remove markdown heading syntax
  const lines = content.split('\n');

  // Skip empty lines and headings
  let description = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      description = trimmed;
      break;
    }
  }

  // Truncate to 150 characters
  if (description.length > 150) {
    description = description.substring(0, 150).trim() + '...';
  }

  return description || 'No description available';
}

// Directories to skip during recursive traversal
const SKIP_DIRECTORIES = new Set([
  'node_modules', '.git', '.next', 'dist', 'build',
  'out', '.vercel', '.turbo', 'coverage', '.cache',
]);

export async function getDocumentationList(projectName: string): Promise<DocMetadata[]> {
  const projectPath = PROJECT_ROOTS[projectName as keyof typeof PROJECT_ROOTS];
  if (!projectPath) {
    throw new Error(`Project not found: ${projectName}`);
  }

  const docsDir = projectPath;
  const docs: DocMetadata[] = [];

  try {
    // Recursively find all markdown files
    async function traverseDirectory(currentPath: string, isRoot: boolean = false): Promise<void> {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        // Skip build directories and hidden folders (but allow root directory itself)
        if (entry.isDirectory()) {
          // Always skip these directories
          if (SKIP_DIRECTORIES.has(entry.name)) {
            continue;
          }
          // Skip hidden directories ONLY if they are subdirectories (not root)
          if (!isRoot && entry.name.startsWith('.')) {
            continue;
          }
          // Recursively traverse subdirectories
          await traverseDirectory(fullPath, false);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          // Process markdown files
          try {
            const stats = fs.statSync(fullPath);
            const content = fs.readFileSync(fullPath, 'utf-8');

            // Get relative path from project root
            const relativePath = path.relative(docsDir, fullPath);
            const pathWithoutExt = relativePath.replace('.md', '');

            // Extract metadata (now async)
            const category = await categorizeDoc(entry.name, content, relativePath, projectPath);
            const description = extractDescription(content);
            const icon = getIconForCategory(category as DocMetadata['category']);

            docs.push({
              name: entry.name,
              path: pathWithoutExt,
              description,
              category: category as DocMetadata['category'],
              size: stats.size,
              modified: stats.mtime,
              icon,
            });
          } catch (err) {
            console.error(`Error processing ${fullPath}:`, err);
          }
        }
      }
    }

    // Start traversal from project root (mark as root to allow .claude directory)
    await traverseDirectory(docsDir, true);

    // Sort by name by default
    docs.sort((a, b) => a.name.localeCompare(b.name));

    console.log(`[getDocumentationList] Found ${docs.length} markdown files in ${projectName}`);
    return docs;
  } catch (error) {
    console.error(`Error reading documentation for ${projectName}:`, error);
    return [];
  }
}
