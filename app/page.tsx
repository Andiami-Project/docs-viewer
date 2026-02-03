'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Search, FileText, Server, Settings, Zap, Database, Globe, ArrowRight, Code, Workflow, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamically import Mermaid diagram (client-side only)
const SystemFlowDiagram = dynamic(() => import('@/components/SystemFlowDiagram'), {
  ssr: false,
  loading: () => <div className="h-[400px] flex items-center justify-center text-slate-400">Loading diagram...</div>
});

interface Project {
  name: string;
  displayName: string;
  description: string;
  category: string;
  tags?: string[];
}

interface ProjectCategory {
  definition: {
    name: string;
    displayName: string;
    description: string;
    icon: string;
  };
  projects: Project[];
}

export default function HomePage() {
  const [projects, setProjects] = useState<Record<string, ProjectCategory>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setLoading(true);
      const response = await fetch('/docs-viewer/api/projects?action=by-category');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }

  async function downloadAllDocs() {
    try {
      setDownloading(true);
      const response = await fetch('/api/download');

      if (!response.ok) {
        throw new Error('Failed to download documentation');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `as-you-wish-docs-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading documentation:', error);
      alert('Failed to download documentation. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return FileText;
      case 'Server':
        return Server;
      case 'Settings':
        return Settings;
      default:
        return FileText;
    }
  };

  // Filter projects based on search query
  const filteredProjects = Object.entries(projects).reduce((acc, [categoryName, category]) => {
    const query = searchQuery.toLowerCase();
    const matchingProjects = category.projects.filter(project => {
      return (
        project.displayName.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        categoryName.toLowerCase().includes(query) ||
        category.definition.displayName.toLowerCase().includes(query)
      );
    });

    if (matchingProjects.length > 0) {
      acc[categoryName] = {
        ...category,
        projects: matchingProjects
      };
    }

    return acc;
  }, {} as Record<string, ProjectCategory>);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
              As You Wish Ecosystem
            </h1>
            <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">
              Complete system architecture documentation - understand how all projects work together
            </p>

            {/* Download All Button */}
            <div className="flex justify-center">
              <button
                onClick={downloadAllDocs}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30"
              >
                <Download className="w-5 h-5" />
                {downloading ? 'Generating Archive...' : 'Download All Documentation'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* System Architecture Overview */}
      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-8 text-center">System Architecture Flow</h2>

          <p className="text-center text-slate-400 mb-8 max-w-3xl mx-auto">
            Interactive workflow diagram - click on any layer to explore its documentation
          </p>

          {/* Interactive Mermaid Diagram */}
          <div className="mb-12 bg-slate-950/50 border border-slate-800 rounded-xl p-8">
            <SystemFlowDiagram />
          </div>

          {/* Detailed Layer Cards */}
          <h3 className="text-2xl font-bold mb-6 text-center text-slate-300">Layer Details</h3>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Frontend Layer - Clickable */}
            <Link
              href="/project/wish-x/docs-list"
              className="group bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <Globe className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold group-hover:text-blue-400 transition-colors">Frontend Layer</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 group-hover:border-blue-500/30 transition-colors">
                  <div className="font-medium text-blue-400 mb-1">wish-x</div>
                  <div className="text-sm text-slate-400">Next.js 15 + React 19 UI</div>
                  <div className="text-xs text-slate-500 mt-1">User input → Chat interface</div>
                </div>
                <div className="flex items-center justify-between">
                  <ArrowRight className="w-5 h-5 text-slate-600" />
                  <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view docs →
                  </span>
                </div>
              </div>
            </Link>

            {/* Backend Layer - Clickable */}
            <Link
              href="/project/wish-backend-x/docs-list"
              className="group bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                  <Server className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold group-hover:text-amber-400 transition-colors">Backend Layer</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 group-hover:border-amber-500/30 transition-colors">
                  <div className="font-medium text-amber-400 mb-1">wish-backend-x</div>
                  <div className="text-sm text-slate-400">Trigger.dev v4 orchestration</div>
                  <div className="text-xs text-slate-500 mt-1">Routes to Claude Agent</div>
                </div>
                <div className="flex items-center justify-between">
                  <ArrowRight className="w-5 h-5 text-slate-600" />
                  <span className="text-xs text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view docs →
                  </span>
                </div>
              </div>
            </Link>

            {/* Agent Layer - Clickable */}
            <Link
              href="/project/claude-agent-server/docs-list"
              className="group bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold group-hover:text-purple-400 transition-colors">Agent Layer</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 group-hover:border-purple-500/30 transition-colors">
                  <div className="font-medium text-purple-400 mb-1">claude-agent-server</div>
                  <div className="text-sm text-slate-400">WebSocket + Agent SDK</div>
                  <div className="text-xs text-slate-500 mt-1">Executes tools & streams responses</div>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view docs →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
              <Workflow className="w-5 h-5 text-blue-400 mb-2" />
              <div className="font-medium text-sm mb-1">Real-time Streaming</div>
              <div className="text-xs text-slate-400">WebSocket bidirectional flow</div>
            </div>
            <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
              <Database className="w-5 h-5 text-green-400 mb-2" />
              <div className="font-medium text-sm mb-1">Supabase Integration</div>
              <div className="text-xs text-slate-400">Database + Storage + Auth</div>
            </div>
            <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
              <Code className="w-5 h-5 text-amber-400 mb-2" />
              <div className="font-medium text-sm mb-1">Tool Execution</div>
              <div className="text-xs text-slate-400">Read, Write, Bash, MCP servers</div>
            </div>
            <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
              <FileText className="w-5 h-5 text-purple-400 mb-2" />
              <div className="font-medium text-sm mb-1">Attachment Support</div>
              <div className="text-xs text-slate-400">Images, PDFs, documents</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search across all project documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Project Categories - Unified Grid Layout */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-12 text-slate-400">
            Loading Projects...
          </div>
        ) : (
          <>
            {/* Unified Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(filteredProjects).flatMap(([categoryName, category]) => {
                const Icon = getCategoryIcon(category.definition.icon);

                return category.projects.map((project) => (
                  <Link
                    key={project.name}
                    href={`/project/${project.name}/docs-list`}
                    className="group block bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-200"
                  >
                    {/* Category Badge */}
                    <div className="px-4 pt-4 pb-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Icon className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-slate-400 font-medium">{category.definition.displayName}</span>
                      </div>
                    </div>

                    {/* Project Content */}
                    <div className="px-4 pb-4">
                      <h4 className="text-lg font-semibold text-slate-100 mb-2 group-hover:text-amber-400 transition-colors">
                        {project.displayName}
                      </h4>
                      <p className="text-sm text-slate-400 line-clamp-3 mb-4">
                        {project.description}
                      </p>

                      {/* Tags */}
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {project.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action */}
                      <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-700">
                        <span className="text-slate-400">View Documentation</span>
                        <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ));
              })}
            </div>

            {/* No Results Message */}
            {Object.keys(filteredProjects).length === 0 && searchQuery && (
              <div className="text-center py-12 text-slate-400">
                <p className="text-lg">No projects found matching &quot;{searchQuery}&quot;</p>
                <p className="text-sm mt-2 text-slate-500">Try a different search term</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-1">
              As You Wish Ecosystem Documentation
            </p>
            <p className="text-xs text-slate-500">
              Complete system architecture - Frontend → Backend → Agent Layer
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
