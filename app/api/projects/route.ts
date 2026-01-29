import { NextResponse } from 'next/server';
import { getProjectsByCategory, getProjectMetadata, updateProjectMetadata, getCategoryDefinition } from '@/lib/categorization-service';
import { PROJECT_ROOTS } from '@/lib/project-config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'by-category') {
      // Return projects grouped by category
      const categorized = await getProjectsByCategory(PROJECT_ROOTS);

      // Add category metadata
      const response: Record<string, any> = {};
      for (const [categoryName, projects] of Object.entries(categorized)) {
        const categoryDef = getCategoryDefinition(categoryName);
        response[categoryName] = {
          definition: categoryDef,
          projects
        };
      }

      return NextResponse.json(response);
    }

    // Default: return all projects with metadata
    const projects = await Promise.all(
      Object.entries(PROJECT_ROOTS).map(async ([name, path]) => {
        const metadata = await getProjectMetadata(name, path);
        return metadata;
      })
    );

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { projectName, updates } = body;

    if (!projectName || !updates) {
      return NextResponse.json(
        { error: 'projectName and updates are required' },
        { status: 400 }
      );
    }

    const updated = await updateProjectMetadata(projectName, updates);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating project metadata:', error);
    return NextResponse.json(
      { error: 'Failed to update project metadata' },
      { status: 500 }
    );
  }
}
