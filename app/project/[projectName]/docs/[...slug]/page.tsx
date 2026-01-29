import { notFound } from 'next/navigation';
import { getProjectMetadata } from '@/lib/project-metadata';
import { parseMarkdownStructure } from '@/lib/markdown-parser';
import { PROJECT_ROOTS } from '@/lib/project-config';
import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { TableOfContents } from './components/TableOfContents';

export default async function DocPage({
  params,
}: {
  params: Promise<{ projectName: string; slug: string[] }>;
}) {
  const { projectName, slug } = await params;
  
  // Get project metadata to verify project exists
  const project = await getProjectMetadata(projectName);
  if (!project) {
    notFound();
  }

  // Construct file path from slug
  const projectRoot = PROJECT_ROOTS[projectName];
  const filePath = path.join(projectRoot, ...slug);
  const mdPath = filePath.endsWith('.md') ? filePath : `${filePath}.md`;

  // Check if file exists
  if (!fs.existsSync(mdPath)) {
    notFound();
  }

  // Read and parse markdown
  const markdown = fs.readFileSync(mdPath, 'utf-8');
  const parsed = parseMarkdownStructure(markdown);

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="mb-4 md:mb-6 text-sm md:text-base text-slate-800 dark:text-gray-300" aria-label="Breadcrumb">
          <a href="/" className="inline-flex items-center py-2 px-2 -ml-2 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-gray-700 rounded transition-colors">
            Home
          </a>
          <span aria-hidden="true" className="mx-1 text-slate-400">/</span>
          <a
            href={`/project/${projectName}`}
            className="inline-flex items-center py-2 px-2 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            {project.displayName}
          </a>
          <span aria-hidden="true" className="mx-1 text-slate-400">/</span>
          <span className="text-slate-900 dark:text-gray-100 font-medium py-2">
            {slug[slug.length - 1].replace('.md', '').replace(/-/g, ' ')}
          </span>
        </nav>

        {/* Two-column layout - TOC on LEFT */}
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 lg:gap-8">
          {/* Table of Contents sidebar - LEFT SIDE */}
          <aside className="hidden lg:block">
            <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <TableOfContents headings={parsed.headings} />
            </div>
          </aside>

          {/* Main content */}
          <article className="bg-white dark:bg-gray-900 rounded-xl p-6 md:p-8 border border-slate-200 dark:border-gray-700 prose prose-sm md:prose-base prose-slate dark:prose-invert max-w-4xl prose-headings:text-slate-900 dark:prose-headings:text-gray-100 prose-p:text-slate-700 dark:prose-p:text-gray-300 prose-strong:text-slate-900 dark:prose-strong:text-gray-100 prose-code:text-slate-800 dark:prose-code:text-gray-200 prose-li:text-slate-700 dark:prose-li:text-gray-300">
            <ReactMarkdown
              rehypePlugins={[
                rehypeHighlight,
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: 'wrap' }],
              ]}
            >
              {markdown}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}
