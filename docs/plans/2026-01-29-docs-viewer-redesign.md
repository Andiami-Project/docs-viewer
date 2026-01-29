# Documentation Viewer Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the documentation viewer from a basic file picker into a beautiful, user-friendly hybrid documentation platform with project landing pages and enhanced viewing experience.

**Architecture:** Route-based architecture with dynamic project landing pages (`/project/[name]`), enhanced documentation viewer (`/project/[name]/docs/[slug]`), and smart content detection APIs. Uses existing file-based doc storage with intelligent metadata extraction.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, ReactMarkdown, rehype plugins, Lucide icons

---

## Phase 1: Project Landing Page Foundation

### Task 1: Create Project Route Structure

**Files:**
- Create: `app/project/[projectName]/page.tsx`
- Create: `app/project/[projectName]/layout.tsx`
- Create: `lib/project-metadata.ts`

**Step 1: Create project metadata utility**

Create `lib/project-metadata.ts`:

```typescript
import { promises as fs } from 'fs';
import path from 'path';

export interface ProjectMetadata {
  name: string;
  displayName: string;
  description: string;
  category: string;
  stats: {
    totalDocs: number;
    lastUpdated: string;
    components: number;
  };
  readmePreview: string;
  keyDocs: Array<{
    title: string;
    description: string;
    path: string;
    icon: string;
  }>;
}

export async function getProjectMetadata(projectName: string): Promise<ProjectMetadata | null> {
  try {
    const docsPath = path.join(process.cwd(), '.docs-viewer-data', projectName);
    const stats = await fs.stat(docsPath);

    // Count markdown files
    const files = await fs.readdir(docsPath, { recursive: true });
    const mdFiles = files.filter((f: string) => f.endsWith('.md'));

    return {
      name: projectName,
      displayName: projectName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: 'Project documentation',
      category: 'general',
      stats: {
        totalDocs: mdFiles.length,
        lastUpdated: stats.mtime.toISOString(),
        components: 0,
      },
      readmePreview: '',
      keyDocs: [],
    };
  } catch (error) {
    console.error('Error fetching project metadata:', error);
    return null;
  }
}
```

**Step 2: Run build to verify types**

Run: `npm run build`
Expected: Build succeeds with new utility file compiled

**Step 3: Create project layout**

Create `app/project/[projectName]/layout.tsx`:

```typescript
import { ReactNode } from 'react';

export default function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { projectName: string };
}) {
  return <>{children}</>;
}
```

**Step 4: Create basic project page**

Create `app/project/[projectName]/page.tsx`:

```typescript
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getProjectMetadata } from '@/lib/project-metadata';

export default async function ProjectPage({
  params,
}: {
  params: { projectName: string };
}) {
  const metadata = await getProjectMetadata(params.projectName);

  if (!metadata) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all projects
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {metadata.displayName}
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          {metadata.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {metadata.stats.totalDocs}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Documentation Files
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href={`/viewer?project=${params.projectName}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}
```

**Step 5: Test project landing page**

Run: `npm run dev`
Visit: `http://localhost:3000/project/wish-x`
Expected: Basic project landing page displays with stats

**Step 6: Commit**

```bash
git add app/project/ lib/project-metadata.ts
git commit -m "feat: add project landing page foundation"
```

---

### Task 2: README Content Extraction

**Files:**
- Modify: `lib/project-metadata.ts`
- Create: `lib/markdown-parser.ts`

**Step 1: Create markdown parser utility**

Create `lib/markdown-parser.ts`:

