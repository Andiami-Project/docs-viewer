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
  // Fetch project metadata from API
  const response = await fetch(`/docs-viewer/api/projects?action=metadata&project=${projectName}`);
  if (!response.ok) return null;
  return response.json();
}
