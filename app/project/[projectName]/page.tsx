import { getProjectMetadata } from '@/lib/project-metadata';
import { notFound } from 'next/navigation';

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {project.displayName}
        </h1>
        <p className="text-xl text-slate-600 dark:text-gray-400 mb-8">
          {project.description}
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-slate-200 dark:border-gray-700">
            <div className="text-sm text-slate-600 dark:text-gray-400">Total Docs</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{project.stats.totalDocs}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-slate-200 dark:border-gray-700">
            <div className="text-sm text-slate-600 dark:text-gray-400">Components</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{project.stats.components}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-slate-200 dark:border-gray-700">
            <div className="text-sm text-slate-600 dark:text-gray-400">Last Updated</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{project.stats.lastUpdated}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