```typescript
export interface ParsedMarkdown {
  content: string;
  headings: Array<{
    level: number;
    text: string;
    slug: string;
  }>;
  codeBlocks: Array<{
    language: string;
    code: string;
  }>;
  firstParagraph: string;
}

export function parseMarkdown(content: string): ParsedMarkdown {
  const lines = content.split('\n');
  const headings: ParsedMarkdown['headings'] = [];
  const codeBlocks: ParsedMarkdown['codeBlocks'] = [];
  let firstParagraph = '';
  let inCodeBlock = false;
  let currentCodeBlock: { language: string; code: string } | null = null;

  for (const line of lines) {
    // Extract headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const slug = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      headings.push({ level, text, slug });
      continue;
    }

    // Track code blocks
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        const language = line.substring(3).trim() || 'text';
        currentCodeBlock = { language, code: '' };
        inCodeBlock = true;
      } else {
        if (currentCodeBlock) {
          codeBlocks.push(currentCodeBlock);
        }
        currentCodeBlock = null;
        inCodeBlock = false;
      }
      continue;
    }

    if (inCodeBlock && currentCodeBlock) {
      currentCodeBlock.code += line + '\n';
    }

    // Extract first paragraph
    if (!firstParagraph && line.trim() && !line.startsWith('#') && !line.startsWith('```')) {
      firstParagraph = line.trim();
    }
  }

  return {
    content,
    headings,
    codeBlocks,
    firstParagraph,
  };
}
```

**Step 2: Update project metadata to include README**

Modify `lib/project-metadata.ts` - add README parsing:

```typescript
import { parseMarkdown } from './markdown-parser';

// Add after existing imports
async function getReadmeContent(projectName: string): Promise<string> {
  try {
    const readmePath = path.join(process.cwd(), '.docs-viewer-data', projectName, 'README.md');
    const content = await fs.readFile(readmePath, 'utf-8');
    return content;
  } catch {
    // Try alternate locations
    try {
      const docsPath = path.join(process.cwd(), '.docs-viewer-data', projectName, 'docs', 'README.md');
      return await fs.readFile(docsPath, 'utf-8');
    } catch {
      return '';
    }
  }
}

// Update getProjectMetadata function to include README preview
export async function getProjectMetadata(projectName: string): Promise<ProjectMetadata | null> {
  try {
    const docsPath = path.join(process.cwd(), '.docs-viewer-data', projectName);
    const stats = await fs.stat(docsPath);

    const files = await fs.readdir(docsPath, { recursive: true });
    const mdFiles = files.filter((f: string) => f.endsWith('.md'));

    // Parse README
    const readmeContent = await getReadmeContent(projectName);
    const parsed = parseMarkdown(readmeContent);
    const preview = parsed.content.substring(0, 500) + '...';

    return {
      name: projectName,
      displayName: projectName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: parsed.firstParagraph || 'Project documentation',
      category: 'general',
      stats: {
        totalDocs: mdFiles.length,
        lastUpdated: stats.mtime.toISOString(),
        components: 0,
      },
      readmePreview: preview,
      keyDocs: [],
    };
  } catch (error) {
    console.error('Error fetching project metadata:', error);
    return null;
  }
}
```

**Step 3: Test README extraction**

Run: `npm run dev`
Visit: `http://localhost:3000/project/wish-x`
Check: Console should show README content being parsed

**Step 4: Commit**

```bash
git add lib/markdown-parser.ts lib/project-metadata.ts
git commit -m "feat: add README content extraction"
```

---

### Task 3: Hero Section with Stats

**Files:**
- Create: `app/project/[projectName]/components/ProjectHero.tsx`
- Modify: `app/project/[projectName]/page.tsx`

**Step 1: Create ProjectHero component**

Create `app/project/[projectName]/components/ProjectHero.tsx`:

```typescript
'use client';

import { FileText, Clock, Package } from 'lucide-react';

interface ProjectHeroProps {
  displayName: string;
  description: string;
  stats: {
    totalDocs: number;
    lastUpdated: string;
    components: number;
  };
}

export function ProjectHero({ displayName, description, stats }: ProjectHeroProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 rounded-2xl p-12 mb-8">
      <div className="max-w-4xl">
        <h1 className="text-5xl font-bold text-white mb-4">
          {displayName}
        </h1>
        <p className="text-xl text-blue-100 mb-8">
          {description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-white" />
              <div>
                <p className="text-3xl font-bold text-white">{stats.totalDocs}</p>
                <p className="text-sm text-blue-100">Documentation Files</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-white" />
              <div>
                <p className="text-lg font-semibold text-white">
                  {formatDate(stats.lastUpdated)}
                </p>
                <p className="text-sm text-blue-100">Last Updated</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-white" />
              <div>
                <p className="text-3xl font-bold text-white">{stats.components}</p>
                <p className="text-sm text-blue-100">Components</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Update project page to use hero**

Modify `app/project/[projectName]/page.tsx`:

```typescript
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getProjectMetadata } from '@/lib/project-metadata';
import { ProjectHero } from './components/ProjectHero';

