import { getProjectMetadata } from '@/lib/project-metadata';
import { notFound, redirect } from 'next/navigation';

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectName: string }>;
}) {
  const { projectName } = await params;
  const project = await getProjectMetadata(projectName);

  if (!project) {
    notFound();
  }

  // Redirect to docs-list page for better UX
  redirect(`/project/${projectName}/docs-list`);
}
