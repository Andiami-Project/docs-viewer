// Server-side only - uses Node.js fs API
import fs from 'fs';
import path from 'path';
import { PROJECT_ROOTS } from './project-config';
import { DocMetadata } from './doc-utils';

export function categorizeDoc(filename: string, content: string): DocMetadata['category'] {
  const lower = filename.toLowerCase();
  const contentLower = content.toLowerCase();

  if (lower.includes('setup') || lower.includes('install') || lower.includes('getting-started')) {
    return 'setup';
  }
  if (lower.includes('api') || contentLower.includes('endpoint') || contentLower.includes('rest api')) {
    return 'api';
  }
  if (lower.includes('config') || lower.includes('.env') || lower.includes('environment')) {
    return 'config';
  }
  if (lower.includes('troubleshoot') || lower.includes('debug') || lower.includes('fix') || lower.includes('error')) {
    return 'troubleshooting';
  }
  if (lower.includes('readme') || lower.includes('guide') || lower.includes('tutorial')) {
    return 'guide';
  }

  return 'other';
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

export async function getDocumentationList(projectName: string): Promise<DocMetadata[]> {
  const projectPath = PROJECT_ROOTS[projectName as keyof typeof PROJECT_ROOTS];
  if (!projectPath) {
    throw new Error(`Project not found: ${projectName}`);
  }

  const docsDir = projectPath;
  const docs: DocMetadata[] = [];

  try {
    // Read all files in the directory
    const files = fs.readdirSync(docsDir);

    for (const file of files) {
      // Only process markdown files
      if (!file.endsWith('.md')) continue;

      const filePath = path.join(docsDir, file);
      const stats = fs.statSync(filePath);

      // Skip if it's a directory
      if (stats.isDirectory()) continue;

      // Read file content
      const content = fs.readFileSync(filePath, 'utf-8');

      // Extract metadata
      const category = categorizeDoc(file, content);
      const description = extractDescription(content);
      const icon = getIconForCategory(category);

      docs.push({
        name: file,
        path: file.replace('.md', ''),
        description,
        category,
        size: stats.size,
        modified: stats.mtime,
        icon,
      });
    }

    // Sort by name by default
    docs.sort((a, b) => a.name.localeCompare(b.name));

    return docs;
  } catch (error) {
    console.error(`Error reading documentation for ${projectName}:`, error);
    return [];
  }
}