export default async function ProjectPage({
  params,
}: {
  params: { projectName: string };
}) {
  const metadata = await getProjectMetadata(params.projectName);

  if (!metadata) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all projects
        </Link>

        <ProjectHero
          displayName={metadata.displayName}
          description={metadata.description}
          stats={metadata.stats}
        />

        <div className="mt-8">
          <Link
            href={`/viewer?project=${params.projectName}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Test hero section**

Run: `npm run dev`
Visit: `http://localhost:3000/project/wish-x`
Expected: Beautiful gradient hero with stats cards

**Step 4: Commit**

```bash
git add app/project/
git commit -m "feat: add hero section with stats cards"
```

---

## Phase 2: Enhanced Documentation Viewer

### Task 4: Table of Contents Sidebar

**Files:**
- Create: `app/project/[projectName]/docs/[...slug]/page.tsx`
- Create: `app/project/[projectName]/docs/[...slug]/components/TableOfContents.tsx`

**Step 1: Create TOC component**

Create `app/project/[projectName]/docs/[...slug]/components/TableOfContents.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Heading {
  level: number;
  text: string;
  slug: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.slug);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav className="sticky top-8 space-y-2">
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
        On This Page
      </p>
      {headings.map((heading) => (
        <a
          key={heading.slug}
          href={`#${heading.slug}`}
          className={cn(
            'block text-sm transition-colors hover:text-blue-600',
            heading.level === 2 && 'font-medium',
            heading.level === 3 && 'pl-4',
            activeId === heading.slug
              ? 'text-blue-600 font-medium'
              : 'text-gray-600 dark:text-gray-400'
          )}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );
}
```

**Step 2: Create enhanced doc viewer page**

Create `app/project/[projectName]/docs/[...slug]/page.tsx`:

```typescript
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { parseMarkdown } from '@/lib/markdown-parser';
import { TableOfContents } from './components/TableOfContents';
import { promises as fs } from 'fs';
import path from 'path';

async function getDocContent(projectName: string, slug: string[]) {
  const filePath = path.join(
    process.cwd(),
    '.docs-viewer-data',
    projectName,
    ...slug
  );

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch {
    return null;
  }
}

