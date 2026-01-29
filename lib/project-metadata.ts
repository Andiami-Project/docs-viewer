export interface ProjectMetadata {
  name: string;
  displayName: string;
  description: string;
  category: string;
  stats: {
    files: number;
    lastUpdated: string;
  };
  readmeContent?: string;
}

export async function getProjectMetadata(projectName: string): Promise<ProjectMetadata | null> {
  try {
    // Use absolute URL for Server Component compatibility
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/docs-viewer/api/projects?action=metadata&project=${projectName}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching project metadata:', error);
    return null;
  }
}
