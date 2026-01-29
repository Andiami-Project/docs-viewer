import { getDocumentationList } from '@/lib/doc-metadata';
import { getProjectMetadata } from '@/lib/project-metadata';
import { notFound } from 'next/navigation';
import { DocsListClient } from './components/DocsListClient';

export default async function DocsListPage({
  params,
}: {
  params: Promise<{ projectName: string }>;
}) {
  const { projectName } = await params;
  const project = await getProjectMetadata(projectName);

  if (!project) {
    notFound();
  }

  // Fetch all documentation
  const docs = await getDocumentationList(projectName);

  return (
    <DocsListClient
      project={{
        name: project.name,
        displayName: project.displayName,
        description: project.description,
        stats: project.stats,
      }}
      docs={docs}
    />
  );
}
