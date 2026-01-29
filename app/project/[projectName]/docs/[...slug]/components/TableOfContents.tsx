'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Get all heading elements
    const headingElements = headings.map(({ id }) =>
      document.getElementById(id)
    ).filter(Boolean) as HTMLElement[];

    if (headingElements.length === 0) return;

    // Intersection Observer for scroll spy
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 1.0,
      }
    );

    // Observe all headings
    headingElements.forEach((el) => observer.observe(el));

    return () => {
      headingElements.forEach((el) => observer.unobserve(el));
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-gray-100 mb-4 uppercase tracking-wider">
        On This Page
      </h3>
      <nav className="space-y-1">
        {headings
          .filter((h) => h.level >= 2 && h.level <= 3)
          .map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={cn(
                'block text-sm py-2 px-3 rounded-lg transition-all duration-200 border-l-2',
                heading.level === 2 && 'ml-0',
                heading.level === 3 && 'ml-4',
                activeId === heading.id
                  ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 border-blue-600 dark:border-blue-400'
                  : 'text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 border-transparent hover:border-slate-300 dark:hover:border-gray-600'
              )}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }}
            >
              {heading.text}
            </a>
          ))}
      </nav>
    </div>
  );
}
