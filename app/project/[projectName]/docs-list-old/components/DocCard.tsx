'use client';

import { DocMetadata, formatFileSize, formatRelativeTime } from '@/lib/doc-utils';
import { ArrowRight, FileText, Settings, BookOpen, Code, Wrench, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { ViewMode } from './DocsListClient';

interface DocCardProps {
  doc: DocMetadata;
  projectName: string;
  viewMode: ViewMode;
}

const iconMap = {
  Settings,
  BookOpen,
  Code,
  Wrench,
  AlertCircle,
  FileText,
};

const categoryColors = {
  setup: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  guide: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  api: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  config: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  troubleshooting: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  other: 'bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-gray-400',
};

const categoryLabels = {
  setup: 'Setup',
  guide: 'Guide',
  api: 'API',
  config: 'Config',
  troubleshooting: 'Troubleshooting',
  other: 'Other',
};

export function DocCard({ doc, projectName, viewMode }: DocCardProps) {
  const IconComponent = iconMap[doc.icon as keyof typeof iconMap] || FileText;
  const href = `/project/${projectName}/docs/${doc.path}`;

  if (viewMode === 'list') {
    return (
      <tr className="hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium font-mono text-slate-900 dark:text-gray-100">
              {doc.name}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 hidden lg:table-cell">
          <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-2">
            {doc.description}
          </p>
        </td>
        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-md ${
              categoryColors[doc.category]
            }`}
          >
            {categoryLabels[doc.category]}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-gray-400 hidden sm:table-cell">
          {formatFileSize(doc.size)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-gray-400 hidden sm:table-cell">
          {formatRelativeTime(doc.modified)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <Link
            href={href}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm inline-flex items-center gap-1 transition-colors"
          >
            View
            <ArrowRight className="w-4 h-4" />
          </Link>
        </td>
      </tr>
    );
  }

  return (
    <Link
      href={href}
      className="group bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 p-6 cursor-pointer block"
    >
      {/* Icon + Category */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
          <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-md ${
            categoryColors[doc.category]
          }`}
        >
          {categoryLabels[doc.category]}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold font-mono text-slate-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {doc.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
        {doc.description}
      </p>

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-500 mb-4">
        <span>{formatFileSize(doc.size)}</span>
        <span>{formatRelativeTime(doc.modified)}</span>
      </div>

      {/* Action */}
      <div className="pt-4 border-t border-slate-100 dark:border-gray-700">
        <span className="text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
          View Documentation
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
