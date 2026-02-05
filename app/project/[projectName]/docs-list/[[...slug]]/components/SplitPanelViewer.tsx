'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu, X, Search, ChevronDown, ChevronRight, ChevronLeft, ChevronRight as ChevronRightNav,
  Settings, ClipboardList, Code, Palette, Rocket, GitBranch, TestTube2, BookOpen, BarChart3, FolderOpen
} from 'lucide-react';
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

interface CategoryConfig {
  display: string;
  icon?: string;
  description?: string;
  order?: number;
}

interface ProjectDocsConfig {
  categories?: Record<string, CategoryConfig>;
  defaultCategory?: string;
}

interface Props {
  project: ProjectInfo;
  docs: Doc[];
  selectedDoc: Doc | null;
  selectedContent: string | null;
  categoryConfig: ProjectDocsConfig;
}

export function SplitPanelViewer({ project, docs, selectedDoc, selectedContent, categoryConfig }: Props) {
  // Helper function to get display name for category
  const getCategoryDisplayName = (categoryKey: string): string => {
    return categoryConfig.categories?.[categoryKey]?.display || formatCategoryName(categoryKey);
  };

  // Helper function to format category name if no config exists
  const formatCategoryName = (name: string): string => {
    return name
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to get icon for category
  const getCategoryIcon = (categoryKey: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      '01-setup': <Settings className="w-4 h-4" />,
      '02-planning': <ClipboardList className="w-4 h-4" />,
      '03-development': <Code className="w-4 h-4" />,
      '04-design': <Palette className="w-4 h-4" />,
      '05-deployment': <Rocket className="w-4 h-4" />,
      '06-git': <GitBranch className="w-4 h-4" />,
      '07-testing': <TestTube2 className="w-4 h-4" />,
      '08-reference': <BookOpen className="w-4 h-4" />,
      '09-reports': <BarChart3 className="w-4 h-4" />,
      'other': <FolderOpen className="w-4 h-4" />,
    };
    return iconMap[categoryKey] || <FolderOpen className="w-4 h-4" />;
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(
      docs.reduce((acc, doc) => {
        acc[doc.category] = true;
        return acc;
      }, {} as Record<string, boolean>)
    ))
  );

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

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Calculate progress
  const currentIndex = selectedDoc ? docs.findIndex(d => d.path === selectedDoc.path) : 0;
  const totalDocs = docs.length;

  // Calculate prev/next documents
  const prevDoc = currentIndex > 0 ? docs[currentIndex - 1] : null;
  const nextDoc = currentIndex < totalDocs - 1 ? docs[currentIndex + 1] : null;

  // Calculate category-based progress
  const categoryDocs = selectedDoc ? docs.filter(d => d.category === selectedDoc.category) : [];
  const categoryIndex = selectedDoc ? categoryDocs.findIndex(d => d.path === selectedDoc.path) : 0;
  const categoryTotal = categoryDocs.length;

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      {/* Top Nav Bar */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="text-base font-semibold">{project.displayName}</div>
                <div className="text-xs text-amber-500 uppercase tracking-wide">Documentation</div>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {selectedDoc && (
              <div className="text-sm text-slate-400">
                <span className="text-amber-500 font-medium">{getCategoryDisplayName(selectedDoc.category)}</span>
                <span className="mx-2">·</span>
                <span>{categoryIndex + 1} of {categoryTotal}</span>
              </div>
            )}
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 border-r border-slate-800 bg-slate-900 h-[calc(100vh-60px)] overflow-y-auto sticky top-[60px]">
            {/* Search */}
            <div className="p-4 border-b border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="search"
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Categories */}
            <nav className="p-3">
              {Object.entries(groupedDocs)
                .sort(([keyA], [keyB]) => {
                  const orderA = categoryConfig.categories?.[keyA]?.order ?? 999;
                  const orderB = categoryConfig.categories?.[keyB]?.order ?? 999;
                  return orderA - orderB;
                })
                .map(([category, categoryDocs]) => {
                const isExpanded = expandedCategories.has(category);
                return (
                  <div key={category} className="mb-3">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-amber-500 group-hover:text-amber-400 transition-colors">
                          {getCategoryIcon(category)}
                        </div>
                        <span className="text-base">{getCategoryDisplayName(category)}</span>
                        <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                          {categoryDocs.length}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-1 ml-3 pl-3 border-l-2 border-slate-800">
                        {categoryDocs.map((doc) => {
                          const isSelected = selectedDoc?.path === doc.path;
                          return (
                            <Link
                              key={doc.path}
                              href={`/project/${project.name}/docs-list/${doc.path}`}
                              className={`
                                block px-3 py-2.5 rounded-lg text-sm transition-all
                                ${isSelected
                                  ? 'bg-amber-500/15 text-amber-300 font-medium border-l-2 border-amber-400 -ml-[14px] pl-[12px] shadow-sm shadow-amber-500/10'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                }
                              `}
                            >
                              <div className="truncate">{doc.filename.replace('.md', '')}</div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {selectedContent ? (
            <article className="px-6 py-12 md:px-12 max-w-4xl mx-auto">
              {/* Enhanced Breadcrumb & Progress */}
              <div className="mb-10 pb-8 border-b border-slate-800">
                {/* Breadcrumb Trail */}
                <div className="flex items-center gap-2 text-sm mb-3">
                  <Link
                    href={`/project/${project.name}/docs-list`}
                    className="text-slate-500 hover:text-amber-500 transition-colors"
                  >
                    {project.displayName}
                  </Link>
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                  <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 font-medium">
                    {selectedDoc?.category ? getCategoryDisplayName(selectedDoc.category) : ''}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                  <span className="text-slate-300 font-medium">{selectedDoc?.filename.replace('.md', '')}</span>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center gap-3">
                  <div className="text-xs text-slate-500">
                    Document <span className="text-amber-500 font-semibold">{categoryIndex + 1}</span> of <span className="text-slate-400">{categoryTotal}</span> in this section
                  </div>
                  <span className="text-slate-700">·</span>
                  <div className="text-xs text-slate-600">
                    {currentIndex + 1} of {totalDocs} total
                  </div>
                </div>
              </div>

              {/* Markdown Content */}
              <div className="prose prose-invert prose-slate max-w-none
                prose-headings:text-slate-50 prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-5xl prose-h1:mb-8 prose-h1:pb-8 prose-h1:border-b prose-h1:border-slate-700 prose-h1:leading-tight
                prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-4
                prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4 prose-h3:text-slate-200
                prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-3 prose-h4:text-slate-300
                prose-p:text-slate-300 prose-p:leading-[1.8] prose-p:text-[15px] prose-p:mb-6
                prose-strong:text-slate-100 prose-strong:font-semibold
                prose-em:text-slate-200 prose-em:italic
                prose-code:text-amber-400 prose-code:bg-slate-900/80 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-[''] prose-code:border prose-code:border-slate-800
                prose-pre:bg-slate-900 prose-pre:border-2 prose-pre:border-slate-800 prose-pre:shadow-2xl prose-pre:rounded-xl prose-pre:my-8 prose-pre:p-6
                prose-a:text-amber-400 prose-a:font-medium prose-a:underline prose-a:decoration-amber-500/30 prose-a:underline-offset-4 hover:prose-a:text-amber-300 hover:prose-a:decoration-amber-400/50 prose-a:transition-colors
                prose-blockquote:border-l-4 prose-blockquote:border-l-amber-500 prose-blockquote:bg-slate-900/70 prose-blockquote:text-slate-300 prose-blockquote:rounded-r-lg prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:my-6 prose-blockquote:italic
                prose-li:text-slate-300 prose-li:my-2 prose-li:leading-relaxed
                prose-ul:my-6 prose-ul:space-y-2
                prose-ol:my-6 prose-ol:space-y-2
                prose-hr:border-slate-700 prose-hr:my-12
                prose-table:text-slate-300 prose-table:border-collapse prose-table:w-full prose-table:my-8
                prose-th:text-slate-100 prose-th:bg-slate-800/50 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-slate-700
                prose-td:text-slate-300 prose-td:px-4 prose-td:py-3 prose-td:border prose-td:border-slate-800
                prose-tr:border-b prose-tr:border-slate-800
                prose-img:rounded-lg prose-img:shadow-xl prose-img:my-8
              ">
                <ReactMarkdown
                  rehypePlugins={[
                    rehypeHighlight,
                    rehypeSlug,
                    [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                  ]}
                >
                  {selectedContent}
                </ReactMarkdown>
              </div>

              {/* Prev/Next Navigation */}
              <div className="mt-16 pt-8 border-t border-slate-800 flex items-center justify-between gap-4">
                {prevDoc ? (
                  <Link
                    href={`/project/${project.name}/docs-list/${prevDoc.path}`}
                    className="group flex-1 flex items-center gap-3 p-4 rounded-lg border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/50 transition-all"
                  >
                    <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-amber-500/10 transition-colors">
                      <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-500 mb-1">Previous</div>
                      <div className="font-medium text-slate-300 group-hover:text-amber-400 truncate">
                        {prevDoc.filename.replace('.md', '')}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {getCategoryDisplayName(prevDoc.category)}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex-1"></div>
                )}

                {nextDoc ? (
                  <Link
                    href={`/project/${project.name}/docs-list/${nextDoc.path}`}
                    className="group flex-1 flex items-center gap-3 p-4 rounded-lg border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/50 transition-all text-right"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-500 mb-1">Next</div>
                      <div className="font-medium text-slate-300 group-hover:text-amber-400 truncate">
                        {nextDoc.filename.replace('.md', '')}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {getCategoryDisplayName(nextDoc.category)}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-amber-500/10 transition-colors">
                      <ChevronRightNav className="w-5 h-5 text-slate-400 group-hover:text-amber-500" />
                    </div>
                  </Link>
                ) : (
                  <div className="flex-1"></div>
                )}
              </div>
            </article>
          ) : (
            <div className="flex items-center justify-center h-[calc(100vh-60px)]">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-slate-400 font-medium">Select a document to view</p>
                <p className="text-sm text-slate-500 mt-1">Choose a file from the sidebar</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
