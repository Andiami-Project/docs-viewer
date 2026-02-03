import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import fs from 'fs/promises';
import path from 'path';

interface Project {
  name: string;
  displayName: string;
  docsPath: string;
}

async function getProjects(): Promise<Project[]> {
  try {
    const dataDir = path.join(process.cwd(), '.docs-viewer-data');
    const projectsFile = path.join(dataDir, 'projects.json');
    const data = await fs.readFile(projectsFile, 'utf-8');
    const projects = JSON.parse(data);
    return projects;
  } catch (error) {
    console.error('Error reading projects:', error);
    return [];
  }
}

async function getAllDocFiles(docsPath: string): Promise<{ relativePath: string; content: string }[]> {
  const files: { relativePath: string; content: string }[] = [];

  async function scanDirectory(dir: string, baseDir: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await scanDirectory(fullPath, baseDir);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          const content = await fs.readFile(fullPath, 'utf-8');
          const relativePath = path.relative(baseDir, fullPath);
          files.push({ relativePath, content });
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error);
    }
  }

  await scanDirectory(docsPath, docsPath);
  return files;
}

export async function GET(request: NextRequest) {
  try {
    const projects = await getProjects();

    if (projects.length === 0) {
      return NextResponse.json(
        { error: 'No projects found' },
        { status: 404 }
      );
    }

    // Create a new ZIP file
    const zip = new JSZip();

    // Add documentation from all projects
    for (const project of projects) {
      const docFiles = await getAllDocFiles(project.docsPath);

      for (const file of docFiles) {
        // Add file to zip with project name as folder prefix
        const zipPath = `${project.name}/${file.relativePath}`;
        zip.file(zipPath, file.content);
      }
    }

    // Add a README to explain the structure
    const readmeContent = `# As You Wish Documentation Archive

This archive contains documentation for all projects in the As You Wish ecosystem.

## Projects Included:

${projects.map(p => `- **${p.displayName}**: ${p.name}/`).join('\n')}

## Structure:

Each project has its own folder containing all markdown documentation files.

Generated: ${new Date().toISOString()}
`;

    zip.file('README.md', readmeContent);

    // Generate the ZIP file as arraybuffer
    const zipContent = await zip.generateAsync({
      type: 'arraybuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    // Return the ZIP file
    return new NextResponse(zipContent, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="as-you-wish-docs-${new Date().toISOString().split('T')[0]}.zip"`,
        'Content-Length': zipContent.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating documentation archive:', error);
    return NextResponse.json(
      { error: 'Failed to generate documentation archive', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
