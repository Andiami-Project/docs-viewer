'use client';

import { Grid, List } from 'lucide-react';
import { ViewMode, SortOption } from './DocsListClient';

interface DocsFilterProps {
  categoryCounts: Record<string, number>;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const categories = [
  { id: 'all', label: 'All' },
  { id: 'setup', label: 'Setup' },
  { id: 'guide', label: 'Guides' },
  { id: 'api', label: 'API' },
  { id: 'config', label: 'Config' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
  { id: 'other', label: 'Other' },
];

export function DocsFilter({
  categoryCounts,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: DocsFilterProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
            {categories.map((category) => {
              const count = categoryCounts[category.id] || 0;
              if (count === 0 && category.id !== 'all') return null;

              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-400'
                  }`}
                >
                  {category.label}{' '}
                  <span className={selectedCategory === category.id ? 'opacity-75' : 'opacity-50'}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort & View */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="px-3 py-2 border border-slate-200 dark:border-gray-700 rounded-lg text-sm text-slate-600 dark:text-gray-400 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none flex-1 sm:flex-initial"
              aria-label="Sort documentation"
            >
              <option value="name">Sort by name</option>
              <option value="date">Sort by date</option>
              <option value="size">Sort by size</option>
            </select>

            <div className="flex border border-slate-200 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-l-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-slate-100 dark:bg-gray-800'
                    : 'hover:bg-slate-50 dark:hover:bg-gray-800'
                }`}
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
              >
                <Grid className="w-4 h-4 text-slate-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-r-lg border-l border-slate-200 dark:border-gray-700 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-slate-100 dark:bg-gray-800'
                    : 'hover:bg-slate-50 dark:hover:bg-gray-800'
                }`}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
              >
                <List className="w-4 h-4 text-slate-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
