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
    color: 'bg-blue-600 dark:bg-blue-700',
    hoverColor: 'group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20',
    label: 'API Reference',
  },
  config: {
    icon: Settings,
    color: 'bg-purple-600 dark:bg-purple-700',
    hoverColor: 'group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20',
    label: 'Configuration',
  },
  guide: {
    icon: FileText,
    color: 'bg-green-600 dark:bg-green-700',
    hoverColor: 'group-hover:bg-green-50 dark:group-hover:bg-green-900/20',
    label: 'Guide',
  },
  example: {
    icon: Lightbulb,
    color: 'bg-orange-600 dark:bg-orange-700',
    hoverColor: 'group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20',
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {keyDocs.map((doc) => {
          const config = typeConfig[doc.type];
          const Icon = config.icon;

          return (
            <Link
              key={doc.path}
              href={`/project/${projectName}/docs${doc.path}`}
              className={`group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-6 border border-slate-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 min-h-[180px] ${config.hoverColor}`}
            >
              {/* Content */}
              <div className="relative">
                {/* Icon with solid background */}
                <div
                  className={`w-12 h-12 rounded-lg ${config.color} flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors capitalize line-clamp-2">
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
