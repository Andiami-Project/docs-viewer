import { NextResponse } from 'next/server';
import { getDocumentationList } from '@/lib/doc-metadata';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectName = searchParams.get('project');

    if (!projectName) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    const docs = await getDocumentationList(projectName);

    return NextResponse.json({
      project: projectName,
      count: docs.length,
      docs,
    });
  } catch (error) {
    console.error('Error fetching documentation list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documentation list' },
      { status: 500 }
    );
  }
}
