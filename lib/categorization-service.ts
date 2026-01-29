import { promises as fs } from 'fs';
import path from 'path';

export interface ProjectMetadata {
  name: string;
  displayName: string;
  description: string;
  category: string;
  path: string;
  icon: string;
  tags: string[];
  autoDetected: boolean;
}

export interface CategoryDefinition {
  name: string;
  displayName: string;
  description: string;
  keywords: string[];
  icon: string;
  aliases: string[];
}

// Master category definitions with normalization rules
const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    name: 'documentation',
    displayName: 'Documentation',
    description: 'Documentation, guides, and knowledge bases',
    keywords: ['doc', 'docs', 'guide', 'wiki', 'knowledge', 'readme', 'manual'],
    icon: 'BookOpen',
    aliases: ['docs', 'documentation', 'guides', 'manuals']
  },
  {
    name: 'backend',
    displayName: 'Backend Services',
    description: 'Backend APIs, services, and server-side applications',
    keywords: ['backend', 'api', 'server', 'service', 'worker', 'job', 'queue'],
    icon: 'Server',
    aliases: ['backend', 'backend-services', 'api', 'services']
  },
  {
    name: 'frontend',
    displayName: 'Frontend Applications',
    description: 'Web applications, UIs, and client-side projects',
    keywords: ['frontend', 'web', 'app', 'ui', 'dashboard', 'portal', 'site'],
    icon: 'Layout',
    aliases: ['frontend', 'web-app', 'webapp', 'ui', 'website']
  },
  {
    name: 'tools',
    displayName: 'Developer Tools',
    description: 'CLI tools, utilities, and development aids',
    keywords: ['cli', 'tool', 'util', 'helper', 'automation', 'script'],
    icon: 'Wrench',
    aliases: ['tools', 'utilities', 'cli-tools', 'dev-tools']
  },
  {
    name: 'infrastructure',
    displayName: 'Infrastructure',
    description: 'DevOps, deployment, and infrastructure projects',
    keywords: ['infra', 'deploy', 'devops', 'ci', 'cd', 'docker', 'k8s'],
    icon: 'Cloud',
    aliases: ['infrastructure', 'infra', 'devops', 'deployment']
  },
  {
    name: 'workspace',
    displayName: 'Workspace Configuration',
    description: 'Workspace settings, configurations, and metadata',
    keywords: ['workspace', 'config', 'settings', 'meta', 'claude'],
    icon: 'Folder',
    aliases: ['workspace', 'workspace-config', 'settings']
  },
  {
    name: 'ai-agents',
    displayName: 'AI & Agents',
    description: 'AI services, agents, and machine learning projects',
    keywords: ['ai', 'agent', 'claude', 'gpt', 'ml', 'llm', 'bot'],
    icon: 'Bot',
    aliases: ['ai', 'agents', 'ai-agents', 'ml']
  },
  {
    name: 'ecommerce',
    displayName: 'E-Commerce',
    description: 'Online stores, shopping platforms, and retail applications',
    keywords: ['store', 'shop', 'ecommerce', 'cart', 'product', 'retail'],
    icon: 'ShoppingCart',
    aliases: ['ecommerce', 'e-commerce', 'store', 'shop']
  },
  {
    name: 'other',
    displayName: 'Other',
    description: 'Miscellaneous projects',
    keywords: [],
    icon: 'Package',
    aliases: ['other', 'misc', 'miscellaneous']
  }
];

const STORAGE_PATH = path.join(process.cwd(), '.docs-viewer-data', 'project-metadata.json');

/**
 * Normalizes a category name to the canonical form
 */
function normalizeCategory(categoryInput: string): string {
  const normalized = categoryInput.toLowerCase().trim();

  // Find matching category by exact match or alias
  for (const def of CATEGORY_DEFINITIONS) {
    if (def.name === normalized || def.aliases.includes(normalized)) {
      return def.name;
    }
  }

  // Return 'other' if no match found
  return 'other';
}

/**
 * Auto-detects category based on project name and path
 */
function autoDetectCategory(projectName: string, projectPath: string): string {
  const lowerName = projectName.toLowerCase();
  const lowerPath = projectPath.toLowerCase();
  const searchText = `${lowerName} ${lowerPath}`;

  // Score each category based on keyword matches
  const scores = CATEGORY_DEFINITIONS.map(def => {
    let score = 0;
    for (const keyword of def.keywords) {
      if (searchText.includes(keyword)) {
        score += 1;
      }
    }
    return { category: def.name, score };
  });

  // Sort by score and return highest (excluding 'other')
  scores.sort((a, b) => b.score - a.score);
  const best = scores.find(s => s.category !== 'other' && s.score > 0);

  return best ? best.category : 'other';
}

