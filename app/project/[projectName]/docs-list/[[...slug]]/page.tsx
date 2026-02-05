import { getDocumentationList } from '@/lib/doc-metadata';
import { getProjectMetadata } from '@/lib/project-metadata';
import { notFound } from 'next/navigation';
import { PROJECT_ROOTS } from '@/lib/project-config';
import fs from 'fs';
import path from 'path';
import { SplitPanelViewer } from './components/SplitPanelViewer';
import { detectCategories } from '@/lib/category-detection';

// Enable ISR with 30-second revalidation
export const revalidate = 30;

export default async function DocsListPage({
  params,
}: {
  params: Promise<{ projectName: string; slug?: string[] }>;
}) {
  const { projectName, slug } = await params;
  const project = await getProjectMetadata(projectName);

  if (!project) {
    notFound();
  }

  // Get project root and category config
  const projectRoot = PROJECT_ROOTS[projectName];
  const categoryConfig = await detectCategories(projectRoot);

  // Fetch all documentation
  const rawDocs = await getDocumentationList(projectName);

  // Transform to match component interface
  const docs = rawDocs.map(doc => ({
    filename: doc.name,
    path: doc.path,
    category: doc.category,
    size: doc.size,
    lastModified: new Date(doc.modified).toISOString(),
    description: doc.description,
  }));

  // Get selected document content if slug is provided
  let selectedDoc = null;
  let selectedContent = null;

  if (slug && slug.length > 0) {
    const docPath = slug.join('/');
    const projectRoot = PROJECT_ROOTS[projectName];
    const filePath = path.join(projectRoot, docPath);
    const mdPath = filePath.endsWith('.md') ? filePath : `${filePath}.md`;

    if (fs.existsSync(mdPath)) {
      selectedContent = fs.readFileSync(mdPath, 'utf-8');
      selectedDoc = docs.find(d => d.path === docPath) || null;
    }
  }

  // If no document selected, try to select README.md first, then fall back to first doc
  if (!selectedDoc && docs.length > 0) {
    const projectRoot = PROJECT_ROOTS[projectName];

    // First, try to find README.md
    const readmeDoc = docs.find(d => d.filename.toLowerCase() === 'readme' || d.filename.toLowerCase() === 'readme.md');

    if (readmeDoc) {
      const mdPath = path.join(projectRoot, `${readmeDoc.path}.md`);
      if (fs.existsSync(mdPath)) {
        selectedContent = fs.readFileSync(mdPath, 'utf-8');
        selectedDoc = readmeDoc;
      }
    }

    // If no README found, fall back to first document
    if (!selectedDoc) {
      const firstDoc = docs[0];
      const mdPath = path.join(projectRoot, `${firstDoc.path}.md`);

      if (fs.existsSync(mdPath)) {
        selectedContent = fs.readFileSync(mdPath, 'utf-8');
        selectedDoc = firstDoc;
      }
    }
  }

  return (
    <SplitPanelViewer
      project={{
        name: project.name,
        displayName: project.displayName,
        description: project.description,
        stats: project.stats,
      }}
      docs={docs}
      selectedDoc={selectedDoc}
      selectedContent={selectedContent}
      categoryConfig={categoryConfig}
    />
  );
}
