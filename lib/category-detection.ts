import * as fs from 'fs';
import * as path from 'path';

export interface CategoryConfig {
  display: string;      // Display name (e.g., "Setup")
  icon?: string;        // Optional icon
  description?: string; // Optional description
  order?: number;       // Optional sort order
}

export interface ProjectDocsConfig {
  categories?: Record<string, CategoryConfig>;
  defaultCategory?: string; // Default: "other"
}

/**
 * Detects documentation categories for a project.
 *
 * Strategy (Hybrid Approach):
 * 1. Try loading .docs-config.json (if exists) - explicit config
 * 2. Auto-detect from directory structure - zero config default
 *
 * @param projectRoot - Absolute path to project root
 * @returns ProjectDocsConfig with detected/configured categories
 */
export async function detectCategories(projectRoot: string): Promise<ProjectDocsConfig> {
  // STEP 1: Try loading .docs-config.json (if exists)
  const configPath = path.join(projectRoot, '.docs-config.json');
  if (fs.existsSync(configPath)) {
    try {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(configContent);
    } catch (error) {
      console.error(`Error reading .docs-config.json at ${configPath}:`, error);
      // Fall through to auto-detection
    }
  }

  // STEP 2: Auto-detect from directory structure
  const possibleDocsPaths = [
    path.join(projectRoot, 'docs'),
    path.join(projectRoot, '.claude', 'docs'),
    path.join(projectRoot, '.claude')
  ];

  let docsPath: string | null = null;
  for (const candidatePath of possibleDocsPaths) {
    if (fs.existsSync(candidatePath)) {
      docsPath = candidatePath;
      break;
    }
  }

  const categories: Record<string, CategoryConfig> = {};

  if (docsPath && fs.existsSync(docsPath)) {
    try {
      const entries = fs.readdirSync(docsPath, { withFileTypes: true });
      const dirs = entries.filter(d => d.isDirectory());

      for (const dir of dirs) {
        const dirName = dir.name;

        // Handle numbered directories: "01-setup" → { display: "Setup", order: 1 }
        const numberedMatch = dirName.match(/^(\d+)-(.+)$/);
        if (numberedMatch) {
          const [, orderStr, name] = numberedMatch;
          categories[dirName] = {
            display: formatCategoryName(name),
            order: parseInt(orderStr, 10)
          };
        } else {
          // Handle regular directories: "api-docs" → { display: "Api Docs" }
          categories[dirName] = {
            display: formatCategoryName(dirName)
          };
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${docsPath}:`, error);
    }
  }

  return {
    categories,
    defaultCategory: 'other'
  };
}

/**
 * Formats a category name for display.
 *
 * Examples:
 * - "setup" → "Setup"
 * - "api-docs" → "Api Docs"
 * - "deployment" → "Deployment"
 *
 * @param name - Raw category name from directory
 * @returns Formatted display name
 */
export function formatCategoryName(name: string): string {
  return name
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
