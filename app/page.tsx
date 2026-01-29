'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, FileText, Server, Settings, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
  name: string;
  displayName: string;
  description: string;
  category: string;
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
  const [darkMode, setDarkMode] = useState(false);

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

  const filteredProjects = Object.entries(projects).reduce((acc, [categoryName, category]) => {
    if (searchQuery) {
      const filtered = category.projects.filter(p =>
        p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[categoryName] = { ...category, projects: filtered };
      }
    } else {
      acc[categoryName] = category;
    }
    return acc;
  }, {} as Record<string, ProjectCategory>);

  return (
    <div className={cn('min-h-screen', darkMode ? 'bg-gray-900' : 'bg-slate-50')}>
      {/* Hero Section */}
      <header className={cn('border-b', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200')}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-6 flex-1">
              <div className="relative w-48 h-48 flex-shrink-0">
                <img
                  src="/docs-viewer/genie-logo.png"
                  alt="As You Wish Logo"
                  className="w-full h-full object-contain genie-magic-animation"
                />
              </div>
              <div>
                <h1 className={cn('text-6xl font-bold mb-4 tracking-tight', darkMode ? 'text-gray-100' : 'text-gray-950')}>
                  As You Wish X1
                </h1>
                <p className={cn('text-xl font-medium', darkMode ? 'text-gray-400' : 'text-slate-600')}>
                  Documentation Hub
                </p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={cn('p-2 rounded-lg', darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100')}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Search and Description */}
        <div className="mb-12">
          <h2 className={cn('text-3xl font-bold mb-4', darkMode ? 'text-gray-100' : 'text-gray-900')}>
            Technical Documentation Portal
          </h2>
          <p className={cn('text-lg mb-6', darkMode ? 'text-gray-400' : 'text-slate-600')}>
            Your Governed, Self-Evolving Execution Platform. Search and explore comprehensive documentation across all projects.
          </p>

          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-12 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500'
                  : 'bg-white border-slate-300 text-gray-900 placeholder:text-slate-400'
              )}
            />
          </div>
        </div>

        {/* Project Categories */}
        {loading ? (
          <div className={cn('text-center py-12', darkMode ? 'text-gray-400' : 'text-slate-500')}>
            Loading Projects...
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(filteredProjects).map(([categoryName, category]) => {
              const Icon = getCategoryIcon(category.definition.icon);

              return (
                <section key={categoryName}>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={cn(
                      'p-2 rounded-lg',
                      darkMode ? 'bg-gray-800' : 'bg-slate-100'
                    )}>
                      <Icon className={cn('w-6 h-6', darkMode ? 'text-gray-300' : 'text-slate-700')} />
                    </div>
                    <div className="flex-1">
                      <h3 className={cn('text-2xl font-semibold', darkMode ? 'text-gray-100' : 'text-gray-900')}>
                        {category.definition.displayName}
                      </h3>
                      <p className={cn('text-base', darkMode ? 'text-gray-400' : 'text-slate-600')}>
                        {category.definition.description}
                      </p>
                    </div>
                    <div className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium',
                      darkMode ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'
                    )}>
                      {category.projects.length}
                    </div>
                  </div>

                  {/* Project Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.projects.map((project) => (
                      <Link
                        key={project.name}
                        href={`/project/${project.name}`}
                        className={cn(
                          'group block rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4',
                          darkMode
                            ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-gray-900/50 focus-visible:ring-offset-gray-900'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-slate-200/50 focus-visible:ring-offset-slate-50'
                        )}
                      >
                        {/* Project Image - Perfect 1:1 Square */}
                        <div className="relative w-full pb-[100%] overflow-hidden bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-900/50">
                          <img
                            src={`/docs-viewer/${project.name}.png`}
                            alt={project.displayName}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>

                        {/* Project Info */}
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className={cn(
                              'p-2 rounded-lg',
                              darkMode ? 'bg-gray-700' : 'bg-slate-100'
                            )}>
                              <Icon className={cn('w-5 h-5', darkMode ? 'text-gray-300' : 'text-slate-700')} />
                            </div>
                            <h4 className={cn('text-xl font-semibold flex-1', darkMode ? 'text-gray-100' : 'text-gray-900')}>
                              {project.displayName}
                            </h4>
                          </div>
                          <p className={cn('text-base mb-4', darkMode ? 'text-gray-400' : 'text-slate-600')}>
                            {project.description}
                          </p>
                          <div className={cn(
                            'flex items-center gap-2 text-sm font-medium',
                            darkMode ? 'text-blue-400' : 'text-blue-600'
                          )}>
                            <span>View Documentation</span>
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={cn('border-t mt-20', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200')}>
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className={cn('text-sm mb-1', darkMode ? 'text-gray-400' : 'text-slate-600')}>
            As You Wish X1 Documentation Hub
          </p>
          <p className={cn('text-xs', darkMode ? 'text-gray-500' : 'text-slate-500')}>
            A governed, self-evolving execution and memory system
          </p>
        </div>
      </footer>
    </div>
  );
}