export default async function DocPage({
  params,
}: {
  params: { projectName: string; slug: string[] };
}) {
  const content = await getDocContent(params.projectName, params.slug);

  if (!content) {
    notFound();
  }

  const parsed = parseMarkdown(content);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link
          href={`/project/${params.projectName}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {params.projectName}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8">
          {/* Main Content */}
          <article className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[
                rehypeHighlight,
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: 'wrap' }],
              ]}
            >
              {content}
            </ReactMarkdown>
          </article>

          {/* Right Sidebar - TOC */}
          <aside className="hidden lg:block">
            <TableOfContents headings={parsed.headings} />
          </aside>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Test enhanced viewer**

Run: `npm run dev`
Visit: `http://localhost:3000/project/wish-x/docs/README.md`
Expected: Two-column layout with TOC on right, scroll spy working

**Step 4: Commit**

```bash
git add app/project/
git commit -m "feat: add table of contents with scroll spy"
```

---

### Task 5: Key Documentation Cards

**Files:**
- Create: `app/project/[projectName]/components/KeyDocCards.tsx`
- Modify: `app/project/[projectName]/page.tsx`
- Modify: `lib/project-metadata.ts`

**Step 1: Add key doc detection to metadata**

Modify `lib/project-metadata.ts` - add key doc detection:

```typescript
async function detectKeyDocs(projectName: string, files: string[]): Promise<Array<{
  title: string;
  description: string;
  path: string;
  icon: string;
}>> {
  const keyDocs = [];

  // Detect API docs
  const apiDoc = files.find(f =>
    f.toLowerCase().includes('api') ||
    f.toLowerCase().includes('reference')
  );
  if (apiDoc) {
    keyDocs.push({
      title: 'API Reference',
      description: 'Complete API documentation and reference',
      path: apiDoc,
      icon: 'Code',
    });
  }

  // Detect config docs
  const configDoc = files.find(f =>
    f.toLowerCase().includes('config') ||
    f.toLowerCase().includes('setup')
  );
  if (configDoc) {
    keyDocs.push({
      title: 'Configuration',
      description: 'Setup and configuration guide',
      path: configDoc,
      icon: 'Settings',
    });
  }

  // Detect examples
  const exampleDoc = files.find(f =>
    f.toLowerCase().includes('example') ||
    f.toLowerCase().includes('tutorial')
  );
  if (exampleDoc) {
    keyDocs.push({
      title: 'Examples',
      description: 'Code examples and tutorials',
      path: exampleDoc,
      icon: 'BookOpen',
    });
  }

  return keyDocs;
}

// Update getProjectMetadata to use detectKeyDocs
export async function getProjectMetadata(projectName: string): Promise<ProjectMetadata | null> {
  try {
    const docsPath = path.join(process.cwd(), '.docs-viewer-data', projectName);
    const stats = await fs.stat(docsPath);

    const files = await fs.readdir(docsPath, { recursive: true });
    const mdFiles = files.filter((f: string) => f.endsWith('.md'));

    const readmeContent = await getReadmeContent(projectName);
    const parsed = parseMarkdown(readmeContent);
    const preview = parsed.content.substring(0, 500) + '...';

    const keyDocs = await detectKeyDocs(projectName, mdFiles);

    return {
      name: projectName,
      displayName: projectName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: parsed.firstParagraph || 'Project documentation',
      category: 'general',
      stats: {
        totalDocs: mdFiles.length,
        lastUpdated: stats.mtime.toISOString(),
        components: keyDocs.length,
      },
      readmePreview: preview,
      keyDocs,
    };
  } catch (error) {
    console.error('Error fetching project metadata:', error);
    return null;
  }
}
```

**Step 2: Create KeyDocCards component**

Create `app/project/[projectName]/components/KeyDocCards.tsx`:

```typescript
import Link from 'next/link';
import { Code, Settings, BookOpen, FileText } from 'lucide-react';

interface KeyDoc {
  title: string;
  description: string;
  path: string;
  icon: string;
}

interface KeyDocCardsProps {
  projectName: string;
  docs: KeyDoc[];
}

const iconMap = {
  Code,
  Settings,
  BookOpen,
  FileText,
};

export function KeyDocCards({ projectName, docs }: KeyDocCardsProps) {
  if (docs.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Key Documentation
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.map((doc) => {
          const Icon = iconMap[doc.icon as keyof typeof iconMap] || FileText;

          return (
            <Link
              key={doc.path}
              href={`/project/${projectName}/docs/${doc.path}`}
              className="group block bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-600 transition-colors">
                  <Icon className="w-6 h-6 text-blue-600 group-hover:text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {doc.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 3: Update project page with key doc cards**

Modify `app/project/[projectName]/page.tsx`:

```typescript
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getProjectMetadata } from '@/lib/project-metadata';
import { ProjectHero } from './components/ProjectHero';
import { KeyDocCards } from './components/KeyDocCards';

export default async function ProjectPage({
  params,
}: {
  params: { projectName: string };
}) {
  const metadata = await getProjectMetadata(params.projectName);

  if (!metadata) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all projects
        </Link>

        <ProjectHero
          displayName={metadata.displayName}
          description={metadata.description}
          stats={metadata.stats}
        />

        <KeyDocCards
          projectName={params.projectName}
          docs={metadata.keyDocs}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Get Started
            </h2>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-400">
                {metadata.readmePreview}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Links
            </h2>
            <div className="space-y-2">
              <Link
                href={`/viewer?project=${params.projectName}`}
                className="block text-blue-600 hover:underline"
              >
                Browse all documentation →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Test key doc cards**

Run: `npm run dev`
Visit: `http://localhost:3000/project/wish-x`
Expected: Key documentation cards auto-detected and displayed

**Step 5: Commit**

```bash
git add app/project/ lib/project-metadata.ts
git commit -m "feat: add key documentation cards with auto-detection"
```

---

## Phase 3: Homepage Integration

### Task 6: Update Homepage Links

**Files:**
- Modify: `app/page.tsx`

**Step 1: Update project card links to new route**

Modify `app/page.tsx` - change the Link href:

```typescript
// Find this section (around line 176-222)
<Link
  key={project.name}
  href={`/project/${project.name}`}  // Changed from /viewer?project=
  className={cn(
    'group block rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
    // ... rest of className
  )}
>
```

**Step 2: Test homepage navigation**

Run: `npm run dev`
Visit: `http://localhost:3000`
Click: Any project card
Expected: Lands on new project landing page (not viewer)

**Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: update homepage to link to project landing pages"
```

---

## Phase 4: Polish & Optimization

### Task 7: Dark Mode & Responsive Design

**Files:**
- Modify: `app/project/[projectName]/components/ProjectHero.tsx`
- Modify: `app/project/[projectName]/docs/[...slug]/components/TableOfContents.tsx`

**Step 1: Test dark mode**

Run: `npm run dev`
Visit: `http://localhost:3000/project/wish-x`
Toggle: Dark mode (moon icon)
Expected: All components have proper dark mode styling

**Step 2: Test mobile responsiveness**

Run: `npm run dev`
Visit: `http://localhost:3000/project/wish-x`
Resize: Browser to mobile width (375px)
Expected:
- Hero stats stack vertically
- Key doc cards stack to single column
- TOC hidden on mobile
- All text readable and properly sized

**Step 3: Add mobile menu for TOC**

Modify `app/project/[projectName]/docs/[...slug]/page.tsx` - add mobile TOC:

```typescript
// Add mobile TOC button and drawer
<div className="lg:hidden mb-6">
  <details className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
    <summary className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">
      Table of Contents
    </summary>
    <div className="mt-4 space-y-2">
      {parsed.headings.map((heading) => (
        <a
          key={heading.slug}
          href={`#${heading.slug}`}
          className={cn(
            'block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600',
            heading.level === 3 && 'pl-4'
          )}
        >
          {heading.text}
        </a>
      ))}
    </div>
  </details>