/**
 * Auto-generates description based on project name
 */
function generateDescription(projectName: string, category: string): string {
  const categoryDef = CATEGORY_DEFINITIONS.find(d => d.name === category);
  const categoryName = categoryDef?.displayName || 'Project';

  // Convert kebab-case and snake_case to Title Case
  const displayName = projectName
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return `${displayName} - ${categoryName}`;
}

/**
 * Gets icon name for a category
 */
function getCategoryIcon(category: string): string {
  const def = CATEGORY_DEFINITIONS.find(d => d.name === category);
  return def?.icon || 'Package';
}

/**
 * Loads project metadata from storage
 */
async function loadMetadata(): Promise<Record<string, ProjectMetadata>> {
  try {
    const data = await fs.readFile(STORAGE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is invalid, return empty object
    return {};
  }
}

/**
 * Saves project metadata to storage
 */
async function saveMetadata(metadata: Record<string, ProjectMetadata>): Promise<void> {
  const dir = path.dirname(STORAGE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(STORAGE_PATH, JSON.stringify(metadata, null, 2));
}

/**
 * Gets or creates metadata for a project
 */
export async function getProjectMetadata(projectName: string, projectPath: string): Promise<ProjectMetadata> {
  const allMetadata = await loadMetadata();

  // If metadata exists, return it (with normalized category)
  if (allMetadata[projectName]) {
    const existing = allMetadata[projectName];
    return {
      ...existing,
      category: normalizeCategory(existing.category)
    };
  }

  // Auto-detect category for new project
  const category = autoDetectCategory(projectName, projectPath);
  const description = generateDescription(projectName, category);
  const icon = getCategoryIcon(category);

  // Create new metadata
  const metadata: ProjectMetadata = {
    name: projectName,
    displayName: projectName.replace(/[-_]/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description,
    category,
    path: projectPath,
    icon,
    tags: [],
    autoDetected: true
  };

  // Save to storage
  allMetadata[projectName] = metadata;
  await saveMetadata(allMetadata);

  return metadata;
}

/**
 * Updates metadata for a project
 */
export async function updateProjectMetadata(projectName: string, updates: Partial<ProjectMetadata>): Promise<ProjectMetadata> {
  const allMetadata = await loadMetadata();

  if (!allMetadata[projectName]) {
    throw new Error(`Project ${projectName} not found`);
  }

  // Normalize category if provided
  if (updates.category) {
    updates.category = normalizeCategory(updates.category);
  }

  // Update metadata
  const updated = {
    ...allMetadata[projectName],
    ...updates,
    autoDetected: false // Mark as manually updated
  };

  allMetadata[projectName] = updated;
  await saveMetadata(allMetadata);

  return updated;
}

/**
 * Gets all projects grouped by category
 */
export async function getProjectsByCategory(projectRoots: Record<string, string>): Promise<Record<string, ProjectMetadata[]>> {
  const allMetadata = await Promise.all(
    Object.entries(projectRoots).map(([name, path]) =>
      getProjectMetadata(name, path)
    )
  );

  // Group by category
  const grouped: Record<string, ProjectMetadata[]> = {};

  for (const metadata of allMetadata) {
    const category = metadata.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(metadata);
  }

  // Sort categories by definition order
  const sortedGrouped: Record<string, ProjectMetadata[]> = {};
  for (const def of CATEGORY_DEFINITIONS) {
    if (grouped[def.name] && grouped[def.name].length > 0) {
      sortedGrouped[def.name] = grouped[def.name].sort((a, b) =>
        a.displayName.localeCompare(b.displayName)
      );
    }
  }

  return sortedGrouped;
}

/**
 * Gets category definition
 */
export function getCategoryDefinition(categoryName: string): CategoryDefinition | undefined {
  return CATEGORY_DEFINITIONS.find(d => d.name === categoryName);
}

/**
 * Gets all category definitions
 */
export function getAllCategories(): CategoryDefinition[] {
  return CATEGORY_DEFINITIONS;
}

/**
 * Validates a category name
 */
export function isValidCategory(categoryName: string): boolean {
  const normalized = normalizeCategory(categoryName);
  return CATEGORY_DEFINITIONS.some(d => d.name === normalized);
}
