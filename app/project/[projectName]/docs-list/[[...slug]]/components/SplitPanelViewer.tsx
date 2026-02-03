'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { RefreshButton } from '@/components/RefreshButton';

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
    <div className="min-h-dvh bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-5">
          {/* Breadcrumb */}
          <nav className="mb-4 text-sm text-slate-600" aria-label="Breadcrumb">
            <Link href="/" className="inline-flex items-center py-1.5 px-2 -ml-2 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
              Home
            </Link>
            <span className="mx-2 text-slate-400">/</span>
            <Link href={`/project/${project.name}`} className="inline-flex items-center py-1.5 px-2 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
              {project.displayName}
            </Link>
            <span className="mx-2 text-slate-400">/</span>
            <span className="text-slate-900 font-medium py-1.5">Documentation</span>
          </nav>

          {/* Project title */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-0.5">{project.displayName}</h1>
                <p className="text-sm md:text-base text-gray-900">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center">
              <RefreshButton />
            </div>
          </div>
        </div>
      </header>

      {/* Split panel layout */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left sidebar - File browser */}
        <aside className="w-80 border-r border-slate-200 bg-slate-50 overflow-y-auto">
          {/* Search */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* File list */}
          <div className="p-3">
            {Object.entries(groupedDocs).map(([category, categoryDocs]) => (
              <div key={category} className="mb-6">
                <h3 className="px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 rounded-md mb-2">
                  {category} ({categoryDocs.length})
                </h3>
                <div className="space-y-1.5">
                  {categoryDocs.map((doc) => {
                    const isSelected = selectedDoc?.path === doc.path;
                    return (
                      <Link
                        key={doc.path}
                        href={`/project/${project.name}/docs-list/${doc.path}`}
                        className={`
                          block px-3 py-3 rounded-lg text-sm transition-all
                          ${isSelected
                            ? 'bg-blue-50 text-blue-600 font-medium shadow-sm border border-blue-200'
                            : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="truncate">{doc.filename}</span>
                        </div>
                        {doc.description && (
                          <p className="text-xs text-gray-900 mt-1.5 ml-6 truncate">
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
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {selectedContent ? (
            <div className="max-w-4xl mx-auto px-6 py-12">
              <article className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 prose prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-900 prose-p:leading-relaxed prose-strong:text-gray-900 prose-code:text-gray-900 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-li:text-gray-900 prose-a:text-blue-600 prose-pre:bg-slate-900 prose-headings:scroll-mt-20">
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
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-900 font-medium">Select a document to view</p>
                <p className="text-sm text-gray-900 mt-1">Choose a file from the sidebar</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
