'use client';

import { FileText, Clock, Search } from 'lucide-react';

interface DocsListHeroProps {
  project: {
    displayName: string;
    description: string;
    stats: {
      lastUpdated: string;
    };
  };
  totalDocs: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function DocsListHero({
  project,
  totalDocs,
  searchQuery,
  onSearchChange,
}: DocsListHeroProps) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 border-b border-slate-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-mono text-slate-900 dark:text-gray-100 mb-2">
              {project.displayName}
            </h1>
            <p className="text-slate-600 dark:text-gray-400 text-pretty">
              {project.description}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-6 mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
            <FileText className="w-4 h-4" />
            <span className="font-medium text-slate-900 dark:text-gray-100">{totalDocs}</span>
            {' '}documentation file{totalDocs !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            Last updated{' '}
            <span className="font-medium text-slate-900 dark:text-gray-100">
              {project.stats.lastUpdated}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
          <input
            type="search"
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            aria-label="Search documentation"
          />
        </div>
      </div>
    </div>
  );
}
