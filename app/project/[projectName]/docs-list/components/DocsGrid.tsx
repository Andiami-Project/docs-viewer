'use client';

import { DocMetadata } from '@/lib/doc-utils';
import { DocCard } from './DocCard';
import { ViewMode } from './DocsListClient';
import { FileQuestion } from 'lucide-react';

interface DocsGridProps {
  docs: DocMetadata[];
  projectName: string;
  viewMode: ViewMode;
  searchQuery: string;
}

export function DocsGrid({ docs, projectName, viewMode, searchQuery }: DocsGridProps) {
  if (docs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8 text-slate-400 dark:text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100 mb-2">
          No documentation found
        </h3>
        <p className="text-slate-600 dark:text-gray-400 text-sm">
          {searchQuery ? (
            <>
              No results for "<span className="font-medium">{searchQuery}</span>". Try a different
              search term.
            </>
          ) : (
            'There are no documentation files available for this project.'
          )}
        </p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Modified
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
            {docs.map((doc) => (
              <DocCard
                key={doc.name}
                doc={doc}
                projectName={projectName}
                viewMode="list"
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {docs.map((doc) => (
        <DocCard
          key={doc.name}
          doc={doc}
          projectName={projectName}
          viewMode="grid"
        />
      ))}
    </div>
  );
}
