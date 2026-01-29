'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileText, Folder, ChevronRight, ChevronDown, Search, Menu, X, Sun, Moon, Copy, Check, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import 'highlight.js/styles/github-dark.css';

interface DocFile {
  name: string;
  path: string;
  relativePath: string;
  type: 'file' | 'directory';
  children?: DocFile[];
}

const PROJECT_NAMES: Record<string, string> = {
  'workspace-docs': 'Workspace Documentation',
  'wish-x': 'Wish-X',
  'wish-backend-x': 'Wish Backend X',
  'doc-automation-hub': 'Documentation Automation Hub',
  'claude-agent-server': 'Claude Agent Server',
};

function FileTreeItem({
  item,
  project,
  onSelect,
  selectedFile,
  darkMode,
}: {
  item: DocFile;
  project: string;
  onSelect: (project: string, file: string) => void;
  selectedFile: string | null;
  darkMode: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = selectedFile === `${project}:${item.relativePath}`;

  if (item.type === 'file') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors',
          isSelected
            ? darkMode
              ? 'bg-blue-900/50 text-blue-300'
              : 'bg-blue-100 text-blue-900'
            : darkMode
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-gray-100 text-gray-700'
        )}
        onClick={() => onSelect(project, item.relativePath)}
      >
        <FileText className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{item.name}</span>
      </div>
    );
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors",
          darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
        )}
        <Folder className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{item.name}</span>
      </div>
      {isOpen && item.children && (
        <div className="ml-4">
          {item.children.map((child, idx) => (
            <FileTreeItem
              key={idx}
              item={child}
              project={project}
              onSelect={onSelect}
              selectedFile={selectedFile}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ViewerContent() {
  const searchParams = useSearchParams();
  const projectParam = searchParams.get('project');

  const [docs, setDocs] = useState<DocFile[] | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (projectParam) {
      fetchDocs();
    }
  }, [projectParam]);

  async function fetchDocs() {
    try {
      setLoading(true);
      const response = await fetch('/docs-viewer/api/docs');
      const data = await response.json();
      setDocs(data[projectParam!] || []);
    } catch (error) {
      console.error('Error fetching docs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectFile(project: string, file: string) {
    try {
      setContentLoading(true);
      const fileKey = `${project}:${file}`;
      setSelectedFile(fileKey);
      const response = await fetch(
        `/docs-viewer/api/content?project=${project}&file=${encodeURIComponent(file)}`
      );
      const data = await response.json();
      const content = data.content || '';
      setFileContent(content);
    } catch (error) {
      console.error('Error fetching file content:', error);
      setFileContent('Error loading file content');
    } finally {
      setContentLoading(false);
    }
  }

  const filteredDocs = docs
    ? filterFilesBySearch(docs, searchQuery.toLowerCase())
    : [];

  function filterFilesBySearch(files: DocFile[], query: string): DocFile[] {
    if (!query) return files;
    return files
      .map((file) => {
        if (file.type === 'file') {
          return file.name.toLowerCase().includes(query) ? file : null;
        } else {
          const filteredChildren = file.children
            ? filterFilesBySearch(file.children, query)
            : [];
          if (filteredChildren.length > 0) {
            return { ...file, children: filteredChildren };
          }
          return file.name.toLowerCase().includes(query) ? file : null;
        }
      })
      .filter(Boolean) as DocFile[];
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!projectParam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No project selected</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Go back to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-screen", darkMode ? "bg-gray-900" : "bg-gray-50")}>
      {/* Sidebar */}
      <aside
        className={cn(
          'border-r transition-all duration-300',
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
          sidebarOpen ? 'w-80' : 'w-0',
          'overflow-hidden'
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className={cn("p-4 border-b", darkMode ? "border-gray-700" : "border-gray-200")}>
            <div className="flex items-center justify-between mb-4">
              <h1 className={cn("text-lg font-semibold truncate", darkMode ? "text-gray-100" : "text-gray-900")}>
                {PROJECT_NAMES[projectParam] || projectParam}
              </h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className={cn("lg:hidden p-1 rounded cursor-pointer", darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100")}
              >
                <X className={cn("w-5 h-5", darkMode ? "text-gray-300" : "")} />
              </button>
            </div>
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400",
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                )}
              />
            </div>
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 text-sm cursor-pointer hover:underline",
                darkMode ? "text-blue-400" : "text-blue-600"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all projects
            </Link>
          </div>

          {/* File Tree */}
          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className={cn("text-center", darkMode ? "text-gray-400" : "text-gray-500")}>Loading files...</div>
            ) : (
              filteredDocs.map((file, idx) => (
                <FileTreeItem
                  key={idx}
                  item={file}
                  project={projectParam}
                  onSelect={handleSelectFile}
                  selectedFile={selectedFile}
                  darkMode={darkMode}
                />
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className={cn("border-b p-4 flex items-center gap-4", darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className={cn("p-2 rounded-md cursor-pointer", darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100")}
            >
              <Menu className={cn("w-5 h-5", darkMode ? "text-gray-300" : "")} />
            </button>
          )}
          <h2 className={cn("text-lg font-semibold flex-1 truncate", darkMode ? "text-gray-100" : "text-gray-900")}>
            {selectedFile ? selectedFile.split(':')[1] : 'Documentation Viewer'}
          </h2>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={cn("p-2 rounded-md cursor-pointer", darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100")}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {contentLoading ? (
            <div className={cn("text-center py-12", darkMode ? "text-gray-400" : "text-gray-500")}>Loading content...</div>
          ) : selectedFile ? (
            <div className="max-w-5xl mx-auto">
              {/* Breadcrumb */}
              <div className={cn("mb-6 text-sm", darkMode ? "text-gray-400" : "text-gray-600")}>
                <span className={darkMode ? "text-gray-500" : "text-gray-400"}>
                  {selectedFile.split(':')[0]}
                </span>
                {' / '}
                <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                  {selectedFile.split(':')[1]}
                </span>
              </div>

              {/* Enhanced Markdown Content */}
              <article className={cn(
                "prose prose-lg max-w-none",
                darkMode
                  ? "prose-invert prose-headings:text-gray-100 prose-p:text-gray-300 prose-a:text-blue-400 prose-strong:text-gray-100 prose-code:text-gray-100 prose-pre:bg-gray-800"
                  : "prose-slate prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
              )}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[
                    rehypeHighlight,
                    rehypeSlug,
                    [rehypeAutolinkHeadings, { behavior: 'wrap' }]
                  ]}
                  components={{
                    pre: ({ node, ...props }) => {
                      const code = props.children?.toString() || '';
                      const id = Math.random().toString(36);
                      return (
                        <div className="relative group">
                          <button
                            onClick={() => copyToClipboard(code, id)}
                            className={cn(
                              "absolute right-2 top-2 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer",
                              darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-700 hover:bg-gray-600"
                            )}
                            aria-label="Copy code"
                          >
                            {copiedCode === id ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-300" />
                            )}
                          </button>
                          <pre {...props} />
                        </div>
                      );
                    },
                    code: ({ node, ...props }) => {
                      const isInline = !props.className;
                      return (
                        <code
                          className={cn(
                            isInline && (darkMode ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-800")
                          )}
                          {...props}
                        />
                      );
                    },
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto">
                        <table {...props} />
                      </div>
                    ),
                  }}
                >
                  {fileContent}
                </ReactMarkdown>
              </article>
            </div>
          ) : (
            <div className={cn("text-center py-12", darkMode ? "text-gray-400" : "text-gray-500")}>
              <FileText className={cn("w-16 h-16 mx-auto mb-4", darkMode ? "text-gray-600" : "text-gray-300")} />
              <p className="text-lg">Select a documentation file to view</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ViewerPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ViewerContent />
    </Suspense>
  );
}
