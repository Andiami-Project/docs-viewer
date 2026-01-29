'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

interface Doc {
  filename: string;
  path: string;
  category: string;
  size: number;
  lastModified: string;
  description?: string;
}

interface ProjectInfo {
  name: string;
  displayName: string;
  description: string;
  stats: {
    totalDocs: number;
    lastUpdated: string;
    components: number | string[];
  };
}

interface Props {
  project: ProjectInfo;
  docs: Doc[];
  selectedDoc: Doc | null;
  selectedContent: string | null;
}

export function SplitPanelViewer({ project, docs, selectedDoc, selectedContent }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter docs based on search
  const filteredDocs = docs.filter(doc =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group docs by category
  const groupedDocs = filteredDocs.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, Doc[]>);

  return (
    <div className="min-h-dvh bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="px-6 py-4">
          {/* Breadcrumb */}
          <nav className="mb-3 text-sm text-slate-600 dark:text-gray-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-gray-200 transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/project/${project.name}`} className="hover:text-slate-900 dark:hover:text-gray-200 transition-colors">
              {project.displayName}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900 dark:text-gray-100 font-medium">Documentation</span>
          </nav>

          {/* Project title */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-gray-100">{project.displayName}</h1>
              <p className="text-sm text-slate-600 dark:text-gray-400">{project.description}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Split panel layout */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left sidebar - File browser */}
        <aside className="w-80 border-r border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-850 overflow-y-auto">
          {/* Search */}
          <div className="p-4 border-b border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* File list */}
          <div className="p-2">
            {Object.entries(groupedDocs).map(([category, categoryDocs]) => (
              <div key={category} className="mb-4">
                <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  {category} ({categoryDocs.length})
                </h3>
                <div className="space-y-1">
                  {categoryDocs.map((doc) => {
                    const isSelected = selectedDoc?.path === doc.path;
                    return (
                      <Link
                        key={doc.path}
                        href={`/project/${project.name}/docs-list/${doc.path}`}
                        className={`
                          block px-3 py-2 rounded-md text-sm transition-colors
                          ${isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                            : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="truncate">{doc.filename}</span>
                        </div>
                        {doc.description && (
                          <p className="text-xs text-slate-500 dark:text-gray-500 mt-1 truncate">
                            {doc.description.substring(0, 50)}...
                          </p>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right panel - Document viewer */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
          {selectedContent ? (
            <article className="max-w-4xl mx-auto p-8 prose prose-slate dark:prose-invert prose-headings:text-slate-900 dark:prose-headings:text-gray-100 prose-p:text-slate-700 dark:prose-p:text-gray-300 prose-strong:text-slate-900 dark:prose-strong:text-gray-100 prose-code:text-slate-800 dark:prose-code:text-gray-200 prose-li:text-slate-700 dark:prose-li:text-gray-300">
              <ReactMarkdown
                rehypePlugins={[
                  rehypeHighlight,
                  rehypeSlug,
                  [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                ]}
              >
                {selectedContent}
              </ReactMarkdown>
            </article>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-500 dark:text-gray-400 font-medium">Select a document to view</p>
                <p className="text-sm text-slate-400 dark:text-gray-500 mt-1">Choose a file from the sidebar</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
