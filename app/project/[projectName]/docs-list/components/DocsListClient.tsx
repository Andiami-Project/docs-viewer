'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { DocMetadata } from '@/lib/doc-utils';
import { DocsListHero } from './DocsListHero';
import { DocsFilter } from './DocsFilter';
import { DocsGrid } from './DocsGrid';

interface DocsListClientProps {
  project: {
    name: string;
    displayName: string;
    description: string;
    stats: {
      totalDocs: number;
      components: number;
      lastUpdated: string;
    };
  };
  docs: DocMetadata[];
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'name' | 'date' | 'size';

export function DocsListClient({ project, docs }: DocsListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: docs.length,
      setup: 0,
      guide: 0,
      api: 0,
      config: 0,
      troubleshooting: 0,
      other: 0,
    };

    docs.forEach((doc) => {
      counts[doc.category]++;
    });

    return counts;
  }, [docs]);

  // Filter and sort docs
  const filteredDocs = useMemo(() => {
    let result = [...docs];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.name.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((doc) => doc.category === selectedCategory);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return b.modified.getTime() - a.modified.getTime();
        case 'size':
          return b.size - a.size;
        default:
          return 0;
      }
    });

    return result;
  }, [docs, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="text-sm text-slate-600 dark:text-gray-400" aria-label="Breadcrumb">
            <Link
              href="/"
              className="inline-flex items-center py-1 px-2 -ml-2 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              Home
            </Link>
            <span aria-hidden="true" className="mx-1">/</span>
            <Link
              href={`/project/${project.name}`}
              className="inline-flex items-center py-1 px-2 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              {project.displayName}
            </Link>
            <span aria-hidden="true" className="mx-1">/</span>
            <span className="text-slate-900 dark:text-gray-100 font-medium py-1">
              Documentation
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <DocsListHero
        project={project}
        totalDocs={docs.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Filter Bar */}
      <DocsFilter
        categoryCounts={categoryCounts}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Documentation Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DocsGrid
          docs={filteredDocs}
          projectName={project.name}
          viewMode={viewMode}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}