</div>
```

**Step 4: Test mobile TOC**

Run: `npm run dev`
Visit: `http://localhost:3000/project/wish-x/docs/README.md` (mobile width)
Expected: Collapsible TOC visible, works on click

**Step 5: Commit**

```bash
git add app/project/
git commit -m "feat: add mobile responsive TOC and dark mode polish"
```

---

### Task 8: Loading States & Error Handling

**Files:**
- Create: `app/project/[projectName]/loading.tsx`
- Create: `app/project/[projectName]/not-found.tsx`
- Create: `app/project/[projectName]/docs/[...slug]/loading.tsx`
- Create: `app/project/[projectName]/docs/[...slug]/not-found.tsx`

**Step 1: Create project loading state**

Create `app/project/[projectName]/loading.tsx`:

```typescript
export default function ProjectLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6" />

        <div className="bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-12 mb-8 animate-pulse">
          <div className="h-12 w-2/3 bg-gray-300 dark:bg-gray-600 rounded mb-4" />
          <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-600 rounded mb-8" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-300/50 dark:bg-gray-600/50 rounded-xl p-4 h-24" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create project not found page**

Create `app/project/[projectName]/not-found.tsx`:

```typescript
import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function ProjectNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <FileQuestion className="w-20 h-20 text-gray-400 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Project Not Found
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          The project you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
```

**Step 3: Create doc loading and not found**

Create `app/project/[projectName]/docs/[...slug]/loading.tsx`:

```typescript
export default function DocLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>

          <div className="hidden lg:block space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

