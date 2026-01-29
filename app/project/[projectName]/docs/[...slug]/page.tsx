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
        <nav className="mb-4 md:mb-6 text-xs md:text-sm text-gray-600 dark:text-gray-400" aria-label="Breadcrumb">
          <a href="/docs-viewer" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
            Home
          </a>
          {' / '}
          <a
            href={`/docs-viewer/project/${projectName}`}
            className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            {project.displayName}
          </a>
          {' / '}
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            {slug[slug.length - 1].replace('.md', '').replace(/-/g, ' ')}
          </span>
        </nav>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-6 lg:gap-8">
          {/* Main content */}
          <article className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 border border-slate-200 dark:border-gray-700 prose prose-sm md:prose-base prose-slate dark:prose-invert max-w-none">
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

          {/* Table of Contents sidebar */}
          <aside className="hidden lg:block">
            <TableOfContents headings={parsed.headings} />
          </aside>
        </div>
      </div>
    </div>
  );
}
