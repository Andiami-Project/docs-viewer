import { PROJECT_ROOTS, VALID_PROJECT_NAMES } from '@/lib/project-config';

/**
 * Server-side rendered page specifically for AI tools
 * Lists all documentation URLs as plain text
 */
export default function AIDocsIndexPage() {
  const baseUrl = 'https://y1.andiami.tech/docs-viewer';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-amber-400">
          📋 Documentation Index for AI Tools
        </h1>

        <p className="text-lg text-slate-300 mb-8">
          Complete URL listing for AI assistants and web crawlers to discover all documentation pages in the As You Wish Ecosystem.
        </p>

        {/* AI All-in-One - Most Important */}
        <section className="mb-12 bg-emerald-900/30 border-2 border-emerald-500 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">⭐ GET ALL CONTENT IN ONE REQUEST (Recommended)</h2>
          <p className="text-slate-300 mb-4">
            Get complete content of ALL documents in a single JSON response:
          </p>
          <div className="bg-slate-900 rounded-lg p-4 mb-2">
            <p className="text-emerald-300 text-xl font-mono font-bold">
              {baseUrl}/api/ai-all
            </p>
          </div>
          <p className="text-emerald-200 mt-4">
            This solves the "inner page access" problem - everything in one response!
          </p>
          <div className="mt-4 text-sm text-slate-400">
            <p>Options:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><code className="bg-slate-800 px-2 py-0.5 rounded">?project=workspace-documentation</code> - Single project only</li>
              <li><code className="bg-slate-800 px-2 py-0.5 rounded">?limit=50</code> - Limit number of documents</li>
              <li><code className="bg-slate-800 px-2 py-0.5 rounded">?summary=true</code> - Metadata only, no content</li>
            </ul>
          </div>
        </section>

        {/* LLMs.txt */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">📋 LLM Configuration File</h2>
          <p className="text-slate-400 mb-4">
            Standard instructions file for AI tools (like robots.txt but for LLMs):
          </p>
          <div className="bg-slate-900 rounded-lg p-4 mb-2">
            <p className="text-blue-300 text-lg font-mono">
              {baseUrl}/llms.txt
            </p>
          </div>
        </section>

        {/* Sitemap URL */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-amber-400">Complete Sitemap</h2>
          <p className="text-slate-400 mb-4">
            Full list of all 898 documentation pages (updated automatically):
          </p>
          <div className="bg-slate-900 rounded-lg p-4 mb-2">
            <p className="text-amber-300 text-lg font-mono">
              {baseUrl}/sitemap.txt
            </p>
          </div>
          <p className="text-slate-400">
            Fetch this URL to get a complete list of all documentation URLs.
          </p>
        </section>

        {/* Main Documentation Pages */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-amber-400">Main Documentation Pages</h2>
          <div className="space-y-4">

            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Documentation Hub</h3>
              <p className="text-blue-300 font-mono">{baseUrl}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Frontend Layer (wish-x)</h3>
              <p className="text-blue-300 font-mono">{baseUrl}/project/wish-x/docs-list</p>
              <p className="text-sm text-slate-400 mt-1">Next.js 15 + React 19 UI application</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Backend Layer (wish-backend-x)</h3>
              <p className="text-amber-300 font-mono">{baseUrl}/project/wish-backend-x/docs-list</p>
              <p className="text-sm text-slate-400 mt-1">Trigger.dev v4 background job orchestration</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Agent Layer (claude-agent-server)</h3>
              <p className="text-purple-300 font-mono">{baseUrl}/project/claude-agent-server/docs-list</p>
              <p className="text-sm text-slate-400 mt-1">WebSocket + Agent SDK for tool execution</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Workspace Claude Files</h3>
              <p className="text-green-300 font-mono">{baseUrl}/project/workspace-claude-files/docs-list</p>
              <p className="text-sm text-slate-400 mt-1">Claude-related configuration and documentation</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Workspace Documentation</h3>
              <p className="text-green-300 font-mono">{baseUrl}/project/workspace-documentation/docs-list</p>
              <p className="text-sm text-slate-400 mt-1">All workspace markdown documentation files</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Documentation Automation Hub</h3>
              <p className="text-slate-300 font-mono">{baseUrl}/project/doc-automation-hub/docs-list</p>
              <p className="text-sm text-slate-400 mt-1">Documentation generation and automation tools</p>
            </div>

          </div>
        </section>

        {/* API Endpoints */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-amber-400">API Endpoints</h2>
          <div className="space-y-4">

            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-emerald-300 mb-2">⭐ Get ALL Content (Best for AI)</h3>
              <p className="text-emerald-200 font-mono">{baseUrl}/api/ai-all</p>
              <p className="text-sm text-slate-400 mt-1">Returns complete content of all documents in one JSON</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Get Single Project (Bulk)</h3>
              <p className="text-slate-300 font-mono">{baseUrl}/api/ai-all?project=workspace-documentation</p>
              <p className="text-sm text-slate-400 mt-1">Returns all documents with content for one project</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Search Documentation</h3>
              <p className="text-slate-300 font-mono">{baseUrl}/api/ai-docs?search=authentication</p>
              <p className="text-sm text-slate-400 mt-1">Search across all documentation with context snippets</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Get All Projects</h3>
              <p className="text-slate-300 font-mono">{baseUrl}/api/projects</p>
              <p className="text-sm text-slate-400 mt-1">Returns JSON list of all documentation projects</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Get Files List (Flat)</h3>
              <p className="text-slate-300 font-mono">{baseUrl}/api/files-list?project=workspace-documentation</p>
              <p className="text-sm text-slate-400 mt-1">Returns flat array of all files with URLs (40KB)</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Get Document Tree</h3>
              <p className="text-slate-300 font-mono">{baseUrl}/api/docs?project=wish-x</p>
              <p className="text-sm text-slate-400 mt-1">Returns nested tree structure of documentation</p>
            </div>

          </div>
        </section>

        {/* Usage Instructions */}
        <section className="mb-12 bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">For AI Tools & Web Crawlers</h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            <li><strong className="text-emerald-300">RECOMMENDED:</strong> Fetch {baseUrl}/api/ai-all to get ALL content in one request</li>
            <li>Or fetch {baseUrl}/llms.txt for access instructions</li>
            <li>Fetch {baseUrl}/sitemap.txt to get complete URL list (898 pages)</li>
            <li>Each documentation page is server-side rendered (SSR)</li>
            <li>All pages return full HTML content without requiring JavaScript</li>
            <li>Use /api/ai-all?project=name for single project bulk content</li>
            <li>Use /api/ai-docs?search=query to search across all docs</li>
            <li>Direct page access works: /project/[projectName]/docs/[...path]</li>
          </ol>
        </section>

        {/* Project Details */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-amber-400">Project Structure</h2>
          <div className="space-y-3 text-slate-300">
            <p><strong className="text-slate-200">Frontend Layer:</strong> wish-x - Next.js 15 + React 19 + TypeScript</p>
            <p><strong className="text-slate-200">Backend Layer:</strong> wish-backend-x - Trigger.dev v4 orchestration</p>
            <p><strong className="text-slate-200">Agent Layer:</strong> claude-agent-server - WebSocket + Agent SDK</p>
            <p><strong className="text-slate-200">Total Documentation:</strong> 898 pages across 6 projects</p>
            <p><strong className="text-slate-200">Update Frequency:</strong> Sitemap regenerates dynamically on each request</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-700 pt-6 mt-12">
          <p className="text-slate-400 text-center">
            As You Wish Ecosystem Documentation - Complete system architecture documentation
          </p>
          <p className="text-slate-500 text-center mt-2 text-sm">
            This page is server-side rendered for AI tool accessibility
          </p>
        </footer>
      </div>
    </div>
  );
}
