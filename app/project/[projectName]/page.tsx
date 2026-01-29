import { getProjectMetadata } from '@/lib/project-metadata';
import { notFound } from 'next/navigation';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { ProjectHero } from './components/ProjectHero';
import { KeyDocCards } from './components/KeyDocCards';

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

  // Get first install command if available
  const installCommand = project.readmeStructure?.installCommands[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <ProjectHero
          displayName={project.displayName}
          description={project.description}
          category={project.category}
          stats={project.stats}
          installCommand={installCommand}
        />

        {/* README Preview Section */}
        {project.readmePreview && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 mb-8 border border-slate-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Overview
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-pretty leading-relaxed">
              {project.readmePreview}
            </p>
          </div>
        )}

        {/* Key Documentation Cards */}
        {project.keyDocs && project.keyDocs.length > 0 && (
          <KeyDocCards projectName={project.name} keyDocs={project.keyDocs} />
        )}

        {/* Browse All Docs Link */}
        <div className="text-center">
          <Link
            href={`/docs-viewer/viewer?project=${project.name}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <FileText className="w-5 h-5" />
            Browse All Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}
