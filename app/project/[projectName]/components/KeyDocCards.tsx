import { FileText, Settings, Code, Lightbulb } from 'lucide-react';
import Link from 'next/link';

interface KeyDoc {
  title: string;
  path: string;
  type: 'api' | 'config' | 'guide' | 'example';
}

interface KeyDocCardsProps {
  projectName: string;
  keyDocs: KeyDoc[];
}

const typeConfig = {
  api: {
    icon: Code,
    color: 'from-blue-500 to-cyan-600',
    label: 'API Reference',
  },
  config: {
    icon: Settings,
    color: 'from-purple-500 to-pink-600',
    label: 'Configuration',
  },
  guide: {
    icon: FileText,
    color: 'from-green-500 to-emerald-600',
    label: 'Guide',
  },
  example: {
    icon: Lightbulb,
    color: 'from-orange-500 to-red-600',
    label: 'Example',
  },
};

export function KeyDocCards({ projectName, keyDocs }: KeyDocCardsProps) {
  if (keyDocs.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Key Documentation
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {keyDocs.map((doc) => {
          const config = typeConfig[doc.type];
          const Icon = config.icon;

          return (
            <Link
              key={doc.path}
              href={`/docs-viewer/project/${projectName}/docs${doc.path}`}
              className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-6 border border-slate-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              {/* Gradient accent on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-5 transition-opacity duration-200`}
              />

              {/* Content */}
              <div className="relative">
                {/* Icon with gradient background */}
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors capitalize">
                  {doc.title}
                </h3>

                {/* Type badge */}
                <span className="inline-block px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                  {config.label}
                </span>
              </div>

              {/* Arrow indicator */}
              <div className="absolute top-6 right-6 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all duration-200">
                →
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