Create `app/project/[projectName]/docs/[...slug]/not-found.tsx`:

```typescript
import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function DocNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <FileQuestion className="w-20 h-20 text-gray-400 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Documentation Not Found
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          The documentation file you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
```

**Step 4: Test loading and error states**

Run: `npm run dev`
Visit: `http://localhost:3000/project/nonexistent`
Expected: 404 page with back button

Visit: `http://localhost:3000/project/wish-x` (slow network)
Expected: Loading skeleton while data fetches

**Step 5: Commit**

```bash
git add app/project/
git commit -m "feat: add loading states and error handling"
```

---

## Phase 5: Final Testing & Deployment

### Task 9: Comprehensive Testing

**Step 1: Test all projects**

Run: `npm run dev`

Test each project:
- `http://localhost:3000/project/wish-x`
- `http://localhost:3000/project/wish-backend-x`
- `http://localhost:3000/project/workspace-docs`
- `http://localhost:3000/project/doc-automation-hub`
- `http://localhost:3000/project/claude-agent-server`

Verify for each:
- [ ] Hero section displays with correct stats
- [ ] Key documentation cards appear (if docs exist)
- [ ] README preview shows
- [ ] "Browse All Documentation" button works
- [ ] Dark mode toggle works
- [ ] Mobile responsive (test at 375px, 768px, 1024px)

**Step 2: Test doc viewer**

For each project, click through to individual docs:
- [ ] TOC generates correctly
- [ ] Scroll spy highlights active section
- [ ] Code blocks have syntax highlighting
- [ ] Copy buttons work
- [ ] Mobile TOC collapsible works
- [ ] Back navigation works

**Step 3: Test homepage integration**

Visit: `http://localhost:3000`

Verify:
- [ ] All project cards link to new landing pages
- [ ] Search functionality still works
- [ ] Category filtering works
- [ ] Dark mode persists across navigation

**Step 4: Performance check**

Run: `npm run build`
Check: Build output for bundle size warnings
Expected: No warnings, build succeeds

Run: `npm run start`
Test: Page load times feel snappy

**Step 5: Create test report**

Document all test results in: `docs/plans/testing-report-2026-01-29.md`

---

### Task 10: Git Workflow & Deployment

**Step 1: Ensure clean git state**

```bash
git status
```

Expected: All changes committed from previous tasks

**Step 2: Final commit**

```bash
git add -A
git commit -m "docs: add testing report and final polish"
```

**Step 3: Push to remote**

```bash
git push origin main
```

**Step 4: Create deployment**

Follow existing deployment workflow:
```bash
npm run build
pm2 restart docs-viewer
```

**Step 5: Verify production**

Visit: Production URL
Test: All functionality works in production
Verify: No console errors

---

## Success Criteria

✅ **Phase 1 Complete:** Beautiful project landing pages with hero, stats, and key docs
✅ **Phase 2 Complete:** Enhanced doc viewer with TOC, scroll spy, and improved UX
✅ **Phase 3 Complete:** Homepage integrated with new routes
✅ **Phase 4 Complete:** Dark mode, mobile responsive, loading states
✅ **Phase 5 Complete:** Tested, documented, and deployed

## Notes for Engineer

- All file paths are absolute from project root
- Dark mode uses Tailwind's `dark:` prefix
- Mobile breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Use existing `cn()` utility from `@/lib/utils` for conditional classes
- Follow Next.js 15 conventions (App Router, Server Components by default)
- Test at each commit - don't batch commits
- Keep components small and focused (single responsibility)
- README extraction should gracefully handle missing files
- TOC should only show H2 and H3 headings (not H1)
- All gradients should respect dark mode
- Loading states should match final layout structure
- 404 pages should always have escape route (back to homepage)

## Related Skills

- @superpowers:executing-plans - Use this to implement the plan task-by-task
- @superpowers:test-driven-development - If adding new utility functions
- @superpowers:verification-before-completion - Before declaring tasks complete
